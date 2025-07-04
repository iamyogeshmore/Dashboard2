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
  OutlinedInput,
  alpha,
  Divider,
  Tooltip,
  Badge,
  Card,
  CardContent,
  Stack,
  Switch,
  FormControlLabel,
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
import { getHDNutsMeasurandValue } from '../../../../services/apiService';

const generateMockData = (measurands, numRecords = 1000) => {
  const now = new Date();
  return Array.from({ length: numRecords }, (_, index) => {
    const timestamp = new Date(now.getTime() - index * 60 * 1000);
    const row = {
      id: index,
      timestamp: timestamp.toISOString(),
    };
    measurands.forEach((m) => {
      let value;
      if (m.includes("Voltage")) value = (Math.random() * 50 + 180).toFixed(2);
      else if (m.includes("Current"))
        value = (Math.random() * 20 + 5).toFixed(2);
      else if (m.includes("Power"))
        value = (Math.random() * 50 + 25).toFixed(2);
      else if (m.includes("Frequency"))
        value = (Math.random() * 2 + 49).toFixed(2);
      row[m] = value;
    });
    return row;
  });
};

const HistoricalDataGrid = ({ table: propTable, onBack, onUpdateTable }) => {
  const { mode } = useThemeContext();
  const { tableId } = useParams();
  const [table, setTable] = useState(propTable);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const defaultMeasurands = [
    "Voltage (V)",
    "Current (A)",
    "Power (kW)",
    "Frequency (Hz)",
  ];
  const initialMeasurands =
    Array.isArray(table?.measurandDisplayNames) && table.measurandDisplayNames.length > 0
      ? table.measurandDisplayNames
      : Array.isArray(table?.measurand) && table.measurand.length > 0
      ? table.measurand
      : defaultMeasurands;
  const [measurand, setMeasurand] = useState(initialMeasurands);
  const [filteredRows, setFilteredRows] = useState(
    table?.data || generateMockData(initialMeasurands, 1000)
  );
  const [graphDialogOpen, setGraphDialogOpen] = useState(false);
  const [selectedMeasurand, setSelectedMeasurand] = useState(null);
  const [showPercentage, setShowPercentage] = useState(false);
  const [tableName, setTableName] = useState(table?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [loadingHDNuts, setLoadingHDNuts] = useState(false);
  const [hdNutsError, setHDNutsError] = useState(null);

  useEffect(() => {
    if (!propTable && tableId) {
      const tables = JSON.parse(localStorage.getItem("historicalTables")) || [];
      const foundTable = tables.find((t) => t.id === tableId);
      if (foundTable) {
        setTable(foundTable);
        setTableName(
          foundTable.name ||
            `${foundTable.profile}-${foundTable.terminal}-${foundTable.measurand.length}`
        );
        setMeasurand(
          Array.isArray(foundTable.measurand) && foundTable.measurand.length > 0
            ? foundTable.measurand
            : defaultMeasurands
        );
        setFilteredRows(
          foundTable.data || generateMockData(foundTable.measurand, 1000)
        );
      }
    }
  }, [tableId, propTable]);

  useEffect(() => {
    if (table) {
      if (Array.isArray(table.measurandDisplayNames) && table.measurandDisplayNames.length > 0) {
        setMeasurand(table.measurandDisplayNames);
      } else if (Array.isArray(table.measurand) && table.measurand.length > 0) {
        setMeasurand(table.measurand);
      } else {
        setMeasurand(defaultMeasurands);
      }
    }
  }, [table]);

  useEffect(() => {
    if (!table?.data) {
      setFilteredRows(generateMockData(measurand, 1000));
    }
  }, [measurand, table?.data]);

  useEffect(() => {
    async function fetchHDNutsData() {
      if (!table) return;
      // Only fetch for Block or Trend profiles
      if (table.profile && (table.profile.toLowerCase() === 'block' || table.profile.toLowerCase() === 'trend')) {
        setLoadingHDNuts(true);
        setHDNutsError(null);
        try {
          // If table.measurandIds exists, use it, else fallback to table.measurand
          const measurandIds = table.measurandIds || table.measurand || [];
          const rows = [];
          // For each measurand, fetch the value
          for (const measId of measurandIds) {
            const res = await getHDNutsMeasurandValue({
              terminalId: table.terminalId || table.terminal,
              measurandId: measId,
              profile: table.profile
            });
            if (res.status === 'success' && res.data) {
              // Map to grid row format
              const row = {
                id: measId,
                timestamp: res.data.TimeStamp || new Date().toISOString(),
                [res.data.MeasurandName || measId]: res.data.MeasurandValue
              };
              rows.push(row);
            }
          }
          setFilteredRows(rows);
        } catch (err) {
          setHDNutsError('Failed to fetch data');
        } finally {
          setLoadingHDNuts(false);
        }
      }
    }
    fetchHDNutsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const handleUpdateTableName = () => {
    if (tableName.trim()) {
      const updatedTable = { ...table, name: tableName };
      setTable(updatedTable);
      const tables = JSON.parse(localStorage.getItem("historicalTables")) || [];
      const updatedTables = tables.map((t) =>
        t.id === table.id ? updatedTable : t
      );
      localStorage.setItem("historicalTables", JSON.stringify(updatedTables));
      if (onUpdateTable) {
        onUpdateTable(updatedTable);
      }
      setIsEditingName(false);
    }
  };

  const hasMeasurands = table && (
    (Array.isArray(table.measurandDisplayNames) && table.measurandDisplayNames.length > 0) ||
    (Array.isArray(table.measurand) && table.measurand.length > 0) ||
    (Array.isArray(table.measurandIds) && table.measurandIds.length > 0)
  );

  if (!table || !hasMeasurands) {
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
            background:
              mode === "light"
                ? "linear-gradient(45deg, #1E40AF, #3B82F6)"
                : "linear-gradient(45deg, #166534, #22C55E)",
            "&:hover": {
              background:
                mode === "light"
                  ? "linear-gradient(45deg, #1E3A8A, #2563EB)"
                  : "linear-gradient(45deg, #14532D, #16A34A)",
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

  if (loadingHDNuts) {
    return <Paper sx={{ p: 4, minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="h6">Loading data...</Typography></Paper>;
  }

  if (hdNutsError) {
    return <Paper sx={{ p: 4, minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="h6" color="error">{hdNutsError}</Typography></Paper>;
  }

  const handleOpenGraphDialog = (providedMeasurand) => {
    const selected =
      providedMeasurand ||
      (Array.isArray(measurand) && measurand.length > 0
        ? measurand[0]
        : defaultMeasurands[0]);
    setSelectedMeasurand(selected);
    setGraphDialogOpen(true);
  };

  const handleCloseGraphDialog = () => {
    setGraphDialogOpen(false);
    setSelectedMeasurand(null);
  };

  const calculateDifference = (currentValue, nextValue) => {
    if (isNaN(currentValue) || isNaN(nextValue)) return "N/A";
    const diff = (currentValue - nextValue).toFixed(2);
    if (showPercentage && nextValue !== 0) {
      return `${((diff / nextValue) * 100).toFixed(2)}%`;
    }
    return diff;
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
                color: mode === "light" ? "#10B981" : "#22C55E",
                fontSize: 18,
              }}
            />
            {date.toLocaleString()}
          </Box>
        );
      },
    },
    ...measurand.map((measurand) => ({
      field: measurand,
      headerName: measurand,
      width: 150,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography variant="inherit">{measurand}</Typography>
          <Tooltip title={`View ${measurand} Graph`}>
            <IconButton
              size="small"
              onClick={() => handleOpenGraphDialog(measurand)}
              sx={{
                color: mode === "light" ? "#10B981" : "#22C55E",
                "&:hover": { color: mode === "light" ? "#059669" : "#16A34A" },
              }}
            >
              <BarChart fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      renderCell: (params) => {
        const value = parseFloat(params.value);
        const rowIndex = filteredRows.findIndex((row) => row.id === params.id);
        const nextRow =
          rowIndex < filteredRows.length - 1
            ? filteredRows[rowIndex + 1]
            : null;
        const nextValue = nextRow ? parseFloat(nextRow[measurand]) : null;
        const difference =
          nextValue !== null ? calculateDifference(value, nextValue) : "N/A";
        const isPositive = difference !== "N/A" && parseFloat(difference) > 0;

        let color = "#64748B";
        let icon = null;

        if (measurand.includes("Voltage")) {
          if (value > 220) color = "#EF4444";
          else if (value < 180) color = "#F59E0B";
          else color = "#10B981";
        } else if (measurand.includes("Power")) {
          if (value > 75) color = "#EF4444";
          else if (value > 50) color = "#10B981";
          else color = "#10B981";
        }

        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color,
            }}
          >
            {icon}
            <Typography sx={{ fontWeight: 500, color }}>
              {params.value}
            </Typography>
            {difference !== "N/A" && (
              <Typography
                variant="caption"
                sx={{
                  color: isPositive ? "#10B981" : "#EF4444",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                }}
              >
                {isPositive ? `(+${difference})` : `(${difference})`}
              </Typography>
            )}
          </Box>
        );
      },
    })),
  ];

  const filterRows = () => {
    if (!startDate || !endDate) return table.data || filteredRows;
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
    const stats = measurand.map((measurand) => {
      const values = filteredRows
        .map((row) => parseFloat(row[measurand]))
        .filter((v) => !isNaN(v));
      return {
        measurand,
        min: values.length ? Math.min(...values).toFixed(2) : "N/A",
        max: values.length ? Math.max(...values).toFixed(2) : "N/A",
        avg: values.length
          ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)
          : "N/A",
      };
    });
    return stats;
  };

  const stats = calculateStats();

  const getGradients = () => ({
    primary:
      mode === "light"
        ? "linear-gradient(45deg, #10B981, #34D399)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light"
        ? "linear-gradient(45deg, #059669, #10B981)"
        : "linear-gradient(45deg, #14532D, #16A34A)",
    paper:
      mode === "light"
        ? "linear-gradient(135deg, #FFFFFF, #F8FAFC)"
        : "linear-gradient(135deg, #1F2937, #111827)",
    container:
      mode === "light"
        ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
        : "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
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
      ["Measurand", "Min", "Max", "Avg"].join(","),
      ...stats.map((stat) =>
        [stat.measurand, stat.min, stat.max, stat.avg].join(",")
      ),
    ];

    const csvContent = [...tableContent, ...statsContent].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${table.name || table.terminal}_data.csv`;
    link.click();
  };

  const handleSaveConfig = () => {
    const updatedTable = {
      ...table,
      measurand,
      data: filteredRows,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      name: tableName,
    };

    const tables = JSON.parse(localStorage.getItem("historicalTables")) || [];
    const updatedTables = tables.map((t) =>
      t.id === table.id ? updatedTable : t
    );
    localStorage.setItem("historicalTables", JSON.stringify(updatedTables));

    if (onUpdateTable) {
      onUpdateTable(updatedTable);
    }

    alert("Configuration saved!");
  };

  const availableMeasurands = [
    "Voltage (V)",
    "Current (A)",
    "Power (kW)",
    "Frequency (Hz)",
    "Voltage2 (V)",
    "Current2 (A)",
    "Power2 (kW)",
    "Frequency2 (Hz)",
  ];

  const handleMeasurandChange = (event) => {
    const newMeasurands = event.target.value;
    setMeasurand(newMeasurands.length > 0 ? newMeasurands : defaultMeasurands);

    const updatedRows = filteredRows.map((row) => ({
      ...row,
      ...newMeasurands.reduce((acc, m) => {
        if (!row[m]) {
          let value;
          if (m.includes("Voltage"))
            value = (Math.random() * 50 + 180).toFixed(2);
          else if (m.includes("Current"))
            value = (Math.random() * 20 + 5).toFixed(2);
          else if (m.includes("Power"))
            value = (Math.random() * 50 + 25).toFixed(2);
          else if (m.includes("Frequency"))
            value = (Math.random() * 2 + 49).toFixed(2);
          return { ...acc, [m]: value };
        }
        return acc;
      }, {}),
    }));
    setFilteredRows(updatedRows);
  };

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredRows(table.data || generateMockData(measurand, 1000));
  };

  return (
    <Box sx={{ display: "flex", gap: 2, minHeight: "80vh" }}>
      <Paper
        sx={{
          width: 300,
          p: 3,
          background: gradients.container,
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
          <InputLabel>Terminal</InputLabel>
          <Select
            value={table.terminal}
            label="Terminal"
            disabled
            sx={{
              background: mode === "light" ? "#F8FAFC" : "#1F2937",
              borderRadius: 2,
              "& .MuiInputBase-root": { bgcolor: "background.paper" },
            }}
          >
            <MenuItem value={table.terminal}>{table.terminal}</MenuItem>
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
            multiple
            value={measurand}
            onChange={handleMeasurandChange}
            input={<OutlinedInput label="Measurand label" />}
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
              background: mode === "light" ? "#E0F7FA" : "#1E3535",
              borderRadius: 2,
              "& .MuiInputBase-root": { bgcolor: "background.paper" },
              "&:hover": {
                boxShadow: `0 4px 8px ${alpha(
                  mode === "light" ? "#00BCD4" : "#26C6DA",
                  0.15
                )}`,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2,
                  boxShadow: `0 8px 24px ${alpha(
                    mode === "light" ? "#00BCD4" : "#26C6DA",
                    0.2
                  )}`,
                },
              },
            }}
          >
            {availableMeasurands.map((m) => (
              <MenuItem key={m} value={m}>
                <Checkbox
                  checked={measurand.includes(m)}
                  sx={{
                    color: mode === "light" ? "#00BCD4" : "#26C6DA",
                    "&.Mui-checked": {
                      color: mode === "light" ? "#00BCD4" : "#26C6DA",
                    },
                  }}
                />
                <ListItemText primary={m} />
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
          <Tooltip title="View Graph for First Measurand">
            <IconButton
              onClick={() => handleOpenGraphDialog(null)}
              sx={{
                color: mode === "light" ? "#10B981" : "#22C55E",
                "&:hover": { color: mode === "light" ? "#059669" : "#16A34A" },
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
              onClick={resetFilters}
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
                    {table.name || table.terminal} - Historical Data
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
                    paginationModel: { pageSize: 9, page: 0 },
                  },
                }}
                pageSizeOptions={[9, 10, 25, 50, 100]}
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
                  key={stat.measurand}
                  sx={{
                    borderRadius: 3,
                    background: gradients.container,
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
                      {stat.measurand}
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
        measurand={selectedMeasurand}
        availableMeasurands={measurand}
        mode={mode}
        gradients={gradients}
      />
    </Box>
  );
};

export default HistoricalDataGrid;
