import { Card, CardContent, Typography } from "@mui/material";
import { CardTitle } from "../Dashboard.styles";

const TextWidget = ({ data }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <CardTitle>{data.title}</CardTitle>
        <Typography sx={{ mt: 2 }}>{data.content}</Typography>
      </CardContent>
    </Card>
  );
};

export default TextWidget;
