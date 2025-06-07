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
} from "@mui/material";
import {
  PlayArrow,
  Save,
  QueryStats,
  PictureAsPdf,
  TableChart,
  Description,
  Refresh,
} from "@mui/icons-material";
import { useThemeContext } from "../../context/ThemeContext";
import { DataGrid } from "@mui/x-data-grid";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO, isBefore, subDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const queryOptions = [
    "Error Logs",
    "System Logs",
    "Access Logs",
    "Performance Logs",
  ];

  // Memoize gradients for performance
  const gradients = useMemo(
    () => ({
      primary:
        mode === "light"
          ? "linear-gradient(45deg, #1E40AF, #3B82F6)"
          : "linear-gradient(45deg, #166534, #22C55E)",
      hover:
        mode === "light"
          ? "linear-gradient(45deg, #1E3A8A, #2563EB)"
          : "linear-gradient(45deg, #14532D, #16A34A)",
      paper:
        mode === "light"
          ? "linear-gradient(135deg, #FFFFFF, #F8FAFC)"
          : "linear-gradient(135deg, #1F2937, #111827)",
      container:
        mode === "light"
          ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
          : "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
    }),
    [mode]
  );

  // Load saved queries from localStorage on mount
  useEffect(() => {
    try {
      const storedQueries = localStorage.getItem("savedLogQueries");
      if (storedQueries) {
        setSavedQueries(JSON.parse(storedQueries));
      }
    } catch (error) {
      console.error("Failed to load saved queries from localStorage:", error);
    }
  }, []);

  // Sample data generation for the data grid
  const generateMockLogs = () => {
    const mockLogs = [];
    const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
    const sources = ["Server", "Database", "Application", "Network"];
    const startTime = fromDate
      ? fromDate.getTime()
      : subDays(new Date(), 1).getTime();
    const endTime = toDate ? toDate.getTime() : new Date().getTime();

    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(
        startTime + Math.random() * (endTime - startTime)
      ).toISOString();
      mockLogs.push({
        id: uuidv4(),
        timestamp,
        level: levels[Math.floor(Math.random() * levels.length)],
        message: `Log message ${i + 1} for ${queryName || "selected query"}`,
        source: sources[Math.floor(Math.random() * sources.length)],
      });
    }
    return mockLogs;
  };

  // Handle Execute button click
  const handleExecute = () => {
    if (!queryName || !fromDate || !toDate) {
      alert("Please select a query name and valid date range.");
      return;
    }
    if (isBefore(toDate, fromDate)) {
      alert("To date must be after From date.");
      return;
    }
    setLogs(generateMockLogs());
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
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (logs.length === 0) return;
    const doc = new jsPDF();
    doc.text("Log Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Timestamp", "Level", "Message", "Source"]],
      body: logs.map((log) => [
        log.timestamp,
        log.level,
        log.message,
        log.source,
      ]),
      theme: "striped",
      headStyles: { fillColor: mode === "light" ? "#1E40AF" : "#166534" },
    });
    doc.save(`log_report_${new Date().toISOString()}.pdf`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (logs.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(workbook, `log_report_${new Date().toISOString()}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(logs);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `log_report_${new Date().toISOString()}.csv`;
    link.click();
  };

  // Data grid columns
  const columns = [
    { field: "timestamp", headerName: "Timestamp", width: 200, sortable: true },
    { field: "level", headerName: "Level", width: 120 },
    { field: "message", headerName: "Message", width: 400, flex: 1 },
    { field: "source", headerName: "Source", width: 150 },
  ];

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
            padding: 2,
            background: gradients.container,
            borderRadius: 3,
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: "all 0.3s ease",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 3,
              background: gradients.paper,
              boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
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
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: `0 8px 28px ${alpha(
                  theme.palette.primary.main,
                  0.2
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
                <InputLabel id="query-name-label">
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
                  label="Query Name label"
                  sx={{
                    height: "50px",
                    borderRadius: 2,
                    backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select a query
                  </MenuItem>
                  {queryOptions.map((query) => (
                    <MenuItem key={query} value={query}>
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
                          mode === "light" ? "#F8FAFC" : "#1F2937",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: theme.palette.text.secondary,
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
                          mode === "light" ? "#F8FAFC" : "#1F2937",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: theme.palette.text.secondary,
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
                <InputLabel id="saved-queries-label">Saved Queries</InputLabel>
                <Select
                  labelId="saved-queries-label"
                  value={selectedSavedQuery}
                  onChange={handleSavedQuerySelect}
                  label="Saved Queries"
                  sx={{
                    height: "50px",
                    borderRadius: 2,
                    backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select a saved query</em>
                  </MenuItem>
                  {savedQueries.map((query) => (
                    <MenuItem key={query.id} value={query.id}>
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
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
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
                      backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
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
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
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
                      "&:hover": {
                        background: gradients.hover,
                        transform: "translateY(-2px)",
                      },
                      "&:active": { transform: "translateY(0)" },
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            </Popover>
          </Paper>

          {logs.length > 0 && (
            <Paper
              elevation={4}
              sx={{
                padding: 2,
                background: gradients.container,
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
                    backgroundColor:
                      mode === "light"
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(15, 23, 42, 0.9)",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.1
                    )}`,
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    background: gradients.paper,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              />
            </Paper>
          )}
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default LogView;
