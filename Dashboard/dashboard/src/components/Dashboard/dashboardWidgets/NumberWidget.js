import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Tooltip, Box } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const NumberWidget = ({ data }) => {
  const [value, setValue] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  const generateRandomValue = () => {
    const min = Number(data.ranges[0]?.min) || 0;
    const max = Number(data.ranges[data.ranges.length - 1]?.max) || 100;
    return (Math.random() * (max - min) + min).toFixed(
      Number(data.decimalPlaces) || 2
    );
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

  const getValueColor = () => {
    const numValue = Number(value);
    for (const range of data.ranges) {
      if (numValue >= Number(range.min) && numValue <= Number(range.max)) {
        return range.color;
      }
    }
    return data.valueColor || "inherit";
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
      <Typography variant="caption">
        Decimal Places: {data.decimalPlaces || "N/A"}
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
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CardTitle
            sx={{
              fontFamily: data.titleFontFamily || "Roboto",
              fontSize: `${data.titleFontSize || 16}px`,
              color: data.titleColor || "inherit",
              fontWeight: data.titleBold ? "bold" : "normal",
              fontStyle: data.titleItalic ? "italic" : "normal",
              textDecoration: data.titleUnderline ? "underline" : "none",
              textAlign: "center",
            }}
          >
            {data.widgetName || "Number Widget"}
          </CardTitle>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip title={tooltipContent} placement="top">
            <Typography
              variant="h5"
              sx={{
                color: getValueColor(),
                fontFamily: data.valueFontFamily || "Roboto",
                fontSize: `${data.valueFontSize || 24}px`,
                fontWeight: data.valueBold ? "bold" : "normal",
                fontStyle: data.valueItalic ? "italic" : "normal",
                textDecoration: data.valueUnderline ? "underline" : "none",
                textAlign: "center",
              }}
            >
              {value} {data.unit || ""}
            </Typography>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NumberWidget;
