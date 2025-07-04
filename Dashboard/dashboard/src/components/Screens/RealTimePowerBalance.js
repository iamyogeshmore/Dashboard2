import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  createTheme,
  ThemeProvider,
  TableHead,
} from "@mui/material";

const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#60a5fa" },
    secondary: { main: "#34d399" },
    background: { default: "#000000", paper: "#000000" },
    text: { primary: "#f8fafc", secondary: "#cbd5e1" },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "none" },
        head: { fontWeight: "none" },
      },
    },
  },
});
const styles = {
  container: { width: "100%", bgcolor: "#1e293b", borderRadius: 1, p: 2 },
  headerText: {
    fontSize: "1.3rem",
    fontWeight: "none",
    color: "red",
    fontFamily: "Arial",
  },
  greenValue: {
    fontSize: "1.3rem",
    fontWeight: "none",
    color: "#4ade80",
    fontFamily: "Arial",
  },
  orangeValue: {
    fontSize: "1.3rem",
    fontWeight: "none",
    color: "#ff9138",
    fontFamily: "Arial",
  },
  blueValue: {
    fontSize: "1.3rem",
    fontWeight: "none",
    color: "#93c5fd",
    fontFamily: "Arial",
  },
  purpleText: {
    fontSize: "1.3rem",
    fontWeight: "none",
    color: "#d8b4fe",
    fontFamily: "Arial",
  },
  valueText: {
    fontSize: "1.3rem",
    fontWeight: "none",
    color: "#fff",
    fontFamily: "Arial",
  },
  dateTimeText: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#ff9138",
    textAlign: "center",
    fontFamily: "Times New Roman",
  },
  headerCell: {
    color: "#f312f3",
    fontWeight: "none",
    textAlign: "center",
    padding: "8px 16px",
    fontSize: "1.3rem",
    fontFamily: "Arial",
  },
  subHeaderCell: {
    color: "#53c772",
    fontWeight: "none",
    textAlign: "center",
    padding: "4px 16px",
    fontSize: "1.3rem",
    fontFamily: "Arial",
  },
  rowLabel: {
    color: "#00ffff",
    fontWeight: "none",
    padding: "6px 16px",
    fontSize: "1.3rem",
    fontFamily: "Arial",
  },
  dataCell: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  redCell: {
    color: "red",
    textAlign: "center",
    padding: "6px 16px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  generationValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  exportValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  importValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  demandValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  allocationValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  powerbalanceValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
  blockwiseperformanceValue: {
    color: "#00ffff",
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "1.3rem",
    fontWeight: "none",
    fontFamily: "Arial",
  },
};

function RealTimePowerBalance() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/getcdnuts`);
        const data = await response.json();
        setApiData(data[0]);
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };

    fetchData();
    const dataFetchInterval = setInterval(fetchData, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(dataFetchInterval);
    };
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const getMeasurandValue = (id, isKwh = false) => {
    if (!apiData?.MeasurandData) return "N/A";
    const measurand = apiData.MeasurandData.find((m) => m.MeasurandId === id);
    const value = measurand?.MeasurandValue;
    if (value === undefined || value === "") return "N/A";
    if (isNaN(value)) return value;
    const numValue = Number(value);

    // Specific handling for blockNumber (id: 161) to round to no decimal points
    const noDecimalIds = [161];
    if (noDecimalIds.includes(id)) {
      return Math.round(numValue).toString();
    }

    // Specific handling for blockWisePerformance IDs (10149 to 10158) to round to no decimal points
    const blockWisePerformanceIds = [
      10149, 10150, 10151, 10152, 10153, 10154, 10155, 10156, 10157, 10158,
    ];
    if (blockWisePerformanceIds.includes(id)) {
      return Math.round(numValue).toString();
    }

    // Specific handling for "RTC CDR (Sch)" (id: 10106, 10107) and "RTC THV (Sch)" (id: 10110, 10111)
    const twoDecimalIds = [
      10106, 10110, 10108, 10112, 10050, 10164, 10165, 10166,
    ];
    if (twoDecimalIds.includes(id)) {
      return numValue.toFixed(2);
    }

    // For KWH, round to nearest integer
    if (isKwh) {
      return Math.round(numValue).toString();
    }

    // For MW, use one decimal point
    return numValue.toFixed(1);
  };

  const dataConfig = {
    headerRow1: [
      {
        label: "Block No",
        key: "blockNumber",
        id: 161,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
      {
        label: "Time Elap",
        key: "timeElapsed",
        id: 163,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
      {
        label: "Time Rem",
        key: "timeRemaining",
        id: 165,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ffff" },
      },
      {
        label: "AR Exp 80%",
        key: "arExpFor80",
        id: 10159,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
      {
        label: "AR Exp 105%",
        key: "arExpFor105",
        id: 10160,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
      {
        label: "CDR Exp(MW)",
        key: "cdrExp",
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.25rem",
          fontFamily: "Arial",
        },
        id: 10016,
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
    ],
    headerRow2: [
      {
        label: "Bus Voltage",
        key: "voltage",
        id: 10161,
        labelStyle: styles.orangeValue,
        valueStyle: { ...styles.valueText, color: "#ff9138" },
      },
      {
        label: "Avg Hz",
        key: "avgFrequency",
        id: 10162,
        labelStyle: styles.orangeValue,
        valueStyle: { ...styles.valueText, color: "#00ffff" },
      },
      {
        label: "Inst. Hz",
        key: "instFrequency",
        id: 10163,
        labelStyle: styles.orangeValue,
        valueStyle: { ...styles.valueText, color: "#ff9138" },
      },
      {
        label: "80 FDR PF",
        key: "fdr80PF",
        id: 10164,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
      {
        label: "120 FDR PF",
        key: "fdr120PF",
        id: 10165,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
      {
        label: "THV PF",
        key: "thvPF",
        id: 10166,
        labelStyle: {
          color: "white",
          fontWeight: "none",
          fontSize: "1.3rem",
          fontFamily: "Arial",
        },
        valueStyle: { ...styles.valueText, color: "#00ff00" },
      },
    ],
    generation: [
      {
        label: "GEN 1",
        key: "gen1",
        id: 10001,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.generationValue,
      },
      {
        label: "GEN 2",
        key: "gen2",
        id: 10002,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.generationValue,
      },
      {
        label: "GEN 3",
        key: "gen3",
        id: 10003,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.generationValue,
      },
      {
        label: "80 PP TOTAL",
        key: "pp80Total",
        id: 10012,
        labelStyle: { color: "#00ffff" },
        valueStyle: styles.generationValue,
      },
      {
        label: "GEN 4",
        key: "gen4",
        id: 10004,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.generationValue,
      },
      {
        label: "GEN 5",
        key: "gen5",
        id: 10005,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.generationValue,
      },
      {
        label: "120 PP TOTAL",
        key: "pp120Total",
        id: 10013,
        labelStyle: { color: "#00ffff" },
        valueStyle: styles.generationValue,
      },
      {
        label: "GROSS GEN (200 PP)",
        key: "grossGen200PP",
        id: 10020,
        labelStyle: { color: "#f312f3", fontSize: "1.1rem" },
        valueStyle: { ...styles.generationValue, color: "#f312f3" },
      },
      {
        label: "THV SOLAR",
        key: "thvSolar",
        id: 10050,
        labelStyle: {
          color: "#f5e6a0",
          fontSize: "1.3rem",
          fontWeight: "none",
        },
        valueStyle: styles.generationValue,
      },
    ],
    exportImport: [
      {
        label: " EXP 80 PP",
        key: "exp80PP",
        mwId: 10014,
        kwhId: 10038,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.exportValue,
      },
      {
        label: " EXP 120 PP",
        key: "exp120PP",
        mwId: 10015,
        kwhId: 10039,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.exportValue,
      },
      {
        label: " EXP 200 PP",
        key: "exp200PP",
        mwId: 10016,
        kwhId: 10040,
        labelStyle: { color: "#00ffff" },
        valueStyle: styles.exportValue,
      },
      {
        label: " IMP 80 PP",
        key: "imp80PP",
        mwId: 10017,
        kwhId: 10041,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.importValue,
      },
      {
        label: " IMP 120 PP",
        key: "imp120PP",
        mwId: 10018,
        kwhId: 10042,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
        valueStyle: styles.importValue,
      },
      {
        label: " IMP 200 PP",
        key: "imp200PP",
        mwId: 10019,
        kwhId: 10043,
        labelStyle: { color: "#00ffff" },
        valueStyle: styles.importValue,
      },
    ],
    demandAllocationDrawal: [
      {
        label: "CCP 1",
        key: "ccp1",
        demandMwId: 10056,
        demandKwhId: 10072,
        allocationMwId: 10064,
        allocationKwhId: 10080,
        drawalMwId: 10006,
        drawalKwhId: 10030,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
      },
      {
        label: "CCP 2",
        key: "ccp2",
        demandMwId: 10057,
        demandKwhId: 10073,
        allocationMwId: 10065,
        allocationKwhId: 10081,
        drawalMwId: 10007,
        drawalKwhId: 10031,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
      },
      {
        label: "CCP 3",
        key: "ccp3",
        demandMwId: 10058,
        demandKwhId: 10074,
        allocationMwId: 10066,
        allocationKwhId: 10082,
        drawalMwId: 10008,
        drawalKwhId: 10032,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
      },
      {
        label: "CDR TOTAL",
        key: "cdrTotal",
        demandMwId: 10059,
        demandKwhId: 10075,
        allocationMwId: 10067,
        allocationKwhId: 10083,
        drawalMwId: 10021,
        drawalKwhId: 10045,
        labelStyle: { color: "#00ffff" },
      },
      {
        label: "THV PL1",
        key: "thvPl1",
        demandMwId: 10060,
        demandKwhId: 10076,
        allocationMwId: 10068,
        allocationKwhId: 10084,
        drawalMwId: 10009,
        drawalKwhId: 10033,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
      },
      {
        label: "THV PL2",
        key: "thvPl2",
        demandMwId: 10061,
        demandKwhId: 10077,
        allocationMwId: 10069,
        allocationKwhId: 10085,
        drawalMwId: 10010,
        drawalKwhId: 10034,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
      },
      {
        label: "THV PL3",
        key: "thvPl3",
        demandMwId: 10062,
        demandKwhId: 10078,
        allocationMwId: 10070,
        allocationKwhId: 10086,
        drawalMwId: 10011,
        drawalKwhId: 10035,
        labelStyle: { color: "#f5e6a0", fontWeight: "none" },
      },
      {
        label: "THV TOTAL",
        key: "thvTotal",
        demandMwId: 10063,
        demandKwhId: 10079,
        allocationMwId: 10071,
        allocationKwhId: 10087,
        drawalMwId: 10022,
        drawalKwhId: 10046,
        labelStyle: { color: "#00ffff" },
      },
      {
        label: "FABU TOTAL",
        key: "fabuTotal",
        demandMwId: 10090,
        demandKwhId: 10091,
        allocationMwId: 10089,
        allocationKwhId: 10088,
        drawalMwId: 10023,
        drawalKwhId: 10047,
        labelStyle: { color: "#f312f3" },
      },
    ],
    firstTable: [
      {
        header: "Block",
        label: "Current -",
        data: [
          {
            label: "CDR Exp",
            mwId: 10016,
            kwhId: 10040,
            style: { color: "#00ffff" },
          },
          {
            label: "THV Drawal",
            mwId: 10054,
            kwhId: 10055,
            style: { color: "#00ffff" },
          },
          {
            label: "Net Injection",
            mwId: 10098,
            kwhId: 10099,
            style: { color: "#ff9138" },
          },
          {
            label: "Net Export (Sch)",
            mwId: 10213,
            kwhId: 10214,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC CDR (Sch)",
            mwId: 10106,
            kwhId: 10107,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC THV (Sch)",
            mwId: 10110,
            kwhId: 10111,
            style: { color: "#00ffff" },
          },
          {
            label: "Achievement",
            id: 10118,
            style: { color: "#ff9138" },
            colSpan: 2,
          },
          {
            label: "Inj > Sch",
            mwId: 10114,
            kwhId: 10115,
            style: { color: "#ff9138" },
          },
        ],
      },
      {
        label: "Last -",
        data: [
          {
            label: "CDR Exp",
            mwId: 10094,
            kwhId: 10095,
            style: { color: "#00ffff" },
          },
          {
            label: "THV Drawal",
            mwId: 10096,
            kwhId: 10097,
            style: { color: "#00ffff" },
          },
          {
            label: "Net Injection",
            mwId: 10100,
            kwhId: 10101,
            style: { color: "#ff9138" },
          },
          {
            label: "Net Export (Sch)",
            mwId: 10104,
            kwhId: 10105,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC CDR (Sch)",
            mwId: 10108,
            kwhId: 10109,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC THV (Sch)",
            mwId: 10112,
            kwhId: 10113,
            style: { color: "#00ffff" },
          },
          {
            label: "Achievement",
            id: 10119,
            style: { color: "#ff9138" },
            colSpan: 2,
          },
          {
            label: "Inj > Sch",
            mwId: 10116,
            kwhId: 10117,
            style: { color: "#ff9138" },
          },
        ],
      },
    ],
    secondTable: [
      {
        header: "Block",
        label: "Current -",
        data: [
          {
            label: "Push To Grid",
            mwId: 10120,
            kwhId: 10121,
            style: { color: "#00ffff" },
          },
          {
            label: "Emergency Drawal",
            mwId: 10124,
            kwhId: 10125,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC Used CDR",
            mwId: 10128,
            kwhId: 10129,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC Used THV",
            mwId: 10132,
            kwhId: 10133,
            style: { color: "#00ffff" },
          },
          {
            label: "Grid Support-CDR",
            mwId: 10136,
            kwhId: 10137,
            style: { color: "#00ffff" },
          },
          {
            label: "Grid Support-THV",
            mwId: 10140,
            kwhId: 10141,
            style: { color: "#00ffff" },
          },
        ],
      },
      {
        label: "Last -",
        data: [
          {
            label: "Push To Grid",
            mwId: 10122,
            kwhId: 10123,
            style: { color: "#00ffff" },
          },
          {
            label: "Emergency Drawal",
            mwId: 10126,
            kwhId: 10127,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC Used CDR",
            mwId: 10130,
            kwhId: 10131,
            style: { color: "#00ffff" },
          },
          {
            label: "RTC Used THV",
            mwId: 10134,
            kwhId: 10135,
            style: { color: "#00ffff" },
          },
          {
            label: "Grid Support-CDR",
            mwId: 10138,
            kwhId: 10139,
            style: { color: "#00ffff" },
          },
          {
            label: "Grid Support-THV",
            mwId: 10142,
            kwhId: 10143,
            style: { color: "#00ffff" },
          },
        ],
      },
    ],
    nextBlockData: [
      { label: "Block no.", key: "nextBlockNo", id: 10144 },
      { label: "FABU Demand", key: "nextFabuDemand", id: 10145 },
      { label: "Net Exp", key: "nextNetExp", id: 10146 },
      { label: "Sch. RTC THV", key: "nextSchRtcThv", id: 10147 },
      { label: "Sch. RTC CDR", key: "nextSchRtcCdr", id: 10148 },
    ],
    blockWisePerformance: [
      [
        { label: "0", key: "perfValue0", id: 10149 },
        { label: "0-60%", key: "perfValue0To60", id: 10150 },
        { label: "60-80%", key: "perfValue60To80", id: 10151 },
        { label: "80-105%", key: "perfValue80To105", id: 10152 },
        { label: ">105%", key: "perfValueAbove105", id: 10153 },
      ],
      [
        { label: "<0", key: "perfValueBelow0", id: 10154 },
        { label: "0-1X", key: "perfValue0To1X", id: 10155 },
        { label: "1X-2X", key: "perfValue1XTo2X", id: 10156 },
        { label: "2-4X", key: "perfValue2To4X", id: 10157 },
        { label: ">4X", key: "perfValueAbove4X", id: 10158 },
      ],
    ],
  };

  const DataItem = ({ label, value, labelStyle, valueStyle }) => (
    <Box sx={{ display: "flex", gap: 3, mb: 1 }}>
      <Typography
        sx={{
          ...labelStyle,
          width: "140px",
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          ...valueStyle,
          width: "120px",
          flexShrink: 0,
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        {value ?? "N/A"}
      </Typography>
    </Box>
  );

  const RenderTableRow = ({
    config,
    isExportImport = false,
    isDemandAllocationDrawal = false,
  }) => (
    <>
      {config.map((item, index) => {
        let drawalMwStyle = styles.dataCell;
        let drawalKwhStyle = styles.dataCell;
        if (isDemandAllocationDrawal) {
          const drawalMwValue = parseFloat(getMeasurandValue(item.drawalMwId));
          const allocationMwValue = parseFloat(
            getMeasurandValue(item.allocationMwId)
          );
          if (
            !isNaN(drawalMwValue) &&
            !isNaN(allocationMwValue) &&
            drawalMwValue > allocationMwValue
          ) {
            drawalMwStyle = styles.redCell;
          }
          const drawalKwhValue = parseFloat(
            getMeasurandValue(item.drawalKwhId, true)
          );
          const allocationKwhValue = parseFloat(
            getMeasurandValue(item.allocationKwhId, true)
          );
          if (
            !isNaN(drawalKwhValue) &&
            !isNaN(allocationKwhValue) &&
            drawalKwhValue > allocationKwhValue
          ) {
            drawalKwhStyle = styles.redCell;
          }
        }

        return (
          <TableRow key={item.key}>
            <TableCell sx={{ ...styles.rowLabel, ...(item.labelStyle || {}) }}>
              {item.label}
            </TableCell>
            {isExportImport ? (
              <>
                <TableCell sx={item.valueStyle || styles.dataCell}>
                  {getMeasurandValue(item.mwId)}
                </TableCell>
                <TableCell sx={item.valueStyle || styles.dataCell}>
                  {getMeasurandValue(item.kwhId, true)}
                </TableCell>
              </>
            ) : isDemandAllocationDrawal ? (
              <>
                <TableCell sx={styles.demandValue}>
                  {getMeasurandValue(item.demandMwId)}
                </TableCell>
                <TableCell sx={styles.demandValue}>
                  {getMeasurandValue(item.demandKwhId, true)}
                </TableCell>
                <TableCell sx={styles.allocationValue}>
                  {getMeasurandValue(item.allocationMwId)}
                </TableCell>
                <TableCell sx={styles.allocationValue}>
                  {getMeasurandValue(item.allocationKwhId, true)}
                </TableCell>
                <TableCell sx={drawalMwStyle}>
                  {getMeasurandValue(item.drawalMwId)}
                </TableCell>
                <TableCell sx={drawalKwhStyle}>
                  {getMeasurandValue(item.drawalKwhId, true)}
                </TableCell>
              </>
            ) : (
              <TableCell sx={item.valueStyle || styles.dataCell}>
                {getMeasurandValue(item.id)}
              </TableCell>
            )}
          </TableRow>
        );
      })}
    </>
  );

  const RenderComplexTable = ({ config }) => (
    <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...styles.headerCell, textAlign: "left" }}>
            Block
          </TableCell>
          {config[0].data.map((item) => (
            <TableCell
              key={item.label}
              colSpan={item.colSpan || 2}
              sx={styles.headerCell}
            >
              {item.label}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell sx={{ borderBottom: "none" }} />
          {config[0].data.flatMap((item) =>
            item.colSpan ? (
              <TableCell
                key={item.label}
                colSpan={item.colSpan}
                sx={{ ...styles.subHeaderCell, textAlign: "center" }}
              >
                %
              </TableCell>
            ) : (
              [
                <TableCell key={`${item.label}-mw`} sx={styles.subHeaderCell}>
                  MW
                </TableCell>,
                <TableCell key={`${item.label}-kwh`} sx={styles.subHeaderCell}>
                  KWH
                </TableCell>,
              ]
            )
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {config.map(({ label, data }) => (
          <TableRow key={label}>
            <TableCell
              sx={{
                ...styles.rowLabel,
                color:
                  label === "Current" || label === "Last"
                    ? "#f5e6a0"
                    : "#f5e6a0",
                fontWeight: "normal", // Changed from "none" to "normal"
              }}
            >
              {label}
            </TableCell>
            {data.map((item) =>
              item.colSpan ? (
                <TableCell
                  key={item.label}
                  colSpan={item.colSpan}
                  sx={{
                    ...styles.dataCell,
                    textAlign: "center",
                    ...(item.style || {}),
                  }}
                >
                  {getMeasurandValue(item.id)}
                </TableCell>
              ) : (
                <>
                  <TableCell
                    key={`${item.label}-mw`}
                    sx={{ ...styles.dataCell, ...(item.style || {}) }}
                  >
                    {getMeasurandValue(item.mwId)}
                  </TableCell>
                  <TableCell
                    key={`${item.label}-kwh`}
                    sx={{ ...styles.dataCell, ...(item.style || {}) }}
                  >
                    {getMeasurandValue(item.kwhId, true)}
                  </TableCell>
                </>
              )
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.default",
          p: 1.5,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img
            src="/INFAlogo.jpg"
            alt="IMFA Logo"
            style={{ width: "100px", height: "50px" }}
          />
          <Typography
            sx={{
              fontWeight: "bold",
              color: "#00ffff",
              fontSize: "1.8rem",
              flexGrow: 1,
              textAlign: "center",
              fontFamily: "Times New Roman",
            }}
          >
            Real-Time Power Balance Monitoring
          </Typography>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={styles.dateTimeText}>
              {formatDate(currentDateTime)} | {formatTime(currentDateTime)}
            </Typography>
          </Box>
          <img
            src="/logo1.png"
            alt="CMS Logo"
            style={{ width: "100px", height: "50px" }}
          />
        </Box>

        <Paper
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            mt: 1,
            padding: "10px",
            border: "3px solid #ccc",
            boxSizing: "border-box",
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableBody sx={{ "& .MuiTableRow-root": { marginBottom: 0 } }}>
                <TableRow
                  sx={{ "& .MuiTableCell-root": { paddingBottom: 0.1 } }}
                >
                  {dataConfig.headerRow1.map((item) => (
                    <TableCell
                      key={item.key}
                      sx={{
                        p: { xs: 0, sm: 1 },
                        minWidth: "250px",
                      }}
                    >
                      <DataItem
                        label={item.label}
                        labelStyle={item.labelStyle}
                        value={getMeasurandValue(item.id)}
                        valueStyle={item.valueStyle}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow sx={{ "& .MuiTableCell-root": { paddingTop: 0.1 } }}>
                  {dataConfig.headerRow2.map((item) => (
                    <TableCell
                      key={item.key}
                      sx={{
                        p: { xs: 0, sm: 1 },
                        minWidth: "250px",
                      }}
                    >
                      <DataItem
                        label={item.label}
                        value={getMeasurandValue(item.id)}
                        labelStyle={item.labelStyle}
                        valueStyle={item.valueStyle}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 0.5,
            mt: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Paper
            sx={{
              flex: 0.8,
              bgcolor: "background.paper",
              p: 1,
              borderRadius: "12px",
              border: "3px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "#f312f3",
                fontWeight: "none",
                mb: 0.5,
                fontSize: "1.3rem",
                fontFamily: "Arial",
              }}
            >
              GENERATION
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 0 }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ ...styles.headerCell, py: 0.5 }} />
                    <TableCell
                      sx={{ ...styles.headerCell, color: "#53c772", py: 0.5 }}
                    >
                      MW
                    </TableCell>
                  </TableRow>
                  <RenderTableRow config={dataConfig.generation} />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <Box
            sx={{
              flex: 1.6, // Increased from 1.3 to make EXPORT / IMPORT and NEXT BLOCK DATA tables wider
              display: "flex",
              flexDirection: "column", // Stacked vertically as per previous request
              gap: 0.5,
              width: "100%", // Ensure full width for stacking
              minWidth: { xs: "100%", sm: "400px" }, // Ensure sufficient width on all screens
            }}
          >
            <Paper
              sx={{
                bgcolor: "background.paper",
                p: 1,
                borderRadius: "12px",
                border: "3px solid #ccc",
                boxSizing: "border-box",
                width: "100%", // Full width within the container
                minWidth: { xs: "100%", sm: "400px" }, // Minimum width for readability
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#f312f3",
                  fontWeight: "none",
                  mb: 0.5,
                  fontSize: "1.3rem",
                  fontFamily: "Arial",
                }}
              >
                EXPORT / IMPORT
              </Typography>
              <TableContainer sx={{ margin: 0, padding: 0 }}>
                <Table sx={{ minWidth: 400, borderCollapse: "collapse" }}>
                  {" "}
                  {/* Increased minWidth */}
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          ...styles.headerCell,
                          py: 0.3,
                          fontSize: "0.75rem",
                        }}
                      />
                      <TableCell
                        sx={{
                          ...styles.headerCell,
                          color: "#53c772",
                          py: 0.3,
                          fontSize: "1.3rem",
                        }}
                      >
                        MW
                      </TableCell>
                      <TableCell
                        sx={{
                          ...styles.headerCell,
                          color: "#53c772",
                          py: 0.3,
                          fontSize: "1.3rem",
                        }}
                      >
                        KWH
                      </TableCell>
                    </TableRow>
                    <RenderTableRow
                      config={dataConfig.exportImport}
                      isExportImport
                    />
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Paper
              sx={{
                bgcolor: "background.paper",
                p: 1,
                borderRadius: "12px",
                border: "3px solid #53c772",
                boxSizing: "border-box",
                width: "100%", // Full width within the container
                minWidth: { xs: "100%", sm: "400px" }, // Minimum width for readability
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#f312f3",
                  fontWeight: "none",
                  mb: 0.5,
                  fontSize: "1.3rem",
                  fontFamily: "Arial",
                }}
              >
                NEXT BLOCK DATA
              </Typography>
              <TableContainer sx={{ margin: 0, padding: 0 }}>
                <Table sx={{ minWidth: 400, borderCollapse: "collapse" }}>
                  {" "}
                  {/* Increased minWidth */}
                  <TableBody>
                    <TableRow>
                      {dataConfig.nextBlockData.map((item) => (
                        <TableCell
                          key={item.key}
                          sx={{
                            ...styles.subHeaderCell,
                            py: 0.3,
                            fontSize: "1.3rem",
                            color: "#53c772",
                          }}
                        >
                          {item.label}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      {dataConfig.nextBlockData.map((item) => (
                        <TableCell
                          key={item.key}
                          sx={{
                            ...styles.blockwiseperformanceValue,
                            py: 0.3,
                            fontSize: "1.3rem",
                          }}
                        >
                          {getMeasurandValue(item.id)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
          <Paper
            sx={{
              flex: 2,
              bgcolor: "background.paper",
              p: 1,
              borderRadius: "12px",
              border: "3px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none", py: 0.5 }} />
                    <TableCell
                      colSpan={2}
                      sx={{ ...styles.headerCell, py: 0.5, pb: 1.5 }}
                    >
                      DEMAND
                    </TableCell>
                    <TableCell
                      colSpan={2}
                      sx={{ ...styles.headerCell, py: 0.5, pb: 1.5 }}
                    >
                      ALLOCATION
                    </TableCell>
                    <TableCell
                      colSpan={2}
                      sx={{ ...styles.headerCell, py: 0.5, pb: 1.5 }}
                    >
                      DRAWAL
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ borderBottom: "none", py: 0.5 }} />
                    <TableCell sx={{ ...styles.subHeaderCell, py: 0.5 }}>
                      MW
                    </TableCell>
                    <TableCell sx={{ ...styles.subHeaderCell, py: 0.5 }}>
                      KWH
                    </TableCell>
                    <TableCell sx={{ ...styles.subHeaderCell, py: 0.5 }}>
                      MW
                    </TableCell>
                    <TableCell sx={{ ...styles.subHeaderCell, py: 0.5 }}>
                      KWH
                    </TableCell>
                    <TableCell sx={{ ...styles.subHeaderCell, py: 0.5 }}>
                      MW
                    </TableCell>
                    <TableCell sx={{ ...styles.subHeaderCell, py: 0.5 }}>
                      KWH
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <RenderTableRow
                    config={dataConfig.demandAllocationDrawal}
                    isDemandAllocationDrawal
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: { xs: 0.5, sm: 0.5 },
            mt: 0.5,
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "flex-start" },
            marginTop: 0.5,
          }}
        >
          <Paper
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 45%" },
              bgcolor: "background.paper",
              p: { xs: 0.3, sm: 0.3, md: 0.2 },
              borderRadius: "12px",
              overflowX: "auto",
              minWidth: 0,
              border: "3px solid #ff9138",
              boxSizing: "border-box",
            }}
          >
            <TableContainer sx={{ padding: 0, margin: 0 }}>
              <RenderComplexTable config={dataConfig.firstTable} />
            </TableContainer>
          </Paper>
          <Paper
            sx={{
              flex: { xs: "1 1 100%", sm: "1 1 55%" },
              bgcolor: "background.paper",
              p: { xs: 0.3, sm: 0.3, md: 0.2 },
              borderRadius: "12px",
              overflowX: "auto",
              minWidth: 0,
              border: "3px solid #ccc",
              boxSizing: "border-box",
            }}
          >
            <TableContainer sx={{ padding: 0, margin: 0 }}>
              <RenderComplexTable config={dataConfig.secondTable} />
            </TableContainer>
          </Paper>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 1, mt: 0.5 }}>
          <Paper
            sx={{
              flex: 1,
              bgcolor: "background.paper",
              borderRadius: "8px",
              p: 0.5,
              border: "3px solid #53c772",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "#f312f3",
                fontWeight: "none",
                mb: 0.5,
                fontSize: "1.3rem",
                fontFamily: "Arial",
              }}
            >
              BLOCK WISE PERFORMANCE
            </Typography>
            <TableContainer sx={{ padding: 0, margin: 0 }}>
              <Table sx={{ minWidth: 0, borderCollapse: "collapse" }}>
                <TableBody>
                  <TableRow>
                    {dataConfig.blockWisePerformance.flat().map((item) => (
                      <TableCell
                        key={item.key}
                        sx={{
                          ...styles.subHeaderCell,
                          py: 0.3,
                          fontSize: "1.1rem",
                          color: "#53c772",
                        }}
                      >
                        {item.label}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {dataConfig.blockWisePerformance.flat().map((item) => (
                      <TableCell
                        key={item.key}
                        sx={{
                          ...styles.blockwiseperformanceValue,
                          py: 0.3,
                          fontSize: "1.3rem",
                        }}
                      >
                        {getMeasurandValue(item.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default RealTimePowerBalance;
