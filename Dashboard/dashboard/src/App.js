// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProvider } from "./context/ThemeContext";
import { getTheme } from "./theme/theme";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Dashboard from "./components/Dashboard/Dashboard";
import TerminalView from "./components/Views/TerminalView";
import MeasurandView from "./components/Views/MeasurandView";
import ScriptView from "./components/Views/ScriptView";
import LogView from "./components/Views/LogView/LogView";
import InjectionSchedule from "./components/Screens/InjectionSchedule";
import ScheduleEntry from "./components/Screens/ScheduleEntry";
import RealTimePowerBalance from "./components/Screens/RealTimePowerBalance";
import ViewReports from "./components/Reports/ViewReports";
import GenerateReports from "./components/Reports/GenerateReports";
import HistoricalDataDisplayTV from "./components/Views/TerminalView/HistoricalDataDisplayTV";
import HistoricalDataDisplayMV from "./components/Views/MeasurandView/HistoricalDataDisplayMV";
import { useThemeContext } from "./context/ThemeContext";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./index.css";

function AppContent({
  onLoadDashboard,
  onCreateNewDashboard,
  currentDashboardId,
  setCurrentDashboardId,
}) {
  const { mode } = useThemeContext();
  const theme = getTheme(mode);
  const location = useLocation();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Update currentDashboardId when loading a dashboard
  const handleLoadDashboard = (dashboardId) => {
    setCurrentDashboardId(dashboardId);
    onLoadDashboard.current(dashboardId);
  };

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        // Safari
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        // IE/Edge
        element.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        // Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  // Handle F11 key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F11") {
        event.preventDefault(); // Prevent default browser full-screen
        toggleFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Listen for full-screen change events to sync state
    const handleFullScreenChange = () => {
      setIsFullScreen(
        !!document.fullscreenElement ||
          !!document.webkitFullscreenElement ||
          !!document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, [isFullScreen]);

  return (
    <MuiThemeProvider theme={theme}>
      <div
        style={{
          background: theme.palette.background.paper,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isFullScreen && (
          <Navbar
            onLoadDashboard={onLoadDashboard}
            onCreateNewDashboard={onCreateNewDashboard}
            currentDashboardId={currentDashboardId}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
          />
        )}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onLoadDashboard={onLoadDashboard}
                  onCreateNewDashboard={onCreateNewDashboard}
                  currentPath={location.pathname}
                />
              }
            />
            <Route path="/views/terminal" element={<TerminalView />} />
            <Route
              path="/views/terminal/historical/:tableId"
              element={<HistoricalDataDisplayTV />}
            />
            <Route
              path="/views/measurand/historical/:tableId"
              element={<HistoricalDataDisplayMV />}
            />
            <Route path="/views/measurand" element={<MeasurandView />} />
            <Route path="/views/script" element={<ScriptView />} />
            <Route path="/views/log" element={<LogView />} />
            <Route
              path="/screens/injection-schedule"
              element={<InjectionSchedule />}
            />
            <Route path="/screens/schedule-entry" element={<ScheduleEntry />} />
            <Route
              path="/screens/real-time-power-balance"
              element={<RealTimePowerBalance />}
            />
            <Route path="/reports/view" element={<ViewReports />} />
            <Route path="/reports/generate" element={<GenerateReports />} />
            <Route path="/about" element={<div>About Page</div>} />
            <Route path="/contact" element={<div>Contact Page</div>} />
          </Routes>
        </div>
        {!isFullScreen && <Footer />}
      </div>
    </MuiThemeProvider>
  );
}

function App() {
  const onLoadDashboard = useRef(() => {});
  const onCreateNewDashboard = useRef(() => {});
  const [currentDashboardId, setCurrentDashboardId] = useState(null);

  return (
    <ThemeProvider>
      <Router>
        <AppContent
          onLoadDashboard={onLoadDashboard}
          onCreateNewDashboard={onCreateNewDashboard}
          currentDashboardId={currentDashboardId}
          setCurrentDashboardId={setCurrentDashboardId}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
