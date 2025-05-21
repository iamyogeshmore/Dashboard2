import { Button, Tooltip } from "@mui/material";
import { TableChart } from "@mui/icons-material";
import * as XLSX from "xlsx";

const ExportExcelButton = ({
  rows,
  columns,
  table,
  mode,
  gradients,
  stats,
}) => {
  const handleExportExcel = () => {
    // Prepare main table data
    const tableData = [
      columns.map((col) => col.headerName), // Header row
      ...rows.map((row) =>
        columns.map((col) => (row[col.field] ? row[col.field].toString() : ""))
      ),
    ];

    // Prepare Data Analysis data
    const statsData =
      stats && stats.length > 0
        ? [
            [], // Separator row
            ["Data Analysis Summary"],
            ["Measurand", "Min", "Max", "Avg"],
            ...stats.map((stat) => [
              stat.measurand,
              stat.min,
              stat.max,
              stat.avg,
            ]),
          ]
        : [];

    // Combine table and stats data
    const worksheetData = [...tableData, ...statsData];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Style headers for main table
    ws["!cols"] = columns.map((col) => ({ wch: col.headerName.length + 10 }));
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: {
          fgColor: { rgb: mode === "light" ? "E0F2FE" : "1E293B" },
        },
        alignment: { horizontal: "center" },
      };
    }

    // Style Data Analysis headers (if present)
    if (stats && stats.length > 0) {
      const statsHeaderRow = tableData.length + 2; // After separator and title
      for (let col = 0; col < 4; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: statsHeaderRow,
          c: col,
        });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true },
          fill: {
            fgColor: { rgb: mode === "light" ? "E0F2FE" : "1E293B" },
          },
          alignment: { horizontal: "center" },
        };
      }
      // Style Data Analysis title
      const titleCell = XLSX.utils.encode_cell({
        r: tableData.length + 1,
        c: 0,
      });
      if (ws[titleCell]) {
        ws[titleCell].s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "left" },
        };
      }
    }

    // Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historical Data");
    XLSX.writeFile(wb, `${table.terminal}_data.xlsx`);
  };

  return (
    <Tooltip title="Export as Excel">
      <Button
        variant="contained"
        startIcon={<TableChart />}
        onClick={handleExportExcel}
        sx={{
          py: 1.2,
          px: 2.5,
          borderRadius: 2,
          background: gradients.primary,
          "&:hover": {
            background: gradients.hover,
            transform: "translateY(-2px)",
            boxShadow:
              mode === "light"
                ? "0 8px 16px rgba(30, 64, 175, 0.2)"
                : "0 8px 16px rgba(22, 101, 52, 0.25)",
          },
          transition: "all 0.3s ease",
        }}
      >
        Export Excel
      </Button>
    </Tooltip>
  );
};

export default ExportExcelButton;
