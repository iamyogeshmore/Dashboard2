import { Box } from "@mui/material";
import { FooterContainer, FooterText } from "./Footer.styles";

const Footer = () => {
  return (
    <FooterContainer>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FooterText>
          &copy; {new Date().getFullYear()} ESTHEORM. All rights reserved.
        </FooterText>
      </Box>
      <FooterText sx={{ textAlign: "right" }}>
        Powered by EnergiSpeak
      </FooterText>
    </FooterContainer>
  );
};

export default Footer;
