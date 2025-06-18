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
}) => {
  const { mode } = useThemeContext();
  const theme = useTheme();

  const handleProfileChange = (event) => {
    const value = event.target.value;
    setFormData({
      profile: value,
      plant: "",
      measurand: "",
      terminals: [],
    });
  };

  const handlePlantChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      plant: value,
      measurand: "",
      terminals: [],
    });
  };

  const handleMeasurandChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      measurand: value,
      terminals: [],
    });
    if (value) {
      setSnackbar({
        open: true,
        message: `Measurand "${value}" selected.`,
        severity: "success",
      });
    }
  };

  const handleTerminalChange = (event) => {
    const value = event.target.value;
    const newTerminals = typeof value === "string" ? value.split(",") : value;
    setFormData({
      ...formData,
      terminals: newTerminals,
    });
    if (newTerminals.length > 0) {
      setSnackbar({
        open: true,
        message: `${newTerminals.length} Terminal(s) selected.`,
        severity: "success",
      });
    }
  };

  const handleSelectAllTerminals = (event) => {
    if (event.target.checked) {
      setFormData({ ...formData, terminals: [...terminals] });
      setSnackbar({
        open: true,
        message: "All Terminals selected.",
        severity: "success",
      });
    } else {
      setFormData({ ...formData, terminals: [] });
      setSnackbar({
        open: true,
        message: "All Terminals deselected.",
        severity: "info",
      });
    }
  };

  const allTerminalsSelected =
    terminals.length > 0 && formData.terminals.length === terminals.length;

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
        disabled={!formData.profile}
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
          {plants.length === 0 ? (
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
        sx={getFormControlStyles("measurand")}
        disabled={!formData.plant}
      >
        <InputLabel sx={{ display: "flex", alignItems: "center" }}>
          <Zoom in={true} style={{ transitionDelay: "200ms" }}>
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
          value={formData.measurand}
          onChange={handleMeasurandChange}
          label="Measurand icon"
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
          {measurand.length === 0 ? (
            <MenuItem disabled>No measurands available</MenuItem>
          ) : (
            measurand.map((m) => (
              <MenuItem key={m} value={m}>
                <ListItemText
                  primary={m}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: formData.measurand === m ? 600 : 400,
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
        disabled={!formData.measurand}
      >
        <InputLabel sx={{ display: "flex", alignItems: "center" }}>
          <Zoom in={true} style={{ transitionDelay: "250ms" }}>
            <Power
              sx={{
                color: iconStyles.terminal.color,
                mr: 1,
                transition: "all 0.3s ease",
                transform: "scale(1.2)",
              }}
            />
          </Zoom>
          Terminals
        </InputLabel>
        <Select
          multiple
          value={formData.terminals}
          onChange={handleTerminalChange}
          input={<OutlinedInput label="Terminals icon" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.length > 3 ? (
                <Chip
                  label={`${selected.length} terminals selected`}
                  size="small"
                  sx={{
                    background:
                      mode === "light"
                        ? alpha(iconStyles.terminal.color, 0.2)
                        : alpha(iconStyles.terminal.color, 0.4),
                    color:
                      mode === "light" ? iconStyles.terminal.color : "#ffffff",
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
                      background:
                        mode === "light"
                          ? alpha(iconStyles.terminal.color, 0.2)
                          : alpha(iconStyles.terminal.color, 0.4),
                      color:
                        mode === "light"
                          ? iconStyles.terminal.color
                          : "#ffffff",
                      fontWeight: 500,
                    }}
                  />
                ))
              )}
            </Box>
          )}
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
          <MenuItem>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allTerminalsSelected}
                  indeterminate={
                    formData.terminals.length > 0 && !allTerminalsSelected
                  }
                  onChange={handleSelectAllTerminals}
                />
              }
              label="Select All"
            />
          </MenuItem>
          {terminals.length === 0 ? (
            <MenuItem disabled>No terminals available</MenuItem>
          ) : (
            terminals.map((terminal) => (
              <MenuItem key={terminal} value={terminal}>
                <Checkbox checked={formData.terminals.includes(terminal)} />
                <ListItemText
                  primary={terminal}
                  sx={{
                    "& .MuiTypography-root": {
                      fontWeight: formData.terminals.includes(terminal)
                        ? 600
                        : 400,
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
