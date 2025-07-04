import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  Alert,
  Skeleton,
  styled,
  useTheme,
  Tooltip,
} from "@mui/material";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import { DataGrid } from "@mui/x-data-grid";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale);

// Styled Icon Wrapper
const StyledIcon = styled("span")(({ theme, status }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0.5),
  borderRadius: "50%",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.4) 100%)"
      : "linear-gradient(145deg, rgba(0,0,0,0.1) 0%, rgba(255,255,255,0.2) 100%)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)"
      : "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.8)",
}));

// Custom 3D Pie Chart Component
const Chart3DPie = ({ data, options, height = 300 }) => {
  const theme = useTheme();

  // Enhanced data for 3D effect
  const enhanced3DData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor.map((color, index) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 100);

        if (color === "#417505") {
          gradient.addColorStop(0, "#66ff66");
          gradient.addColorStop(0.7, "#417505");
          gradient.addColorStop(1, "#00cc00");
        } else if (color === "#d0021b") {
          gradient.addColorStop(0, "#ff6666");
          gradient.addColorStop(0.7, "#d0021b");
          gradient.addColorStop(1, "#cc0000");
        }

        return gradient;
      }),
      borderWidth: 3,
      borderColor: dataset.backgroundColor.map((color) =>
        color === "#417505" ? "#00aa00" : "#aa0000"
      ),
      offset: data.datasets[0].data.map(() => 15),
      hoverOffset: 25,
      segment: {
        borderWidth: 4,
        borderSkipped: false,
      },
    })),
  };

  const enhanced3DOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins.legend,
        labels: {
          ...options.plugins.legend.labels,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 20,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);

                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                  pointStyle: "circle",
                  fontColor:
                    theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        ...options.plugins.tooltip,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          ...options.plugins.tooltip.callbacks,
          title: (context) => {
            return `${context[0].label} Status`;
          },
          label: (context) => {
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `Count: ${value}`,
              `Percentage: ${percentage}%`,
              `Total: ${total}`,
            ];
          },
        },
      },
    },
    rotation: -Math.PI / 2,
    cutout: "20%",
    spacing: 2,
  };

  return (
    <Box
      sx={{
        height: height,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "-10px",
          bottom: "-10px",
          background: `linear-gradient(135deg, 
                        ${
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)"
                        } 0%, 
                        transparent 50%)`,
          borderRadius: "50%",
          zIndex: -1,
          transform: "translateZ(-10px)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "-20px",
          bottom: "-20px",
          background: `radial-gradient(ellipse at center, 
                        transparent 40%, 
                        ${
                          theme.palette.mode === "dark"
                            ? "rgba(0,0,0,0.3)"
                            : "rgba(0,0,0,0.1)"
                        } 70%)`,
          borderRadius: "50%",
          zIndex: -2,
          transform: "translateZ(-20px)",
        },
      }}
    >
      <Doughnut data={enhanced3DData} options={enhanced3DOptions} />
    </Box>
  );
};

const DataCard = styled(Card)(({ theme, status, isBridge }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor:
    status === true ? "#417505" : status === false ? "#d0021b" : "#1976d2",
  ...(isBridge
    ? {
        boxShadow:
          theme.palette.mode === "dark"
            ? "inset 3px 3px 6px rgba(255,255,255,0.2), inset -3px -3px 6px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)"
            : "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.1)",
      }
    : {
        boxShadow:
          theme.palette.mode === "dark"
            ? "inset 3px 3px 6px rgba(255,255,255,0.2), inset -3px -3px 6px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)"
            : "inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.1)",
      }),
  width: "100%",
  textAlign: "center",
  ...(status === true && {
    animation: "blink 2s infinite",
    "@keyframes blink": {
      "0%": { opacity: 1 },
      "50%": { opacity: 0.5 },
      "100%": { opacity: 1 },
    },
  }),
}));

const GlobalStyles = styled("style")({
  "@keyframes blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.5 },
    "100%": { opacity: 1 },
  },
  "@keyframes pulse": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e, #2d2d2d)"
      : "linear-gradient(145deg, #ffffff, #f5f5f5)",
  width: "100%",
}));

const Enhanced3DCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 50%, #1e1e1e 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)"
      : "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
  transition: "all 0.3s ease-in-out",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.05)",
  width: "100%",
}));

function StatusMonitoring() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8008/api/get-escomstat"); // Updated URL
        const data = await response.json(); // Assuming the response is JSON
        setData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 33000); // Fetch every 33 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  // Calculate Bridge and Terminal statistics
  const bridgeStats = {
    total: data.length,
    trueCount: data.filter((item) => item.Status === true).length,
    falseCount: data.filter((item) => item.Status === false).length,
  };

  const terminalStats = {
    total: data.reduce(
      (acc, item) => acc + (item.TerminalDetails || []).length,
      0
    ),
    trueCount: data.reduce(
      (acc, item) =>
        acc +
        (item.TerminalDetails || []).filter(
          (terminal) => terminal.Status === true
        ).length,
      0
    ),
    falseCount: data.reduce(
      (acc, item) =>
        acc +
        (item.TerminalDetails || []).filter(
          (terminal) => terminal.Status === false
        ).length,
      0
    ),
  };

  // Enhanced 3D Pie chart data for Bridges
  const bridgeChartData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [bridgeStats.trueCount, bridgeStats.falseCount],
        backgroundColor: ["#417505", "#d0021b"],
        borderColor: ["#00aa00", "#aa0000"],
        borderWidth: 2,
      },
    ],
  };

  // Enhanced 3D Pie chart data for Terminals
  const terminalChartData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [terminalStats.trueCount, terminalStats.falseCount],
        backgroundColor: ["#417505", "#d0021b"],
        borderColor: ["#00aa00", "#aa0000"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
          font: {
            size: 12,
            weight: "bold",
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
        bodyColor: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
        borderColor: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
      },
    },
  };

  const CardSkeleton = () => (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={80}
      sx={{ mb: 2, borderRadius: 2 }}
    />
  );

  // Calculate maximum character lengths for BridgeName and TerminalNames
  const maxBridgeNameLength = Math.max(
    ...data.map((item) => (item.BridgeName || "N/A").length),
    10
  );
  const maxTerminals = Math.max(
    ...data.map((item) => (item.TerminalDetails || []).length),
    1
  );
  const terminalNameLengths = Array(maxTerminals).fill(5);
  data.forEach((item) => {
    (item.TerminalDetails || []).forEach((terminal, index) => {
      const nameLength = (terminal.TerminalName || "N/A").length;
      if (index < maxTerminals && nameLength > terminalNameLengths[index]) {
        terminalNameLengths[index] = nameLength;
      }
    });
  });

  // Calculate dynamic row height based on maximum name length
  const baseRowHeight = 60;
  const maxNameLength = Math.max(maxBridgeNameLength, ...terminalNameLengths);
  const rowHeight = Math.max(
    baseRowHeight,
    baseRowHeight + Math.floor(maxNameLength / 10) * 10
  );

  const gridData = data.map((item, idx) => {
    const row = {
      id: idx + 1,
      bridgeName: item.BridgeName || "N/A",
      bridgeStatus: item.Status,
    };
    (item.TerminalDetails || []).forEach((terminal, index) => {
      row[`terminal${index + 1}`] = terminal.TerminalName || "N/A";
      row[`terminalStatus${index + 1}`] = terminal.Status;
    });
    return row;
  });

  const columns = [
    {
      field: "bridgeName",
      headerName: "Bridge",
      flex: maxBridgeNameLength / 10,
      headerClassName: "header-style",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            animation:
              params.row.bridgeStatus === true ? "blink 2s infinite" : "none",
            "@keyframes blink": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.5 },
              "100%": { opacity: 1 },
            },
          }}
        >
          <DataCard status={params.row.bridgeStatus} isBridge={true}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color:
                  params.row.bridgeStatus === true
                    ? "#ffffff"
                    : params.row.bridgeStatus === false
                    ? "#ffffff"
                    : theme.palette.mode === "dark"
                    ? "#ffffff"
                    : "#1976d2",
              }}
            >
              {params.value}
            </Typography>
          </DataCard>
        </Box>
      ),
    },
    ...Array.from({ length: maxTerminals }, (_, i) => ({
      field: `terminal${i + 1}`,
      headerName: `Terminal ${i + 1}`,
      flex: terminalNameLengths[i] / 10,
      headerClassName: "header-style",
      headerAlign: "center",
      renderCell: (params) => {
        const terminalStatus = params.row[`terminalStatus${i + 1}`];
        return params.value && params.value !== "N/A" ? (
          <Box
            sx={{
              animation: terminalStatus === true ? "blink 2s infinite" : "none",
              "@keyframes blink": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            }}
          >
            <DataCard status={terminalStatus} isBridge={false}>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color:
                    terminalStatus === true
                      ? "#ffffff"
                      : terminalStatus === false
                      ? "#ffffff"
                      : theme.palette.mode === "dark"
                      ? "#ffffff"
                      : "#1976d2",
                }}
              >
                {params.value}
              </Typography>
            </DataCard>
          </Box>
        ) : null;
      },
    })),
  ];

  return (
    <>
      <GlobalStyles />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #121212 0%, #1e1e1e 100%)"
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          py: 8,
          px: 3,
          mt: 1,
        }}
      >
        <Container maxWidth="xxl">
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 5,
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              {error}
            </Alert>
          )}

          {!loading && data.length > 0 && (
            <Grid container spacing={4} columns={12}>
              <Grid xs={12} md={6}>
                <Enhanced3DCard>
                  <CardHeader
                    title={
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(45deg, #ffffff, #ffffff)"
                              : "linear-gradient(45deg, #0000ff, #0000ff)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Bridge Status Indicator">
                          <StyledIcon>
                            <SettingsEthernetIcon sx={{ fontSize: "1.8rem" }} />
                          </StyledIcon>
                        </Tooltip>
                        <Box component="span" sx={{ ml: 1 }}>
                          Bridge Status
                        </Box>
                      </Typography>
                    }
                    subheader={
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: "center",
                          fontWeight: "medium",
                          color:
                            theme.palette.mode === "dark"
                              ? "#fff"
                              : "text.secondary",
                        }}
                      >
                        Total Bridges: {bridgeStats.total} | Active:{" "}
                        {bridgeStats.trueCount} | Inactive:{" "}
                        {bridgeStats.falseCount}
                      </Typography>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent sx={{ pt: 0, pb: 2 }}>
                    <Chart3DPie
                      data={bridgeChartData}
                      options={chartOptions}
                      height={250}
                    />
                  </CardContent>
                </Enhanced3DCard>
              </Grid>
              <Grid xs={12} md={6}>
                <Enhanced3DCard>
                  <CardHeader
                    title={
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          background:
                            theme.palette.mode === "dark"
                              ? "linear-gradient(45deg, #ffffff, #ffffff)"
                              : "linear-gradient(45deg, #0000ff, #0000ff)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="Terminal Status Indicator">
                          <StyledIcon>
                            <ElectricMeterIcon sx={{ fontSize: "1.8rem" }} />
                          </StyledIcon>
                        </Tooltip>
                        <Box component="span" sx={{ ml: 1 }}>
                          Terminal Status
                        </Box>
                      </Typography>
                    }
                    subheader={
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: "center",
                          fontWeight: "medium",
                          color:
                            theme.palette.mode === "dark"
                              ? "#fff"
                              : "text.secondary",
                        }}
                      >
                        Total Terminals: {terminalStats.total} | Active:{" "}
                        {terminalStats.trueCount} | Inactive:{" "}
                        {terminalStats.falseCount}
                      </Typography>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent sx={{ pt: 0, pb: 2 }}>
                    <Chart3DPie
                      data={terminalChartData}
                      options={chartOptions}
                      height={250}
                    />
                  </CardContent>
                </Enhanced3DCard>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={5} columns={12}>
            <Grid xs={12}>
              <StyledCard>
                <CardContent>
                  {loading ? (
                    <>
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                    </>
                  ) : data.length === 0 ? (
                    <Typography
                      variant="body1"
                      color={
                        theme.palette.mode === "dark"
                          ? "#bbbbbb"
                          : "text.secondary"
                      }
                      sx={{ textAlign: "center", py: 5 }}
                    >
                      No bridges or terminals available
                    </Typography>
                  ) : (
                    <DataGrid
                      rows={gridData}
                      columns={columns}
                      autoHeight
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 9,
                            page: 0,
                          },
                        },
                      }}
                      pageSizeOptions={[9, 10, 20, 50]}
                      disableRowSelectionOnClick
                      sx={{
                        "& .MuiDataGrid-root": {
                          borderRadius: 2,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#ffffff",
                        },
                        "& .header-style": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#1e1e1e"
                              : "#f0f0f0",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color:
                            theme.palette.mode === "dark"
                              ? "#ffffff"
                              : "text.primary",
                        },
                        "& .MuiDataGrid-columnHeader": {
                          textAlign: "center",
                          justifyContent: "center",
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                          width: "100%",
                          textAlign: "center",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        },
                        "& .MuiDataGrid-columnHeaderTitleContainer": {
                          justifyContent: "center",
                          width: "100%",
                        },
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#1e1e1e"
                              : "#fafafa",
                        },
                        "& .MuiDataGrid-cell": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#ffffff",
                        },
                        "& .MuiDataGrid-footerContainer": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#000000"
                              : "#ffffff",
                          color:
                            theme.palette.mode === "dark"
                              ? "#ffffff"
                              : "text.primary",
                        },
                        mt: 2,
                      }}
                    />
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default StatusMonitoring;
