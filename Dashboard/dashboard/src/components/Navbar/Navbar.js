// Navbar.js
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Tooltip,
  Chip,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Person,
  AccountCircle,
  Settings,
  ExitToApp,
  Notifications,
  Help,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import DropdownMenu from "./DropdownMenu";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import {
  EnergyLabel,
  TimeDisplay,
  UserIconButton,
  AnimatedEnergiSpeak,
} from "./Navbar.styles";

// Animated EnergiSpeak Component
const EnergispeakAnimated = () => {
  return (
    <AnimatedEnergiSpeak component={Link} to="/">
      <Box>
        {/* Main text with gradient */}
        <Box component="span">
          Energi
          <Box
            component="span"
            sx={{
              color: "#FFFFFF",
            }}
          >
            Speak
          </Box>
        </Box>

      

        {/* Floating energy particles (static) */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "4px",
            height: "4px",
            background: "#10B981",
            borderRadius: "50%",
            opacity: 0.6,
            boxShadow: "0 0 6px #10B981",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              opacity: 1,
              transform: "scale(1.5)",
              boxShadow: "0 0 10px #10B981",
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "60%",
            left: "15%",
            width: "3px",
            height: "3px",
            background: "#34D399",
            borderRadius: "50%",
            opacity: 0.5,
            boxShadow: "0 0 5px #34D399",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              opacity: 1,
              transform: "scale(1.3)",
              boxShadow: "0 0 8px #34D399",
            },
          }}
        />
      </Box>
    </AnimatedEnergiSpeak>
  );
};

const Navbar = ({
  onLoadDashboard,
  onCreateNewDashboard,
  currentDashboardId,
  isFullScreen,
  toggleFullScreen,
}) => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  );
  const [showRouteName, setShowRouteName] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [openDashboardDropdown, setOpenDashboardDropdown] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toggle route name display
  useEffect(() => {
    setShowRouteName(true);
    const interval = setInterval(() => {
      setShowRouteName((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Load saved dashboards from localStorage
  useEffect(() => {
    const dashboards = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("dashboard_")) {
        const dashboardData = JSON.parse(localStorage.getItem(key));
        dashboards.push({
          id: key,
          name: dashboardData.name,
          isPublished: dashboardData.isPublished || false,
        });
      }
    }
    setSavedDashboards(dashboards);
  }, [currentDashboardId]);

  // Map routes to display names
  const getRouteName = (path) => {
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

    if (directRoutes[path]) {
      return directRoutes[path];
    }

    if (path.match(/^\/views\/terminal\/historical\/[a-zA-Z0-9-]+$/)) {
      return "Terminal historical View";
    }
    if (path.match(/^\/views\/measurand\/historical\/[a-zA-Z0-9-]+$/)) {
      return "Measurand historical View";
    }

    return "Unknown";
  };

  const currentRouteName = getRouteName(location.pathname);

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

  // Handle Dashboard tab click
  const handleDashboardClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      setOpenDashboardDropdown(true);
    }
  };

  // Handle User menu
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleUserAction = (action) => {
    handleUserMenuClose();
    switch (action) {
      case "profile":
        console.log("Navigate to profile");
        // navigate('/profile');
        break;
      case "settings":
        console.log("Navigate to settings");
        // navigate('/settings');
        break;
      case "notifications":
        console.log("Navigate to notifications");
        // navigate('/notifications');
        break;
      case "help":
        console.log("Navigate to help");
        // navigate('/help');
        break;
      case "logout":
        console.log("Logout user");
        // Add logout logic here
        break;
      default:
        break;
    }
  };

  // Dashboard dropdown items
  const dashboardItems = [
    {
      label: "Create New Dashboard",
      onClick: () => onCreateNewDashboard.current(),
    },
    ...savedDashboards.map((dashboard) => ({
      label: dashboard.name,
      onClick: () => onLoadDashboard.current(dashboard.id),
      icon: (
        <Chip
          label={
            dashboard.isPublished
              ? "Published"
              : dashboard.id === currentDashboardId
              ? "Active"
              : ""
          }
          color={
            dashboard.isPublished
              ? "success"
              : dashboard.id === currentDashboardId
              ? "primary"
              : "default"
          }
          size="small"
          sx={{ ml: 1, height: 20 }}
        />
      ),
    })),
  ];

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
          <DropdownMenu
            label="Dashboards"
            items={dashboardItems}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            }
            isActive={location.pathname === "/"}
            onClick={handleDashboardClick}
            open={openDashboardDropdown}
            onClose={() => setOpenDashboardDropdown(false)}
          />
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
                <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" />
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
          <Tooltip
            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            placement="bottom"
          >
            <UserIconButton
              onClick={toggleFullScreen}
              aria-label="toggle full screen"
            >
              {isFullScreen ? (
                <FullscreenExit sx={{ fontSize: 28 }} />
              ) : (
                <Fullscreen sx={{ fontSize: 28 }} />
              )}
            </UserIconButton>
          </Tooltip>
          <TimeDisplay>{currentTime}</TimeDisplay>
          <Tooltip title="Account Menu" placement="bottom">
            <UserIconButton
              onClick={handleUserMenuOpen}
              aria-label="account menu"
              aria-controls={userMenuAnchor ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuAnchor ? "true" : undefined}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                color="success"
              >
                <Avatar
                  sx={{
                    bgcolor: "transparent",
                    color: "#FFFFFF",
                    transition: "all 0.3s ease",
                  }}
                >
                  <AccountCircle sx={{ fontSize: 28, color: "#FFFFFF" }} />
                </Avatar>
              </Badge>
            </UserIconButton>
          </Tooltip>
          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              elevation: 8,
              sx: {
                minWidth: 200,
                mt: 1,
                backgroundImage: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))"
                    : "linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(6, 78, 59, 0.95))",
                backdropFilter: "blur(20px)",
                color: (theme) =>
                  theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                border: (theme) =>
                  theme.palette.mode === "light"
                    ? "1px solid rgba(0, 0, 0, 0.2)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 2,
                boxShadow: (theme) =>
                  theme.palette.mode === "light"
                    ? "0 20px 40px rgba(0, 0, 0, 0.15)"
                    : "0 20px 40px rgba(0, 0, 0, 0.3)",
                "& .MuiMenuItem-root": {
                  borderRadius: 1,
                  margin: "4px 8px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.08)"
                        : "rgba(255, 255, 255, 0.15)",
                    color: (theme) =>
                      theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                    transform: "translateX(8px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "light"
                        ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                        : "0 4px 12px rgba(255, 255, 255, 0.1)",
                  },
                },
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderBottom: 1,
                borderColor: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.2)"
                    : "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: (theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.2)"
                        : "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Person
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                    }}
                  />
                </Avatar>
                <Box>
                  <Box
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: (theme) =>
                        theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                    }}
                  >
                    John Doe
                  </Box>
                  <Box
                    sx={{
                      fontSize: "0.75rem",
                      color: (theme) =>
                        theme.palette.mode === "light"
                          ? "rgba(0, 0, 0, 0.7)"
                          : "rgba(255, 255, 255, 0.7)",
                      opacity: 0.8,
                    }}
                  >
                    john.doe@example.com
                  </Box>
                </Box>
              </Box>
            </Box>
            <MenuItem onClick={() => handleUserAction("profile")}>
              <ListItemIcon>
                <Person
                  fontSize="small"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                }}
              >
                Profile
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleUserAction("settings")}>
              <ListItemIcon>
                <Settings
                  fontSize="small"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                }}
              >
                Settings
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleUserAction("notifications")}>
              <ListItemIcon>
                <Badge badgeContent={3} color="error">
                  <Notifications
                    fontSize="small"
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                    }}
                  />
                </Badge>
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                }}
              >
                Notifications
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleUserAction("help")}>
              <ListItemIcon>
                <Help
                  fontSize="small"
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#1E293B" : "#FFFFFF",
                }}
              >
                Help & Support
              </ListItemText>
            </MenuItem>
            <Divider
              sx={{
                my: 1,
                borderColor: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.2)"
                    : "rgba(255, 255, 255, 0.2)",
              }}
            />
            <MenuItem
              onClick={() => handleUserAction("logout")}
              sx={{
                color: "#FF6B6B",
                "&:hover": {
                  backgroundColor: "rgba(255, 107, 107, 0.1)",
                },
              }}
            >
              <ListItemIcon>
                <ExitToApp fontSize="small" sx={{ color: "#FF6B6B" }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
          <EnergispeakAnimated />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
