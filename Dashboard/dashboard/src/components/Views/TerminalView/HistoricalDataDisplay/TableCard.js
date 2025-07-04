import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useThemeContext } from "../../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const TableCard = ({ table, onDelete }) => {
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  const getGradients = () => ({
    card:
      mode === "light"
        ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(220,252,231,0.9))"
        : "linear-gradient(135deg, rgba(31,41,55,0.95), rgba(6,78,59,0.9))",
    accent:
      mode === "light"
        ? "linear-gradient(45deg, #10B981, #34D399)"
        : "linear-gradient(45deg, #22C55E, #34D399)",
    hover:
      mode === "light"
        ? "linear-gradient(135deg, rgba(220,252,231,0.95), rgba(187,247,208,0.9))"
        : "linear-gradient(135deg, rgba(6,78,59,0.95), rgba(16,185,129,0.9))",
  });

  const gradients = getGradients();

  const handleClick = () => {
    navigate(`/views/terminal/historical/${table._id || table.id}`);
  };

  return (
    <div>
      <Card
        onClick={handleClick}
        sx={{
          background: gradients.card,
          border: `1px solid ${
            mode === "light"
              ? "rgba(16, 185, 129, 0.3)"
              : "rgba(34, 197, 94, 0.3)"
          }`,
          borderRadius: 3,
          boxShadow:
            mode === "light"
              ? "0 8px 24px rgba(16, 185, 129, 0.15)"
              : "0 8px 24px rgba(22, 101, 52, 0.2)",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          transition: "all 0.3s ease",
          "&:hover": {
            background: gradients.hover,
            boxShadow:
              mode === "light"
                ? "0 12px 32px rgba(16, 185, 129, 0.25)"
                : "0 12px 32px rgba(22, 101, 52, 0.3)",
            transform: "translateY(-4px)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            background: gradients.accent,
          },
        }}
      >
        <CardContent sx={{ p: 2, position: "relative" }}>
          <Tooltip title="Delete Table" arrow placement="top">
            <IconButton
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking delete
                onDelete(table);
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: mode === "light" ? "#d32f2f" : "#ef5350",
                background:
                  mode === "light"
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(31,41,55,0.8)",
                "&:hover": {
                  background:
                    mode === "light"
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(31,41,55,0.9)",
                  color: mode === "light" ? "#b71c1c" : "#d32f2f",
                },
                width: 32,
                height: 32,
              }}
            >
              <Delete sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              fontWeight: 600,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={handleClick}
          >
            {table.name || table.terminalDisplayName || table.terminal} {/* Display table name or terminal display name */}
            <Chip
              label={table.profile}
              size="small"
              sx={{
                background: gradients.accent,
                color: "white",
                fontWeight: 500,
              }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Plant:</strong> {table.plantDisplayName || table.plant}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}
          >
            <strong>Measurand:</strong>
            {Array.isArray(table.measurandDisplayNames)
              ? table.measurandDisplayNames.map((measurand) => (
                  <Chip
                    key={measurand}
                    label={measurand}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: mode === "light" ? "#10B981" : "#22C55E",
                      color: mode === "light" ? "#10B981" : "#22C55E",
                    }}
                  />
                ))
              : Array.isArray(table.measurand)
              ? table.measurand.map((measurand) => (
                  <Chip
                    key={measurand}
                    label={measurand}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: mode === "light" ? "#10B981" : "#22C55E",
                      color: mode === "light" ? "#10B981" : "#22C55E",
                    }}
                  />
                ))
              : Array.isArray(table.measurandIds)
              ? table.measurandIds.map((id) => (
                  <Chip
                    key={id}
                    label={id}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: mode === "light" ? "#10B981" : "#22C55E",
                      color: mode === "light" ? "#10B981" : "#22C55E",
                    }}
                  />
                ))
              : null}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1,
              background:
                mode === "light"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(34, 197, 94, 0.1)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            Created: {table.createdTime}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableCard;
