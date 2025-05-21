import { useState } from "react";

// This is a simplified version of the EnergispeakAnimated component
// that you can use directly in your Navbar.js file
const EnergispeakAnimated = () => {
  const [sparkPosition, setSparkPosition] = useState(0);

  // Start the animation when component loads
  useState(() => {
    const interval = setInterval(() => {
      setSparkPosition((prev) => (prev < 100 ? prev + 5 : 0));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden inline-block px-2 py-1">
      {/* Main text with gradient */}
      <span
        className="text-2xl font-bold relative z-10"
        style={{
          background: "linear-gradient(45deg, #22C55E, #4ADE80)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 10px rgba(34, 197, 94, 0.7)",
        }}
      >
        Energi<span className="text-white">Speak</span>
      </span>

      {/* Moving electricity spark */}
      <div
        className="absolute top-0 h-full w-1 opacity-80 blur-sm"
        style={{
          left: `${sparkPosition}%`,
          background:
            "linear-gradient(to bottom, transparent, #22C55E, #4ADE80, transparent)",
          transform: "translateX(-50%)",
        }}
      />

      {/* Horizontal energy line */}
      <div
        className="absolute bottom-0 left-0 h-0.5"
        style={{
          width: `${sparkPosition}%`,
          background:
            "linear-gradient(to right, transparent, #22C55E, #4ADE80)",
          boxShadow: "0 0 10px #22C55E",
          transition: "width 0.15s ease-out",
        }}
      />
    </div>
  );
};

// Demo usage in a navbar-like context
const NavbarWithAnimatedLogo = () => {
  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <EnergispeakAnimated />
      </div>

      <div className="flex items-center space-x-4">
        <button className="px-3 py-1 rounded-full bg-green-600 hover:bg-green-500 transition-colors">
          Dashboard
        </button>
        <button className="px-3 py-1 rounded-full bg-opacity-20 bg-white hover:bg-opacity-30 transition-colors">
          Views
        </button>
        <button className="px-3 py-1 rounded-full bg-opacity-20 bg-white hover:bg-opacity-30 transition-colors">
          Reports
        </button>
      </div>
    </div>
  );
};

export default NavbarWithAnimatedLogo;
