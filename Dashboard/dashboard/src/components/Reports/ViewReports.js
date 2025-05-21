import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Assessment } from "@mui/icons-material";
import { SectionTitle } from "./Reports.styles";

const ViewReports = () => {
  const reports = [
    { id: 1, name: "Monthly Energy Report", date: "2025-05-01" },
    { id: 2, name: "Solar Output Analysis", date: "2025-05-10" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>
        <Assessment sx={{ mr: 1 }} /> View Reports
      </SectionTitle>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.id}</TableCell>
              <TableCell>{report.name}</TableCell>
              <TableCell>{report.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ViewReports;
