import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#10B981" : "#166534",
        light: mode === "light" ? "#34D399" : "#22C55E",
        dark: mode === "light" ? "#047857" : "#14532D",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: mode === "light" ? "#059669" : "#15803D",
        light: mode === "light" ? "#6EE7B7" : "#4ADE80",
        dark: mode === "light" ? "#065F46" : "#064E3B",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "light" ? "#F0FDF4" : "#022C22",
        paper: mode === "light" ? "#FFFFFF" : "#1F2937",
      },
      text: {
        primary: mode === "light" ? "#1E293B" : "#F3F4F6",
        secondary: mode === "light" ? "#475569" : "#D1D5DB",
      },
      energy: {
        blue: mode === "light" ? "#10B981" : "#22C55E",
        green: mode === "light" ? "#10B981" : "#22C55E",
        yellow: mode === "light" ? "#F59E0B" : "#FBBF24",
        red: mode === "light" ? "#EF4444" : "#F87171",
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      h1: { fontWeight: 600, fontSize: "2.5rem", letterSpacing: "-0.02em" },
      h2: { fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em" },
      h3: { fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.02em" },
      h4: { fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.02em" },
      h5: { fontWeight: 500, fontSize: "1.25rem" },
      h6: { fontWeight: 500, fontSize: "1rem" },
      body1: { fontWeight: 400, fontSize: "1rem" },
      button: { fontWeight: 500, textTransform: "none", fontSize: "0.9rem" },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor:
              mode === "light" ? "#86EFAC transparent" : "#86EFAC transparent",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: mode === "light" ? "#86EFAC" : "#86EFAC",
              border: "2px solid transparent",
            },
            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus":
              {
                backgroundColor: mode === "light" ? "#4ADE80" : "#4ADE80",
              },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover":
              {
                backgroundColor: mode === "light" ? "#4ADE80" : "#4ADE80",
              },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage:
              mode === "light"
                ? "linear-gradient(90deg, #10B981, #34D399)"
                : "linear-gradient(90deg, #166534, #22C55E)",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${
              mode === "light" ? "#34D399" : "#4ADE80"
            }`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage:
              mode === "light"
                ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,253,244,0.9))"
                : "linear-gradient(135deg, rgba(31,41,55,0.95), rgba(6,78,59,0.9))",
            backdropFilter: "blur(12px)",
            boxShadow:
              mode === "light"
                ? "0 8px 24px rgba(16, 185, 129, 0.1)"
                : "0 8px 24px rgba(22, 101, 52, 0.2)",
            border: `1px solid ${
              mode === "light"
                ? "rgba(52, 211, 153, 0.3)"
                : "rgba(34, 197, 94, 0.3)"
            }`,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0 12px 32px rgba(16, 185, 129, 0.15)"
                  : "0 12px 32px rgba(22, 101, 52, 0.25)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            transition:
              "transform 0.2s, background-color 0.3s, box-shadow 0.3s",
            borderRadius: "8px",
            padding: "8px 16px",
            backdropFilter: "blur(6px)", // Added for glassmorphism
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: `0 4px 12px ${
                mode === "light"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(22, 101, 52, 0.3)"
              }`,
            },
            "&:active": { transform: "translateY(0)" },
          },
          containedPrimary: {
            background:
              mode === "light"
                ? "linear-gradient(45deg, #10B981, #34D399)"
                : "linear-gradient(45deg, #166534, #22C55E)",
            "&:hover": {
              background:
                mode === "light"
                  ? "linear-gradient(45deg, #059669, #10B981)"
                  : "linear-gradient(45deg, #14532D, #16A34A)",
            },
          },
          containedSecondary: {
            background:
              mode === "light"
                ? "linear-gradient(45deg, #059669, #6EE7B7)"
                : "linear-gradient(45deg, #15803D, #4ADE80)",
            "&:hover": {
              background:
                mode === "light"
                  ? "linear-gradient(45deg, #047857, #10B981)"
                  : "linear-gradient(45deg, #064E3B, #22C55E)",
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            padding: "8px 16px",
            transition: "background-color 0.2s, transform 0.2s",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(52, 211, 153, 0.1)"
                  : "rgba(34, 197, 94, 0.1)",
              transform: "translateX(4px)",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor:
              mode === "light"
                ? "rgba(16, 185, 129, 0.9)"
                : "rgba(22, 101, 52, 0.9)",
            color: "#FFFFFF",
            fontSize: "0.8rem",
            borderRadius: "4px",
            backdropFilter: "blur(6px)",
            border: `1px solid ${
              mode === "light"
                ? "rgba(52, 211, 153, 0.3)"
                : "rgba(34, 197, 94, 0.3)"
            }`,
          },
        },
      },
    },
    shadows: Array(25)
      .fill()
      .map((_, i) => `0 ${i * 2}px ${i * 4}px rgba(0,0,0,${0.05 + i * 0.005})`),
  });
