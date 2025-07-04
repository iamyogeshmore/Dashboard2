import { useState, useEffect, useRef } from "react";
import {
  Box,
  Toolbar,
  Tooltip,
  Fade,
  Button,
  Paper,
  Chip,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  TextFields,
  Numbers,
  Speed,
  Timeline,
  TableChart,
  Image,
  Save,
  Publish,
  Update,
  Delete,
  Title,
  Lock,
  LockOpen,
  Settings,
  Edit,
  Brush,
} from "@mui/icons-material";
import WidgetDialog from "./WidgetDialog";
import WidgetPropertiesDialog from "./WidgetPropertiesDialog";
import TextWidget from "./dashboardWidgets/TextWidget.js";
import NumberWidget from "./dashboardWidgets/NumberWidget.js";
import GaugeWidget from "./dashboardWidgets/GaugeWidget.js";
import GraphWidget from "./dashboardWidgets/GraphWidget.js";
import MultiAxisGraphWidget from "./dashboardWidgets/MultiAxisGraphWidget.js";
import DataGridWidget from "./dashboardWidgets/DataGridWidget.js";
import ImageWidget from "./dashboardWidgets/ImageWidget.js";
import { useThemeContext } from "../../context/ThemeContext";
import useSnackbar from "./useSnackbar";
import { useTheme } from "@mui/material/styles";
import {
  StyledAppBar,
  DashboardTitle,
  WidgetIconButton,
  ActionButton,
  EditModeSwitch,
  StyledWidgetDialog,
  StyledTextField,
  StyledSelect,
} from "./Dashboard.styles";
import ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  createDashboard,
  getDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard as apiDeleteDashboard,
  listDashboards,
} from "../../services/apiService";

const VALID_WIDGET_TYPES = [
  "text",
  "number",
  "gauge",
  "graph",
  "datagrid",
  "image",
];

const Dashboard = ({ onLoadDashboard, onCreateNewDashboard, currentPath }) => {
  const { mode } = useThemeContext();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [openPropertiesDialog, setOpenPropertiesDialog] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [layout, setLayout] = useState([]);
  const [editMode, setEditMode] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [dashboardName, setDashboardName] = useState("");
  const [patron, setPatron] = useState("");
  const [nameError, setNameError] = useState("");
  const [isDashboardSaved, setIsDashboardSaved] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [noPublishedDashboard, setNoPublishedDashboard] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [hoveredWidgetId, setHoveredWidgetId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const [gridWidth, setGridWidth] = useState(0);
  const gridRef = useRef(null);

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
    if (currentPath === "/") {
      // First, get the published dashboard's id
      listDashboards()
        .then((res) => {
          if (res.status === "success" && Array.isArray(res.data)) {
            const publishedDashboard = res.data.find(d => d.isPublished);
            if (publishedDashboard) {
              // Fetch the full dashboard by id
              getDashboardById(publishedDashboard._id).then((response) => {
                if (response.status === "success" && response.data) {
                  setWidgets(response.data.widgets || []);
                  setLayout(response.data.layout || []);
                  setDashboardName(response.data.name || "");
                  setIsDashboardSaved(true);
                  setCurrentDashboardId(response.data._id);
                  setIsPublished(true);
                  setNoPublishedDashboard(false);
                }
              });
            } else {
              setWidgets([]);
              setLayout([]);
              setDashboardName("");
              setIsDashboardSaved(false);
              setCurrentDashboardId(null);
              setIsPublished(false);
              setNoPublishedDashboard(true);
            }
          }
        })
        .catch(() => {
          setNoPublishedDashboard(true);
        });
    }
  }, [currentPath]);

  const handleOpenDialog = (type) => {
    if (!VALID_WIDGET_TYPES.includes(type)) {
      showSnackbar("Invalid widget type selected", "error");
      return;
    }
    setSelectedWidgetType(type);
    setEditingWidget(null);
    setOpenDialog(true);
  };

  const handleEditWidget = (widget) => {
    if (!VALID_WIDGET_TYPES.includes(widget.type)) {
      showSnackbar("Cannot edit widget: Invalid widget type", "error");
      return;
    }
    setSelectedWidgetType(widget.type);
    setEditingWidget(widget);
    setOpenDialog(true);
  };

  const handleOpenPropertiesDialog = (widget) => {
    setSelectedWidget(widget);
    setOpenPropertiesDialog(true);
  };

  const handleClosePropertiesDialog = () => {
    setOpenPropertiesDialog(false);
    setSelectedWidget(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWidgetType(null);
    setEditingWidget(null);
  };

  const handleAddWidget = (widgetData) => {
    if (editingWidget) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === editingWidget.id ? { ...w, data: widgetData } : w
        )
      );
      showSnackbar("Widget updated successfully!", "success");
    } else {
      const newWidgetId = Date.now().toString();
      setWidgets((prev) => [
        ...prev,
        { id: newWidgetId, type: selectedWidgetType, data: widgetData },
      ]);
      setLayout((prev) => [
        ...prev,
        { i: newWidgetId, x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2, maxH: 12 },
      ]);
      showSnackbar("Widget added successfully!", "success");
    }
    handleCloseDialog();
  };

  const handleUpdateWidgetProperties = (updatedWidget) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );
    showSnackbar("Widget properties updated successfully!", "success");
    handleClosePropertiesDialog();
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
    setLayout((prev) => prev.filter((item) => item.i !== widgetId));
    showSnackbar("Widget deleted successfully!", "success");
  };

  const handleLayoutChange = (newLayout) => {
    if (!isLocked) {
      setLayout(newLayout);
    }
  };

  const handleToggleEditMode = () => {
    setEditMode((prev) => !prev);
    if (!editMode) {
      setIsLocked(false);
    }
  };

  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
    showSnackbar(
      isLocked ? "Widgets unlocked for repositioning" : "Widgets locked",
      "info"
    );
  };

  const handleOpenSaveDialog = () => {
    setOpenSaveDialog(true);
  };

  const handleCloseSaveDialog = () => {
    setOpenSaveDialog(false);
    setPatron("");
    setNameError("");
  };

  const validateDashboardName = (name) => {
    if (!name) {
      return "Dashboard name is required";
    }
    if (name.length > 50) {
      return "Name must be 50 characters or less";
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return "Name can only contain letters, numbers, and spaces";
    }
    return "";
  };

  const handleSaveDashboard = async () => {
    const error = validateDashboardName(dashboardName);
    if (error) {
      setNameError(error);
      showSnackbar(error, "error");
      return;
    }
    const dashboardData = { widgets, layout, name: dashboardName, isPublished, patron };
    try {
      let response;
      if (isDashboardSaved && currentDashboardId) {
        response = await updateDashboard(currentDashboardId, dashboardData);
      } else {
        response = await createDashboard(dashboardData);
      }
      if (response.status === "success") {
        showSnackbar(
          isDashboardSaved ? "Dashboard updated successfully!" : "Dashboard saved successfully!",
          "success"
        );
        setIsDashboardSaved(true);
        setCurrentDashboardId(response.data._id);
        handleCloseSaveDialog();
        if (onLoadDashboard) onLoadDashboard.current(response.data._id);
      } else {
        showSnackbar(response.message || "Failed to save dashboard", "error");
      }
    } catch (err) {
      showSnackbar("Failed to save dashboard", "error");
    }
  };

  const handlePublishDashboard = async () => {
    try {
      // Unpublish all dashboards first
      const allDashboards = await getDashboards();
      if (allDashboards.status === "success" && Array.isArray(allDashboards.data)) {
        await Promise.all(
          allDashboards.data
            .filter(d => d.isPublished)
            .map(d => updateDashboard(d._id, { ...d, isPublished: false }))
        );
      }
      // Publish current dashboard
      const dashboardData = { widgets, layout, name: dashboardName, isPublished: true, patron };
      let response;
      if (isDashboardSaved && currentDashboardId) {
        response = await updateDashboard(currentDashboardId, dashboardData);
      } else {
        response = await createDashboard(dashboardData);
      }
      if (response.status === "success") {
        setIsPublished(true);
        setIsDashboardSaved(true);
        setCurrentDashboardId(response.data._id);
        showSnackbar("Dashboard published successfully!", "success");
        if (onLoadDashboard) onLoadDashboard.current(response.data._id);
      } else {
        showSnackbar(response.message || "Failed to publish dashboard", "error");
      }
    } catch (err) {
      showSnackbar("Failed to publish dashboard", "error");
    }
  };

  const handleLoadDashboard = async (dashboardId) => {
    try {
      const response = await getDashboardById(dashboardId);
      if (response.status === "success" && response.data) {
        setWidgets(response.data.widgets || []);
        setLayout(response.data.layout || []);
        setDashboardName(response.data.name || "");
        setIsDashboardSaved(true);
        setCurrentDashboardId(dashboardId);
        setIsPublished(response.data.isPublished || false);
        setNoPublishedDashboard(false);
        showSnackbar(`Loaded dashboard: ${response.data.name}`, "success");
      }
    } catch (err) {
      showSnackbar("Failed to load dashboard", "error");
    }
  };

  const handleCreateNewDashboard = () => {
    setWidgets([]);
    setLayout([]);
    setDashboardName("");
    setIsDashboardSaved(false);
    setCurrentDashboardId(null);
    setIsPublished(false);
    setNoPublishedDashboard(false);
    showSnackbar("New dashboard created!", "info");
  };

  useEffect(() => {
    if (onLoadDashboard) {
      onLoadDashboard.current = handleLoadDashboard;
    }
    if (onCreateNewDashboard) {
      onCreateNewDashboard.current = handleCreateNewDashboard;
    }
  }, [onLoadDashboard, onCreateNewDashboard]);

  const patrons = ["Patron A", "Patron B", "Patron C", "Patron D"];

  const widgetIcons = [
    { type: "text", icon: <TextFields />, tooltip: "Add Text Widget" },
    { type: "number", icon: <Numbers />, tooltip: "Add Number Widget" },
    { type: "gauge", icon: <Speed />, tooltip: "Add Gauge Widget" },
    { type: "graph", icon: <Timeline />, tooltip: "Add Graph Widget" },
    { type: "datagrid", icon: <TableChart />, tooltip: "Add DataGrid Widget" },
    { type: "image", icon: <Image />, tooltip: "Add Image Widget" },
  ];

  const renderWidget = (widget) => {
    return (
      <Box
        sx={{ position: "relative", height: "100%", width: "100%" }}
        onMouseEnter={() => setHoveredWidgetId(widget.id)}
        onMouseLeave={() => setHoveredWidgetId(null)}
      >
        {editMode && hoveredWidgetId === widget.id && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 1,
              zIndex: 1,
            }}
          >
            <Tooltip title="Edit Widget">
              <WidgetIconButton
                size="small"
                onClick={() => handleEditWidget(widget)}
              >
                <Edit fontSize="small" color="primary" />
              </WidgetIconButton>
            </Tooltip>
            <Tooltip title="Widget Properties">
              <WidgetIconButton
                size="small"
                onClick={() => handleOpenPropertiesDialog(widget)}
              >
                <Brush fontSize="small" color="primary" />
              </WidgetIconButton>
            </Tooltip>
            <Tooltip title="Delete Widget">
              <WidgetIconButton
                size="small"
                onClick={() => handleDeleteWidget(widget.id)}
              >
                <Delete fontSize="small" color="error" />
              </WidgetIconButton>
            </Tooltip>
          </Box>
        )}
        {(() => {
          switch (widget.type) {
            case "text":
              return <TextWidget data={widget.data} />;
            case "number":
              return <NumberWidget data={widget.data} />;
            case "gauge":
              return <GaugeWidget data={widget.data} />;
            case "graph":
              return widget.data.graphProfile === "multi-axis" ? (
                <MultiAxisGraphWidget
                  data={widget.data}
                  onUpdate={(updatedData) => {
                    setWidgets((prev) =>
                      prev.map((w) =>
                        w.id === widget.id ? { ...w, data: updatedData } : w
                      )
                    );
                    showSnackbar(
                      "Multi-Axis Graph settings updated!",
                      "success"
                    );
                  }}
                />
              ) : (
                <GraphWidget
                  data={widget.data}
                  onUpdate={(updatedData) => {
                    setWidgets((prev) =>
                      prev.map((w) =>
                        w.id === widget.id ? { ...w, data: updatedData } : w
                      )
                    );
                    showSnackbar("Graph settings updated!", "success");
                  }}
                />
              );
            case "datagrid":
              return (
                <DataGridWidget
                  data={widget.data}
                  editMode={editMode}
                  onUpdate={(updatedData) => {
                    setWidgets((prev) =>
                      prev.map((w) =>
                        w.id === widget.id ? { ...w, data: updatedData } : w
                      )
                    );
                    showSnackbar("DataGrid settings updated!", "success");
                  }}
                />
              );
            case "image":
              return <ImageWidget data={widget.data} />;
            default:
              return null;
          }
        })()}
      </Box>
    );
  };

  const handleDeleteDashboard = async () => {
    if (!currentDashboardId) return;
    try {
      const response = await apiDeleteDashboard(currentDashboardId);
      if (response.status === "success") {
        setWidgets([]);
        setLayout([]);
        setDashboardName("");
        setIsDashboardSaved(false);
        setCurrentDashboardId(null);
        setIsPublished(false);
        setNoPublishedDashboard(true);
        showSnackbar("Dashboard deleted successfully!", "success");
      } else {
        showSnackbar(response.message || "Failed to delete dashboard", "error");
      }
    } catch (err) {
      showSnackbar("Failed to delete dashboard", "error");
    }
  };

  return (
    <Box
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        minHeight: "100vh",
        boxShadow: (theme) =>
          `0 4px 20px ${
            theme.palette.mode === "light"
              ? "rgba(0,0,0,0.05)"
              : "rgba(0,0,0,0.2)"
          }`,
      }}
    >
      <Fade in timeout={800}>
        <Box>
          {noPublishedDashboard && !isDashboardSaved && !currentDashboardId ? (
            <Paper
              sx={{
                m: 4,
                p: 4,
                textAlign: "center",
                bgcolor: (theme) => theme.palette.background.paper,
                boxShadow: (theme) =>
                  `0 4px 12px ${
                    theme.palette.mode === "light"
                      ? "rgba(0,0,0,0.08)"
                      : "rgba(0,0,0,0.2)"
                  }`,
              }}
            >
              <Typography variant="h6" gutterBottom>
                No Published Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Create a new dashboard or select one from the dropdown.
              </Typography>
              <ActionButton
                variant="contained"
                onClick={handleCreateNewDashboard}
                sx={{ mt: 2 }}
              >
                Create New Dashboard
              </ActionButton>
            </Paper>
          ) : (
            <>
              {editMode && (
                <div>
                  <StyledAppBar position="static">
                    <Toolbar
                      variant="dense"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        minHeight: 56,
                        px: { xs: 1, sm: 2 },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1, sm: 0 },
                        py: { xs: 1, sm: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {widgetIcons.map(({ type, icon, tooltip }) => (
                          <Tooltip key={type} title={tooltip}>
                            <div
                              onClick={() => handleOpenDialog(type)}
                              aria-label={tooltip}
                            >
                              <WidgetIconButton
                                size="small"
                              >
                                {icon}
                              </WidgetIconButton>
                            </div>
                          </Tooltip>
                        ))}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          my: { xs: 1, sm: 0 },
                        }}
                      >
                        <DashboardTitle variant="subtitle1">
                          {dashboardName || "Energy Dashboard"}
                        </DashboardTitle>
                        <Chip
                          label={isPublished ? "Published" : "Active"}
                          color={isPublished ? "success" : "primary"}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            bgcolor: (theme) =>
                              isPublished
                                ? theme.palette.success.light
                                : theme.palette.primary.light,
                            color: theme.palette.primary.contrastText,
                            boxShadow: `0 0 8px ${
                              isPublished
                                ? theme.palette.success.main
                                : theme.palette.primary.main
                            }50`,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <div>
                          <ActionButton
                            variant="contained"
                            size="small"
                            startIcon={isDashboardSaved ? <Update /> : <Save />}
                            onClick={handleOpenSaveDialog}
                            aria-label={
                              isDashboardSaved
                                ? "Update Dashboard"
                                : "Save Dashboard"
                            }
                          >
                            {isDashboardSaved ? "Update" : "Save"}
                          </ActionButton>
                        </div>
                        <div>
                          <ActionButton
                            variant="contained"
                            size="small"
                            startIcon={<Publish />}
                            onClick={handlePublishDashboard}
                            aria-label="Publish Dashboard"
                          >
                            Publish
                          </ActionButton>
                        </div>
                      </Box>
                    </Toolbar>
                  </StyledAppBar>
                </div>
              )}
              <Box
                sx={{
                  position: "sticky",
                  top: 16,
                  zIndex: 1100,
                  display: "flex",
                  justifyContent: "flex-end",
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  mx: { xs: 2, sm: 3 },
                }}
              >
                <Tooltip title="Dashboard Settings">
                  <div>
                    <IconButton
                      size="small"
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      sx={{
                        color: (theme) => theme.palette.primary.main,
                        bgcolor: (theme) => "rgba(59, 130, 246, 0.15)",
                        "&:hover": {
                          bgcolor: (theme) => "rgba(59, 130, 246, 0.25)",
                        },
                        borderRadius: "8px",
                      }}
                    >
                      <Settings fontSize="0.5rem" />
                    </IconButton>
                  </div>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    sx: {
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.background.paper}dd, ${theme.palette.background.default}cc)`,
                      backdropFilter: "blur(12px)",
                      borderRadius: "12px",
                      border: (theme) =>
                        `1px solid ${
                          theme.palette.mode === "light"
                            ? "rgba(59, 130, 246, 0.3)"
                            : "rgba(34, 197, 94, 0.3)"
                        }`,
                      boxShadow: (theme) =>
                        `0 8px 24px ${
                          theme.palette.mode === "light"
                            ? "rgba(30, 64, 175, 0.2)"
                            : "rgba(22, 101, 52, 0.3)"
                        }`,
                      mt: 1,
                      p: 1,
                    },
                  }}
                >
                  <MenuItem
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5,
                      "&:hover": {
                        background: (theme) =>
                          theme.palette.mode === "light"
                            ? "rgba(59, 130, 246, 0.1)"
                            : "rgba(34, 197, 94, 0.1)",
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? theme.palette.primary.main
                            : theme.palette.primary.light,
                        fontWeight: 500,
                      }}
                    >
                      {editMode ? "Edit On" : "Edit Off"}
                    </Typography>
                    <EditModeSwitch
                      checked={editMode}
                      onChange={handleToggleEditMode}
                    />
                  </MenuItem>
                  {editMode && (
                    <MenuItem
                      onClick={handleToggleLock}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                        "&:hover": {
                          background: (theme) =>
                            theme.palette.mode === "light"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(34, 197, 94, 0.1)",
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: (theme) =>
                            isLocked
                              ? theme.palette.error.main
                              : theme.palette.primary.main,
                          fontWeight: 500,
                        }}
                      >
                        {isLocked ? "Unlock Widgets" : "Lock Widgets"}
                      </Typography>
                      {isLocked ? (
                        <Lock fontSize="small" />
                      ) : (
                        <LockOpen fontSize="small" />
                      )}
                    </MenuItem>
                  )}
                </Menu>
              </Box>
              <Box ref={gridRef}>
                <ReactGridLayout
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
                  margin={[16, 16]} // Add consistent margin between grid items
                  containerPadding={[16, 16]} // Add padding inside the grid container
                  onDragStop={(layout, oldItem, newItem) => {
                    const maxCols = 12;
                    const marginPx = 16; // Match the margin value in pixels
                    const containerWidth =
                      gridWidth || window.innerWidth * 0.95;
                    const colWidth = (containerWidth - 2 * marginPx) / maxCols; // Calculate column width

                    // Constrain x to stay within bounds
                    if (newItem.x < 0) {
                      newItem.x = 0;
                    }
                    // Ensure widget doesn't exceed right boundary
                    const maxX = maxCols - newItem.w;
                    if (newItem.x > maxX) {
                      newItem.x = maxX;
                    }
                  }}
                  style={{
                    width: "100%",
                  }}
                >
                  {widgets.map((widget, index) => (
                    <Box
                      key={widget.id}
                      sx={{
                        bgcolor:
                          widget.data.backgroundColor ||
                          theme.palette.background.paper,
                        boxShadow: (theme) =>
                          theme.palette.mode === "light"
                            ? "0 4px 12px rgba(0,0,0,0.08)"
                            : "0 4px 12px rgba(0,0,0,0.2)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          boxShadow: (theme) =>
                            editMode && !isLocked
                              ? theme.palette.mode === "light"
                                ? "0 6px 16px rgba(0,0,0,0.12)"
                                : "0 6px 16px rgba(0,0,0,0.3)"
                              : "none",
                        },
                      }}
                    >
                      <Fade in timeout={800 + index * 200}>
                        <div style={{ height: "100%", width: "100%" }}>
                          {renderWidget(widget)}
                        </div>
                      </Fade>
                    </Box>
                  ))}
                </ReactGridLayout>
              </Box>
            </>
          )}
        </Box>
      </Fade>
      <WidgetDialog
        open={openDialog}
        onClose={handleCloseDialog}
        widgetType={selectedWidgetType}
        onSubmit={handleAddWidget}
        initialData={editingWidget?.data}
      />
      <WidgetPropertiesDialog
        open={openPropertiesDialog}
        onClose={handleClosePropertiesDialog}
        widget={selectedWidget}
        onSubmit={handleUpdateWidgetProperties}
      />
      <StyledWidgetDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: (theme) => theme.palette.primary.main,
            textAlign: "center",
            textShadow: (theme) => `0 0 8px ${theme.palette.primary.light}80`,
          }}
        >
          {isDashboardSaved ? "Update Dashboard" : "Save Dashboard"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2.5, mt: 1.5 }}>
            <InputLabel id="patron-select-label">Select Patron</InputLabel>
            <StyledSelect
              labelId="patron-select-label"
              value={patron}
              label="Select Patron"
              onChange={(e) => setPatron(e.target.value)}
              sx={{ borderRadius: (theme) => theme.shape.borderRadius }}
            >
              {patrons.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </StyledSelect>
          </FormControl>
          <StyledTextField
            fullWidth
            label="Dashboard Name"
            value={dashboardName}
            onChange={(e) => {
              setDashboardName(e.target.value);
              setNameError(validateDashboardName(e.target.value));
            }}
            error={!!nameError}
            helperText={nameError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Title />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: (theme) => theme.shape.borderRadius }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseSaveDialog}
            sx={{
              textTransform: "none",
              color: (theme) => theme.palette.text.secondary,
              borderRadius: "10px",
              px: 3,
              "&:hover": {
                background: (theme) => theme.palette.background.default,
              },
            }}
          >
            Cancel
          </Button>
          <div>
            <ActionButton
              variant="contained"
              onClick={handleSaveDashboard}
              sx={{
                textTransform: "none",
                borderRadius: (theme) => theme.shape.borderRadius,
                px: 3,
              }}
            >
              {isDashboardSaved ? "Update" : "Save"}
            </ActionButton>
          </div>
        </DialogActions>
      </StyledWidgetDialog>
      <SnackbarComponent />
    </Box>
  );
};

export default Dashboard;
