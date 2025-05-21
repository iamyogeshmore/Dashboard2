import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { useThemeContext } from "../../../context/ThemeContext";

const DeleteTableConfirmationDialog = ({ open, onClose, onConfirm, table }) => {
  const { mode } = useThemeContext();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-table-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          background:
            mode === "light" ? "#ffffff" : theme.palette.background.paper,
          boxShadow:
            mode === "light"
              ? "0 20px 60px rgba(0,0,0,0.2)"
              : "0 20px 60px rgba(0,0,0,0.5)",
        },
      }}
    >
      <DialogTitle id="delete-table-dialog-title" sx={{ fontWeight: 600 }}>
        Confirm Table Deletion
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: theme.palette.text.primary }}>
          Are you sure you want to delete the table for "{table?.terminal}" with
          profile "{table?.profile}"?
        </Typography>
        <Typography
          sx={{
            color: theme.palette.text.secondary,
            mt: 1,
            fontSize: "0.9rem",
          }}
        >
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: alpha(theme.palette.text.primary, 0.3),
            color: theme.palette.text.primary,
            borderRadius: 1,
            textTransform: "none",
            "&:hover": {
              borderColor: alpha(theme.palette.text.primary, 0.6),
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            background: mode === "light" ? "#d32f2f" : "#b71c1c",
            "&:hover": {
              background: mode === "light" ? "#b71c1c" : "#9a0007",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTableConfirmationDialog;
