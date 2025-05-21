import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  alpha,
  Divider,
  Tooltip,
  Badge,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  ArrowBack,
  Download,
  Assessment,
  DateRange,
  BarChart,
  Bolt,
  Refresh,
  WbSunny,
  Settings,
  FilterAlt,
  Speed,
  Save,
  Edit,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useThemeContext } from "../../../../context/ThemeContext";
import ExportPDFButton from "../../Helper/ExportPDFButton";
import ExportExcelButton from "../../Helper/ExportExcelButton";
import MeasurandGraphDialog from "../../Helper/MeasurandGraphDialog";
import { useParams } from "react-router-dom";

const availableTerminals = [
  "Mill Motor 1A 680kW",
  "Mill Motor 1B 680kW",
  "Mill Motor 2A 680kW",
  "Mill Motor 2B 680kW",
];

const generateMockData = (table, numRecords = 1000) => {
  if (!table || !table.terminals || !table.measurand) return [];
  const now = new Date();
  const data = [];
  for (let i = 0; i < numRecords; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000);
    const row = {
      id: `row-${i}`,
      timestamp: timestamp.toISOString(),
    };
    table.terminals.forEach((terminal) => {
      let value;
      if (table.measurand.includes("Voltage"))
        value = (Math.random() * 50 + 180).toFixed(2);
      else if (table.measurand.includes("Current"))
        value = (Math.random() * 20 + 5).toFixed(2);
      else if (table.measurand.includes("Power"))
        value = (Math.random() * 50 + 25).toFixed(2);
      else if (table.measurand.includes("Frequency"))
        value = (Math.random() * 2 + 49).toFixed(2);
      row[terminal] = value;
    });
    data.push(row);
  }
  // Sort by timestamp descending (newest first)
  return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const HistoricalDataGridMV = ({ table: propTable, onBack, onUpdateTable }) => {
  const { mode } = useThemeContext();
  const { tableId } = useParams();
  const [table, setTable] = useState(propTable);
  const [loading, setLoading] = useState(!propTable && tableId);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredRows, setFilteredRows] = useState(
    table ? generateMockData(table, 1000) : []
  );
  const [graphDialogOpen, setGraphDialogOpen] = useState(false);
  const [tableName, setTableName] = useState(table?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedTerminals, setSelectedTerminals] = useState(
    table?.terminals || []
  );
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    if (!propTable && tableId) {
      setLoading(true);
      const tables =
        JSON.parse(localStorage.getItem("measurandHistoricalTables")) || [];
      const foundTable = tables.find((t) => t.id === tableId);
      if (foundTable) {
        setTable(foundTable);
        setTableName(
          foundTable.name ||
            `${foundTable.profile}-${foundTable.measurand}-${foundTable.terminals.length}`
        );
        setSelectedTerminals(foundTable.terminals);
        setFilteredRows(generateMockData(foundTable, 1000));
      }
      setLoading(false);
    }
  }, [tableId, propTable]);

  useEffect(() => {
    if (table && !table.data) {
      setFilteredRows(generateMockData(table, 1000));
    }
  }, [table]);

  const handleUpdateTableName = () => {
    if (tableName.trim()) {
      const updatedTable = { ...table, name: tableName };
      setTable(updatedTable);
      const tables =
        JSON.parse(localStorage.getItem("measurandHistoricalTables")) || [];
      const updatedTables = tables.map((t) =>
        t.id === table.id ? updatedTable : t
      );
      localStorage.setItem(
        "measurandHistoricalTables",
        JSON.stringify(updatedTables)
      );
      if (onUpdateTable) {
        onUpdateTable(updatedTable);
      }
      setIsEditingName(false);
    }
  };

  const handleTerminalChange = (event) => {
    const value = event.target.value;
    const newTerminals = typeof value === "string" ? value.split(",") : value;
    setSelectedTerminals(newTerminals);
    const updatedTable = { ...table, terminals: newTerminals };
    setTable(updatedTable);
    setFilteredRows(generateMockData(updatedTable, 1000));
    const tables =
      JSON.parse(localStorage.getItem("measurandHistoricalTables")) || [];
    const updatedTables = tables.map((t) =>
      t.id === table.id ? updatedTable : t
    );
    localStorage.setItem(
      "measurandHistoricalTables",
      JSON.stringify(updatedTables)
    );
    if (onUpdateTable) {
      onUpdateTable(updatedTable);
    }
  };

  const handleOpenGraphDialog = () => {
    setGraphDialogOpen(true);
  };

  const handleCloseGraphDialog = () => {
    setGraphDialogOpen(false);
  };

  const calculateDifference = (currentValue, prevValue) => {
    console.log(
      `calculateDifference: currentValue=${currentValue}, prevValue=${prevValue}`
    );
    if (
      isNaN(currentValue) ||
      isNaN(prevValue) ||
      prevValue === null ||
      currentValue === null
    ) {
      return "N/A";
    }
    const diff = (currentValue - prevValue).toFixed(2);
    if (showPercentage && prevValue !== 0) {
      const percentage = ((diff / prevValue) * 100).toFixed(2);
      console.log(`Percentage diff: ${percentage}%`);
      return `${percentage}%`;
    }
    console.log(`Raw diff: ${diff >= 0 ? `+${diff}` : diff}`);
    return diff >= 0 ? `+${diff}` : diff;
  };

  const columns = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DateRange
              sx={{
                mr: 1,
                color: mode === "light" ? "#3B82F6" : "#22C55E",
                fontSize: 18,
              }}
            />
            {date.toLocaleString()}
          </Box>
        );
      },
    },
    ...selectedTerminals.map((terminal) => ({
      field: terminal,
      headerName: terminal,
      width: 220,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const value = parseFloat(params.value);
        const rowIndex = filteredRows.findIndex((row) => row.id === params.id);
        let diff = "N/A";
        let prevValue = null;
        if (rowIndex < filteredRows.length - 1) {
          prevValue = parseFloat(filteredRows[rowIndex + 1][terminal]);
          diff = calculateDifference(value, prevValue);
        }
        const isPositive =
          diff !== "N/A" &&
          (showPercentage ? parseFloat(diff) > 0 : diff.startsWith("+"));
        let color = "#64748B";
        if (table?.measurand.includes("Voltage")) {
          if (value > 220) color = "#EF4444";
          else if (value < 180) color = "#F59E0B";
          else color = "#10B981";
        } else if (table?.measurand.includes("Power")) {
          if (value > 75) color = "#EF4444";
          else if (value > 50) color = "#10B981";
          else color = "#3B82F6";
        }
        console.log(
          `Terminal: ${terminal}, Row: ${rowIndex}, Value: ${value}, PrevValue: ${prevValue}, Diff: ${diff}, IsPositive: ${isPositive}`
        );
        return (
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography sx={{ fontWeight: 500, color }}>
              {isNaN(value) ? "N/A" : params.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color:
                  diff === "N/A"
                    ? "#64748B"
                    : isPositive
                    ? "#10B981"
                    : "#EF4444",

                opacity: 1,
              }}
            >
              {diff !== "N/A" ? `(${diff})` : "(N/A)"}
            </Typography>
          </Box>
        );
      },
    })),
  ];

  const filterRows = () => {
    if (!startDate || !endDate) return table?.data || filteredRows;
    return filteredRows.filter((row) => {
      const rowDate = new Date(row.timestamp);
      return rowDate >= startDate && rowDate <= endDate;
    });
  };

  const handleDateFilter = () => {
    setFilteredRows(filterRows());
  };

  const handleQuickFilter = (hours) => {
    const now = new Date();
    setEndDate(now);
    setStartDate(new Date(now.getTime() - hours * 60 * 60 * 1000));
    setTimeout(() => {
      setFilteredRows(filterRows());
    }, 100);
  };

  const calculateStats = () => {
    if (!table || !selectedTerminals.length) {
      return [];
    }
    return selectedTerminals.map((terminal) => {
      const values = filteredRows
        .map((row) => parseFloat(row[terminal]))
        .filter((v) => !isNaN(v));
      return {
        terminal,
        measurand: table.measurand,
        min: values.length ? Math.min(...values).toFixed(2) : "N/A",
        max: values.length ? Math.max(...values).toFixed(2) : "N/A",
        avg: values.length
          ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)
          : "N/A",
      };
    });
  };

  const stats = calculateStats();

  const getGradients = () => ({
    paper: mode === "light" ? "#FFFFFF" : "#1F2937",
    primary:
      mode === "light"
        ? "linear-gradient(45deg, #1E40AF, #3B82F6)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light"
        ? "linear-gradient(45deg, #1E3A8A, #2563EB)"
        : "linear-gradient(45deg, #14532D, #16A34A)",
    container: mode === "light" ? "#F8FAFC" : "#111827",
    configPanel:
      mode === "light"
        ? "linear-gradient(135deg, #FFFFFF, #F8FAFC)"
        : "linear-gradient(135deg, #1F2937, #111827)",
    statCard:
      mode === "light"
        ? "linear-gradient(135deg, #E0F2FE, #DBEAFE)"
        : "linear-gradient(135deg, #0F172A, #1E293B)",
    actionButton: mode === "light" ? "#3B82F6" : "#22C55E",
  });

  const gradients = getGradients();

  const handleDownload = () => {
    const tableContent = [
      columns.map((col) => col.headerName).join(","),
      ...filteredRows.map((row) =>
        columns.map((col) => row[col.field] ?? "").join(",")
      ),
    ];

    const statsContent = [
      "",
      "Data Analysis Summary",
      ["Terminal", "Measurand", "Min", "Max", "Avg"].join(","),
      ...stats.map((s) =>
        [s.terminal, s.measurand, s.min, s.max, s.avg].join(",")
      ),
    ];

    const csvContent = [...tableContent, ...statsContent].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${table?.name || table?.measurand || "data"}_data.csv`;
    link.click();
  };

  const handleSaveConfig = () => {
    if (!table) return;
    const updatedTable = {
      ...table,
      data: filteredRows,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      name: tableName,
      terminals: selectedTerminals,
    };

    const tables =
      JSON.parse(localStorage.getItem("measurandHistoricalTables")) || [];
    const updatedTables = tables.map((t) =>
      t.id === table.id ? updatedTable : t
    );
    localStorage.setItem(
      "measurandHistoricalTables",
      JSON.stringify(updatedTables)
    );

    if (onUpdateTable) {
      onUpdateTable(updatedTable);
    }

    alert("Configuration saved!");
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          background: mode === "light" ? "#F8FAFC" : "#111827",
          borderRadius: 3,
          minHeight: "600px",
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 10px 25px rgba(30, 64, 175, 0.15)"
              : "0 10px 25px rgba(22, 101, 52, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
          Loading Table...
        </Typography>
      </Paper>
    );
  }

  if (!table || !table.measurand) {
    return (
      <Paper
        sx={{
          p: 4,
          background: mode === "light" ? "#F8FAFC" : "#111827",
          borderRadius: 3,
          minHeight: "600px",
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 10px 25px rgba(30, 64, 175, 0.15)"
              : "0 10px 25px rgba(22, 101, 52, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h5"
          color="text.primary"
          sx={{ mb: 2, fontWeight: 600 }}
        >
          Table Not Found
        </Typography>
        <Button
          variant="contained"
          onClick={onBack}
          startIcon={<ArrowBack />}
          sx={{
            mt: 2,
            py: 1.5,
            px: 3,
            borderRadius: 2,
            fontWeight: 600,
            background: gradients.primary,
            "&:hover": {
              background: gradients.hover,
              transform: "translateY(-2px)",
              boxShadow:
                mode === "light"
                  ? "0 8px 20px rgba(30, 64, 175, 0.25)"
                  : "0 8px 20px rgba(22, 101, 52, 0.3)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Back to Tables
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 2, minHeight: "80vh" }}>
      <Paper
        sx={{
          width: 300,
          p: 3,
          background: gradients.configPanel,
          borderRadius: 3,
          boxShadow:
            mode === "light"
              ? "0 10px 25px rgba(30, 64, 175, 0.15)"
              : "0 10px 25px rgba(22, 101, 52, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "sticky",
          top: 20,
          height: "fit-content",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              mode === "light"
                ? "0 12px 28px rgba(30, 64, 175, 0.2)"
                : "0 12px 28px rgba(22, 101, 52, 0.25)",
            transform: "translateY(-5px)",
          },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Settings
              sx={{ color: mode === "light" ? "#3B82F6" : "#22C55E" }}
            />
            Configuration
          </Typography>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            startIcon={<Save />}
            sx={{
              background: gradients.primary,
              "&:hover": { background: gradients.hover },
              borderRadius: 2,
              py: 1,
              mt: 1,
            }}
          >
            Save
          </Button>
        </Box>

        <Divider sx={{ my: 1 }} />

        <FormControl sx={{ mb: 2 }}>
          <InputLabel>Profile</InputLabel>
          <Select
            value={table.profile}
            label="Profile"
            disabled
            sx={{
              background: mode === "light" ? "#F8FAFC" : "#1F2937",
              borderRadius: 2,
              "& .MuiInputBase-root": { bgcolor: "background.paper" },
            }}
          >
            <MenuItem value={table.profile}>{table.profile}</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 2 }}>
          <InputLabel>Plant</InputLabel>
          <Select
            value={table.plant}
            label="Plant"
            disabled
            sx={{
              background: mode === "light" ? "#F8FAFC" : "#1F2937",
              borderRadius: 2,
              "& .MuiInputBase-root": { bgcolor: "background.paper" },
            }}
          >
            <MenuItem value={table.plant}>{table.plant}</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 2 }}>
          <InputLabel sx={{ display: "flex", alignItems: "center" }}>
            <Assessment
              sx={{
                color: mode === "light" ? "#00BCD4" : "#26C6DA",
                mr: 1,
                transform: "scale(0.9)",
              }}
            />
            Measurand
          </InputLabel>
          <Select
            value={table.measurand}
            label="Measurand label"
            disabled
            sx={{
              background: mode === "light" ? "#E0F7FA" : "#1E3535",
              borderRadius: 2,
              "& .MuiInputBase-root": { bgcolor: "background.paper" },
            }}
          >
            <MenuItem value={table.measurand}>{table.measurand}</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ mb: 2 }}>
          <InputLabel>Terminals</InputLabel>
          <Select
            multiple
            value={selectedTerminals}
            onChange={handleTerminalChange}
            label="Terminals"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        mode === "light" ? "#00BCD4" : "#26C6DA",
                        0.1
                      ),
                      color: mode === "light" ? "#00BCD4" : "#26C6DA",
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            )}
            sx={{
              background: mode === "light" ? "#F8FAFC" : "#1F2937",
              borderRadius: 2,
              "& .MuiInputBase-root": { bgcolor: "background.paper" },
            }}
          >
            {availableTerminals.map((t) => (
              <MenuItem key={t} value={t}>
                <Checkbox checked={selectedTerminals.includes(t)} />
                <ListItemText primary={t} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showPercentage}
                onChange={(e) => setShowPercentage(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: mode === "light" ? "#3B82F6" : "#22C55E",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: mode === "light" ? "#3B82F6" : "#22C55E",
                  },
                }}
              />
            }
            label={showPercentage ? "Percentage" : "Raw Difference"}
            sx={{
              color: mode === "light" ? "#4B5563" : "#9CA3AF",
              "& .MuiTypography-root": {
                fontSize: "0.85rem",
              },
            }}
          />
          <Tooltip title="View Graph">
            <IconButton
              onClick={handleOpenGraphDialog}
              sx={{
                color: mode === "light" ? "#3B82F6" : "#22C55E",
                "&:hover": { color: mode === "light" ? "#2563EB" : "#16A34A" },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.85rem",
                  color: mode === "light" ? "#4B5563" : "#9CA3AF",
                  mr: 2,
                }}
              >
                Show Graph
              </Typography>
              <BarChart fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Badge
          badgeContent="Filter"
          color={mode === "light" ? "info" : "info"}
          sx={{ alignSelf: "flex-start" }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {startDate && endDate && (
                <Chip
                  icon={<DateRange />}
                  label={`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                  color="info"
                  variant="outlined"
                  sx={{
                    ml: 1,
                    fontWeight: 500,
                    py: 2,
                    borderRadius: 2,
                    color: mode === "light" ? "#3B82F6" : "#22C55E",
                  }}
                />
              )}
            </Box>
            <FilterAlt fontSize="small" />
            Filter
          </Typography>
        </Badge>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Start Date & Time"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    background: mode === "light" ? "#F8FAFC" : "#1F2937",
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
          <DateTimePicker
            label="End Date & Time"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    background: mode === "light" ? "#F8FAFC" : "#1F2937",
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </LocalizationProvider>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleDateFilter}
            startIcon={<DateRange />}
            sx={{
              background: gradients.primary,
              "&:hover": { background: gradients.hover },
              borderRadius: 2,
              py: 1,
            }}
          >
            Apply Filter
          </Button>

          <Tooltip title="Reset Filters">
            <IconButton
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setFilteredRows(table.data || generateMockData(table, 1000));
              }}
              sx={{
                bgcolor: mode === "light" ? "#F1F5F9" : "#1E293B",
                "&:hover": {
                  bgcolor: mode === "light" ? "#E2E8F0" : "#334155",
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", gap: 1, my: 2, flexDirection: "column" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Quick Filters:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip
              label="Last 1 Hour"
              onClick={() => handleQuickFilter(1)}
              variant="outlined"
              size="small"
              sx={{
                borderColor: mode === "light" ? "#3B82F6" : "#22C55E",
                color: mode === "light" ? "#3B82F6" : "#22C55E",
                "&:hover": {
                  background: mode === "light" ? "#E0F2FE" : "#064E3B",
                },
              }}
            />
            <Chip
              label="Last 8 Hours"
              onClick={() => handleQuickFilter(8)}
              variant="outlined"
              size="small"
              sx={{
                borderColor: mode === "light" ? "#3B82F6" : "#22C55E",
                color: mode === "light" ? "#3B82F6" : "#22C55E",
                "&:hover": {
                  background: mode === "light" ? "#E0F2FE" : "#064E3B",
                },
              }}
            />
            <Chip
              label="Last 24 Hours"
              onClick={() => handleQuickFilter(24)}
              variant="outlined"
              size="small"
              sx={{
                borderColor: mode === "light" ? "#3B82F6" : "#22C55E",
                color: mode === "light" ? "#3B82F6" : "#22C55E",
                "&:hover": {
                  background: mode === "light" ? "#E0F2FE" : "#064E3B",
                },
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 1 }} />
      </Paper>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          sx={{
            flex: 1,
            p: 3,
            background: gradients.container,
            borderRadius: 3,
            minHeight: "600px",
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 10px 25px rgba(30, 64, 175, 0.15)"
                : "0 10px 25px rgba(22, 101, 52, 0.2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Tooltip title="Back to Tables">
              <IconButton
                onClick={onBack}
                sx={{
                  bgcolor: mode === "light" ? "#F1F5F9" : "#1E293B",
                  "&:hover": {
                    bgcolor: mode === "light" ? "#E2E8F0" : "#334155",
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isEditingName ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    size="small"
                    sx={{ width: 300 }}
                    placeholder="Enter table name"
                  />
                  <Tooltip title="Save Table Name">
                    <IconButton
                      onClick={handleUpdateTableName}
                      sx={{
                        color: mode === "light" ? "#3B82F6" : "#22C55E",
                        "&:hover": {
                          color: mode === "light" ? "#2563EB" : "#16A34A",
                        },
                      }}
                    >
                      <Save />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    color="text.primary"
                    sx={{
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <WbSunny
                      sx={{ color: mode === "light" ? "#F59E0B" : "#FBBF24" }}
                    />
                    {table.name || table.measurand} - Historical Data
                  </Typography>
                  <Tooltip title="Edit Table Name">
                    <IconButton
                      onClick={() => setIsEditingName(true)}
                      sx={{
                        color: mode === "light" ? "#3B82F6" : "#22C55E",
                        "&:hover": {
                          color: mode === "light" ? "#2563EB" : "#16A34A",
                        },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>

            <Box sx={{ ml: "auto", display: "flex", gap: 1.5 }}>
              <ExportPDFButton
                rows={filteredRows}
                columns={columns}
                table={table}
                startDate={startDate}
                endDate={endDate}
                mode={mode}
                gradients={gradients}
                stats={stats}
              />
              <ExportExcelButton
                rows={filteredRows}
                columns={columns}
                table={table}
                mode={mode}
                gradients={gradients}
                stats={stats}
              />
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                sx={{
                  py: 1.2,
                  px: 2.5,
                  borderRadius: 2,
                  background: gradients.primary,
                  "&:hover": {
                    background: gradients.hover,
                    transform: "translateY(-2px)",
                    boxShadow:
                      mode === "light"
                        ? "0 8px 16px rgba(30, 64, 175, 0.2)"
                        : "0 8px 16px rgba(22, 101, 52, 0.25)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Download CSV
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "auto",
              boxShadow:
                mode === "light"
                  ? "0 6px 20px rgba(30, 64, 175, 0.12)"
                  : "0 6px 20px rgba(22, 101, 52, 0.18)",
              mb: 3,
              height: "auto",
              maxHeight: "600px",
              position: "relative",
            }}
          >
            <Box>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    background: mode === "light" ? "#E0F2FE" : "#1E293B",
                    borderRadius: "12px 12px 0 0",
                    py: 1.5,
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 700,
                  },
                  background: gradients.paper,
                  borderRadius: 3,
                  "& .MuiDataGrid-cell": {
                    py: 1.5,
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                    },
                  },
                }}
              />
            </Box>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h6"
              color="text.primary"
              sx={{
                mb: 2,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <BarChart
                sx={{ color: mode === "light" ? "#3B82F6" : "#22C55E" }}
              />
              Data Analysis
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {stats.map((stat) => (
                <Card
                  key={stat.terminal}
                  sx={{
                    borderRadius: 3,
                    background: gradients.statCard,
                    boxShadow:
                      mode === "light"
                        ? "0 8px 16px rgba(30, 64, 175, 0.1)"
                        : "0 8px 16px rgba(22, 101, 52, 0.2)",
                    minWidth: 200,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow:
                        mode === "light"
                          ? "0 12px 24px rgba(30, 64, 175, 0.15)"
                          : "0 12px 24px rgba(22, 101, 52, 0.25)",
                    },
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      width: "100%",
                      background: stat.measurand.includes("Voltage")
                        ? "#EF4444"
                        : stat.measurand.includes("Current")
                        ? "#F59E0B"
                        : stat.measurand.includes("Power")
                        ? "#10B981"
                        : "#3B82F6",
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {stat.measurand.includes("Voltage") && (
                        <Bolt color="error" />
                      )}
                      {stat.measurand.includes("Current") && (
                        <Bolt color="warning" />
                      )}
                      {stat.measurand.includes("Power") && (
                        <Speed color="success" />
                      )}
                      {stat.measurand.includes("Frequency") && (
                        <Assessment color="info" />
                      )}
                      {stat.terminal}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Max:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {stat.max}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Min:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {stat.min}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Avg:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{
                          color: stat.measurand.includes("Voltage")
                            ? "#EF4444"
                            : stat.measurand.includes("Current")
                            ? "#F59E0B"
                            : stat.measurand.includes("Power")
                            ? "#10B981"
                            : "#3B82F6",
                        }}
                      >
                        {stat.avg}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      <MeasurandGraphDialog
        open={graphDialogOpen}
        onClose={handleCloseGraphDialog}
        rows={filteredRows}
        measurand={table.measurand}
        availableMeasurands={[table.measurand]}
        mode={mode}
        gradients={gradients}
      />
    </Box>
  );
};

export default HistoricalDataGridMV;
