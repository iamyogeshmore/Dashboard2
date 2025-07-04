import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Divider,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Description as ReportIcon,
  DataArray as QueryIcon,
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

function GenerateReport() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [queryNames, setQueryNames] = useState([]);
  const [selectedQueries, setSelectedQueries] = useState([]);
  const [queryDetails, setQueryDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info",
  });
  const [generatedReportId, setGeneratedReportId] = useState("");
  const [reportStatus, setReportStatus] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [countdown, setCountdown] = useState(20); // New state for countdown

  const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

  // Stepper state
  const getActiveStep = () => {
    if (!selectedReport) return 0;
    if (selectedQueries.length === 0) return 1;
    if (!areAllQueryDetailsFilled()) return 2;
    if (generatingReport && !isReportReady) return 3;
    if (isReportReady) return 4;
    return 2;
  };

  // Check if all query details are filled
  const areAllQueryDetailsFilled = () => {
    return selectedQueries.every((queryId) => {
      const details = queryDetails[queryId] || {};
      return (
        details.fromDate && details.toDate && details.fromTime && details.toTime
      );
    });
  };

  // Effects
  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (generatedReportId && !isReportReady) {
      checkReportStatus();
    }
  }, [generatedReportId, isReportReady]);

  useEffect(() => {
    setSelectedQueries([]);
    setQueryDetails({});
    if (selectedReport) {
      fetchQueryNames(selectedReport);
    } else {
      setQueryNames([]);
    }
  }, [selectedReport]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (generatingReport && !isReportReady && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup on unmount or when countdown stops
  }, [generatingReport, isReportReady, countdown]);

  // API functions
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch.get(`${API_BASE_URL}/getReport`);
      const enabledReports = response.data.filter(
        (report) => report.Enable === true
      );
      setReports(enabledReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showNotification("Failed to fetch reports", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryNames = async (reportId) => {
    setLoading(true);
    try {
      const response = await fetch.get(
        `${API_BASE_URL}/getReportDetails/${reportId}`
      );
      if (response.data && response.data.QueryDetails) {
        setQueryNames(response.data.QueryDetails);
      } else {
        setQueryNames([]);
      }
    } catch (error) {
      console.error("Error fetching query names:", error);
      showNotification("Failed to fetch query names", "error");
      setQueryNames([]);
    } finally {
      setLoading(false);
    }
  };

  const checkReportStatus = async () => {
    if (!generatedReportId || isReportReady) return;

    setCheckingStatus(true);
    try {
      const response = await fetch.get(
        `${API_BASE_URL}/getReportStatus/${generatedReportId}`
      );
      const status = response.data.status === true;
      setReportStatus(status);

      if (status) {
        setIsReportReady(true);
        showNotification("Report is ready for download", "success");
        setLoading(false);
        setGeneratingReport(false);
        setCountdown(20); // Reset countdown when report is ready
      } else {
        setTimeout(() => checkReportStatus(), 20000);
      }
    } catch (error) {
      console.error("Error checking report status:", error);
      showNotification("Failed to check report status", "error");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleGenerateReport = async () => {
    if (
      !selectedReport ||
      selectedQueries.length === 0 ||
      !areAllQueryDetailsFilled()
    ) {
      showNotification(
        "Please complete all required fields for all selected queries",
        "warning"
      );
      return;
    }

    setLoading(true);
    setGeneratingReport(true);
    setReportStatus(false);
    setIsReportReady(false);
    setCountdown(20); // Initialize countdown

    try {
      const queryDetailsArray = selectedQueries.map((queryId) => {
        const query = queryNames.find((q) => q._id === queryId);
        return {
          QueryName: query.QueryName,
          fromDate: queryDetails[queryId].fromDate,
          toDate: queryDetails[queryId].toDate,
          fromTime: queryDetails[queryId].fromTime,
          toTime: queryDetails[queryId].toTime,
        };
      });

      const response = await fetch.post(`${API_BASE_URL}/generateReport`, {
        reportId: selectedReport,
        queryDetails: queryDetailsArray,
      });

      showNotification("Report generation initiated successfully", "info");
      setGeneratedReportId(response.data.esolReport._id);
      checkReportStatus();
      fetchReports();
    } catch (error) {
      console.error("Error generating report:", error);
      showNotification("Failed to generate report", "error");
      setLoading(false);
      setGeneratingReport(false);
      setCountdown(20); // Reset countdown on error
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch.get(
        `${API_BASE_URL}/getReportFile/${generatedReportId}`,
        {
          responseType: "blob", // Important for handling binary data
        }
      );

      // Create a Blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Get the filename from the Content-Disposition header or fallback to report name
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "report.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      } else {
        // Fallback to report name from reports state
        const report = reports.find((r) => r._id === selectedReport);
        if (report) {
          fileName = `${report.RepName}.xlsx`;
        }
      }

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification("Report downloaded successfully", "success");
      resetFormFields();
    } catch (error) {
      console.error("Error downloading report:", error);
      showNotification("Failed to download report", "error");
    }
  };

  const resetFormFields = () => {
    setSelectedReport("");
    setSelectedQueries([]);
    setQueryDetails({});
    setIsReportReady(false);
    setGeneratedReportId("");
    setReportStatus(false);
    setCountdown(20); // Reset countdown
  };

  const showNotification = (message, type = "info") => {
    setNotification({ open: true, message, type });
  };

  const handleQueryDetailsChange = (queryId, field, value) => {
    setQueryDetails((prev) => ({
      ...prev,
      [queryId]: {
        ...prev[queryId],
        [field]: value,
      },
    }));
  };

  // Step definitions for stepper
  const steps = [
    "Select Report Type",
    "Select Queries",
    "Set Date Ranges",
    "Generating Report",
    "Download Report",
  ];

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth={false} sx={{ mb: 4, mt: 10, maxWidth: "120rem" }}>
      <Card elevation={3} sx={{ overflow: "visible" }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              bgcolor: theme.palette.primary.main,
              color: "white",
              borderTopLeftRadius: theme.shape.borderRadius,
              borderTopRightRadius: theme.shape.borderRadius,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ReportIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h5" fontWeight="500">
              Report Generator
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
            {!isSmallScreen ? (
              <Stepper activeStep={getActiveStep()} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Typography
                variant="subtitle1"
                color="textSecondary"
                align="center"
              >
                Step {getActiveStep() + 1} of {steps.length}:{" "}
                {steps[getActiveStep()]}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Main Form Content */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} columns={12}>
              {/* Report Selection */}
              <Grid xs={12} md={6}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: theme.shape.borderRadius,
                    },
                  }}
                >
                  <InputLabel id="report-select-label">
                    Select Report Type
                  </InputLabel>
                  <Select
                    labelId="report-select-label"
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    label="Select Report Type"
                    startAdornment={
                      <ReportIcon
                        sx={{
                          mr: 1,
                          ml: -0.5,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    }
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading reports...
                      </MenuItem>
                    ) : reports.length === 0 ? (
                      <MenuItem disabled>No reports available</MenuItem>
                    ) : (
                      reports.map((report) => (
                        <MenuItem key={report._id} value={report._id}>
                          {report.RepName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Query Selection */}
              <Grid xs={12} md={6}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  disabled={!selectedReport || queryNames.length === 0}
                >
                  <InputLabel id="query-select-label">
                    Select Queries
                  </InputLabel>
                  <Select
                    labelId="query-select-label"
                    multiple
                    value={selectedQueries}
                    onChange={(e) => setSelectedQueries(e.target.value)}
                    label="Select Queries"
                    startAdornment={
                      <QueryIcon
                        sx={{
                          mr: 1,
                          ml: -0.5,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    }
                    renderValue={(selected) =>
                      selected
                        .map(
                          (id) =>
                            queryNames.find((q) => q._id === id)?.QueryName
                        )
                        .join(", ")
                    }
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading queries...
                      </MenuItem>
                    ) : queryNames.length === 0 ? (
                      <MenuItem disabled>No queries available</MenuItem>
                    ) : (
                      queryNames.map((query) => (
                        <MenuItem key={query._id} value={query._id}>
                          {query.QueryName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range Section for Each Query */}
              {selectedQueries.map((queryId) => {
                const query = queryNames.find((q) => q._id === queryId);
                return (
                  <Grid xs={12} key={queryId}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        fontWeight: 500,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Date Range for {query?.QueryName}
                    </Typography>
                    <Grid container spacing={3} columns={12}>
                      <Grid xs={12} sm={6} md={3}>
                        <TextField
                          label="From Date"
                          type="date"
                          value={queryDetails[queryId]?.fromDate || ""}
                          onChange={(e) =>
                            handleQueryDetailsChange(
                              queryId,
                              "fromDate",
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <CalendarIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid xs={12} sm={6} md={3}>
                        <TextField
                          label="From Time"
                          type="time"
                          value={queryDetails[queryId]?.fromTime || ""}
                          onChange={(e) =>
                            handleQueryDetailsChange(
                              queryId,
                              "fromTime",
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <TimeIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid xs={12} sm={6} md={3}>
                        <TextField
                          label="To Date"
                          type="date"
                          value={queryDetails[queryId]?.toDate || ""}
                          onChange={(e) =>
                            handleQueryDetailsChange(
                              queryId,
                              "toDate",
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <CalendarIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid xs={12} sm={6} md={3}>
                        <TextField
                          label="To Time"
                          type="time"
                          value={queryDetails[queryId]?.toTime || ""}
                          onChange={(e) =>
                            handleQueryDetailsChange(
                              queryId,
                              "toTime",
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <TimeIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette.text.secondary,
                                }}
                              />
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Divider />

          {/* Action Buttons */}
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={resetFormFields}
              startIcon={<RefreshIcon />}
              sx={{ flexGrow: isSmallScreen ? 1 : 0 }}
            >
              Reset
            </Button>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexGrow: isSmallScreen ? 1 : 0,
                width: isSmallScreen ? "100%" : "auto",
                mt: isSmallScreen ? 2 : 0,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                disabled={
                  loading ||
                  generatingReport ||
                  isReportReady ||
                  !selectedReport ||
                  selectedQueries.length === 0 ||
                  !areAllQueryDetailsFilled()
                }
                startIcon={
                  generatingReport ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ReportIcon />
                  )
                }
                sx={{ flexGrow: 1 }}
              >
                {generatingReport ? "Generating..." : "Generate Report"}
              </Button>

              {isReportReady && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleDownloadReport}
                  startIcon={<DownloadIcon />}
                  sx={{ flexGrow: 1 }}
                >
                  Download Report
                </Button>
              )}
            </Box>
          </Box>

          {/* Status Section with Countdown */}
          {generatingReport && !isReportReady && (
            <Box
              sx={{
                p: 3,
                bgcolor: theme.palette.info.light,
                color: theme.palette.info.contrastText,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress
                  size={24}
                  sx={{ mr: 2, color: "currentColor" }}
                />
                <Typography>
                  Generating your report. Time remaining: {countdown} seconds...
                </Typography>
              </Box>
            </Box>
          )}

          {isReportReady && (
            <Box
              sx={{
                p: 3,
                bgcolor: theme.palette.success.light,
                color: theme.palette.success.contrastText,
              }}
            >
              <Typography>Your report is ready to download!</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default GenerateReport;
