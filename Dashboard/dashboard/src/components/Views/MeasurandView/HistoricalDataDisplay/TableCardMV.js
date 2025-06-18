import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
  alpha,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useThemeContext } from "../../../../context/ThemeContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TableCardMV = ({ table, onDelete, onEdit }) => {
  const { mode } = useThemeContext();
  const navigate = useNavigate();

  const getGradients = () => ({
    primary:
      mode === "light"
        ? "linear-gradient(45deg, #10B981, #34D399)"
        : "linear-gradient(45deg, #166534, #22C55E)",
    hover:
      mode === "light"
        ? "linear-gradient(45deg, #059669, #10B981)"
        : "linear-gradient(45deg, #14532D, #16A34A)",
    paper:
      mode === "light"
        ? "linear-gradient(135deg, #FFFFFF, #F8FAFC)"
        : "linear-gradient(135deg, #1F2937, #111827)",
    container:
      mode === "light"
        ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
        : "linear-gradient(135deg, #022C22 0%, #064E3B 100%)",
  });

  const gradients = getGradients();

  const handleClick = () => {
    navigate(`/views/measurand/historical/${table.id}`);
  };

  return (
    <motion.div>
      <Card
        onClick={handleClick}
        sx={{
          background: gradients.paper,
          border: `1px solid ${gradients.container}`,
          borderRadius: 3,
          boxShadow:
            mode === "light"
              ? "0 8px 24px rgba(30, 64, 175, 0.15)"
              : "0 8px 24px rgba(22, 101, 52, 0.2)",
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          transition: "all 0.3s ease",
          "&:hover": {
            background: gradients.hover,
            boxShadow:
              mode === "light"
                ? "0 12px 32px rgba(30, 64, 175, 0.25)"
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
            background: gradients.primary,
          },
        }}
      >
        <CardContent sx={{ p: 2, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <Tooltip title="Edit Table" arrow placement="top">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(table);
                }}
                sx={{
                  color: gradients.primary,
                  "&:hover": { background: alpha(gradients.primary, 0.1) },
                }}
              >
                <Edit sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Table" arrow placement="top">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(table);
                }}
                sx={{
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
          </Box>
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
            {table.name}
            <Chip
              label={table.profile}
              size="small"
              sx={{
                background: gradients.primary,
                color: "white",
                fontWeight: 500,
              }}
            />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Plant:</strong> {table.plant}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}
          >
            <strong>Terminals:</strong>
            {table.terminals.map((terminal) => (
              <Chip
                key={terminal}
                label={terminal}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: gradients.primary,
                  color: gradients.primary,
                }}
              />
            ))}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1,
              background: gradients.container,
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
    </motion.div>
  );
};

export default TableCardMV;
