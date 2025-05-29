import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";
import GaugeChart from "react-gauge-chart";

const GaugeWidget = ({ data }) => {
  const [value, setValue] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  const generateRandomValue = () => {
    const min = Number(data.ranges[0]?.min) || 0;
    const max = Number(data.ranges[data.ranges.length - 1]?.max) || 100;
    return Math.random() * (max - min) + min;
  };
  const getValueColor = () => {
    const numValue = Number(value);
    for (const range of data.ranges) {
      if (numValue >= Number(range.min) && numValue <= Number(range.max)) {
        return range.color;
      }
    }
    return data.valueColor || "inherit";
  };
  useEffect(() => {
    setValue(generateRandomValue());
    setTimestamp(new Date().toLocaleString());

    const interval = setInterval(() => {
      setValue(generateRandomValue());
      setTimestamp(new Date().toLocaleString());
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  const getGaugeColors = () => {
    return data.ranges.map((range) => range.color);
  };

  const normalizedValue = () => {
    const min = Number(data.ranges[0]?.min) || 0;
    const max = Number(data.ranges[data.ranges.length - 1]?.max) || 100;
    return (value - min) / (max - min);
  };

  const tooltipContent = (
    <Box>
      <Typography variant="caption">Plant: {data.plant || "N/A"}</Typography>
      <br />
      <Typography variant="caption">
        Terminal: {data.terminal || "N/A"}
      </Typography>
      <br />
      <Typography variant="caption">
        Measurand: {data.measurand || "N/A"}
      </Typography>
      <br />
      <Typography variant="caption">Timestamp: {timestamp}</Typography>
      <br />
      <Typography variant="caption">Ranges:</Typography>
      {data.ranges.map((range, index) => (
        <Typography variant="caption" key={index}>
          Range {index + 1}: {range.min} - {range.max} ({range.color})
        </Typography>
      ))}
    </Box>
  );

  return (
    <Card
      sx={{
        height: "100%",
        width: "100%",
        background: `linear-gradient(135deg, ${
          data.backgroundColor || "#ffffff"
        }ee, ${data.backgroundColor || "#ffffff"}cc)`,
        border: `${data.borderWidth || 1}px solid ${
          data.borderColor || "#e0e0e0"
        }`,
        borderRadius: `${data.borderRadius || 4}px`,
        boxShadow: (theme) =>
          `0 4px 20px ${
            theme.palette.mode === "light"
              ? "rgba(0,0,0,0.1)"
              : "rgba(0,0,0,0.3)"
          }`,
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
          background: `linear-gradient(135deg, ${
            data.backgroundColor || "#ffffff"
          }ee, ${data.backgroundColor || "#ffffff"}cc)`,
          border: `${data.borderWidth || 1}px solid ${
            data.borderColor || "#e0e0e0"
          }`,
          borderRadius: `${data.borderRadius || 4}px`,
          boxShadow: (theme) =>
            `0 4px 20px ${
              theme.palette.mode === "light"
                ? "rgba(0,0,0,0.1)"
                : "rgba(0,0,0,0.3)"
            }`,
        }}
      >
        <Tooltip title={tooltipContent} placement="top">
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <CardTitle
              sx={{
                fontFamily: data.titleFontFamily || "Roboto",
                fontSize: `${data.titleFontSize || 16}px`,
                color: data.titleColor || "inherit",
                fontWeight: data.titleBold ? "bold" : "normal",
                fontStyle: data.titleItalic ? "italic" : "normal",
                textDecoration: data.titleUnderline ? "underline" : "none",
                textShadow: (theme) =>
                  `0 0 8px ${theme.palette.primary.light}80`,
              }}
            >
              {data.widgetName || "Gauge Widget"}
            </CardTitle>
          </Box>
        </Tooltip>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GaugeChart
            id="gauge-chart"
            nrOfLevels={data.ranges.length}
            colors={getGaugeColors()}
            arcWidth={0.3}
            percent={normalizedValue()}
            textColor={getValueColor()}
            needleColor={getValueColor()}
            needleBaseColor="#000000"
            formatTextValue={() =>
              `${value.toFixed(Number(data.decimalPlaces) || 1)} ${
                data.unit || ""
              }`
            }
            style={{
              width: "100%",
              height: "100%",
            }}
            textStyle={{
              color: getValueColor(),
            }}
            arcsLength={data.ranges.map((range, index) => {
              const min = Number(data.ranges[0]?.min) || 0;
              const max =
                Number(data.ranges[data.ranges.length - 1]?.max) || 100;
              const rangeSize =
                (Number(range.max) - Number(range.min)) / (max - min);
              return rangeSize;
            })}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default GaugeWidget;
