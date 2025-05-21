const WebSocket = require("ws");
const ESPlantTerminal = require("./models/ESPlantTerminal");
const HDNutsGraph = require("./models/HDNutsGraph");
const ESPlant = require("./models/ESPlant");
const logger = require("./utils/logger");

// Initialize WebSocket server
const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    logger.info("New WebSocket client connected");

    // Handle client messages
    ws.on("message", async (message) => {
      try {
        const { type, terminalId, measurandId } = JSON.parse(message);

        // Validate input
        const terminalIdNum = parseInt(terminalId);
        const measurandIdNum = parseInt(measurandId);

        if (isNaN(terminalIdNum) || (type === "liveValue" && !measurandId)) {
          ws.send(
            JSON.stringify({
              status: "error",
              message: "Invalid terminalId or measurandId",
            })
          );
          return;
        }

        // Start polling based on message type
        const interval = setInterval(async () => {
          if (ws.readyState !== WebSocket.OPEN) {
            clearInterval(interval);
            return;
          }

          try {
            if (type === "liveValue") {
              // Handle live value from ESPlantTerminal (view)
              const record = await ESPlantTerminal.findOne(
                { TerminalId: terminalIdNum },
                "TimeStamp TerminalName MeasurandDetails"
              )
                .sort({ TimeStamp: -1 })
                .lean()
                .exec();

              if (!record || !record.MeasurandDetails[measurandId]) {
                ws.send(
                  JSON.stringify({
                    status: "error",
                    message: `No data for TerminalId: ${terminalIdNum}, MeasurandId: ${measurandId}`,
                  })
                );
                return;
              }

              const measurand = record.MeasurandDetails[measurandId];
              ws.send(
                JSON.stringify({
                  status: "success",
                  type: "liveValue",
                  data: {
                    MeasurandName: measurand.MeasurandName,
                    MeasurandValue: measurand.MeasurandValue,
                    TimeStamp: record.TimeStamp,
                  },
                })
              );
            } else if (type === "history") {
              // Handle historical data from HDNutsGraph (collection)
              const plant = await ESPlant.findOne(
                { "TerminalList.TerminalId": terminalIdNum },
                { MeasurandList: 1 }
              ).lean();

              const measurand = plant?.MeasurandList.find(
                (m) => m.MeasurandId === measurandIdNum
              );

              const records = await HDNutsGraph.aggregate([
                { $match: { TerminalId: terminalIdNum } },
                { $sort: { TimeStamp: -1 } },
                { $limit: 900 },
                { $unwind: "$MeasurandData" },
                { $match: { "MeasurandData.MeasurandId": measurandIdNum } },
                {
                  $project: {
                    MeasurandId: "$MeasurandData.MeasurandId",
                    MeasurandName:
                      measurand?.DisplayName || "$MeasurandData.MeasurandName",
                    MeasurandValue: "$MeasurandData.MeasurandValue",
                    TimeStamp: 1,
                    _id: 0,
                  },
                },
              ]).exec();

              ws.send(
                JSON.stringify({
                  status: "success",
                  type: "history",
                  data: records,
                  count: records.length,
                })
              );
            }
          } catch (error) {
            logger.error(`WebSocket data fetch error: ${error.message}`, {
              stack: error.stack,
            });
            ws.send(
              JSON.stringify({
                status: "error",
                message: "Server error",
              })
            );
          }
        }, 2000); // Poll every 2 seconds

        // Clean up on client disconnect
        ws.on("close", () => {
          clearInterval(interval);
          logger.info("WebSocket client disconnected");
        });
      } catch (error) {
        logger.error(`WebSocket message error: ${error.message}`, {
          stack: error.stack,
        });
        ws.send(
          JSON.stringify({
            status: "error",
            message: "Invalid message format",
          })
        );
      }
    });

    ws.on("error", (error) => {
      logger.error(`WebSocket error: ${error.message}`);
    });
  });

  logger.info("WebSocket server initialized");
  return wss;
};

module.exports = { initializeWebSocket };
