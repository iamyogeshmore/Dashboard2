import { useState } from "react";
import { Button, Menu, MenuItem, Tooltip, Box } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { NavButton } from "./Navbar.styles";

const DropdownMenu = ({
  label,
  items,
  isActive,
  icon,
  onClick,
  open,
  onClose,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    if (onClick) {
      onClick(); // Call custom onClick handler
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) {
      onClose(); // Call custom onClose handler
    }
  };

  // Use open prop if provided, otherwise use local anchorEl state
  const isOpen = open !== undefined ? open : Boolean(anchorEl);

  // Check if a menu item is currently active
  const isMenuItemActive = (itemPath) => {
    if (!itemPath) return false;
    return location.pathname === itemPath || location.pathname.startsWith(itemPath);
  };

  return (
    <>
      <Tooltip title={`Open ${label || "Menu"}`}>
        <NavButton
          endIcon={<ArrowDropDown />}
          startIcon={icon}
          onClick={handleOpen}
          className={isActive ? "active" : ""}
        >
          {label}
        </NavButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundImage: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))"
                : "linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(6, 78, 59, 0.95))",
            backdropFilter: "blur(20px)",
            color: (theme) => theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
            border: (theme) => 
              theme.palette.mode === "light" 
                ? "1px solid rgba(0, 0, 0, 0.2)" 
                : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 20px 40px rgba(0, 0, 0, 0.15)"
                : "0 20px 40px rgba(0, 0, 0, 0.3)",
            mt: 1,
            minWidth: 200,
            "& .MuiMenuItem-root": {
              borderRadius: "8px",
              margin: "4px 8px",
              padding: "12px 16px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              color: (theme) => theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
              fontWeight: 500,
              "&:hover": {
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.12)"
                    : "rgba(255, 255, 255, 0.2)",
                color: (theme) => theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                transform: "translateX(8px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "light"
                    ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                    : "0 4px 12px rgba(255, 255, 255, 0.15)",
              },
              "&:first-of-type": {
                marginTop: "8px",
              },
              "&:last-of-type": {
                marginBottom: "8px",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      >
        {items.map((item) => {
          const isActive = isMenuItemActive(item.path);
          return (
            <MenuItem
              key={item.label}
              onClick={() => {
                handleClose();
                if (item.onClick) {
                  item.onClick();
                }
              }}
              component={item.path && !item.onClick ? Link : "div"}
              to={item.path}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                background: (theme) => isActive ? 
                  (theme.palette.mode === "light" 
                    ? "rgba(0, 0, 0, 0.15)" 
                    : "rgba(255, 255, 255, 0.25)") : "transparent",
                border: (theme) => isActive ? 
                  (theme.palette.mode === "light" 
                    ? "2px solid rgba(0, 0, 0, 0.3)" 
                    : "2px solid rgba(255, 255, 255, 0.4)") : "none",
                fontWeight: isActive ? 600 : 500,
                color: (theme) => isActive ? 
                  (theme.palette.mode === "light" ? "#000000" : "#FFFFFF") : 
                  (theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF"),
                "&:hover": {
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.18)"
                      : "rgba(255, 255, 255, 0.25)",
                  color: (theme) => theme.palette.mode === "light" ? "#000000" : "#FFFFFF",
                  transform: "translateX(8px)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "light"
                      ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                      : "0 4px 12px rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {item.label}
                {item.icon}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default DropdownMenu;
