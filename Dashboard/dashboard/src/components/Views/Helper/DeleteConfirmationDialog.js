import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  measurand,
  terminal,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      sx={{ "& .MuiDialog-paper": { borderRadius: 2 } }}
    >
      <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the widget for "{measurand}" on "
          {terminal}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1 }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{ borderRadius: 1 }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
