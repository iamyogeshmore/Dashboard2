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
import LogView from "./components/Views/LogView";
import InjectionSchedule from "./components/Screens/InjectionSchedule";
import ScheduleEntry from "./components/Screens/ScheduleEntry";
import RealTimePowerBalance from "./components/Screens/RealTimePowerBalance";
import ViewReports from "./components/Reports/ViewReports";
import GenerateReports from "./components/Reports/GenerateReports";
import HistoricalDataDisplayTV from "./components/Views/TerminalView/HistoricalDataDisplayTV";
import HistoricalDataDisplayMV from "./components/Views/MeasurandView/HistoricalDataDisplayMV";
import { useThemeContext } from "./context/ThemeContext";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import "./index.css";

function AppContent({
  onLoadDashboard,
  onCreateNewDashboard,
  currentDashboardId,
  setCurrentDashboardId,
}) {
  const { mode } = useThemeContext();
  const theme = getTheme(mode);
  const location = useLocation(); // Now safe to use within Router context

  // Update currentDashboardId when loading a dashboard
  const handleLoadDashboard = (dashboardId) => {
    setCurrentDashboardId(dashboardId);
    onLoadDashboard.current(dashboardId);
  };

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
        <Navbar
          onLoadDashboard={onLoadDashboard}
          onCreateNewDashboard={onCreateNewDashboard}
          currentDashboardId={currentDashboardId}
        />
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
        <Footer />
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
        {" "}
        {/* Move Router here to wrap AppContent */}
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
