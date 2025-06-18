import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";
import AddTableDialog from "./HistoricalDataDisplay/AddTableDialog";
import TableCard from "./HistoricalDataDisplay/TableCard";
import HistoricalDataGrid from "./HistoricalDataDisplay/HistoricalDataGrid";
import DeleteTableConfirmationDialog from "../Helper/DeleteTableConfirmationDialog";
import { Dashboard } from "@mui/icons-material";

const HistoricalDataDisplayTV = () => {
  const { mode } = useThemeContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [tables, setTables] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const { tableId } = useParams();
  const navigate = useNavigate();

  const profiles = ["Profile 1", "Profile 2"];
  const plants = ["Unit 1 Mill Motors"];
  const terminals = ["Mill Motor 1A 680kW"];
  const measurand = [
    "Voltage (V)",
    "Current (A)",
    "Power (kW)",
    "Frequency (Hz)",
    "Voltage2 (V)",
    "Current2 (A)",
    "Power2 (kW)",
    "Frequency2 (Hz)",
  ];

  useEffect(() => {
    const storedTables = localStorage.getItem("historicalTables");
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateTable = (formData) => {
    const newTable = {
      id: uuidv4(),
      profile: formData.profile,
      plant: formData.plant,
      terminal: formData.terminal,
      measurand: formData.measurand,
      name: formData.name, // Include the name from formData
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

    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    localStorage.setItem("historicalTables", JSON.stringify(updatedTables));
    setOpenDialog(false);
  };

  const handleOpenDeleteDialog = (table) => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (tableToDelete) {
      const updatedTables = tables.filter((t) => t.id !== tableToDelete.id);
      setTables(updatedTables);
      localStorage.setItem("historicalTables", JSON.stringify(updatedTables));
      if (tableId === tableToDelete.id) {
        navigate("/views/terminal", { state: { tab: 1 } });
      }
    }
    handleCloseDeleteDialog();
  };

  const handleBackToCards = () => {
    navigate("/views/terminal", { state: { tab: 1 }, replace: true });
  };

  const handleUpdateTable = (updatedTable) => {
    const updatedTables = tables.map((table) =>
      table.id === updatedTable.id ? updatedTable : table
    );
    setTables(updatedTables);
    localStorage.setItem("historicalTables", JSON.stringify(updatedTables));
  };

  const getGradients = () => ({
    paper:
      mode === "light"
        ? "linear-gradient(135deg, #FFFFFF, #F8FAFC)"
        : "linear-gradient(135deg, #1F2937, #111827)",
    primary:
      mode === "light"
        ? "linear-gradient(45deg, #10B981, #34D399)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light"
        ? "linear-gradient(45deg, #059669, #10B981)"
        : "linear-gradient(45deg, #14532D, #16A34A)",
    container:
      mode === "light"
        ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
        : "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
  });

  const gradients = getGradients();

  return (
    <Box sx={{ p: 2, minHeight: "80vh" }}>
      {tableId ? (
        <HistoricalDataGrid
          table={tables.find((t) => t.id === tableId) || null}
          onBack={handleBackToCards}
          onUpdateTable={handleUpdateTable}
        />
      ) : (
        <>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              background: gradients.paper,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
              borderRadius: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                background: gradients.primary,
                "&:hover": { background: gradients.hover },
                borderRadius: 2,
                padding: "8px 16px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add Table
            </Button>
          </Paper>

          {tables.length === 0 ? (
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
                No Table Generated
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", maxWidth: "500px" }}
              >
                To generate a table, click on the{" "}
                <Box
                  component="span"
                  sx={{
                    color: mode === "light" ? "primary.main" : "primary.light",
                    fontWeight: 600,
                  }}
                >
                  Add Table{" "}
                </Box>
                button on the UI. A form will appear where you can select a
                Profile, Plant, Terminal, and Measurands. After making your
                selections, click{" "}
                <Box
                  component="span"
                  sx={{
                    color: mode === "light" ? "primary.main" : "primary.light",
                    fontWeight: 600,
                  }}
                >
                  Create Table{" "}
                </Box>
                to create a custom view based on your inputs.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 2,
                p: 2,
                background: gradients.container,
                borderRadius: 2,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              {tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onDelete={handleOpenDeleteDialog}
                />
              ))}
            </Box>
          )}

          <AddTableDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleCreateTable}
            profiles={profiles}
            plants={plants}
            terminals={terminals}
            measurand={measurand}
          />
          <DeleteTableConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
            table={tableToDelete}
          />
        </>
      )}
    </Box>
  );
};

export default HistoricalDataDisplayTV;
