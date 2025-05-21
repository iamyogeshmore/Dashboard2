import { useState, useEffect } from "react";
import { AppBar, Toolbar, Box, Tooltip } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import DropdownMenu from "./DropdownMenu";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import { EnergyLabel, NavButton, TimeDisplay } from "./Navbar.styles";

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
  const [showRouteName, setShowRouteName] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Reset to show route name when route changes
    setShowRouteName(true);
    const interval = setInterval(() => {
      setShowRouteName((prev) => !prev);
    }, 5000); // Toggle every 5 seconds
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Map routes to display names
  const getRouteName = (path) => {
    // Direct matches
    const directRoutes = {
      "/": "Dashboard",
      "/views/terminal": "Terminal View",
      "/views/measurand": "Measurand View",
      "/views/script": "Script View",
      "/views/log": "Log View",
      "/screens/injection-schedule": "Injection Schedule",
      "/screens/schedule-entry": "Schedule Entry",
      "/screens/real-time-power-balance": "Real-Time Power Balance",
      "/reports/view": "View Reports",
      "/reports/generate": "Generate Reports",
      "/about": "About",
      "/contact": "Contact",
    };

    // Check for direct match first
    if (directRoutes[path]) {
      return directRoutes[path];
    }

    // Check for dynamic routes with pattern matching
    if (path.match(/^\/views\/terminal\/historical\/[a-zA-Z0-9-]+$/)) {
      return "Terminal historical View";
    }
    if (path.match(/^\/views\/measurand\/historical\/[a-zA-Z0-9-]+$/)) {
      return "Measurand historical View";
    }

    return "Unknown";
  };

  const currentRouteName = getRouteName(location.pathname);

  // Animation variants
  const textVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          sx={{
            width: "400px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={textVariants}
            key={showRouteName ? "route" : "estheorm"}
          >
            <EnergyLabel component={Link} to="/" className="energy-label">
              {showRouteName ? currentRouteName : "ESTHEORM"}
            </EnergyLabel>
          </motion.div>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Tooltip title="Main Dashboard">
            <NavButton
              component={Link}
              to="/"
              startIcon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              }
              className={location.pathname === "/" ? "active" : ""}
            >
              Dashboard
            </NavButton>
          </Tooltip>
          <DropdownMenu
            label="Views"
            items={[
              { label: "Terminal View", path: "/views/terminal" },
              { label: "Measurand View", path: "/views/measurand" },
              { label: "Script View", path: "/views/script" },
              { label: "Log View", path: "/views/log" },
            ]}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            }
            isActive={location.pathname.startsWith("/views")}
          />
          <DropdownMenu
            label="Screens"
            items={[
              {
                label: "Injection-schedule",
                path: "/screens/injection-schedule",
              },
              { label: "Schedule-entry", path: "/screens/schedule-entry" },
              {
                label: "Real-time-power-balance",
                path: "/screens/real-time-power-balance",
              },
            ]}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-venir1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" />
              </svg>
            }
            isActive={location.pathname.startsWith("/screens")}
          />
          <DropdownMenu
            label="Reports"
            items={[
              { label: "View Reports", path: "/reports/view" },
              { label: "Generate Reports", path: "/reports/generate" },
            ]}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            }
            isActive={location.pathname.startsWith("/reports")}
          />
          <Tooltip title="Toggle Light/Dark Mode">
            <ThemeToggle />
          </Tooltip>
          <TimeDisplay>{currentTime}</TimeDisplay>
        </Box>
        <EnergyLabel component={Link} to="/" className="energy-label">
          EnergiSpeak
        </EnergyLabel>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
