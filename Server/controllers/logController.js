const ESBolt = require("../models/ESBolts");
const mongoose = require("mongoose");

// ----------------------- Controller to get all queries -----------------------
const getQueries = async (req, res) => {
  try {
    const queries = await ESBolt.find(
      { Enable: true, QType: { $in: [1, 2] } },
      "QName QDescription"
    );
    res.json(queries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching queries", error: error.message });
  }
};

// ----------------------- Controller to execute a query -----------------------
const executeQuery = async (req, res) => {
  const { qName, fromDate, toDate } = req.body;

  try {
    if (!qName || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Log incoming UTC ISO strings

    // Fetch the query document
    const queryDoc = await ESBolt.findOne({ QName: qName });
    if (!queryDoc) {
      return res.status(404).json({ message: "Query not found" });
    }

    const qScript = queryDoc.QScript.trim();
    const qType = queryDoc.QType; // 1 = pipeline, 2 = view
    const db = mongoose.connection.db;

    let result;

    if (qType === 1) {
      if (!qScript.startsWith("db.")) {
        return res
          .status(400)
          .json({ message: "Invalid pipeline script format" });
      }

      const collectionMatch = qScript.match(/db\.([^\.]+)\.aggregate\s*\(/);
      if (!collectionMatch) {
        return res.status(400).json({ message: "Invalid aggregation syntax" });
      }
      const collectionName = collectionMatch[1];

      const pipelineStrMatch = qScript.match(/\[\s*(.+?)\s*\]\s*\);?$/s);
      if (!pipelineStrMatch) {
        return res.status(400).json({ message: "Invalid pipeline format" });
      }
      let pipelineStr = pipelineStrMatch[1];

      pipelineStr = pipelineStr.replace(/\/\/.*$/gm, "").trim();

      let pipeline;
      try {
        pipeline = JSON.parse(pipelineStr);
      } catch (initialParseError) {
        pipelineStr = pipelineStr
          .replace(/\s+/g, " ")
          .replace(/([{,])\s*([$\w]+)\s*:/g, '$1 "$2":')
          .replace(/,\s*([\]}])/g, "$1");

        if (!pipelineStr.startsWith("[")) {
          pipelineStr = `[${pipelineStr}]`;
        }

        try {
          pipeline = JSON.parse(pipelineStr);
        } catch (cleanedParseError) {
          console.error(
            "Error parsing cleaned pipeline:",
            cleanedParseError.message
          );
          return res.status(400).json({
            message: "Invalid aggregation pipeline",
            error: cleanedParseError.message,
          });
        }
      }

      if (!Array.isArray(pipeline)) {
        pipeline = [pipeline];
      }

      const dateFilterStage = {
        $match: {
          TimeStamp: {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          },
        },
      };
      pipeline.unshift(dateFilterStage);

      result = await db
        .collection(collectionName)
        .aggregate(pipeline)
        .toArray();
    } else if (qType === 2) {
      const viewName = qScript;

      const query = {
        TimeStamp: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      };

      result = await db
        .collection(viewName)
        .find(query)
        .sort({ TimeStamp: 1 })
        .toArray();
    } else {
      return res.status(400).json({
        message: "Invalid QType. Must be 1 (pipeline) or 2 (view)",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Query execution error:", error);
    res.status(500).json({
      message: "Error executing query",
      error: error.message,
    });
  }
};

module.exports = {
  getQueries,
  executeQuery,
};
