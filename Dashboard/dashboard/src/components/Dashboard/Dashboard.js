import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Typography,
  Fade,
  Button,
  Switch,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Paper,
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import WidgetDialog from "./WidgetDialog";
import TextWidget from "./dashboardWidgets/TextWidget.js";
import NumberWidget from "./dashboardWidgets/NumberWidget.js";
import GaugeWidget from "./dashboardWidgets/GaugeWidget.js";
import GraphWidget from "./dashboardWidgets/GraphWidget.js";
import DataGridWidget from "./dashboardWidgets/DataGridWidget.js";
import ImageWidget from "./dashboardWidgets/ImageWidget.js";
import { useThemeContext } from "../../context/ThemeContext";
import useSnackbar from "./useSnackbar";

// Styled Switch for Edit Mode Toggle
const EditModeSwitch = styled(Switch)(({ theme }) => ({
  width: 48,
  height: 24,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 3,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(24px)",
      color: theme.palette.primary.contrastText,
      "& + .MuiSwitch-track": {
        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
        opacity: 1,
        border: 0,
      },
      "& .MuiSwitch-thumb": {
        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      },
    },
    "&:not(.Mui-checked)": {
      "& .MuiSwitch-thumb": {
        background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.light})`,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    width: 16,
    height: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "background 0.3s ease",
  },
  "& .MuiSwitch-track": {
    borderRadius: 24 / 2,
    background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
    opacity: 1,
    transition: "background 0.3s ease",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
  },
}));

const Dashboard = ({ onLoadDashboard, onCreateNewDashboard, currentPath }) => {
  const { mode } = useThemeContext();
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [editMode, setEditMode] = useState(true);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [dashboardName, setDashboardName] = useState("");
  const [patron, setPatron] = useState("");
  const [nameError, setNameError] = useState("");
  const [isDashboardSaved, setIsDashboardSaved] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [noPublishedDashboard, setNoPublishedDashboard] = useState(false);

  // Load published dashboard or blank view on mount or navigation to "/"
  useEffect(() => {
    if (currentPath === "/") {
      // Check for a published dashboard
      let publishedDashboard = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("dashboard_")) {
          const dashboardData = JSON.parse(localStorage.getItem(key));
          if (dashboardData.isPublished) {
            publishedDashboard = { id: key, ...dashboardData };
            break;
          }
        }
      }

      if (publishedDashboard) {
        setWidgets(publishedDashboard.widgets || []);
        setDashboardName(publishedDashboard.name || "");
        setIsDashboardSaved(true);
        setCurrentDashboardId(publishedDashboard.id);
        setIsPublished(true);
        setNoPublishedDashboard(false);
      } else {
        // No published dashboard, show blank view
        setWidgets([]);
        setDashboardName("");
        setIsDashboardSaved(false);
        setCurrentDashboardId(null);
        setIsPublished(false);
        setNoPublishedDashboard(true);
      }
    }
  }, [currentPath]);

  const handleOpenDialog = (type) => {
    setSelectedWidgetType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWidgetType(null);
  };

  const handleAddWidget = (widgetData) => {
    setWidgets((prev) => [
      ...prev,
      { id: Date.now(), type: selectedWidgetType, data: widgetData },
    ]);
    handleCloseDialog();
    showSnackbar("Widget added successfully!", "success");
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
    showSnackbar("Widget deleted successfully!", "success");
  };

  const handleToggleEditMode = () => {
    setEditMode((prev) => !prev);
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

  const handleSaveDashboard = () => {
    const error = validateDashboardName(dashboardName);
    if (error) {
      setNameError(error);
      showSnackbar(error, "error");
      return;
    }
    // Generate unique ID for new dashboards
    const dashboardId = isDashboardSaved
      ? currentDashboardId
      : `dashboard_${Date.now()}`;
    const dashboardData = { widgets, name: dashboardName, isPublished };
    localStorage.setItem(dashboardId, JSON.stringify(dashboardData));
    console.log(
      isDashboardSaved ? "Updating dashboard:" : "Saving dashboard:",
      dashboardData
    );
    showSnackbar(
      isDashboardSaved
        ? "Dashboard updated successfully!"
        : "Dashboard saved successfully!",
      "success"
    );
    setIsDashboardSaved(true);
    setCurrentDashboardId(dashboardId);
    handleCloseSaveDialog();
    // Update parent component to refresh dashboard list
    onLoadDashboard.current(dashboardId);
  };

  const handlePublishDashboard = () => {
    // Set isPublished: true for current dashboard, false for others
    const dashboardId = isDashboardSaved
      ? currentDashboardId
      : `dashboard_${Date.now()}`;
    const dashboardData = { widgets, name: dashboardName, isPublished: true };

    // Update all dashboards in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("dashboard_") && key !== dashboardId) {
        const otherDashboard = JSON.parse(localStorage.getItem(key));
        otherDashboard.isPublished = false;
        localStorage.setItem(key, JSON.stringify(otherDashboard));
      }
    }

    // Save current dashboard
    localStorage.setItem(dashboardId, JSON.stringify(dashboardData));
    setIsPublished(true);
    setIsDashboardSaved(true);
    setCurrentDashboardId(dashboardId);
    showSnackbar("Dashboard published successfully!", "success");
    // Update parent component
    onLoadDashboard.current(dashboardId);
  };

  const handleLoadDashboard = (dashboardId) => {
    const dashboardData = JSON.parse(localStorage.getItem(dashboardId));
    if (dashboardData) {
      setWidgets(dashboardData.widgets || []);
      setDashboardName(dashboardData.name || "");
      setIsDashboardSaved(true);
      setCurrentDashboardId(dashboardId);
      setIsPublished(dashboardData.isPublished || false);
      setNoPublishedDashboard(false);
      showSnackbar(`Loaded dashboard: ${dashboardData.name}`, "success");
    }
  };

  const handleCreateNewDashboard = () => {
    setWidgets([]);
    setDashboardName("");
    setIsDashboardSaved(false);
    setCurrentDashboardId(null);
    setIsPublished(false);
    setNoPublishedDashboard(false);
    showSnackbar("New dashboard created!", "info");
  };

  // Pass load and create functions to parent
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
      <Box sx={{ position: "relative", height: "100%" }}>
        {editMode && (
          <Tooltip title="Delete Widget">
            <IconButton
              size="small"
              onClick={() => handleDeleteWidget(widget.id)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(255,255,255,0.8)",
                zIndex: 1,
              }}
            >
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
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
              return <GraphWidget data={widget.data} />;
            case "datagrid":
              return <DataGridWidget data={widget.data} />;
            case "image":
              return <ImageWidget data={widget.data} />;
            default:
              return null;
          }
        })()}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        minHeight: "100vh",
        borderRadius: 2,
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
              }}
            >
              <Typography variant="h6" gutterBottom>
                No Published Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Create a new dashboard or select one from the dropdown.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateNewDashboard}
                sx={{ mt: 2 }}
              >
                Create New Dashboard
              </Button>
            </Paper>
          ) : (
            <>
              {editMode && (
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <AppBar
                    position="static"
                    sx={{
                      background: (theme) =>
                        theme.components.MuiAppBar.styleOverrides.root
                          .backgroundImage,
                      borderRadius: 0,
                      boxShadow: (theme) =>
                        theme.components.MuiAppBar.styleOverrides.root
                          .boxShadow,
                      py: 0,
                      minHeight: 48,
                    }}
                  >
                    <Toolbar
                      variant="dense"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        minHeight: 48,
                        px: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {widgetIcons.map(({ type, icon, tooltip }) => (
                          <Tooltip key={type} title={tooltip}>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <IconButton
                                size="small"
                                color="inherit"
                                onClick={() => handleOpenDialog(type)}
                                sx={{
                                  bgcolor: (theme) =>
                                    theme.palette.mode === "light"
                                      ? "rgba(255,255,255,0.1)"
                                      : "rgba(255,255,255,0.2)",
                                  borderRadius: 1,
                                  p: 0.6,
                                }}
                              >
                                {icon}
                              </IconButton>
                            </motion.div>
                          </Tooltip>
                        ))}
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            flexGrow: 1,
                            textAlign: "center",
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            color: (theme) =>
                              theme.palette.primary.contrastText,
                          }}
                        >
                          {dashboardName || "Energy Dashboard"}
                        </Typography>
                        <Chip
                          label={isPublished ? "Published" : "Active"}
                          color={isPublished ? "success" : "primary"}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={isDashboardSaved ? <Update /> : <Save />}
                            onClick={handleOpenSaveDialog}
                            sx={{
                              textTransform: "none",
                              borderRadius: 1,
                              px: 1,
                              py: 0.3,
                              fontSize: "0.8rem",
                            }}
                          >
                            {isDashboardSaved ? "Update" : "Save"}
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            startIcon={<Publish />}
                            onClick={handlePublishDashboard}
                            sx={{
                              textTransform: "none",
                              borderRadius: 1,
                              px: 1,
                              py: 0.3,
                              fontSize: "0.8rem",
                            }}
                          >
                            Publish
                          </Button>
                        </motion.div>
                      </Box>
                    </Toolbar>
                  </AppBar>
                </motion.div>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  my: 2,
                  px: { xs: 2, sm: 3 },
                }}
              >
                <Tooltip
                  title={editMode ? "Disable Edit Mode" : "Enable Edit Mode"}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        background: (theme) =>
                          theme.palette.mode === "light"
                            ? "rgba(59, 130, 246, 0.08)"
                            : "rgba(34, 197, 94, 0.08)",
                        borderRadius: "20px",
                        padding: "4px 8px",
                        backdropFilter: "blur(8px)",
                        boxShadow: (theme) =>
                          theme.palette.mode === "light"
                            ? "0 2px 8px rgba(30, 64, 175, 0.1)"
                            : "0 2px 8px rgba(22, 101, 52, 0.1)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          mr: 1,
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
                    </Box>
                  </motion.div>
                </Tooltip>
              </Box>
              <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 4 }}
                sx={{ px: { xs: 2, sm: 3 } }}
              >
                {widgets.map((widget, index) => (
                  <Grid item xs={12} sm={6} md={4} key={widget.id}>
                    <Fade in timeout={800 + index * 200}>
                      <Box
                        sx={{
                          height: "100%",
                          bgcolor: (theme) => theme.palette.background.paper,
                          borderRadius: (theme) => theme.shape.borderRadius,
                          boxShadow: (theme) =>
                            theme.palette.mode === "light"
                              ? "0 4px 12px rgba(0,0,0,0.08)"
                              : "0 4px 12px rgba(0,0,0,0.2)",
                          p: 2,
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: (theme) =>
                              theme.palette.mode === "light"
                                ? "0 6px 16px rgba(0,0,0,0.12)"
                                : "0 6px 16px rgba(0,0,0,0.3)",
                          },
                        }}
                      >
                        {renderWidget(widget)}
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Fade>
      <WidgetDialog
        open={openDialog}
        onClose={handleCloseDialog}
        widgetType={selectedWidgetType}
        onSubmit={handleAddWidget}
      />
      <Dialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: (theme) => theme.shape.borderRadius,
            p: 2,
            bgcolor: (theme) => theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 600, color: (theme) => theme.palette.primary.main }}
        >
          {isDashboardSaved ? "Update Dashboard" : "Save Dashboard"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="patron-select-label">Select Patron</InputLabel>
            <Select
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
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Dashboard Name"
            value={dashboardName}
            onChange={(e) => {
              setDashboardName(e.target.value);
              setNameError(validateDashboardName(e.target.value));
            }}
            error={!!nameError}
            helperText={nameError}
            sx={{ borderRadius: (theme) => theme.shape.borderRadius }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseSaveDialog}
            sx={{
              textTransform: "none",
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveDashboard}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              borderRadius: (theme) => theme.shape.borderRadius,
            }}
          >
            {isDashboardSaved ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <SnackbarComponent />
    </Box>
  );
};

export default Dashboard;
