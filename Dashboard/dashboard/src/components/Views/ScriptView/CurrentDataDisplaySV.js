import { useState, useEffect, useRef, useMemo } from "react";
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
  TextField,
  Popover,
  Checkbox,
  ListItemText,
  Chip,
  OutlinedInput,
  Divider,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  Fade,
} from "@mui/material";
import {
  Save,
  Delete,
  Lock,
  LockOpen,
  Add,
  Factory,
  Code,
  Update,
  AssessmentOutlined,
  Analytics,
  CalendarToday,
  ViewModule,
  Dashboard,
} from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import GridLayout from "react-grid-layout";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";
import { v4 as uuidv4 } from "uuid";
import NumberWidget from "../Widget/NumberWidget";

const CurrentDataDisplaySV = () => {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const [widgetType, setWidgetType] = useState("Number");
  const [plant, setPlant] = useState("");
  const [selectedScripts, setSelectedScripts] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [isLocked, setIsLocked] = useState(true); // Default to locked
  const [layout, setLayout] = useState([]);
  const [savedViews, setSavedViews] = useState([]);
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

  const DEFAULT_WIDGET_WIDTH = 2;
  const DEFAULT_WIDGET_HEIGHT = 2;
  const WIDGETS_PER_ROW = 6;
  const selectWidth = 220;

  const graphTypes = ["Number", "Graph"];
  const plants = [
    "Unit 1 Mill Motors",
    "Unit 2 Processing Plant",
    "Unit 3 Assembly Line",
    "Unit 4 Packaging",
  ];
  const scriptOptions = [
    "Voltage (V)",
    "Current (A)",
    "Power (W)",
    "Frequency (Hz)",
    "Temperature (°C)",
    "Pressure (Pa)",
    "Humidity (%)",
    "Vibration (m/s²)",
  ];

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

    try {
      const storedViews = localStorage.getItem("scriptSavedViews");
      if (storedViews) {
        setSavedViews(JSON.parse(storedViews));
      }
    } catch (error) {
      console.error("Failed to load saved views from localStorage:", error);
      setSavedViews([]);
    }

    return () => {
      window.removeEventListener("resize", updateGridWidth);
      if (gridRef.current) {
        resizeObserver.unobserve(gridRef.current);
      }
    };
  }, []);

  const handleCreateWidgets = () => {
    if (!plant) {
      setSnackbar({
        open: true,
        message: "Please select a Plant.",
        severity: "error",
      });
      return;
    }
    if (selectedScripts.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one Script.",
        severity: "error",
      });
      return;
    }

    setSelectedViewId("");
    setIsUpdating(false);

    const newWidgets = selectedScripts.map((script) => ({
      id: uuidv4(),
      measurand: script,
      plant,
      value: (Math.random() * 100).toFixed(2),
      timestamp: new Date().toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    }));

    setWidgets(newWidgets);

    const cols = 12;
    const itemsPerRow = Math.min(WIDGETS_PER_ROW, selectedScripts.length);
    const itemWidth = Math.max(
      DEFAULT_WIDGET_WIDTH,
      Math.floor(cols / itemsPerRow)
    );

    const newLayout = newWidgets.map((widget, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;

      return {
        i: widget.id,
        x: col * itemWidth,
        y: row * DEFAULT_WIDGET_HEIGHT,
        w: itemWidth,
        h: DEFAULT_WIDGET_HEIGHT,
        minW: 2,
        minH: 2,
        maxH: 5,
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
    if (selectedScripts.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one Script to save the view.",
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
    } else if (!newName.trim()) {
      setViewNameError("View name cannot be empty.");
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
    if (plant && selectedScripts.length > 0) {
      const viewData = {
        id: isUpdating && selectedViewId ? selectedViewId : uuidv4(),
        name: viewName.trim(),
        widgetType,
        plant,
        scripts: selectedScripts,
        layout,
        widgets: widgets.map((w) => ({
          id: w.id,
          measurand: w.measurand,
          plant: w.plant,
        })),
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

      const updatedViews = isUpdating
        ? savedViews.map((v) => (v.id === selectedViewId ? viewData : v))
        : [...savedViews, viewData];

      try {
        setSavedViews(updatedViews);
        localStorage.setItem("scriptSavedViews", JSON.stringify(updatedViews));
        setSelectedViewId(viewData.id);
        setCreatedTime(viewData.createdTime);
        setSnackbar({
          open: true,
          message: isUpdating
            ? "View updated successfully!"
            : "View saved successfully!",
          severity: "success",
        });
        handleSaveClose();
      } catch (error) {
        console.error("Failed to save view to localStorage:", error);
        setSnackbar({
          open: true,
          message: "Failed to save view.",
          severity: "error",
        });
      }
    }
  };

  const handleSelectView = (view) => {
    setWidgetType(view.widgetType);
    setPlant(view.plant);
    setSelectedScripts(view.scripts || []);
    setIsUpdating(false);

    const newWidgets = (view.scripts || []).map((script) => ({
      id: uuidv4(),
      measurand: script,
      plant: view.plant,
      value: (Math.random() * 100).toFixed(2),
      timestamp: new Date().toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    }));

    setWidgets(newWidgets);

    let newLayout;
    if (view.layout && view.layout.length > 0) {
      newLayout = newWidgets.map((widget, index) => {
        const oldLayoutItem =
          view.layout[Math.min(index, view.layout.length - 1)];
        return {
          ...oldLayoutItem,
          i: widget.id,
        };
      });
    } else {
      const cols = 12;
      const itemsPerRow = Math.min(WIDGETS_PER_ROW, newWidgets.length);
      const itemWidth = Math.max(
        DEFAULT_WIDGET_WIDTH,
        Math.floor(cols / itemsPerRow)
      );

      newLayout = newWidgets.map((widget, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;

        return {
          i: widget.id,
          x: col * itemWidth,
          y: row * DEFAULT_WIDGET_HEIGHT,
          w: itemWidth,
          h: DEFAULT_WIDGET_HEIGHT,
          minW: 2,
          minH: 2,
          maxH: 5,
        };
      });
    }

    setLayout(newLayout);
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
    setSelectedScripts([]);
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
      const updatedViews = savedViews.filter((view) => view.id !== viewId);
      try {
        setSavedViews(updatedViews);
        localStorage.setItem("scriptSavedViews", JSON.stringify(updatedViews));
        if (selectedViewId === viewId) {
          handleCreateNewView();
        }
        setSnackbar({
          open: true,
          message: "View deleted successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Failed to delete view from localStorage:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete view.",
          severity: "error",
        });
      }
    }
  };

  const handleLayoutChange = (newLayout) => {
    if (!isLocked) {
      const maxCols = 12;
      const sanitizedLayout = newLayout.map((item) => ({
        ...item,
        x:
          Math.min(item.x, maxCols - item.w) >= 0
            ? Math.min(item.x, maxCols - item.w)
            : 0,
      }));
      setLayout(sanitizedLayout);
    }
  };

  const handleScriptSelection = (event) => {
    const { value } = event.target;
    setSelectedScripts(typeof value === "string" ? value.split(",") : value);
  };

  const handleSelectAllScripts = (event) => {
    setSelectedScripts(event.target.checked ? [...scriptOptions] : []);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const allScriptsSelected =
    scriptOptions.length > 0 && selectedScripts.length === scriptOptions.length;
  const isSavePopoverOpen = Boolean(saveAnchorEl);
  const savePopoverId = isSavePopoverOpen ? "save-popover" : undefined;

  return (
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
              transform: "translateY(-4px)",
              boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.2)}`,
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
            <FormControl sx={{ width: selectWidth, flexShrink: 0 }}>
              <InputLabel id="Widget-type-label">
                <Code
                  sx={{
                    color: theme.palette.info.main,
                    verticalAlign: "middle",
                    mr: 1,
                  }}
                />
                Widget Type
              </InputLabel>
              <Select
                labelId="Widget-type-label"
                value={widgetType}
                onChange={(e) => setWidgetType(e.target.value)}
                label="Widget Type label"
                sx={{
                  height: "40px",
                  borderRadius: 2,
                  backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {graphTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ width: selectWidth, flexShrink: 0 }}>
              <InputLabel id="plant-label">
                <Factory
                  sx={{
                    color: theme.palette.warning.main,
                    verticalAlign: "middle",
                    mr: 1,
                  }}
                />
                Plant
              </InputLabel>
              <Select
                labelId="plant-label"
                value={plant}
                onChange={(e) => {
                  setPlant(e.target.value);
                  setSelectedScripts([]);
                }}
                label="Plant label"
                sx={{
                  height: "40px",
                  borderRadius: 2,
                  backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {plants.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              sx={{ width: selectWidth, flexShrink: 0 }}
              disabled={!plant}
            >
              <InputLabel id="script-multiple-checkbox-label">
                <Code
                  sx={{
                    color: theme.palette.info.main,
                    verticalAlign: "middle",
                    mr: 1,
                  }}
                />
                Scripts{" "}
                {selectedScripts.length > 0 && `(${selectedScripts.length})`}
              </InputLabel>
              <Select
                labelId="script-multiple-checkbox-label"
                multiple
                value={selectedScripts}
                onChange={handleScriptSelection}
                input={<OutlinedInput label="multiple-Scripts" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.length > 3 ? (
                      <Chip
                        label={`${selected.length} scripts selected`}
                        size="small"
                        sx={{
                          borderRadius: "6px",
                          bgcolor: mode === "light" ? "#DBEAFE" : "#064E3B",
                          color: mode === "light" ? "#1E40AF" : "#D1FAE5",
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            bgcolor: mode === "light" ? "#DBEAFE" : "#064E3B",
                            color: mode === "light" ? "#1E40AF" : "#D1FAE5",
                            fontWeight: 500,
                          }}
                        />
                      ))
                    )}
                  </Box>
                )}
                sx={{
                  height: "40px",
                  borderRadius: 2,
                  backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                  "& .MuiSelect-select": {
                    padding: "12px 32px 12px 14px",
                  },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <MenuItem>
                  <Checkbox
                    checked={allScriptsSelected}
                    indeterminate={
                      selectedScripts.length > 0 && !allScriptsSelected
                    }
                    onChange={handleSelectAllScripts}
                  />
                  <ListItemText primary="Select All" />
                </MenuItem>
                <Divider />
                {scriptOptions.map((script) => (
                  <MenuItem key={script} value={script}>
                    <Checkbox checked={selectedScripts.includes(script)} />
                    <ListItemText primary={script} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCreateWidgets}
              disabled={!plant || selectedScripts.length === 0}
              startIcon={<Analytics />}
              sx={{
                height: "40px",
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
              Go
            </Button>

            <Button
              variant="contained"
              disabled={!plant || selectedScripts.length === 0}
              startIcon={<Add sx={{ color: "#ADFF2F" }} />}
              sx={{
                height: "40px",
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
              Add Widget
            </Button>

            <FormControl sx={{ width: selectWidth, flexShrink: 0 }}>
              <InputLabel id="saved-dashboards-label">
                Saved Dashboards
              </InputLabel>
              <Select
                labelId="saved-dashboards-label"
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
                label="Saved Dashboards"
                sx={{
                  height: "40px",
                  borderRadius: 2,
                  backgroundColor: mode === "light" ? "#F8FAFC" : "#1F2937",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select a saved View
                </MenuItem>
                <MenuItem value="new">
                  <Typography sx={{ display: "flex", alignItems: "center" }}>
                    <Add sx={{ mr: 1, fontSize: 18 }} />
                    Create New View
                  </Typography>
                </MenuItem>
                <Divider />
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
                    <Update
                      sx={{ color: selectedViewId ? "#4CAF50" : "#aaa" }}
                    />
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
                    <Delete
                      sx={{ color: selectedViewId ? "#FF4500" : "#aaa" }}
                    />
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
                  {isUpdating ? "Update View" : "Save View"}
                </Typography>
                <TextField
                  label="View Name"
                  variant="outlined"
                  size="medium"
                  fullWidth
                  value={viewName}
                  onChange={handleViewNameChange}
                  autoFocus
                  error={!!viewNameError}
                  helperText={viewNameError}
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
                    onClick={handleSaveView}
                    variant="contained"
                    size="large"
                    disabled={!!viewNameError}
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
                theme.palette.mode === "light" ? "#93C5FD" : "#4ADE80"
              }`,
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 6px 16px rgba(30, 64, 175, 0.15)"
                : "0 6px 16px rgba(22, 101, 52, 0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: (theme) =>
                theme.palette.mode === "light"
                  ? "0 10px 24px rgba(30, 64, 175, 0.2)"
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
                color: (theme) =>
                  theme.palette.mode === "light" ? "#1E40AF" : "#22C55E",
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #DBEAFE, #F0F9FF)"
                    : "linear-gradient(45deg, #064E3B, #14532D)",
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
              <Factory
                fontSize="small"
                sx={{ color: theme.palette.warning.main }}
              />
              Plant: {plant || "None"}
            </Typography>

            <Tooltip
              title={
                selectedScripts.length > 0 ? (
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? "#1E40AF"
                            : "#22C55E",
                      }}
                    >
                      Selected Scripts:
                    </Typography>
                    {selectedScripts.map((script) => (
                      <Typography
                        key={script}
                        variant="body2"
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === "light"
                              ? "#1E40AF"
                              : "#22C55E",
                        }}
                      >
                        - {script}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  "No scripts selected"
                )
              }
              placement="top"
              arrow
              PopperProps={{
                sx: {
                  "& .MuiTooltip-tooltip": {
                    background: gradients.paper,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
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
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E40AF" : "#22C55E",
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "linear-gradient(45deg, #DBEAFE, #F0F9FF)"
                      : "linear-gradient(45deg, #064E3B, #14532D)",
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
                Scripts: {selectedScripts.length} selected
              </Typography>
            </Tooltip>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #DBEAFE, #F0F9FF)"
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
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E40AF" : "#22C55E",
                }}
              >
                <Code
                  fontSize="small"
                  sx={{ color: theme.palette.info.main, mr: 0.5 }}
                />
                Type: {widgetType} View
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: (theme) =>
                  theme.palette.mode === "light" ? "#1E40AF" : "#22C55E",
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #DBEAFE, #F0F9FF)"
                    : "linear-gradient(45deg, #064E3B, #14532D)",
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
              <CalendarToday
                fontSize="small"
                sx={{ color: theme.palette.secondary.main }}
              />
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
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
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
          elevation={4}
          sx={{
            padding: 2,
            background: gradients.container,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
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
          <div ref={gridRef} style={{ width: "100%", height: "100%" }}>
            {widgets.length > 0 ? (
              <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={70}
                width={gridWidth || 1200}
                isDraggable={!isLocked}
                isResizable={!isLocked}
                onLayoutChange={handleLayoutChange}
                margin={[12, 12]}
                containerPadding={[12, 12]}
                compactType="vertical"
                preventCollision={false}
              >
                {widgets.map((widget) => (
                  <Box
                    key={widget.id}
                    sx={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                      borderRadius: 3,
                      boxShadow: `0 4px 16px ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      backgroundColor:
                        mode === "light"
                          ? "rgba(255, 255, 255, 0.95)"
                          : "rgba(15, 23, 42, 0.9)",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: `0 8px 24px ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <NumberWidget
                      terminal={widget.plant}
                      measurand={widget.measurand}
                      value={widget.value}
                      timestamp={widget.timestamp}
                      widgetId={widget.id}
                      onDelete={handleDeleteWidget}
                    />
                  </Box>
                ))}
              </GridLayout>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "400px",
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
                  No Dashboard Generated
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ textAlign: "center", maxWidth: "500px" }}
                >
                  Select a Plant, choose{" "}
                  <Box
                    component="span"
                    sx={{
                      color:
                        mode === "light" ? "primary.main" : "primary.light",
                      fontWeight: 600,
                    }}
                  >
                    Scripts{" "}
                  </Box>{" "}
                  to monitor, and click "Go" to create your custom view.
                  <br />
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: "center",
                      maxWidth: "500px",
                      color:
                        mode === "light" ? "primary.main" : "primary.light",
                      fontWeight: 600,
                    }}
                  >
                    You can also select a previously saved view from the
                    dropdown menu.
                  </Typography>
                </Typography>
              </Box>
            )}
          </div>
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
    </Fade>
  );
};

export default CurrentDataDisplaySV;
