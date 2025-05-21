import { Card, CardContent, Typography, Box } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const ImageWidget = ({ data }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <CardTitle>{data.title}</CardTitle>
        <Box sx={{ mt: 2, height: 150, overflow: "hidden", borderRadius: 2 }}>
          <img
            src={data.imageUrl}
            alt={data.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ImageWidget;
