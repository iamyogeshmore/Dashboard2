import { Button, Tooltip } from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";

// Apply the autoTable plugin to jsPDF
applyPlugin(jsPDF);

const ExportPDFButton = ({
  rows,
  columns,
  table,
  startDate,
  endDate,
  mode,
  gradients,
  stats,
}) => {
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Set fonts and colors based on theme
    const textColor = mode === "light" ? "#000000" : "#FFFFFF";
    doc.setFont("Helvetica");

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(textColor);
    doc.text(`${table.terminal} - Historical Data`, 14, 20);

    // Add date range if applied
    let startY = 30;
    if (startDate && endDate) {
      doc.setFontSize(12);
      doc.text(
        `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        14,
        30
      );
      startY = 40;
    }

    // Prepare main table data
    const tableData = rows.map((row) =>
      columns.map((col) => (row[col.field] ? row[col.field].toString() : ""))
    );

    // Add main table to PDF
    doc.autoTable({
      head: [columns.map((col) => col.headerName)],
      body: tableData,
      startY,
      styles: {
        font: "Helvetica",
        textColor: textColor,
        fillColor: mode === "light" ? [255, 255, 255] : [31, 41, 55],
        lineColor: mode === "light" ? [200, 200, 200] : [100, 100, 100],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: mode === "light" ? [224, 242, 254] : [30, 41, 59],
        textColor: mode === "light" ? [30, 64, 175] : [34, 197, 94],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: mode === "light" ? [248, 250, 252] : [17, 24, 39],
      },
      margin: { top: 40 },
    });

    // Add Data Analysis section
    if (stats && stats.length > 0) {
      // Add section title
      const lastTableY = doc.lastAutoTable.finalY || startY;
      doc.setFontSize(14);
      doc.text("Data Analysis Summary", 14, lastTableY + 10);

      // Prepare stats table data
      const statsData = stats.map((stat) => [
        stat.measurand,
        stat.min,
        stat.max,
        stat.avg,
      ]);

      // Add stats table
      doc.autoTable({
        head: [["Measurand", "Min", "Max", "Avg"]],
        body: statsData,
        startY: lastTableY + 20,
        styles: {
          font: "Helvetica",
          textColor: textColor,
          fillColor: mode === "light" ? [255, 255, 255] : [31, 41, 55],
          lineColor: mode === "light" ? [200, 200, 200] : [100, 100, 100],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: mode === "light" ? [224, 242, 254] : [30, 41, 59],
          textColor: mode === "light" ? [30, 64, 175] : [34, 197, 94],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: mode === "light" ? [248, 250, 252] : [17, 24, 39],
        },
      });
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(textColor);
      doc.text(
        `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(`${table.terminal}_data.pdf`);
  };

  return (
    <Tooltip title="Export as PDF">
      <Button
        variant="contained"
        startIcon={<PictureAsPdf />}
        onClick={handleExportPDF}
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
        Export PDF
      </Button>
    </Tooltip>
  );
};

export default ExportPDFButton;
