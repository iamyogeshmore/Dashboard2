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
  Typography,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";

const WidgetDialog = ({ open, onClose, widgetType, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const widgetFields = {
    text: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "content", label: "Content", type: "text", required: true },
    ],
    number: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "plant", label: "Plant", type: "text", required: true },
      { name: "terminal", label: "Terminal", type: "text", required: true },
      { name: "measurand", label: "Measurand", type: "text", required: true },
      { name: "unit", label: "Unit", type: "text", required: true },
      {
        name: "decimalUnit",
        label: "Decimal Unit",
        type: "number",
        required: true,
      },
    ],
    gauge: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "min", label: "Min Value", type: "number", required: true },
      { name: "max", label: "Max Value", type: "number", required: true },
      { name: "value", label: "Current Value", type: "number", required: true },
      { name: "unit", label: "Unit", type: "text", required: true },
    ],
    graph: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "chartType",
        label: "Chart Type",
        type: "select",
        options: ["line", "bar", "area"],
        required: true,
      },
    ],
    datagrid: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "columns",
        label: "Columns (comma-separated)",
        type: "text",
        required: true,
      },
    ],
    image: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "imageUrl", label: "Image URL", type: "text", required: true },
    ],
  };

  const fields = widgetFields[widgetType] || [];

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add{" "}
        {widgetType
          ? widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
          : ""}{" "}
        Widget
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {fields.map((field) => (
            <Box key={field.name} sx={{ mb: 2, mt: 1 }}>
              {field.type === "select" ? (
                <FormControl fullWidth error={!!errors[field.name]}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    {...register(field.name, {
                      required: field.required
                        ? `${field.label} is required`
                        : false,
                    })}
                    label={field.label}
                  >
                    {field.options.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[field.name] && (
                    <Typography color="error" variant="caption">
                      {errors[field.name].message}
                    </Typography>
                  )}
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type}
                  {...register(field.name, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                    validate:
                      field.type === "number"
                        ? (value) =>
                            !isNaN(value) || `${field.label} must be a number`
                        : undefined,
                  })}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]?.message}
                />
              )}
            </Box>
          ))}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onFormSubmit)} color="primary">
          Add Widget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetDialog;
