import { useState, useMemo, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  Popover,
  TextField,
  useTheme,
  alpha,
  Fade,
  Grid,
} from "@mui/material";
import {
  PlayArrow,
  Save,
  QueryStats,
  PictureAsPdf,
  TableChart,
  Description,
  Refresh,
  ShowChart,
} from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import { DataGrid } from "@mui/x-data-grid";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO, isBefore, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import LogGraph from "./LogGraph";
const API_BASE_URL = process.env.REACT_APP_API_LOCAL_URL;

const LogView = () => {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const [queryName, setQueryName] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedSavedQuery, setSelectedSavedQuery] = useState("");
  const [saveAnchorEl, setSaveAnchorEl] = useState(null);
  const [customQueryName, setCustomQueryName] = useState("");
  const [queryOptions, setQueryOptions] = useState([]);
  const [measurandNames, setMeasurandNames] = useState([]);
  const [graphOpen, setGraphOpen] = useState(false);
  const [selectedMeasurand, setSelectedMeasurand] = useState(null);
  const [compareMeasurands, setCompareMeasurands] = useState([]);

  // Define vibrant color palette for statistics (matching LogGraph)
  const colors = [
    "#6366F1", // Indigo
    "#EC4899", // Pink
    "#22D3EE", // Cyan
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#8B5CF6", // Purple
  ];

  // Calculate statistics for measurands
  const statistics = useMemo(() => {
    if (!logs || !measurandNames || !measurandNames.length) return {};

    return measurandNames.reduce((acc, measurand, index) => {
      const values = logs
        .map((log) => log[measurand])
        .filter((val) => val != null && !isNaN(val));

      if (values.length === 0) return acc;

      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      acc[measurand] = {
        mean: mean.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        color: colors[index % colors.length],
      };
      return acc;
    }, {});
  }, [logs, measurandNames]);

  // Memoize gradients for performance
  const gradients = useMemo(
    () => ({
      primary:
        mode === "light"
          ? "linear-gradient(45deg, #4F46E5, #7C3AED)"
          : "linear-gradient(45deg, #065F46, #10B981)",
      hover:
        mode === "light"
          ? "linear-gradient(45deg, #4338CA, #6D28D9)"
          : "linear-gradient(45deg, #064E3B, #059669)",
      paper:
        mode === "light"
          ? "linear-gradient(145deg, #FFFFFF, #F3F4F6)"
          : "linear-gradient(145deg, #1F2937, #111827)",
      container:
        mode === "light"
          ? "linear-gradient(145deg, #EFF6FF, #DBEAFE)"
          : "linear-gradient(145deg, #022C22, #064E3B)",
    }),
    [mode]
  );

  // Fetch queries from API on mount
  useEffect(() => {
    const fetchQueries = async () => {
      try {
        // const response = await fetch("http://localhost:8008/api/logs/queries");
        const response = await fetch(`${API_BASE_URL}api/logs/queries`);
        const data = await response.json();
        if (response.ok) {
          setQueryOptions(data.map((query) => query.QName));
        } else {
          console.error("Error fetching queries:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch queries:", error);
      }
    };
    fetchQueries();

    // Load saved queries from localStorage
    try {
      const storedQueries = localStorage.getItem("savedLogQueries");
      if (storedQueries) {
        setSavedQueries(JSON.parse(storedQueries));
      }
    } catch (error) {
      console.error("Failed to load saved queries from localStorage:", error);
    }
  }, []);

  // Handle Execute button click
  const handleExecute = async () => {
    if (!queryName || !fromDate || !toDate) {
      alert("Please select a query name and valid date range.");
      return;
    }
    if (isBefore(toDate, fromDate)) {
      alert("To date must be after From date.");
      return;
    }

    try {
      const response = await fetch(
        // "http://localhost:8008/api/logs/execute-query",
        `${API_BASE_URL}api/logs/execute-query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qName: queryName,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Extract unique measurand names
        const uniqueMeasurands = [
          ...new Set(
            data.flatMap((log) => log.MeasurandData.map((m) => m.MeasurandName))
          ),
        ];
        setMeasurandNames(uniqueMeasurands);

        // Transform data for DataGrid, ensuring MeasurandValue is a number
        const transformedLogs = data.map((log) => {
          const row = {
            id: uuidv4(),
            timestamp: log.TimeStamp,
          };
          log.MeasurandData.forEach((m) => {
            const value = Number(m.MeasurandValue);
            row[m.MeasurandName] = isNaN(value)
              ? null
              : Number(value.toFixed(2));
          });
          return row;
        });
        setLogs(transformedLogs);
      } else {
        alert(`Error executing query: ${data.message}`);
      }
    } catch (error) {
      alert("Failed to execute query: " + error.message);
    }
  };

  // Handle Refresh button click
  const handleRefresh = () => {
    if (queryName && fromDate && toDate) {
      handleExecute();
    }
  };

  // Handle Save button click
  const handleSaveIconClick = (event) => {
    if (queryName && fromDate && toDate) {
      setSaveAnchorEl(event.currentTarget);
      setCustomQueryName(`Query ${savedQueries.length + 1}`);
    }
  };

  const handleSaveClose = () => {
    setSaveAnchorEl(null);
    setCustomQueryName("");
  };

  const handleSaveQuery = () => {
    if (!queryName || !fromDate || !toDate) return;

    const queryData = {
      id: uuidv4(),
      name: customQueryName || `Query ${savedQueries.length + 1}`,
      queryName,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };

    const updatedQueries = [...savedQueries, queryData];
    try {
      setSavedQueries(updatedQueries);
      localStorage.setItem("savedLogQueries", JSON.stringify(updatedQueries));
      handleSaveClose();
    } catch (error) {
      console.error("Failed to save query to localStorage:", error);
    }
  };

  // Handle Saved Query selection
  const handleSavedQuerySelect = (event) => {
    const queryId = event.target.value;
    setSelectedSavedQuery(queryId);
    if (queryId) {
      const selectedQuery = savedQueries.find((q) => q.id === queryId);
      if (selectedQuery) {
        setQueryName(selectedQuery.queryName);
        setFromDate(parseISO(selectedQuery.fromDate));
        setToDate(parseISO(selectedQuery.toDate));
        handleExecute();
      }
    } else {
      setQueryName("");
      setFromDate(null);
      setToDate(null);
      setLogs([]);
      setMeasurandNames([]);
    }
  };

  // Handle Graph icon click
  const handleGraphClick = (measurand) => {
    setSelectedMeasurand(measurand);
    setCompareMeasurands([measurand]);
    setGraphOpen(true);
  };

  // Handle Graph dialog close
  const handleGraphClose = () => {
    setGraphOpen(false);
    setSelectedMeasurand(null);
    setCompareMeasurands([]);
  };

  // Handle measurand comparison
  const handleCompareChange = (event) => {
    const value = event.target.value;
    setCompareMeasurands(typeof value === "string" ? value.split(",") : value);
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (logs.length === 0) return;
    const doc = new jsPDF();
    doc.text("Log Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Timestamp", ...measurandNames]],
      body: logs.map((log) => [
        format(parseISO(log.timestamp), "HH:mm:ss"),
        ...measurandNames.map((name) =>
          log[name] != null ? Number(log[name]).toFixed(2) : ""
        ),
      ]),
      theme: "striped",
      headStyles: { fillColor: mode === "light" ? "#4F46E5" : "#065F46" },
    });
    doc.save(`log_report_${new Date().toISOString()}.pdf`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (logs.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(
      logs.map((log) => ({
        Timestamp: format(parseISO(log.timestamp), "HH:mm:ss"),
        ...Object.fromEntries(
          measurandNames.map((name) => [
            name,
            log[name] != null ? Number(log[name]).toFixed(2) : "",
          ])
        ),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(workbook, `log_report_${new Date().toISOString()}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(
      logs.map((log) => ({
        Timestamp: format(parseISO(log.timestamp), "HH:mm:ss"),
        ...Object.fromEntries(
          measurandNames.map((name) => [
            name,
            log[name] != null ? Number(log[name]).toFixed(2) : "",
          ])
        ),
      }))
    );
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `log_report_${new Date().toISOString()}.csv`;
    link.click();
  };

  // Data grid columns with graph icon
  const columns = useMemo(
    () => [
      {
        field: "timestamp",
        headerName: "Timestamp",
        width: 200,

        sortable: true,
        valueFormatter: ({ value }) => value,
      },
      ...measurandNames.map((name) => ({
        field: name,
        headerName: name,
        width: 150,
        valueFormatter: ({ value }) => value,
        renderHeader: () => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: theme.palette.text.primary,
            }}
          >
            <Typography
              sx={{
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                color: theme.palette.text.primary,
              }}
            >
              {name}
            </Typography>
            <Tooltip title={`View ${name} Graph`}>
              <IconButton
                size="small"
                onClick={() => handleGraphClick(name)}
                sx={{
                  color: theme.palette.info.main,
                  "&:hover": { transform: "scale(1.1)" },
                  transition: "all 0.2s ease",
                }}
              >
                <ShowChart />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      })),
    ],
    [measurandNames, theme.palette.info.main]
  );

  const isSavePopoverOpen = Boolean(saveAnchorEl);
  const savePopoverId = isSavePopoverOpen ? "save-query-popover" : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Fade in timeout={600}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minHeight: "80vh",
            width: "100%",
            padding: 3,
            background: gradients.container,
            borderRadius: 4,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
            transition: "all 0.3s ease",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 3,
              background: gradients.paper,
              boxShadow: `0 6px 20px ${alpha(
                theme.palette.primary.main,
                0.15
              )}`,
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: gradients.primary,
                borderRadius: "3px 3px 0 0",
              },
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: `0 10px 28px ${alpha(
                  theme.palette.primary.main,
                  0.25
                )}`,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                flexWrap: "wrap",
              }}
            >
              <FormControl sx={{ width: 220, flexShrink: 0 }}>
                <InputLabel
                  id="query-name-label"
                  sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                >
                  <QueryStats
                    sx={{
                      color: theme.palette.info.main,
                      verticalAlign: "middle",
                      mr: 1,
                    }}
                  />
                  Query Name
                </InputLabel>
                <Select
                  labelId="query-name-label"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  label="query-name-label"
                  sx={{
                    height: "50px",
                    borderRadius: 2,
                    backgroundColor: mode === "light" ? "#FFFFFF" : "#1F2937",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "& .MuiSelect-select": {
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                    },
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <MenuItem value="" disabled>
                    Select a query
                  </MenuItem>
                  {queryOptions.map((query) => (
                    <MenuItem
                      key={query}
                      value={query}
                      sx={{ fontWeight: 500 }}
                    >
                      {query}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DateTimePicker
                label="From Date & Time"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                maxDateTime={toDate || new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      width: 220,
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                        borderRadius: 2,
                        backgroundColor:
                          mode === "light" ? "#FFFFFF" : "#1F2937",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                        fontFamily: "'Inter', sans-serif",
                      },
                      "& .MuiInputLabel-root": {
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        "&.Mui-focused": {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                )}
                format="MM/dd/yyyy hh:mm a"
                slotProps={{
                  textField: { variant: "outlined" },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        background: gradients.paper,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.3
                        )}`,
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />

              <DateTimePicker
                label="To Date & Time"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                minDateTime={fromDate}
                maxDateTime={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      width: 220,
                      "& .MuiOutlinedInput-root": {
                        height: "50px",
                        borderRadius: 2,
                        backgroundColor:
                          mode === "light" ? "#FFFFFF" : "#1F2937",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                        fontFamily: "'Inter', sans-serif",
                      },
                      "& .MuiInputLabel-root": {
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontFamily: "'Inter', sans-serif",
                        "&.Mui-focused": {
                          color: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                )}
                format="MM/dd/yyyy hh:mm a"
                slotProps={{
                  textField: { variant: "outlined" },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": {
                        background: gradients.paper,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.3
                        )}`,
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleExecute}
                disabled={!queryName || !fromDate || !toDate}
                startIcon={<PlayArrow />}
                sx={{
                  height: "50px",
                  background: gradients.primary,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                  "&:hover": {
                    background: gradients.hover,
                    transform: "translateY(-2px)",
                    boxShadow: `0 6px 16px ${alpha(
                      theme.palette.primary.main,
                      0.4
                    )}`,
                  },
                  "&:active": { transform: "translateY(0)" },
                  px: 3,
                  flexShrink: 0,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Execute
              </Button>

              <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
                <Tooltip title="Export as PDF">
                  <IconButton
                    onClick={handleExportPDF}
                    disabled={logs.length === 0}
                    aria-label="Export as PDF"
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      height: 50,
                      width: 50,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.error.main, 0.2),
                        transform: "scale(1.05)",
                      },
                      "&:active": { transform: "scale(1)" },
                      "&.Mui-disabled": { opacity: 0.5 },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <PictureAsPdf
                      sx={{
                        color:
                          logs.length > 0 ? theme.palette.error.main : "#aaa",
                      }}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Export as Excel">
                  <IconButton
                    onClick={handleExportExcel}
                    disabled={logs.length === 0}
                    aria-label="Export as Excel"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      height: 50,
                      width: 50,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.success.main, 0.2),
                        transform: "scale(1.05)",
                      },
                      "&:active": { transform: "scale(1)" },
                      "&.Mui-disabled": { opacity: 0.5 },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <TableChart
                      sx={{
                        color:
                          logs.length > 0 ? theme.palette.success.main : "#aaa",
                      }}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Export as CSV">
                  <IconButton
                    onClick={handleExportCSV}
                    disabled={logs.length === 0}
                    aria-label="Export as CSV"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      height: 50,
                      width: 50,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                        transform: "scale(1.05)",
                      },
                      "&:active": { transform: "scale(1)" },
                      "&.Mui-disabled": { opacity: 0.5 },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Description
                      sx={{
                        color:
                          logs.length > 0 ? theme.palette.warning.main : "#aaa",
                      }}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Refresh Query">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={!queryName || !fromDate || !toDate}
                    aria-label="Refresh Query"
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      height: 50,
                      width: 50,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.info.main, 0.2),
                        transform: "scale(1.05)",
                      },
                      "&:active": { transform: "scale(1)" },
                      "&.Mui-disabled": { opacity: 0.5 },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Refresh
                      sx={{
                        color:
                          queryName && fromDate && toDate
                            ? theme.palette.info.main
                            : "#aaa",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              <FormControl sx={{ width: 220, flexShrink: 0 }}>
                <InputLabel
                  id="saved-queries-label"
                  sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
                >
                  Saved Queries
                </InputLabel>
                <Select
                  labelId="saved-queries-label"
                  value={selectedSavedQuery}
                  onChange={handleSavedQuerySelect}
                  label="Saved Queries"
                  sx={{
                    height: "50px",
                    borderRadius: 2,
                    backgroundColor: mode === "light" ? "#FFFFFF" : "#1F2937",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    "& .MuiSelect-select": {
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                    },
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <MenuItem value="">
                    <em>Select a saved query</em>
                  </MenuItem>
                  {savedQueries.map((query) => (
                    <MenuItem
                      key={query.id}
                      value={query.id}
                      sx={{ fontWeight: 500 }}
                    >
                      {query.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Save Query">
                <IconButton
                  onClick={handleSaveIconClick}
                  disabled={!queryName || !fromDate || !toDate}
                  aria-label="Save Query"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    height: 50,
                    width: 50,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      transform: "scale(1.05)",
                    },
                    "&:active": { transform: "scale(1)" },
                    "&.Mui-disabled": { opacity: 0.5 },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Save
                    sx={{
                      color:
                        mode === "light"
                          ? theme.palette.primary.main
                          : theme.palette.success.main,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>

            <Popover
              id={savePopoverId}
              open={isSavePopoverOpen}
              anchorEl={saveAnchorEl}
              onClose={handleSaveClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  width: 340,
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                  background: gradients.paper,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              <Box
                sx={{
                  p: 3,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Save Query
                </Typography>
                <TextField
                  label="Query Name"
                  variant="outlined"
                  size="medium"
                  fullWidth
                  value={customQueryName}
                  onChange={(e) => setCustomQueryName(e.target.value)}
                  autoFocus
                  sx={{
                    mt: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: mode === "light" ? "#FFFFFF" : "#1F2937",
                      fontFamily: "'Inter', sans-serif",
                    },
                    "& .MuiInputLabel-root": {
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                    mt: 1,
                  }}
                >
                  <Button
                    onClick={handleSaveClose}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: 2,
                      borderColor: theme.palette.text.secondary,
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveQuery}
                    variant="contained"
                    size="large"
                    sx={{
                      background: gradients.primary,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                      "&:hover": {
                        background: gradients.hover,
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 16px ${alpha(
                          theme.palette.primary.main,
                          0.4
                        )}`,
                      },
                      "&:active": { transform: "translateY(0)" },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Paper>

          {logs.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper
                elevation={4}
                sx={{
                  padding: 2,
                  background: gradients.paper,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  boxShadow: `0 8px 24px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                  borderRadius: 3,
                  flex: 1,
                  position: "relative",
                  overflow: "auto",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: `0 12px 32px ${alpha(
                      theme.palette.primary.main,
                      0.25
                    )}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <DataGrid
                  rows={logs}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  autoHeight
                  sx={{
                    "& .MuiDataGrid-root": {
                      border: "none",
                      backgroundColor: mode === "light" ? "#FFFFFF" : "#1F2937",
                      fontFamily: "'Inter', sans-serif",
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                      color: mode === "light" ? "#1F2937" : "#F3F4F6",
                      fontWeight: 500,
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      background: gradients.primary,

                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: "scale(1.005)",
                      transition: "all 0.2s ease",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: 500,
                    },
                  }}
                />
              </Paper>

              {Object.keys(statistics).length > 0 && (
                <Fade in timeout={800}>
                  <Box
                    sx={{
                      background: gradients.paper,
                      borderRadius: 3,
                      padding: 3,
                      boxShadow: `0 6px 20px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: `0 10px 28px ${alpha(
                          theme.palette.primary.main,
                          0.25
                        )}`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: mode === "light" ? "#1F2937" : "#F3F4F6",
                        mb: 2,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Measurand Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      {measurandNames.map((measurand, index) => (
                        <Grid item xs={12} sm={6} md={4} key={measurand}>
                          <Box
                            sx={{
                              background:
                                statistics[measurand]?.color ||
                                colors[index % colors.length],
                              color: "#FFFFFF",
                              borderRadius: 2,
                              padding: 2,
                              boxShadow: `0 4px 12px ${alpha(
                                statistics[measurand]?.color ||
                                  colors[index % colors.length],
                                0.4
                              )}`,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.03)",
                                boxShadow: `0 6px 16px ${alpha(
                                  statistics[measurand]?.color ||
                                    colors[index % colors.length],
                                  0.5
                                )}`,
                              },
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                mb: 1,
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {measurand}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              Avg: {statistics[measurand]?.mean || "N/A"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              Min: {statistics[measurand]?.min || "N/A"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              Max: {statistics[measurand]?.max || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              )}
            </Box>
          )}

          <LogGraph
            open={graphOpen}
            onClose={handleGraphClose}
            logs={logs}
            measurandNames={measurandNames}
            selectedMeasurand={selectedMeasurand}
            compareMeasurands={compareMeasurands}
            onCompareChange={handleCompareChange}
            mode={mode}
          />
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default LogView;
