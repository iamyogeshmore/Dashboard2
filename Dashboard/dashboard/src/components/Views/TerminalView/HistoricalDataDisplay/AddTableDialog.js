import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Fade,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Zoom,
  CircularProgress,
  Tooltip,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import TableForm from "./TableForm";
import { useThemeContext } from "../../../../context/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import TableChartIcon from "@mui/icons-material/TableChart";
import InfoIcon from "@mui/icons-material/Info";

const AddTableDialog = ({
  open,
  onClose,
  onSubmit,
  profiles,
  plants,
  terminals,
  measurand,
  loading = {},
  error = {},
  fetchTerminals,
  fetchMeasurands,
}) => {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    profile: "",
    plant: "",
    terminal: "",
    measurand: [],
  });
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Reset form data and snackbar when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        profile: "",
        plant: "",
        terminal: "",
        measurand: [],
      });
      setIsSubmitting(false);
      setSnackbar({ open: false, message: "", severity: "success" });
    }
  }, [open]);

  // Validate form data
  useEffect(() => {
    setIsValid(
      formData.profile &&
        formData.plant &&
        formData.terminal &&
        formData.measurand.length > 0
    );
  }, [formData]);

  // Add useEffect to fetch terminals and measurands when plant/terminal changes
  useEffect(() => {
    if (formData.plant) {
      fetchTerminals && fetchTerminals(formData.plant);
    }
  }, [formData.plant]);

  useEffect(() => {
    if (formData.plant && formData.terminal) {
      fetchMeasurands && fetchMeasurands(formData.plant, formData.terminal);
    }
  }, [formData.plant, formData.terminal]);

  const handleSubmit = async () => {
    if (!formData.profile) {
      setSnackbar({
        open: true,
        message: "Please select a Profile.",
        severity: "error",
      });
      return;
    }
    if (!formData.plant) {
      setSnackbar({
        open: true,
        message: "Please select a Plant.",
        severity: "error",
      });
      return;
    }
    if (!formData.terminal) {
      setSnackbar({
        open: true,
        message: "Please select a Terminal.",
        severity: "error",
      });
      return;
    }
    if (formData.measurand.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one Measurand.",
        severity: "error",
      });
      return;
    }

    if (isValid) {
      setIsSubmitting(true);
      try {
        // Generate default table name: profilename-terminalname-countofmeasurands
        const tableName = `${formData.profile}-${formData.terminal}-${formData.measurand.length}`;
        const tableData = { ...formData, name: tableName };
        await onSubmit(tableData);
        setSnackbar({
          open: true,
          message: "Table created successfully!",
          severity: "success",
        });
        onClose();
      } catch (error) {
        console.error("Submission failed:", error);
        setSnackbar({
          open: true,
          message: "Failed to create table.",
          severity: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  // Enhanced gradient colors
  const getPrimaryColor = () =>
    mode === "light" ? theme.palette.primary.main : theme.palette.success.main;
  const getSecondaryColor = () =>
    mode === "light" ? theme.palette.primary.dark : theme.palette.success.dark;

  const dialogBgColor =
    mode === "light" ? "#ffffff" : theme.palette.background.paper;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Fade}
        transitionDuration={400}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow:
              mode === "light"
                ? "0 20px 60px rgba(0,0,0,0.2), 0 10px 25px rgba(0,0,0,0.1)"
                : "0 20px 60px rgba(0,0,0,0.5), 0 10px 25px rgba(0,0,0,0.3)",
            overflow: "hidden",
            background: dialogBgColor,
            maxWidth: 580,
            width: "100%",
            transition: "all 0.3s ease-in-out",
          },
        }}
      >
        {/* Enhanced Header with animated gradient */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${getPrimaryColor()} 0%, ${getSecondaryColor()} 100%)`,
            padding: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 50%, ${alpha(
                getPrimaryColor(),
                0
              )} 0%, ${alpha(getSecondaryColor(), 0.4)} 100%)`,
              animation: "pulseGradient 8s ease infinite",
              zIndex: 0,
            },
            "@keyframes pulseGradient": {
              "0%": { opacity: 0.3, transform: "scale(1)" },
              "50%": { opacity: 0.6, transform: "scale(1.3)" },
              "100%": { opacity: 0.3, transform: "scale(1)" },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              zIndex: 1,
            }}
          >
            <Zoom in={open} style={{ transitionDelay: "150ms" }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha("#fff", 0.15),
                  backdropFilter: "blur(8px)",
                  boxShadow: `0 4px 12px ${alpha("#000", 0.1)}`,
                }}
              >
                <TableChartIcon
                  sx={{
                    color: "white",
                    fontSize: 28,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                  }}
                />
              </Box>
            </Zoom>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Create New Table
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha("#fff", 0.9),
                  fontSize: "0.95rem",
                  mt: 0.5,
                  fontWeight: 400,
                }}
              >
                Configure settings for data visualization
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Close" arrow placement="left">
            <IconButton
              onClick={onClose}
              size="medium"
              sx={{
                color: "white",
                backgroundColor: alpha("#fff", 0.15),
                backdropFilter: "blur(8px)",
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.25),
                  transform: "rotate(90deg)",
                  transition: "all 0.3s ease",
                },
                zIndex: 1,
                width: 40,
                height: 40,
              }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Info Card */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor:
                mode === "light"
                  ? alpha(theme.palette.info.light, 0.1)
                  : alpha(theme.palette.info.dark, 0.15),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <InfoIcon
              sx={{
                color: theme.palette.info.main,
                fontSize: 24,
                animation: "pulse 2s infinite ease-in-out",
                "@keyframes pulse": {
                  "0%": { opacity: 0.7, transform: "scale(1)" },
                  "50%": { opacity: 1, transform: "scale(1.1)" },
                  "100%": { opacity: 0.7, transform: "scale(1)" },
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color:
                  mode === "light"
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                fontWeight: 400,
                fontSize: "0.95rem",
                lineHeight: 1.5,
              }}
            >
              Select a Profile first, then a Plant, followed by a Terminal, and
              finally at least one Measurand to create your data table.
            </Typography>
          </Paper>
        </Box>

        {/* Dialog Content */}
        <DialogContent
          sx={{
            px: 3,
            py: 2.5,
            "&::-webkit-scrollbar": {
              width: "8px",
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.4),
            },
          }}
        >
          <TableForm
            formData={formData}
            setFormData={setFormData}
            profiles={profiles}
            plants={plants}
            terminals={terminals}
            measurand={measurand}
            loading={loading}
            error={error}
            setSnackbar={setSnackbar}
          />
        </DialogContent>

        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5) }} />

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            padding: 3,
            justifyContent: "space-between",
            backgroundColor:
              mode === "light"
                ? alpha(theme.palette.background.default, 0.5)
                : alpha(theme.palette.background.default, 0.2),
          }}
        >
          <Tooltip title="Discard changes and close" arrow placement="top">
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.text.primary, 0.3),
                color: theme.palette.text.primary,
                "&:hover": {
                  borderColor: alpha(theme.palette.text.primary, 0.6),
                  backgroundColor: alpha(theme.palette.text.primary, 0.05),
                  transform: "translateY(-2px)",
                },
                textTransform: "none",
                fontWeight: 500,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                transition: "all 0.3s ease",
              }}
            >
              Cancel
            </Button>
          </Tooltip>

          <Tooltip
            title={
              isValid ? "Create the table" : "Complete all fields to proceed"
            }
            arrow
            placement="top"
          >
            <span>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!isValid || isSubmitting}
                startIcon={isSubmitting ? null : <AddIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${getPrimaryColor()} 0%, ${getSecondaryColor()} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${getSecondaryColor()} 0%, ${getPrimaryColor()} 100%)`,
                    boxShadow: `0 8px 20px ${alpha(getPrimaryColor(), 0.5)}`,
                    transform: "translateY(-2px)",
                  },
                  "&.Mui-disabled": {
                    background:
                      mode === "light"
                        ? alpha(theme.palette.action.disabled, 0.3)
                        : alpha(theme.palette.action.disabled, 0.2),
                    color:
                      mode === "light"
                        ? alpha(theme.palette.text.primary, 0.4)
                        : alpha(theme.palette.text.primary, 0.3),
                  },
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: 2,
                  px: 3.5,
                  py: 1.2,
                  transition:
                    "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  minWidth: 140,
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Create Table"
                )}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default AddTableDialog;
