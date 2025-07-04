import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  createTheme,
  ThemeProvider,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6", // Vibrant blue
    },
    secondary: {
      main: "#10b981", // Emerald green
    },
    background: {
      default: "#000000", // Dark slate
      paper: "#1e293b", // Slightly lighter slate
    },
    text: {
      primary: "#f1f5f9", // Light gray
      secondary: "#94a3b8", // Muted gray
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          padding: "8px 16px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #334155",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "#1e293b",
        },
      },
    },
  },
});

function InjectionSchedule() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const fileInputRef = useRef(null);

  // Initialize dates to April 26th 2025 as default
  const defaultDate = "2025-04-26";
  const [fromDate, setFromDate] = useState(defaultDate);
  const [toDate, setToDate] = useState(defaultDate);

  // Define table headers based on MeasurandNames
  const tableHeaders = [
    "ID",
    "TimeStamp",
    "From Time",
    "To Time",
    "SIG1MW",
    "SIG1MVAR",
    "SIG2MW",
    "SIG2MVAR",
    "SIG3MW",
    "SIG3MVAR",
    "SIG4MW",
    "SIG4MVAR",
    "SIG5MW",
    "SIG5MVAR",
    "WL",
    "SIRTCCDRMW",
    "SIRTCTHVMW",
    "UpdatedTime",
  ];

  // Transform MongoDB data to table format
  const transformData = (mongoData) => {
    return mongoData.map((doc) => {
      const timeStamp = new Date(doc.TimeStamp);
      const endTime = new Date(timeStamp.getTime() + 15 * 60000); // Add 15 minutes

      // Helper function to get measurand value
      const getMeasurandValue = (measurandName) => {
        const measurand = doc.MeasurandData.find(
          (m) => m.MeasurandName === measurandName
        );
        return measurand ? Number(measurand.MeasurandValue.toFixed(2)) : 0;
      };

      return {
        id: doc._id,
        timeStamp: timeStamp.toLocaleString(),
        fromTime: timeStamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        toTime: endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        SIG1MW: getMeasurandValue("SIG1MW"),
        SIG1MVAR: getMeasurandValue("SIG1MVAR"),
        SIG2MW: getMeasurandValue("SIG2MW"),
        SIG2MVAR: getMeasurandValue("SIG2MVAR"),
        SIG3MW: getMeasurandValue("SIG3MW"),
        SIG3MVAR: getMeasurandValue("SIG3MVAR"),
        SIG4MW: getMeasurandValue("SIG4MW"),
        SIG4MVAR: getMeasurandValue("SIG4MVAR"),
        SIG5MW: getMeasurandValue("SIG5MW"),
        SIG5MVAR: getMeasurandValue("SIG5MVAR"),
        WL: getMeasurandValue("WL"),
        SIRTCCDRMW: getMeasurandValue("SIRTCCDRMW"),
        SIRTCTHVMW: getMeasurandValue("SIRTCTHVMW"),
        updatedTime: timeStamp.toLocaleString(),
      };
    });
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Format dates for API call
      const formattedFromDate = new Date(fromDate);
      const formattedToDate = new Date(toDate);

      // Format as YYYY-MM-DD
      const fromDateStr = formattedFromDate.toISOString().split("T")[0];
      const toDateStr = formattedToDate.toISOString().split("T")[0];

      console.log("Fetching data for date range:", {
        fromDate: fromDateStr,
        toDate: toDateStr,
      });

      const response = await fetch(
        `${API_BASE_URL}/hdd/hdnuts900?fromDate=${fromDateStr}&toDate=${toDateStr}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch data");
      }

      if (result.data.length === 0) {
        console.log("No data found for the date range");
        setData([]);
        return;
      }

      const transformedData = transformData(result.data);
      console.log("Transformed data:", transformedData);
      setData(transformedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchData();
    }
  }, [fromDate, toDate]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("File content:", e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleClearFile = () => {
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    console.log("Download button clicked");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          // width: '100vw',
          p: 3,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            mt: 10,
          }}
        >
          <img
            src="/INFAlogo.jpg"
            alt="IMFA Logo"
            style={{ width: "100px", height: "50px" }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              fontFamily: "Times New Roman",
            }}
          >
            Injection Schedule
          </Typography>
          <img
            src="/logo1.png"
            alt="CMS Logo"
            style={{ width: "100px", height: "50px" }}
          />
        </Box>

        {/* Main Content */}
        <Paper
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "background.paper",
              p: 2,
              borderBottom: "1px solid #334155",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* New Styled File Upload Component */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#334155",
                  borderRadius: "8px",
                  height: "40px",
                  overflow: "hidden",
                  position: "relative",
                  width: fileName ? "300px" : "350px",
                  transition: "width 0.3s ease",
                  fontFamily: "Times New Roman",
                }}
              >
                <Tooltip title="Choose file">
                  <Button
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      height: "100%",
                      borderRadius: "8px 0 0 8px",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                    />
                  </Button>
                </Tooltip>

                <Box
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    px: 1,
                    flex: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {fileName || "No file selected"}
                  </Typography>
                </Box>

                {fileName && (
                  <Tooltip title="Clear">
                    <IconButton
                      size="small"
                      onClick={handleClearFile}
                      sx={{ color: "text.secondary", mr: 0.5 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Paper>
            </Box>

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                fontFamily: "Times New Roman",
                fontSize: "1.2rem",
              }}
            >
              Upload
            </Button>
            <Button
              variant="contained"
              onClick={handleDownload}
              sx={{
                bgcolor: "secondary.main",
                "&:hover": { bgcolor: "secondary.dark" },
                fontFamily: "Times New Roman",
                fontSize: "1.2rem",
              }}
            >
              Download
            </Button>
            <TextField
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{
                style: { color: "text.secondary" },
                shrink: true,
              }}
              InputProps={{
                style: { color: "text.primary" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  fontFamily: "Times New Roman",
                  fontSize: "1.2rem",
                },
              }}
              size="small"
            />
            <TextField
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{
                style: { color: "text.secondary" },
                shrink: true,
              }}
              InputProps={{
                style: { color: "text.primary" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  fontFamily: "Times New Roman",
                  fontSize: "1.2rem",
                },
              }}
              size="small"
            />
          </Box>

          {/* Table */}
          <TableContainer sx={{ maxHeight: "calc(100vh - 200px)" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: "text.primary",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        fontFamily: "Times New Roman",
                        fontSize: "0.9rem",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={18}
                      align="center"
                      sx={{
                        fontFamily: "Times New Roman",
                        fontSize: "0.9rem",
                      }}
                    >
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={18}
                      align="center"
                      sx={{ color: "error.main" }}
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={18}
                      align="center"
                      sx={{ fontFamily: "Times New Roman", fontSize: "0.9rem" }}
                    >
                      No data available for the selected date range
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { bgcolor: "#334155" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.timeStamp}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.fromTime}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.toTime}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG1MW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG1MVAR}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG2MW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG2MVAR}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG3MW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG3MVAR}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG4MW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG4MVAR}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG5MW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIG5MVAR}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.WL}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIRTCCDRMW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.SIRTCTHVMW}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {row.updatedTime}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default InjectionSchedule;
