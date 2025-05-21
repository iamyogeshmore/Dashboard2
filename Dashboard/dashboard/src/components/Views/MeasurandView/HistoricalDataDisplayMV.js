import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { Add, Dashboard } from "@mui/icons-material";
import { useThemeContext } from "../../../context/ThemeContext";
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";
import AddTableDialogMV from "./HistoricalDataDisplay/AddTableDialogMV";
import TableCardMV from "./HistoricalDataDisplay/TableCardMV";
import HistoricalDataGridMV from "./HistoricalDataDisplay/HistoricalDataGridMV";
import DeleteTableConfirmationDialog from "../Helper/DeleteTableConfirmationDialog";

const HistoricalDataDisplayMV = () => {
  const { mode } = useThemeContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [tables, setTables] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [editTable, setEditTable] = useState(null);
  const { tableId } = useParams();
  const navigate = useNavigate();

  const profiles = ["Profile 1", "Profile 2"];
  const plants = ["Unit 1 Mill Motors"];
  const terminals = ["Mill Motor 1A 680kW", "Mill Motor 1B 680kW"];
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
    const storedTables = localStorage.getItem("measurandHistoricalTables");
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
  }, []);

  const handleOpenDialog = () => {
    setEditTable(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditTable(null);
  };

  const handleCreateTable = (formData) => {
    const newTable = {
      id: editTable ? editTable.id : uuidv4(),
      profile: formData.profile,
      plant: formData.plant,
      measurand: formData.measurand,
      terminals: formData.terminals,
      name: formData.name, // Use the provided table name
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

    let updatedTables;
    if (editTable) {
      updatedTables = tables.map((t) => (t.id === editTable.id ? newTable : t));
    } else {
      updatedTables = [...tables, newTable];
    }

    setTables(updatedTables);
    localStorage.setItem(
      "measurandHistoricalTables",
      JSON.stringify(updatedTables)
    );
    setOpenDialog(false);
    setEditTable(null);
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
      localStorage.setItem(
        "measurandHistoricalTables",
        JSON.stringify(updatedTables)
      );
      if (tableId === tableToDelete.id) {
        navigate("/views/measurand", { state: { tab: 1 } });
      }
    }
    handleCloseDeleteDialog();
  };

  const handleEditTable = (table) => {
    setEditTable(table);
    setOpenDialog(true);
  };

  const handleBackToCards = () => {
    navigate("/views/measurand", { state: { tab: 1 }, replace: true });
  };

  const handleUpdateTable = (updatedTable) => {
    const updatedTables = tables.map((table) =>
      table.id === updatedTable.id ? updatedTable : table
    );
    setTables(updatedTables);
    localStorage.setItem(
      "measurandHistoricalTables",
      JSON.stringify(updatedTables)
    );
  };

  const getGradients = () => ({
    paper:
      mode === "light"
        ? "linear-gradient(135deg, #FFFFFF, #F8FAFC)"
        : "linear-gradient(135deg, #1F2937, #111827)",
    primary:
      mode === "light"
        ? "linear-gradient(45deg, #1E40AF, #3B82F6)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light"
        ? "linear-gradient(45deg, #1E3A8A, #2563EB)"
        : "linear-gradient(45deg, #14532D, #16A34A)",
    container:
      mode === "light"
        ? "linear-gradient(135deg, #EFF6FF, #DBEAFE)"
        : "linear-gradient(135deg, #022C22, #064E3B)",
  });

  const gradients = getGradients();

  return (
    <Box sx={{ p: 2, minHeight: "80vh" }}>
      {tableId ? (
        <HistoricalDataGridMV
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
                Profile, Plant, Measurand, and Terminals. After making your
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
                <TableCardMV
                  key={table.id}
                  table={table}
                  onDelete={handleOpenDeleteDialog}
                  onEdit={handleEditTable}
                />
              ))}
            </Box>
          )}

          <AddTableDialogMV
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleCreateTable}
            profiles={profiles}
            plants={plants}
            measurand={measurand}
            terminals={terminals}
            initialData={editTable}
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

export default HistoricalDataDisplayMV;
