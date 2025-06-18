import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
} from "@mui/material";
import { SketchPicker } from "react-color";
import { useThemeContext } from "../../../context/ThemeContext";

const WidgetSettingsDialog = ({
  open,
  onClose,
  onSave,
  widgetId,
  initialSettings,
  defaultMeasurandColor,
}) => {
  const { mode } = useThemeContext();
  const [settings, setSettings] = useState({
    fontFamily: initialSettings?.fontFamily || "'Inter', 'Roboto', sans-serif",
    fontSize: initialSettings?.fontSize || "1rem",
    backgroundColor:
      initialSettings?.backgroundColor ||
      (mode === "light" ? "#FFFFFF" : "#1F2937"),
    textColor:
      initialSettings?.textColor || (mode === "light" ? "#1E293B" : "#F3F4F6"),
    measurandColor: initialSettings?.measurandColor || null, // Null means use default
  });
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showMeasurandColorPicker, setShowMeasurandColorPicker] =
    useState(false);

  // Refs for each color picker container
  const backgroundPickerRef = useRef(null);
  const textColorPickerRef = useRef(null);
  const measurandColorPickerRef = useRef(null);

  const fontOptions = [
    "'Inter', 'Roboto', sans-serif",
    "Arial, sans-serif",
    "'Helvetica Neue', sans-serif",
    "'Times New Roman', Times, serif",
  ];

  const handleChange = (field) => (event) => {
    setSettings({ ...settings, [field]: event.target.value });
  };

  const handleColorChange = (field) => (color) => {
    setSettings({ ...settings, [field]: color.hex });
  };

  const handleResetMeasurandColor = () => {
    setSettings({ ...settings, measurandColor: null });
    setShowMeasurandColorPicker(false); // Close picker if open when resetting
  };

  const handleSave = () => {
    onSave(widgetId, settings);
    onClose();
  };

  // Handle outside click to close color pickers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        backgroundPickerRef.current &&
        !backgroundPickerRef.current.contains(event.target)
      ) {
        setShowBackgroundPicker(false);
      }
      if (
        textColorPickerRef.current &&
        !textColorPickerRef.current.contains(event.target)
      ) {
        setShowTextColorPicker(false);
      }
      if (
        measurandColorPickerRef.current &&
        !measurandColorPickerRef.current.contains(event.target)
      ) {
        setShowMeasurandColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="settings-dialog-title"
      sx={{ "& .MuiDialog-paper": { borderRadius: 2, minWidth: "400px" } }}
    >
      <DialogTitle id="settings-dialog-title">Widget Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={settings.fontFamily}
              onChange={handleChange("fontFamily")}
              label="Font Family"
            >
              {fontOptions.map((font) => (
                <MenuItem key={font} value={font}>
                  {font.split(",")[0].replace(/['"]/g, "")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Font Size (e.g., 1rem, 16px)"
            value={settings.fontSize}
            onChange={handleChange("fontSize")}
            fullWidth
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Background Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: settings.backgroundColor,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
              />
              {showBackgroundPicker && (
                <Box
                  ref={backgroundPickerRef}
                  sx={{ position: "absolute", zIndex: 2 }}
                >
                  <SketchPicker
                    color={settings.backgroundColor}
                    onChangeComplete={handleColorChange("backgroundColor")}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowBackgroundPicker(false)}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    Close
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Text Color
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: settings.textColor,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              />
              {showTextColorPicker && (
                <Box
                  ref={textColorPickerRef}
                  sx={{ position: "absolute", zIndex: 2 }}
                >
                  <SketchPicker
                    color={settings.textColor}
                    onChangeComplete={handleColorChange("textColor")}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowTextColorPicker(false)}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    Close
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Measurand Color
              {settings.measurandColor && (
                <Button
                  size="small"
                  onClick={handleResetMeasurandColor}
                  sx={{ ml: 1, color: "#EF4444" }}
                >
                  Reset to Default
                </Button>
              )}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor:
                    settings.measurandColor || defaultMeasurandColor,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() =>
                  setShowMeasurandColorPicker(!showMeasurandColorPicker)
                }
              />
              {showMeasurandColorPicker && (
                <Box
                  ref={measurandColorPickerRef}
                  sx={{ position: "absolute", zIndex: 2 }}
                >
                  <SketchPicker
                    color={settings.measurandColor || defaultMeasurandColor}
                    onChangeComplete={handleColorChange("measurandColor")}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowMeasurandColorPicker(false)}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    Close
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            borderRadius: 1,
            background: getGradients().primary,
            "&:hover": {
              background: getGradients().hover,
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetSettingsDialog;
