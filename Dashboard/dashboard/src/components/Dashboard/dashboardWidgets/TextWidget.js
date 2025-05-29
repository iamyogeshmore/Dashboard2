import { Card, CardContent, Typography } from "@mui/material";

const TextWidget = ({ data }) => {
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            whiteSpace: "pre-wrap",
            overflow: "auto",
            fontFamily: data.valueFontFamily || "Roboto",
            fontSize: `${data.valueFontSize || 24}px`,
            color: data.valueColor || data.titleColor || "inherit",
            fontWeight: data.valueBold ? "bold" : "normal",
            fontStyle: data.valueItalic ? "italic" : "normal",
            textDecoration: data.valueUnderline ? "underline" : "none",
            textAlign: "center",
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {data.content || "No content provided"}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TextWidget;
