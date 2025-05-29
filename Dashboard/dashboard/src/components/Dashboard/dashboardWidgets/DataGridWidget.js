import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { CardTitle } from "../Dashboard.styles";
import { useTheme } from "@mui/material/styles";

const mockData = {
  plants: ["Plant A", "Plant B", "Plant C"],
  terminals: {
    "Plant A": ["Terminal A1", "Terminal A2"],
    "Plant B": ["Terminal B1", "Terminal B2"],
    "Plant C": ["Terminal C1", "Terminal C2"],
  },
  measurands: {
    "Terminal A1": ["Temperature", "Pressure"],
    "Terminal A2": ["Flow Rate", "Voltage"],
    "Terminal B1": ["Current", "Power"],
    "Terminal B2": ["Energy", "Frequency"],
    "Terminal C1": ["Humidity", "Level"],
    "Terminal C2": ["Speed", "Torque"],
  },
};

const DataGridWidget = ({ data, editMode, onUpdate }) => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());
  const [selectedPlant, setSelectedPlant] = useState(
    data.plant || mockData.plants[0]
  );
  const [columnSelections, setColumnSelections] = useState(
    data.columnSelections ||
      Array(Number(data.columns || 1)).fill({
        type: data.dataGridType === "terminal" ? "measurand" : "terminal",
        value: "",
      })
  );
  const [rowSelections, setRowSelections] = useState(
    data.rowSelections ||
      Array(Number(data.rows || 1)).fill({
        type: data.dataGridType === "terminal" ? "terminal" : "measurand",
        value: "",
      })
  );

  const getAvailableItems = (type, plant) => {
    if (type === "terminal") {
      return mockData.terminals[plant] || [];
    }
    if (type === "measurand") {
      const plantTerminals = mockData.terminals[plant] || [];
      const allMeasurands = new Set();
      plantTerminals.forEach((terminal) => {
        const terminalMeasurands = mockData.measurands[terminal] || [];
        terminalMeasurands.forEach((measurand) => allMeasurands.add(measurand));
      });
      return Array.from(allMeasurands);
    }
    return [];
  };

  const generateRandomData = () => {
    const newRows = [];
    const numRows = Number(data.rows) || 1;
    const numColumns = Number(data.columns) || 1;

    for (let i = 0; i < numRows; i++) {
      const row = { id: i };
      if (data.showTimestamp) {
        row.timestamp = new Date().toLocaleString();
      }
      row.label = rowSelections[i]?.value || `Row ${i + 1}`;
      for (let j = 0; j < numColumns; j++) {
        row[`col${j}`] = (Math.random() * 100).toFixed(
          Number(data.decimalPlaces) || 2
        );
      }
      newRows.push(row);
    }
    return newRows;
  };

  const handlePlantChange = (event) => {
    const newPlant = event.target.value;
    setSelectedPlant(newPlant);
    const newColumnSelections = columnSelections.map((col) => ({
      ...col,
      value: "",
    }));
    const newRowSelections = rowSelections.map((row) => ({
      ...row,
      value: "",
    }));
    setColumnSelections(newColumnSelections);
    setRowSelections(newRowSelections);
    if (onUpdate) {
      onUpdate({
        ...data,
        plant: newPlant,
        columnSelections: newColumnSelections,
        rowSelections: newRowSelections,
      });
    }
  };

  const handleColumnSelectionChange = (index, type, value) => {
    const newColumnSelections = [...columnSelections];
    newColumnSelections[index] = { type, value };
    setColumnSelections(newColumnSelections);
    if (onUpdate) {
      onUpdate({
        ...data,
        columnSelections: newColumnSelections,
      });
    }
  };

  const handleRowSelectionChange = (index, value) => {
    const newRowSelections = [...rowSelections];
    newRowSelections[index] = {
      type: data.dataGridType === "terminal" ? "terminal" : "measurand",
      value,
    };
    setRowSelections(newRowSelections);
    if (onUpdate) {
      onUpdate({
        ...data,
        rowSelections: newRowSelections,
      });
    }
  };

  useEffect(() => {
    if (!data.columnSelections || !data.rowSelections) {
      const newColumnSelections = Array(Number(data.columns || 1)).fill({
        type: data.dataGridType === "terminal" ? "measurand" : "terminal",
        value: "",
      });
      const newRowSelections = Array(Number(data.rows || 1)).fill({
        type: data.dataGridType === "terminal" ? "terminal" : "measurand",
        value: "",
      });
      setColumnSelections(newColumnSelections);
      setRowSelections(newRowSelections);
      if (onUpdate) {
        onUpdate({
          ...data,
          plant: selectedPlant,
          columnSelections: newColumnSelections,
          rowSelections: newRowSelections,
        });
      }
    }
  }, [data, selectedPlant, onUpdate]);

  useEffect(() => {
    setRows(generateRandomData());
    setTimestamp(new Date().toLocaleString());

    const interval = setInterval(() => {
      setRows(generateRandomData());
      setTimestamp(new Date().toLocaleString());
    }, 5000);

    return () => clearInterval(interval);
  }, [data, selectedPlant, columnSelections, rowSelections]);

  return (
    <Card
      sx={{
        height: "100%",
        width: "100%",
        background: data.backgroundColor || "#ffffff",

        border: `${data.borderWidth || 1}px solid ${
          data.borderColor || theme.palette.divider
        }`,
        borderRadius: `${data.borderRadius || 8}px`,
        boxShadow:
          theme.palette.mode === "light"
            ? "0 4px 16px rgba(0,0,0,0.1)"
            : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow:
            theme.palette.mode === "light"
              ? "0 6px 20px rgba(0,0,0,0.15)"
              : "0 6px 20px rgba(0,0,0,0.4)",
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <CardTitle
            sx={{
              fontFamily: data.titleFontFamily || "Roboto",
              fontSize: `${data.titleFontSize || 18}px`,
              color: data.titleColor || theme.palette.primary.main,
              fontWeight: data.titleBold ? "bold" : "normal",
              fontStyle: data.titleItalic ? "italic" : "normal",
              textDecoration: data.titleUnderline ? "underline" : "none",
              textShadow: `0 0 4px ${theme.palette.primary.light}40`,
              minWidth: "150px",
            }}
          >
            {data.widgetName || "Data Grid Widget"}
          </CardTitle>
          <FormControl
            sx={{
              width: "150px",
              minWidth: "120px",
            }}
          >
            <InputLabel
              sx={{
                color: data.titleColor || theme.palette.text.secondary,
                "&.Mui-focused": {
                  color: data.titleColor || theme.palette.primary.main,
                },
                fontSize: "0.9rem",
              }}
            >
              Plant
            </InputLabel>
            <Select
              value={selectedPlant}
              onChange={handlePlantChange}
              label="Plant"
              size="small"
              disabled={!editMode}
              sx={{
                borderRadius: "6px",
                background: data.backgroundColor || "#ffffff",

                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: data.borderColor || theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: data.borderColor || theme.palette.primary.main,
                  boxShadow: `0 0 8px ${
                    data.borderColor || theme.palette.primary.light
                  }80`,
                },
                "& .MuiSelect-select": {
                  py: 0.75,
                  fontSize: "0.9rem",
                },
              }}
            >
              {mockData.plants.map((plant) => (
                <MenuItem key={plant} value={plant} sx={{ fontSize: "0.9rem" }}>
                  {plant}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            flexGrow: 1,
            borderRadius: "8px",
            background: data.backgroundColor || "#ffffff",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 2px 8px rgba(0,0,0,0.05)"
                : "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: data.backgroundColor || "#ffffff",
                }}
              >
                {data.showTimestamp && (
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: data.titleColor || theme.palette.text.primary,
                      borderBottom: `1px solid ${
                        data.borderColor || theme.palette.divider
                      }`,
                      fontFamily: data.titleFontFamily || "Roboto",
                      fontSize: `${data.titleFontSize || 18}px`,
                      fontWeight: data.titleBold ? "bold" : "normal",
                      fontStyle: data.titleItalic ? "italic" : "normal",
                      textDecoration: data.titleUnderline
                        ? "underline"
                        : "none",
                    }}
                  >
                    Timestamp
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: data.titleColor || theme.palette.text.primary,
                    borderBottom: `1px solid ${
                      data.borderColor || theme.palette.divider
                    }`,
                    fontFamily: data.titleFontFamily || "Roboto",
                    fontSize: `${data.titleFontSize || 18}px`,
                    fontWeight: data.titleBold ? "bold" : "normal",
                    fontStyle: data.titleItalic ? "italic" : "normal",
                    textDecoration: data.titleUnderline ? "underline" : "none",
                  }}
                >
                  {data.dataGridType === "terminal"
                    ? "Terminals"
                    : "Measurands"}
                </TableCell>
                {columnSelections.map((col, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      fontWeight: 600,
                      color: data.titleColor || theme.palette.text.primary,
                      borderBottom: `1px solid ${
                        data.borderColor || theme.palette.divider
                      }`,
                      fontFamily: data.titleFontFamily || "Roboto",
                      fontSize: `${data.titleFontSize || 18}px`,
                      fontWeight: data.titleBold ? "bold" : "normal",
                      fontStyle: data.titleItalic ? "italic" : "normal",
                      textDecoration: data.titleUnderline
                        ? "underline"
                        : "none",
                    }}
                  >
                    {editMode ? (
                      <FormControl>
                        <Select
                          value={col.value || ""}
                          onChange={(e) =>
                            handleColumnSelectionChange(
                              index,
                              col.type,
                              e.target.value
                            )
                          }
                          displayEmpty
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor:
                                data.borderColor || theme.palette.divider,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor:
                                data.borderColor || theme.palette.primary.main,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor:
                                data.borderColor || theme.palette.primary.main,
                              boxShadow: `0 0 6px ${
                                data.borderColor || theme.palette.primary.light
                              }80`,
                            },
                            "& .MuiSelect-select": {
                              py: 0.75,
                              fontSize: "0.9rem",
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                            <em>
                              Select{" "}
                              {col.type === "terminal"
                                ? "Terminal"
                                : "Measurand"}
                            </em>
                          </MenuItem>
                          {getAvailableItems(col.type, selectedPlant).map(
                            (item) => (
                              <MenuItem
                                key={item}
                                value={item}
                                sx={{ fontSize: "0.9rem" }}
                              >
                                {item}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    ) : (
                      col.value || `Column ${index + 1}`
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    background: data.backgroundColor || "#ffffff",

                    "&:hover": {
                      backgroundColor: `${
                        data.backgroundColor || theme.palette.primary.light
                      }20`,
                      transition: "background-color 0.2s ease",
                    },
                  }}
                >
                  {data.showTimestamp && (
                    <TableCell
                      sx={{
                        color: data.valueColor || theme.palette.text.secondary,
                        borderBottom: `1px solid ${
                          data.borderColor || theme.palette.divider
                        }`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: data.valueFontFamily || "Roboto",
                          fontSize: `${data.valueFontSize || 16}px`,
                          color:
                            data.valueColor || theme.palette.text.secondary,
                          fontWeight: data.valueBold ? "bold" : "normal",
                          fontStyle: data.valueItalic ? "italic" : "normal",
                          textDecoration: data.valueUnderline
                            ? "underline"
                            : "none",
                        }}
                      >
                        {row.timestamp}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: data.valueColor || theme.palette.text.secondary,
                      borderBottom: `1px solid ${
                        data.borderColor || theme.palette.divider
                      }`,
                    }}
                  >
                    {editMode ? (
                      <FormControl>
                        <Select
                          value={rowSelections[row.id]?.value || ""}
                          onChange={(e) =>
                            handleRowSelectionChange(row.id, e.target.value)
                          }
                          displayEmpty
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor:
                                data.borderColor || theme.palette.divider,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor:
                                data.borderColor || theme.palette.primary.main,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor:
                                data.borderColor || theme.palette.primary.main,
                              boxShadow: `0 0 6px ${
                                data.borderColor || theme.palette.primary.light
                              }80`,
                            },
                            "& .MuiSelect-select": {
                              py: 0.75,
                              fontSize: "0.9rem",
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                            <em>
                              Select{" "}
                              {data.dataGridType === "terminal"
                                ? "Terminal"
                                : "Measurand"}
                            </em>
                          </MenuItem>
                          {getAvailableItems(
                            data.dataGridType === "terminal"
                              ? "terminal"
                              : "measurand",
                            selectedPlant
                          ).map((item) => (
                            <MenuItem
                              key={item}
                              value={item}
                              sx={{ fontSize: "0.9rem" }}
                            >
                              {item}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: data.valueFontFamily || "Roboto",
                          fontSize: `${data.valueFontSize || 16}px`,
                          color:
                            data.valueColor || theme.palette.text.secondary,
                          fontWeight: data.valueBold ? "bold" : "normal",
                          fontStyle: data.valueItalic ? "italic" : "normal",
                          textDecoration: data.valueUnderline
                            ? "underline"
                            : "none",
                        }}
                      >
                        {row.label}
                      </Typography>
                    )}
                  </TableCell>
                  {columnSelections.map((_, index) => (
                    <TableCell
                      key={index}
                      sx={{
                        color: data.valueColor || theme.palette.text.secondary,
                        borderBottom: `1px solid ${
                          data.borderColor || theme.palette.divider
                        }`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: data.valueFontFamily || "Roboto",
                          fontSize: `${data.valueFontSize || 16}px`,
                          color:
                            data.valueColor || theme.palette.text.secondary,
                          fontWeight: data.valueBold ? "bold" : "normal",
                          fontStyle: data.valueItalic ? "italic" : "normal",
                          textDecoration: data.valueUnderline
                            ? "underline"
                            : "none",
                        }}
                      >
                        {row[`col${index}`]}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default DataGridWidget;
