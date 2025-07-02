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
import { getPlants, getTerminals, getMeasurands, createHistoricalTable, getHistoricalTables, deleteHistoricalTable, getHistoricalTableById } from "../../../services/apiService";

const HistoricalDataDisplayTV = () => {
  const { mode } = useThemeContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [tables, setTables] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const { tableId } = useParams();
  const navigate = useNavigate();

  const profiles = ["Block", "Trend"];
  const [plants, setPlants] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [measurandOptions, setMeasurandOptions] = useState([]);
  const [loading, setLoading] = useState({ plants: false, terminals: false, measurands: false });
  const [error, setError] = useState({ plants: null, terminals: null, measurands: null });
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);

  const fetchTables = async () => {
    try {
      const response = await getHistoricalTables();
      if (response.status === "success" && Array.isArray(response.data)) {
        setTables(response.data);
      } else {
        setTables([]);
      }
    } catch (err) {
      setTables([]);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Fetch plants on mount
  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    if (tableId) {
      setLoadingTable(true);
      setTableError(null);
      getHistoricalTableById(tableId)
        .then((res) => {
          if (res.status === 'success' && res.data) {
            setSelectedTable(res.data);
          } else {
            setSelectedTable(null);
            setTableError('Table Not Found');
          }
        })
        .catch(() => {
          setSelectedTable(null);
          setTableError('Table Not Found');
        })
        .finally(() => setLoadingTable(false));
    } else {
      setSelectedTable(null);
      setLoadingTable(false);
      setTableError(null);
    }
  }, [tableId]);

  const fetchPlants = async () => {
    setLoading((prev) => ({ ...prev, plants: true }));
    setError((prev) => ({ ...prev, plants: null }));
    try {
      const response = await getPlants("Terminal");
      if (response.status === "success" && Array.isArray(response.data)) {
        setPlants(response.data.map((plant) => plant.name));
      } else {
        setPlants([]);
        setError((prev) => ({ ...prev, plants: response.message || "No plants found" }));
      }
    } catch (err) {
      setPlants([]);
      setError((prev) => ({ ...prev, plants: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, plants: false }));
    }
  };

  const fetchTerminals = async (plantName) => {
    setLoading((prev) => ({ ...prev, terminals: true }));
    setError((prev) => ({ ...prev, terminals: null }));
    try {
      const plantObj = (await getPlants("Terminal")).data.find((p) => p.name === plantName);
      if (!plantObj) return setTerminals([]);
      const response = await getTerminals(plantObj.id, "Terminal");
      if (response.status === "success" && Array.isArray(response.data)) {
        setTerminals(response.data.map((t) => ({ id: t.TerminalId, name: t.TerminalName })));
      } else {
        setTerminals([]);
        setError((prev) => ({ ...prev, terminals: response.message || "No terminals found" }));
      }
    } catch (err) {
      setTerminals([]);
      setError((prev) => ({ ...prev, terminals: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, terminals: false }));
    }
  };

  const fetchMeasurands = async (plantName, terminalId) => {
    setLoading((prev) => ({ ...prev, measurands: true }));
    setError((prev) => ({ ...prev, measurands: null }));
    try {
      const plantObj = (await getPlants("Terminal")).data.find((p) => p.name === plantName);
      if (!plantObj) return setMeasurandOptions([]);
      const response = await getMeasurands(plantObj.id, terminalId, "Terminal");
      if (response.status === "success" && Array.isArray(response.data)) {
        setMeasurandOptions(response.data.map((m) => ({ id: m.MeasurandId, name: m.MeasurandName })));
      } else {
        setMeasurandOptions([]);
        setError((prev) => ({ ...prev, measurands: response.message || "No measurands found" }));
      }
    } catch (err) {
      setMeasurandOptions([]);
      setError((prev) => ({ ...prev, measurands: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, measurands: false }));
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateTable = async (formData) => {
    // formData: { profile, plant, terminal, measurand, name }
    // Find plantId and terminalId from names
    const plantObj = (await getPlants("Terminal")).data.find((p) => p.name === formData.plant);
    const terminalObj = terminals.find((t) => t.id === formData.terminal);
    if (!plantObj || !terminalObj) return;
    const measurandIds = formData.measurand;
    const payload = {
      name: formData.name,
      profile: formData.profile,
      plantId: plantObj.id,
      terminalId: terminalObj.id,
      measurandIds,
    };
    await createHistoricalTable(payload);
    fetchTables();
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

  const handleConfirmDelete = async () => {
    if (tableToDelete) {
      try {
        await deleteHistoricalTable(tableToDelete._id || tableToDelete.id);
        fetchTables();
        if (tableId === (tableToDelete._id || tableToDelete.id)) {
          navigate("/views/terminal", { state: { tab: 1 } });
        }
      } catch (err) {
        // Optionally show error
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
        loadingTable ? (
          <Paper sx={{ p: 4, minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="h6">Loading table...</Typography></Paper>
        ) : tableError ? (
          <Paper sx={{ p: 4, minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="h6" color="error">{tableError}</Typography></Paper>
        ) : (
          <HistoricalDataGrid
            table={selectedTable}
            onBack={handleBackToCards}
            onUpdateTable={handleUpdateTable}
          />
        )
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
                  key={table._id || table.id}
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
            measurand={measurandOptions}
            loading={loading}
            error={error}
            fetchTerminals={fetchTerminals}
            fetchMeasurands={fetchMeasurands}
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
