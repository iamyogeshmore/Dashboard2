import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Schedule } from "@mui/icons-material";
import { SectionTitle } from "./Screens.styles";

const InjectionSchedule = () => {
  const schedule = [
    { time: "08:00", power: "100 MW" },
    { time: "12:00", power: "150 MW" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <SectionTitle>
        <Schedule sx={{ mr: 1 }} /> Injection Schedule
      </SectionTitle>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Power</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{entry.time}</TableCell>
              <TableCell>{entry.power}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default InjectionSchedule;
