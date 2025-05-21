import { useState } from "react";
import { Button, Menu, MenuItem, Tooltip, Box } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { NavButton } from "./Navbar.styles";

const DropdownMenu = ({ label, items, isActive, icon }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundImage: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, #FFFFFF, #DBEAFE)"
                : "linear-gradient(135deg, #1F2937, #064E3B)",
            color: (theme) =>
              theme.palette.mode === "light" ? "#1E293B" : "#F3F4F6",
            border: (theme) => `1px solid ${theme.palette.primary.light}`,
            borderRadius: "8px",
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0 4px 16px rgba(30, 64, 175, 0.15)"
                : "0 4px 16px rgba(22, 101, 52, 0.2)",
          },
        }}
      >
        {items.map((item) => (
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
              "&:hover": {
                background: (theme) => theme.palette.primary.light,
                color: "#1E293B",
                transform: "scale(1.02)",
                transition: "all 0.2s ease",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {item.icon}
              {item.label}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DropdownMenu;
