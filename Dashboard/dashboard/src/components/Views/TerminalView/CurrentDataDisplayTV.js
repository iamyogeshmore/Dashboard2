import { useState, useEffect, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  TextField,
  Popover,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Save,
  Delete,
  Lock,
  LockOpen,
  Add,
  Factory,
  Power,
  Assessment,
  BarChart,
  Update,
  Dashboard,
  ViewModule,
} from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import GridLayout from "react-grid-layout";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { v4 as uuidv4 } from "uuid";
import NumberWidget from "../Widget/NumberWidget";
import GraphWidget from "../Widget/GraphWidget";
import {
  getPlants,
  getTerminals,
  getMeasurands,
  getLiveMeasurandValue,
} from "../../../services/apiService";

const CurrentDataDisplayTV = ({ saveView, savedViews, deleteView }) => {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const [widgetType, setWidgetType] = useState("Number");
  const [plant, setPlant] = useState("");
  const [terminal, setTerminal] = useState("");
  const [measurands, setMeasurands] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [layout, setLayout] = useState([]);
  const [selectedViewId, setSelectedViewId] = useState("");
  const [createdTime, setCreatedTime] = useState(null);
  const [saveAnchorEl, setSaveAnchorEl] = useState(null);
  const [viewName, setViewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewNameError, setViewNameError] = useState("");
  const gridRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // API data states
  const [plants, setPlants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [measurandOptions, setMeasurandOptions] = useState([]);
  const [loading, setLoading] = useState({
    plants: false,
    terminals: false,
    measurands: false,
  });

  const DEFAULT_WIDGET_WIDTH = 2;
  const DEFAULT_WIDGET_HEIGHT = 3;

  const graphTypes = ["Number", "Graph"];
  const selectWidth = 180;

  // Add a ref to store the current widgets
  const widgetsRef = useRef(widgets);

  // Update ref when widgets change
  useEffect(() => {
    widgetsRef.current = widgets;
  }, [widgets]);

  // Fetch plants on component mount
  useEffect(() => {
    fetchPlants();
  }, []);

  // Fetch plants from API
  const fetchPlants = async () => {
    setLoading((prev) => ({ ...prev, plants: true }));
    try {
      // For Terminal view, fetch only Terminal type plants
      const response = await getPlants("Terminal");
      console.log("fetchPlants response:", response); // Debug log
      if (response.status === "success" && Array.isArray(response.data)) {
        const mappedPlants = response.data.map((plant) => ({
          id: plant.id,
          name: plant.name,
          type: plant.type,
          patronId: plant.patronId,
        }));
        console.log("Mapped plants:", mappedPlants); // Debug log
        setPlants(mappedPlants);
        if (mappedPlants.length === 0) {
          setSnackbar({
            open: true,
            message: "No Terminal type plants available",
            severity: "warning",
          });
        }
      } else {
        throw new Error(response.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching plants:", error);
      setSnackbar({
        open: true,
        message: `Error fetching plants: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, plants: false }));
    }
  };

  // Fetch terminals when plant changes
  const fetchTerminals = async (plantId) => {
    if (!plantId) return;

    setLoading((prev) => ({ ...prev, terminals: true }));
    try {
      // For Terminal view, fetch terminals with Terminal type filter
      const response = await getTerminals(plantId, "Terminal");
      console.log("fetchTerminals response:", response); // Debug log
      if (response.status === "success" && Array.isArray(response.data)) {
        const mappedTerminals = response.data.map((terminal) => ({
          id: terminal.TerminalId,
          name: terminal.TerminalName,
        }));
        console.log("Mapped terminals:", mappedTerminals); // Debug log
        setTerminals(mappedTerminals);
        if (mappedTerminals.length === 0) {
          setSnackbar({
            open: true,
            message: "No terminals available for this plant",
            severity: "warning",
          });
        }
      } else {
        throw new Error(response.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      setSnackbar({
        open: true,
        message: `Error fetching terminals: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, terminals: false }));
    }
  };

  // Fetch measurands when terminal changes
  const fetchMeasurands = async (plantId, terminalId) => {
    if (!plantId || !terminalId) return;

    setLoading((prev) => ({ ...prev, measurands: true }));
    try {
      // For Terminal view, fetch measurands with Terminal type filter
      const response = await getMeasurands(plantId, terminalId, "Terminal");
      console.log("fetchMeasurands response:", response); // Debug log
      if (response.status === "success" && Array.isArray(response.data)) {
        const mappedMeasurands = response.data.map((measurand) => ({
          id: measurand.MeasurandId,
          name: measurand.MeasurandName,
          unit: measurand.Unit,
        }));
        console.log("Mapped measurands:", mappedMeasurands); // Debug log
        setMeasurandOptions(mappedMeasurands);
        if (mappedMeasurands.length === 0) {
          setSnackbar({
            open: true,
            message: "No measurands available for this terminal",
            severity: "warning",
          });
        }
      } else {
        throw new Error(response.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching measurands:", error);
      setSnackbar({
        open: true,
        message: `Error fetching measurands: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, measurands: false }));
    }
  };

  // Handle plant selection
  const handlePlantChange = (plantId) => {
    setPlant(plantId);
    setTerminal("");
    setMeasurands([]);
    setTerminals([]);
    setMeasurandOptions([]);
    if (plantId) {
      fetchTerminals(plantId);
    }
  };

  // Handle terminal selection
  const handleTerminalChange = (terminalId) => {
    setTerminal(terminalId);
    setMeasurands([]);
    setMeasurandOptions([]);
    if (terminalId && plant) {
      fetchMeasurands(plant, terminalId);
    }
  };

  // Real data fetch function (replace mock data)
  const fetchLatestData = async (terminalId, measurandId) => {
    try {
      const response = await getLiveMeasurandValue(terminalId, measurandId);
      console.log("API Response:", response); // Debug log
      if (response.status === "success") {
        console.log("Timestamp from API:", response.data.TimeStamp); // Debug log
        return {
          value: response.data.MeasurandValue,
          timestamp: response.data.TimeStamp, // Return the full timestamp
          unit: response.data.Unit,
        };
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching latest data:", error);
      // Return error state instead of mock data
      return {
        value: "Error",
        timestamp: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    const updateGridWidth = () => {
      if (gridRef.current) {
        const containerWidth = gridRef.current.getBoundingClientRect().width;
        setGridWidth(containerWidth);
      }
    };

    updateGridWidth();
    window.addEventListener("resize", updateGridWidth);
    const resizeObserver = new ResizeObserver(updateGridWidth);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateGridWidth);
      if (gridRef.current) {
        resizeObserver.unobserve(gridRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentWidgets = widgetsRef.current;
      if (currentWidgets.length === 0) return;

      const updatedWidgets = await Promise.all(
        currentWidgets.map(async (widget) => {
          try {
            const latestData = await fetchLatestData(
              widget.terminal,
              widget.measurandId
            );
            if (widget.type === "Number") {
              return {
                ...widget,
                unit: latestData.unit || widget.unit,
                data: {
                  value: latestData.value,
                  timestamp: latestData.timestamp,
                },
              };
            } else if (widget.type === "Graph") {
              const newDataPoint = {
                time: latestData.timestamp,
                value: parseFloat(latestData.value),
                isLatest: true,
              };
              const newData = [...widget.data, newDataPoint];
              if (newData.length > 1) {
                newData[newData.length - 2].isLatest = false;
              }
              if (newData.length > 900) {
                return { ...widget, data: newData.slice(-900) };
              }
              return { ...widget, data: newData };
            }
            return widget;
          } catch (error) {
            console.error(`Error updating widget ${widget.id}:`, error);
            // Return widget unchanged if there's an error
            return widget;
          }
        })
      );
      setWidgets(updatedWidgets);
    }, 10000); // Poll every 10 seconds for live updates

    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent infinite loops

  const handleCreateWidgets = () => {
    if (!plant) {
      setSnackbar({
        open: true,
        message: "Please select a Plant.",
        severity: "error",
      });
      return;
    }
    if (!terminal) {
      setSnackbar({
        open: true,
        message: "Please select a Terminal.",
        severity: "error",
      });
      return;
    }
    if (measurands.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one Measurand.",
        severity: "error",
      });
      return;
    }

    setSelectedViewId("");
    setIsUpdating(false);
    const newWidgets = measurands.map((measurandId, index) => {
      const measurandOption = measurandOptions.find(
        (m) => m.id === measurandId
      );
      return {
        id: `${terminal}-${measurandId}-${Date.now()}-${index}`,
        type: widgetType,
        terminal,
        measurandId,
        measurandName: measurandOption?.name || `Measurand ${measurandId}`,
        unit: measurandOption?.unit || "",
        data:
          widgetType === "Number"
            ? {
                value: "Loading...",
                timestamp: new Date().toISOString(),
              }
            : [],
      };
    });
    setWidgets(newWidgets);

    const maxCols = 12;
    const widgetsPerRow = Math.min(
      Math.floor(maxCols / DEFAULT_WIDGET_WIDTH),
      newWidgets.length
    );
    const widgetsPerRow_actual = widgetsPerRow > 0 ? widgetsPerRow : 1;

    const newLayout = newWidgets.map((widget, index) => {
      const row = Math.floor(index / widgetsPerRow_actual);
      const col = (index % widgetsPerRow_actual) * DEFAULT_WIDGET_WIDTH;

      return {
        i: widget.id,
        x: col,
        y: row * DEFAULT_WIDGET_HEIGHT,
        w: widgetType === "Graph" ? 4 : DEFAULT_WIDGET_WIDTH,
        h: widgetType === "Graph" ? 6 : DEFAULT_WIDGET_HEIGHT,
        minW: 2,
        minH: 2,
        maxH: 8,
      };
    });

    setLayout(newLayout);
    setCreatedTime(
      new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
    setSnackbar({
      open: true,
      message: "Widgets created successfully!",
      severity: "success",
    });
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== widgetId)
    );
    setLayout((prevLayout) =>
      prevLayout.filter((layout) => layout.i !== widgetId)
    );
    localStorage.removeItem(`widgetSettings_${widgetId}`);
    setSnackbar({
      open: true,
      message: "Widget deleted successfully!",
      severity: "success",
    });
  };

  const handleSaveIconClick = (event) => {
    if (!plant) {
      setSnackbar({
        open: true,
        message: "Please select a Plant to save the view.",
        severity: "error",
      });
      return;
    }
    if (!terminal) {
      setSnackbar({
        open: true,
        message: "Please select a Terminal to save the view.",
        severity: "error",
      });
      return;
    }
    if (measurands.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one Measurand to save the view.",
        severity: "error",
      });
      return;
    }
    setSaveAnchorEl(event.currentTarget);
    setViewName(
      isUpdating
        ? savedViews.find((v) => v.id === selectedViewId)?.name || ""
        : `View ${savedViews.length + 1}`
    );
    setViewNameError("");
  };

  const handleSaveClose = () => {
    setSaveAnchorEl(null);
    setViewNameError("");
  };

  const handleViewNameChange = (e) => {
    const newName = e.target.value;
    setViewName(newName);
    if (
      !isUpdating &&
      newName.trim() &&
      savedViews.some(
        (view) => view.name.toLowerCase() === newName.toLowerCase().trim()
      )
    ) {
      setViewNameError("A view with this name already exists.");
    } else {
      setViewNameError("");
    }
  };

  const handleSaveView = () => {
    if (!viewName.trim()) {
      setViewNameError("View name cannot be empty.");
      return;
    }
    if (
      !isUpdating &&
      savedViews.some(
        (view) => view.name.toLowerCase() === viewName.toLowerCase().trim()
      )
    ) {
      setViewNameError("A view with this name already exists.");
      return;
    }
    if (plant && terminal && measurands.length > 0) {
      if (isUpdating && selectedViewId) {
        const updatedView = {
          id: selectedViewId,
          name: viewName.trim(),
          widgetType,
          plant,
          terminal,
          measurands,
          layout,
          createdTime: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        };
        saveView(updatedView);
        setSnackbar({
          open: true,
          message: "View updated successfully!",
          severity: "success",
        });
      } else {
        const newView = {
          id: uuidv4(),
          name: viewName.trim(),
          widgetType,
          plant,
          terminal,
          measurands,
          layout,
          createdTime: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        };
        saveView(newView);
        setSelectedViewId(newView.id);
        setCreatedTime(newView.createdTime);
        setSnackbar({
          open: true,
          message: "View saved successfully!",
          severity: "success",
        });
      }
      handleSaveClose();
    }
  };

  const handleSelectView = (view) => {
    setWidgetType(view.widgetType);
    setPlant(view.plant);
    setTerminal(view.terminal);
    setMeasurands(view.measurands);
    setIsUpdating(false);

    const newWidgets = view.measurands.map((measurandId, index) => {
      const measurandOption = measurandOptions.find(
        (m) => m.id === measurandId
      );
      return {
        id: `${view.terminal}-${measurandId}-${Date.now()}-${index}`,
        type: view.widgetType,
        terminal: view.terminal,
        measurandId,
        measurandName: measurandOption?.name || `Measurand ${measurandId}`,
        unit: measurandOption?.unit || "",
        data:
          view.widgetType === "Number"
            ? {
                value: "Loading...",
                timestamp: new Date().toISOString(),
              }
            : [],
      };
    });

    setWidgets(newWidgets);

    if (view.layout && view.layout.length > 0) {
      const newLayout = view.layout.map((item, index) => ({
        ...item,
        i: newWidgets[index]?.id || item.i,
      }));
      setLayout(newLayout);
    } else {
      const maxCols = 12;
      const widgetsPerRow = Math.min(
        Math.floor(maxCols / DEFAULT_WIDGET_WIDTH),
        newWidgets.length
      );
      const widgetsPerRow_actual = widgetsPerRow > 0 ? widgetsPerRow : 1;

      const newLayout = newWidgets.map((widget, index) => {
        const row = Math.floor(index / widgetsPerRow_actual);
        const col = (index % widgetsPerRow_actual) * DEFAULT_WIDGET_WIDTH;

        return {
          i: widget.id,
          x: col,
          y: row * DEFAULT_WIDGET_HEIGHT,
          w: widgetType === "Graph" ? 4 : DEFAULT_WIDGET_WIDTH,
          h: widgetType === "Graph" ? 6 : DEFAULT_WIDGET_HEIGHT,
          minW: 2,
          minH: 2,
          maxH: 8,
        };
      });

      setLayout(newLayout);
    }

    setSelectedViewId(view.id);
    setCreatedTime(view.createdTime || null);
    setSnackbar({
      open: true,
      message: `View "${view.name}" loaded successfully!`,
      severity: "success",
    });
  };

  const handleCreateNewView = () => {
    setWidgetType("Number");
    setPlant("");
    setTerminal("");
    setMeasurands([]);
    setWidgets([]);
    setLayout([]);
    setSelectedViewId("");
    setCreatedTime(null);
    setIsUpdating(false);
    setViewName(`View ${savedViews.length + 1}`);
    setSnackbar({
      open: true,
      message: "New view created successfully!",
      severity: "success",
    });
  };

  const handleUpdateView = () => {
    if (selectedViewId) {
      setIsUpdating(true);
      handleSaveIconClick({
        currentTarget: document.getElementById("update-icon"),
      });
    } else {
      setSnackbar({
        open: true,
        message: "No view selected to update.",
        severity: "error",
      });
    }
  };

  const handleDeleteView = (viewId) => {
    if (window.confirm("Are you sure you want to delete this view?")) {
      deleteView(viewId);
      if (selectedViewId === viewId) {
        setSelectedViewId("");
        setWidgets([]);
        setLayout([]);
        setPlant("");
        setTerminal("");
        setMeasurands([]);
        setWidgetType("Number");
        setCreatedTime(null);
        setIsUpdating(false);
      }
      setSnackbar({
        open: true,
        message: "View deleted successfully!",
        severity: "success",
      });
    }
  };

  const handleLayoutChange = (newLayout) => {
    if (!isLocked) {
      const maxCols = 12;
      const sanitizedLayout = newLayout.map((item) => {
        const safeX = Math.min(item.x, maxCols - item.w);
        return {
          ...item,
          x: safeX >= 0 ? safeX : 0,
        };
      });
      setLayout(sanitizedLayout);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const getGradients = () => {
    return {
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
    };
  };

  const gradients = getGradients();
  const isSavePopoverOpen = Boolean(saveAnchorEl);
  const savePopoverId = isSavePopoverOpen ? "save-popover" : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: "80vh",
        width: "100%",
        padding: 0,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 2,
          background: gradients.paper,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <FormControl sx={{ width: selectWidth }}>
            <InputLabel>
              <BarChart
                sx={{ color: "#FF69B4", verticalAlign: "middle", mr: 1 }}
              />
              Widget Type
            </InputLabel>
            <Select
              value={widgetType}
              onChange={(e) => setWidgetType(e.target.value)}
              label="Widget Type label"
              sx={{ height: "40px" }}
            >
              {graphTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ width: selectWidth }}>
            <InputLabel>
              <Factory
                sx={{ color: "#FF4500", verticalAlign: "middle", mr: 1 }}
              />
              Plant
            </InputLabel>
            <Select
              value={plant}
              onChange={(e) => {
                handlePlantChange(e.target.value);
              }}
              label="Plant label"
              sx={{ height: "40px" }}
              disabled={loading.plants}
            >
              {loading.plants ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading plants...
                </MenuItem>
              ) : plants.length === 0 ? (
                <MenuItem disabled>No plants available</MenuItem>
              ) : (
                plants.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl
            sx={{ width: selectWidth }}
            disabled={!plant || loading.terminals}
          >
            <InputLabel>
              <Power
                sx={{ color: "#FFD700", verticalAlign: "middle", mr: 1 }}
              />
              Terminal
            </InputLabel>
            <Select
              value={terminal}
              onChange={(e) => {
                handleTerminalChange(e.target.value);
              }}
              label="Terminal label"
              sx={{ height: "40px" }}
            >
              {loading.terminals ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading terminals...
                </MenuItem>
              ) : terminals.length === 0 ? (
                <MenuItem disabled>No terminals available</MenuItem>
              ) : (
                terminals.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl
            sx={{ width: selectWidth }}
            disabled={!terminal || loading.measurands}
          >
            <InputLabel>
              <Assessment
                sx={{ color: "#00CED1", verticalAlign: "middle", mr: 1 }}
              />
              Measurands
            </InputLabel>
            <Select
              multiple
              value={measurands}
              onChange={(e) => setMeasurands(e.target.value)}
              label="Measurands label"
              renderValue={(selected) => `${selected.length} selected`}
              sx={{ height: "40px" }}
            >
              {loading.measurands ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading measurands...
                </MenuItem>
              ) : measurandOptions.length === 0 ? (
                <MenuItem disabled>No measurands available</MenuItem>
              ) : (
                <MenuItem>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={measurands.length === measurandOptions.length}
                        onChange={(e) =>
                          setMeasurands(
                            e.target.checked
                              ? measurandOptions.map((m) => m.id)
                              : []
                          )
                        }
                      />
                    }
                    label="Select All"
                  />
                </MenuItem>
              )}
              {!loading.measurands &&
                measurandOptions.length > 0 &&
                measurandOptions.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    <Checkbox checked={measurands.includes(m.id)} />
                    <Typography>{m.name}</Typography>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleCreateWidgets}
            disabled={!plant || !terminal || measurands.length === 0}
            sx={{
              height: "40px",
              background: gradients.primary,
              minWidth: "90px",
              "&:hover": { background: gradients.hover },
            }}
          >
            Go
          </Button>

          <Button
            variant="contained"
            disabled={!plant || !terminal || measurands.length === 0}
            startIcon={<Add sx={{ color: "#ADFF2F" }} />}
            sx={{
              height: "40px",
              background: gradients.primary,
              minWidth: "120px",
              "&:hover": { background: gradients.hover },
            }}
          >
            Add Widget
          </Button>

          <FormControl sx={{ width: selectWidth }}>
            <InputLabel>Saved Views</InputLabel>
            <Select
              value={selectedViewId}
              onChange={(e) => {
                if (e.target.value === "new") {
                  handleCreateNewView();
                } else {
                  const selectedView = savedViews.find(
                    (v) => v.id === e.target.value
                  );
                  if (selectedView) {
                    handleSelectView(selectedView);
                  }
                }
              }}
              label="Saved Views"
              sx={{ height: "40px" }}
            >
              <MenuItem value="" disabled>
                Select a saved view
              </MenuItem>
              <MenuItem value="new">
                <Typography>Create New View</Typography>
              </MenuItem>
              {savedViews.map((view) => (
                <MenuItem key={view.id} value={view.id}>
                  <Typography>{view.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Save View">
              <IconButton onClick={handleSaveIconClick}>
                <Save sx={{ color: "#00CED1" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Update View">
              <span>
                <IconButton
                  id="update-icon"
                  onClick={handleUpdateView}
                  disabled={!selectedViewId}
                  sx={{
                    "&.Mui-disabled": {
                      opacity: 0.5,
                    },
                  }}
                >
                  <Update sx={{ color: selectedViewId ? "#4CAF50" : "#aaa" }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Delete View">
              <span>
                <IconButton
                  onClick={() =>
                    selectedViewId && handleDeleteView(selectedViewId)
                  }
                  disabled={!selectedViewId}
                  sx={{
                    "&.Mui-disabled": {
                      opacity: 0.5,
                    },
                  }}
                >
                  <Delete sx={{ color: selectedViewId ? "#FF4500" : "#aaa" }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={isLocked ? "Unlock Widgets" : "Lock Widgets"}>
              <IconButton onClick={() => setIsLocked(!isLocked)}>
                {isLocked ? (
                  <Lock sx={{ color: "red" }} />
                ) : (
                  <LockOpen sx={{ color: "#FFD700" }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          <Popover
            id={savePopoverId}
            open={isSavePopoverOpen}
            anchorEl={saveAnchorEl}
            onClose={handleSaveClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <Box
              sx={{
                p: 2,
                width: 300,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="subtitle1">
                {isUpdating ? "Update View" : "Save View"}
              </Typography>
              <TextField
                label="View Name"
                variant="outlined"
                size="small"
                fullWidth
                value={viewName}
                onChange={handleViewNameChange}
                autoFocus
                error={!!viewNameError}
                helperText={viewNameError}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  onClick={handleSaveClose}
                  variant="outlined"
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveView}
                  variant="contained"
                  size="small"
                  disabled={!!viewNameError}
                  sx={{
                    background: gradients.primary,
                    "&:hover": { background: gradients.hover },
                  }}
                >
                  {isUpdating ? "Update" : "Save"}
                </Button>
              </Box>
            </Box>
          </Popover>
        </Box>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          padding: 1.1,
          background: gradients.container,
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === "light" ? "#4ADE80" : "#4ADE80"
            }`,
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0 6px 16px rgba(16, 185, 129, 0.15)"
              : "0 6px 16px rgba(22, 101, 52, 0.2)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 10px 24px rgba(16, 185, 129, 0.2)"
                : "0 10px 24px rgba(22, 101, 52, 0.3)",
          },
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            px: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,

              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            Plant: {plants.find((p) => p.id === plant)?.name || "None"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,

              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            Terminal: {terminals.find((t) => t.id === terminal)?.name || "None"}
          </Typography>

          <Tooltip
            title={
              measurands.length > 0 ? (
                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Selected Measurands:
                  </Typography>
                  {measurands.map((measurand) => (
                    <Typography
                      key={measurand}
                      variant="body2"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? "#10B981"
                            : "#22C55E",
                      }}
                    >
                      -{" "}
                      {measurandOptions.find((m) => m.id === measurand)?.name ||
                        measurand}
                    </Typography>
                  ))}
                </Box>
              ) : (
                "No measurands selected"
              )
            }
            placement="top"
            arrow
            PopperProps={{
              sx: {
                "& .MuiTooltip-tooltip": {
                  background: gradients.paper,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  p: 1.5,
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                },
                "& .MuiTooltip-arrow": {
                  color: gradients.paper,
                },
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,

                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <ViewModule
                fontSize="small"
                sx={{ color: theme.palette.info.main }}
              />
              Measurands: {measurands.length} selected
            </Typography>
          </Tooltip>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              background: (theme) =>
                theme.palette.mode === "light"
                  ? "linear-gradient(45deg, #DCFCE7, #F0FDF4)"
                  : "linear-gradient(45deg, #064E3B, #14532D)",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
              }}
            >
              Type: {widgetType} View
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,

              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              transition: "transform 0.2s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            Created: {createdTime || "N/A"}
          </Typography>
          {isUpdating && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#4CAF50",
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #DBEAFE, #F0F9FF)"
                    : "linear-gradient(45deg, #064E3B, #14532D)",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                border: "1px solid #4CAF50",
              }}
            >
              <Update
                fontSize="small"
                sx={{ verticalAlign: "middle", mr: 0.5 }}
              />
              Update Mode
            </Typography>
          )}
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 0,
          borderRadius: 2,
          background: gradients.container,
          minHeight: "300px",
          width: "100%",
          overflow: "hidden",
          position: "relative",
        }}
        ref={gridRef}
      >
        {widgets.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",

              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: mode === "light" ? "primary.main" : "primary.light",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              <Dashboard sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
              <br />
              No View Generated
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", maxWidth: "500px" }}
            >
              Select a Plant, choose Terminal and choose{" "}
              <Box
                component="span"
                sx={{
                  color: mode === "light" ? "primary.main" : "primary.light",
                  fontWeight: 600,
                }}
              >
                Measurands{" "}
              </Box>{" "}
              to monitor, and click "Go" to create your custom view.
              <br />
              <Typography
                component="span"
                variant="body1"
                sx={{
                  textAlign: "center",
                  maxWidth: "500px",
                  color: mode === "light" ? "primary.main" : "primary.light",
                  fontWeight: 600,
                }}
              >
                You can also select a previously saved views from the dropdown
                menu.
              </Typography>
            </Typography>
          </Box>
        )}

        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
          <GridLayout
            className="layout"
            layout={layout}
            onLayoutChange={handleLayoutChange}
            cols={12}
            rowHeight={40}
            width={gridWidth || window.innerWidth * 0.95}
            isDraggable={!isLocked}
            isResizable={!isLocked}
            compactType="vertical"
            preventCollision={false}
            onDragStop={(layout, oldItem, newItem) => {
              const maxCols = 12;
              if (newItem.x < 0) newItem.x = 0;
              if (newItem.x + newItem.w > maxCols)
                newItem.x = maxCols - newItem.w;
            }}
            style={{}}
          >
            {widgets.map((widget) => (
              <div key={widget.id}>
                {widget.type === "Number" ? (
                  <NumberWidget
                    terminal={widget.terminal}
                    measurand={widget.measurandName}
                    value={widget.data.value}
                    timestamp={widget.data.timestamp}
                    widgetId={widget.id}
                    onDelete={handleDeleteWidget}
                    unit={widget.unit}
                  />
                ) : (
                  <GraphWidget
                    terminal={widget.terminal}
                    measurand={widget.measurandName}
                    data={widget.data}
                    widgetId={widget.id}
                    onDelete={handleDeleteWidget}
                  />
                )}
              </div>
            ))}
          </GridLayout>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CurrentDataDisplayTV;
