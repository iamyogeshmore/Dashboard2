import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Tooltip,
  Zoom,
  Chip,
  ListItemText,
  OutlinedInput,
  alpha,
} from "@mui/material";
import { Factory, Power, Assessment, Person } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "../../../../context/ThemeContext";

const TableForm = ({
  formData,
  setFormData,
  profiles,
  plants,
  terminals,
  measurand,
  setSnackbar,
  loading = {},
  error = {},
}) => {
  const { mode } = useThemeContext();
  const theme = useTheme();

  const handleProfileChange = (event) => {
    const value = event.target.value;
    setFormData({
      profile: value,
      plant: "",
      terminal: "",
      measurand: [],
    });
  };

  const handlePlantChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      plant: value,
      terminal: "",
      measurand: [],
    });
  };

  const handleTerminalChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      terminal: value,
      measurand: [],
    });
  };

  const handleMeasurandChange = (event) => {
    const value = event.target.value;
    const newMeasurands = typeof value === "string" ? value.split(",") : value;
    setFormData({
      ...formData,
      measurand: newMeasurands,
    });
    if (newMeasurands.length > 0) {
      setSnackbar({
        open: true,
        message: `${newMeasurands.length} Measurand(s) selected.`,
        severity: "success",
      });
    }
  };

  const handleSelectAllMeasurands = (event) => {
    if (event.target.checked) {
      setFormData({ ...formData, measurand: [...measurand.map((m) => m.id)] });
      setSnackbar({
        open: true,
        message: "All Measurands selected.",
        severity: "success",
      });
    } else {
      setFormData({ ...formData, measurand: [] });
      setSnackbar({
        open: true,
        message: "All Measurands deselected.",
        severity: "info",
      });
    }
  };

  const allMeasurandsSelected =
    measurand.length > 0 && formData.measurand.length === measurand.length;

  const backgrounds = {
    profile: {
      light: "#f7f2fb",
      dark: "#2a1e35",
    },
    plant: {
      light: "#fff2f2",
      dark: "#351e1e",
    },
    terminal: {
      light: "#fffae0",
      dark: "#35331e",
    },
    measurand: {
      light: "#e0f7fa",
      dark: "#1e3535",
    },
  };

  const iconStyles = {
    profile: { color: "#9c27b0", hover: "#ba68c8" },
    plant: { color: "#f44336", hover: "#ef5350" },
    terminal: { color: "#ffc107", hover: "#ffca28" },
    measurand: { color: "#00bcd4", hover: "#26c6da" },
  };

  const getFormControlStyles = (field) => ({
    width: "100%",
    maxWidth: 340,
    mb: 2.5,
    mx: "auto",
    transition: "transform 0.2s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      "& .MuiOutlinedInput-root": {
        boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
      },
    },
    "& .MuiInputBase-root": {
      height: 56,
      borderRadius: 2,
      backgroundColor:
        mode === "light" ? backgrounds[field].light : backgrounds[field].dark,
      display: "flex",
      alignItems: "center",
      transition: "all 0.25s ease-in-out",
      "&:hover": {
        boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
      },
      "&.Mui-focused": {
        backgroundColor:
          mode === "light"
            ? alpha(backgrounds[field].light, 0.9)
            : alpha(backgrounds[field].dark, 0.9),
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
      fontSize: "0.95rem",
      "&.Mui-focused": {},
    },
    "& .MuiSelect-select": {
      minHeight: "56px !important",
      display: "flex",
      alignItems: "center",
      padding: "8px 14px",
    },
  });

  const menuProps = {
    PaperProps: {
      sx: {
        borderRadius: 2,
        boxShadow: `0 8px 24px ${alpha(
          theme.palette.common.black,
          mode === "light" ? 0.15 : 0.4
        )}`,
        maxHeight: 300,
        "& .MuiMenuItem-root": {
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        },
      },
    },
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "center",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "center",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        animation: "fadeIn 0.6s ease",
        "@keyframes fadeIn": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <FormControl
        sx={getFormControlStyles("profile")}
        disabled={profiles.length === 0}
      >
        <InputLabel sx={{ display: "flex", alignItems: "center" }}>
          <Zoom in={true} style={{ transitionDelay: "100ms" }}>
            <Person
              sx={{
                color: iconStyles.profile.color,
                mr: 1,
                transition: "all 0.3s ease",
                transform: "scale(1.2)",
              }}
            />
          </Zoom>
          Profile
        </InputLabel>
        <Select
          value={formData.profile}
          onChange={handleProfileChange}
          label="Profile icon"
          MenuProps={menuProps}
          sx={{
            "& .MuiSvgIcon-root": {
              color: iconStyles.profile.color,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          {profiles.length === 0 ? (
            <MenuItem disabled>No profiles available</MenuItem>
          ) : (
            profiles.map((profile) => (
              <MenuItem key={profile} value={profile}>
                <ListItemText
                  primary={profile}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: formData.profile === profile ? 600 : 400,
                    },
                  }}
                />
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl
        sx={getFormControlStyles("plant")}
        disabled={!formData.profile || loading.plants}
      >
        <InputLabel sx={{ display: "flex", alignItems: "center" }}>
          <Zoom in={true} style={{ transitionDelay: "150ms" }}>
            <Factory
              sx={{
                color: iconStyles.plant.color,
                mr: 1,
                transition: "all 0.3s ease",
                transform: "scale(1.2)",
              }}
            />
          </Zoom>
          Plant
        </InputLabel>
        <Select
          value={formData.plant}
          onChange={handlePlantChange}
          label="Plant icon"
          MenuProps={menuProps}
          sx={{
            "& .MuiSvgIcon-root": {
              color: iconStyles.plant.color,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          {loading.plants ? (
            <MenuItem disabled>Loading plants...</MenuItem>
          ) : error.plants ? (
            <MenuItem disabled>{error.plants}</MenuItem>
          ) : plants.length === 0 ? (
            <MenuItem disabled>No plants available</MenuItem>
          ) : (
            plants.map((plant) => (
              <MenuItem key={plant} value={plant}>
                <ListItemText
                  primary={plant}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: formData.plant === plant ? 600 : 400,
                    },
                  }}
                />
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl
        sx={getFormControlStyles("terminal")}
        disabled={!formData.plant}
      >
        <InputLabel sx={{ display: "flex", alignItems: "center" }}>
          <Zoom in={true} style={{ transitionDelay: "200ms" }}>
            <Power
              sx={{
                color: iconStyles.terminal.color,
                mr: 1,
                transition: "all 0.3s ease",
                transform: "scale(1.2)",
              }}
            />
          </Zoom>
          Terminal
        </InputLabel>
        <Select
          value={formData.terminal}
          onChange={handleTerminalChange}
          label="Terminal icon"
          MenuProps={menuProps}
          sx={{
            "& .MuiSvgIcon-root": {
              color: iconStyles.terminal.color,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          {terminals.length === 0 ? (
            <MenuItem disabled>No terminals available</MenuItem>
          ) : (
            terminals.map((terminal) => (
              <MenuItem key={terminal.id} value={terminal.id}>
                <ListItemText
                  primary={terminal.name}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: formData.terminal === terminal.id ? 600 : 400,
                    },
                  }}
                />
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <FormControl
        sx={getFormControlStyles("measurand")}
        disabled={!formData.terminal}
      >
        <InputLabel sx={{ display: "flex", alignItems: "center" }}>
          <Zoom in={true} style={{ transitionDelay: "250ms" }}>
            <Assessment
              sx={{
                color: iconStyles.measurand.color,
                mr: 1,
                transition: "all 0.3s ease",
                transform: "scale(1.2)",
              }}
            />
          </Zoom>
          Measurand
        </InputLabel>
        <Select
          multiple
          value={formData.measurand}
          onChange={handleMeasurandChange}
          input={<OutlinedInput label="Measurand icon" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.length > 3 ? (
                <Chip
                  label={`${selected.length} measurands selected`}
                  size="small"
                  sx={{
                    background:
                      mode === "light"
                        ? alpha(iconStyles.measurand.color, 0.2)
                        : alpha(iconStyles.measurand.color, 0.4),
                    color:
                      mode === "light" ? iconStyles.measurand.color : "#ffffff",
                    fontWeight: 500,
                  }}
                />
              ) : (
                selected.map((id) => {
                  const meas = measurand.find((m) => m.id === id);
                  return (
                    <Chip
                      key={id}
                      label={meas ? meas.name : id}
                      size="small"
                      sx={{
                        background:
                          mode === "light"
                            ? alpha(iconStyles.measurand.color, 0.2)
                            : alpha(iconStyles.measurand.color, 0.4),
                        color:
                          mode === "light"
                            ? iconStyles.measurand.color
                            : "#ffffff",
                        fontWeight: 500,
                      }}
                    />
                  );
                })
              )}
            </Box>
          )}
          MenuProps={menuProps}
          sx={{
            "& .MuiSvgIcon-root": {
              color: iconStyles.measurand.color,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          <MenuItem>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allMeasurandsSelected}
                  indeterminate={
                    formData.measurand.length > 0 && !allMeasurandsSelected
                  }
                  onChange={handleSelectAllMeasurands}
                />
              }
              label="Select All"
            />
          </MenuItem>
          {measurand.length === 0 ? (
            <MenuItem disabled>No measurands available</MenuItem>
          ) : (
            measurand.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                <Checkbox checked={formData.measurand.includes(m.id)} />
                <ListItemText
                  primary={m.name}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: formData.measurand.includes(m.id) ? 600 : 400,
                    },
                  }}
                />
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TableForm;
