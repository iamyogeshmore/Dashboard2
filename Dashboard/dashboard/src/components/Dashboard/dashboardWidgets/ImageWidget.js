import { Card, CardContent, Typography, Box } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const ImageWidget = ({ data }) => {
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
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <CardTitle
          sx={{
            fontFamily: data.titleFontFamily || "Roboto",
            fontSize: `${data.titleFontSize || 16}px`,
            color: data.titleColor || "inherit",
            fontWeight: data.titleBold ? "bold" : "normal",
            fontStyle: data.titleItalic ? "italic" : "normal",
            textDecoration: data.titleUnderline ? "underline" : "none",
          }}
        >
          {data.widgetName || "Image Widget"}
        </CardTitle>
        <Box
          sx={{
            flexGrow: 1,
            mt: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {data.image ? (
            <Box
              component="img"
              src={data.image}
              alt="Widget Image"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 1,
              }}
            />
          ) : (
            <Typography
              sx={{
                color: data.valueColor || "inherit",
                fontFamily: data.valueFontFamily || "Roboto",
                fontSize: `${data.valueFontSize || 24}px`,
                fontWeight: data.valueBold ? "bold" : "normal",
                fontStyle: data.valueItalic ? "italic" : "normal",
                textDecoration: data.valueUnderline ? "underline" : "none",
              }}
            >
              No image provided
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ImageWidget;
