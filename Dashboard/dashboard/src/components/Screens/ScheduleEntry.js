// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   Select,
//   MenuItem,
//   TextField,
//   Button,
//   createTheme,
//   ThemeProvider,
//   FormControl,
//   InputLabel,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   IconButton,
//   Chip,
// } from "@mui/material";
// import CircularProgress from "@mui/material/CircularProgress";
// import { formatTimestamp } from "../DashboardWidgets/formatTimestamp";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import CloseIcon from "@mui/icons-material/Close";
// import { useAuthContext } from "../../contexts/useAuthContext";
// const API_BASE_URL = `${process.env.REACT_APP_API_LOCAL_URL}api`;

// const theme = createTheme({
//   palette: {
//     mode: "dark",
//     primary: {
//       main: "#3b82f6",
//     },
//     secondary: {
//       main: "#10b981",
//     },
//     background: {
//       default: "#000000",
//       paper: "#000000",
//     },
//     text: {
//       primary: "#f1f5f9",
//       secondary: "#94a3b8",
//     },
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: "none",
//           borderRadius: "8px",
//           padding: "8px 16px",
//         },
//       },
//     },
//     MuiTextField: {
//       styleOverrides: {
//         root: {
//           "& .MuiOutlinedInput-root": {
//             borderRadius: "8px",
//           },
//         },
//       },
//     },
//     MuiSelect: {
//       styleOverrides: {
//         root: {
//           borderRadius: "8px",
//         },
//       },
//     },
//     MuiTableCell: {
//       styleOverrides: {
//         root: {
//           borderBottom: "1px solid #334155",
//         },
//         head: {
//           fontWeight: 600,
//           backgroundColor: "#1e293b",
//         },
//       },
//     },
//   },
// });

// // Add these utility functions at the top of your component
// const convertISTtoUTC = (istHour, istMinute, dateType) => {
//   let utcHour = istHour - 5;
//   let utcMinute = istMinute - 30;
//   let dayOffset = 0;

//   if (utcMinute < 0) {
//     utcMinute += 60;
//     utcHour -= 1;
//   }

//   if (utcHour < 0) {
//     utcHour += 24;
//     dayOffset = -1;
//   }

//   const today = new Date();
//   const targetDate = new Date(today);
//   if (dateType === "tomorrow") {
//     targetDate.setDate(today.getDate() + 1);
//   }
//   targetDate.setDate(targetDate.getDate() + dayOffset);

//   return {
//     hour: utcHour,
//     minute: utcMinute,
//     date: targetDate.toISOString().split("T")[0],
//   };
// };

// // Helper to get IST date for "today" or "tomorrow"
// const getISTDate = (dateType) => {
//   const today = new Date();
//   if (dateType === "tomorrow") {
//     today.setDate(today.getDate() + 1);
//   }
//   // Set to IST midnight
//   today.setHours(0, 0, 0, 0);
//   return today;
// };

// const SCHEDULE_OPTIONS = ["PGC", "FCC", "RFD", "RFA", "SI", "Auxiliary"];

// function SheduleEntry() {
//   const { user } = useAuthContext();
//   const [selectedSchedule, setSelectedSchedule] = useState("");
//   const [selectedPlant, setSelectedPlant] = useState("");
//   const [dateType, setDateType] = useState("today");
//   const [fromBlock, setFromBlock] = useState("");
//   const [toBlock, setToBlock] = useState("");
//   const [mw, setMW] = useState("");
//   const [revNo, setRevNo] = useState("");
//   const [remark, setRemark] = useState("");
//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [availablePlants, setAvailablePlants] = useState([]);
//   const [timeBlocks, setTimeBlocks] = useState([]);
//   const [remarksModalOpen, setRemarksModalOpen] = useState(false);
//   const [selectedBlockRemarks, setSelectedBlockRemarks] = useState("");
//   const [selectedBlockNumber, setSelectedBlockNumber] = useState(null);
//   const [allowedSchedules, setAllowedSchedules] = useState(SCHEDULE_OPTIONS);
//   const [userAccessRole, setUserAccessRole] = useState("RC0");

//   // Add useEffect to determine user's access role and allowed schedules
//   useEffect(() => {
//     if (user) {
//       console.log("User data:", user);
//       // Get RoleCode from localStorage
//       let userData = null;
//       try {
//         const localStorageUser = localStorage.getItem("user");
//         if (localStorageUser) {
//           userData = JSON.parse(localStorageUser);
//         }
//       } catch (error) {
//         console.error("Error parsing user data from localStorage:", error);
//       }

//       // ONLY use RoleCode - remove the access fallback
//       const roleCode = userData?.RoleCode || "RC0";
//       console.log("Using role code:", roleCode);

//       setUserAccessRole(roleCode);

//       // Set allowed schedules based on RoleCode
//       if (roleCode === "RC0") {
//         setAllowedSchedules(SCHEDULE_OPTIONS);
//       } else if (
//         roleCode === "CCP1" ||
//         roleCode === "CCP2" ||
//         roleCode === "CCP3"
//       ) {
//         setAllowedSchedules(["FCC", "RFD"]);
//       } else {
//         setAllowedSchedules(SCHEDULE_OPTIONS);
//       }
//     } else {
//       setAllowedSchedules(SCHEDULE_OPTIONS);
//       setUserAccessRole("RC0");
//     }
//   }, [user]);

//   // Add useEffect to fetch data when component mounts or when date type changes
//   useEffect(() => {
//     fetchBlockData();
//   }, [dateType, selectedSchedule, selectedPlant]);

//   // Add useEffect to update available plants when schedule changes
//   useEffect(() => {
//     const updateAvailablePlants = async () => {
//       console.log("Updating plants for schedule:", selectedSchedule);

//       // For SI and Auxiliary, we don't need to check existing measurands
//       if (selectedSchedule === "SI") {
//         const siPlants = ["SI", "RTC CDR", "RTC THV"];
//         console.log("Setting SI plants:", siPlants);
//         setAvailablePlants(siPlants);
//         return;
//       }

//       if (selectedSchedule === "Auxiliary") {
//         const auxPlants = ["Aux CDR", "Aux THV"];
//         console.log("Setting Auxiliary plants:", auxPlants);
//         setAvailablePlants(auxPlants);
//         return;
//       }

//       // For other schedules, keep the existing logic
//       const existingMeasurands = await getExistingMeasurands();

//       switch (selectedSchedule) {
//         case "RFD":
//           setAvailablePlants(getPlantOptions("RFD"));
//           break;

//         case "RFA":
//           if (existingMeasurands.FCC.size > 0) {
//             const fccPlants = Array.from(existingMeasurands.FCC)
//               .sort((a, b) => a - b)
//               .map((num) => {
//                 if (num <= 3) return `CCP${num}`;
//                 return `THVPL${num - 3}`;
//               });
//             setAvailablePlants(fccPlants);
//           } else {
//             setAvailablePlants([]);
//           }
//           break;

//         case "FCC":
//           setAvailablePlants(getPlantOptions("FCC"));
//           break;

//         case "PGC":
//           setAvailablePlants(getPlantOptions("PGC"));
//           break;

//         default:
//           setAvailablePlants([]);
//       }
//     };

//     updateAvailablePlants();
//   }, [selectedSchedule]);

//   // Add useEffect to update timeBlocks when dateType changes
//   useEffect(() => {
//     setTimeBlocks(getTimeBlocks());
//   }, [dateType]);

//   useEffect(() => {
//     if (selectedSchedule && selectedPlant) {
//       const fetchRevisionNumber = async () => {
//         try {
//           const response = await fetch(
//             `${API_BASE_URL}/screen2/getLatestRevNo?schedule=${selectedSchedule}&dateType=${dateType}`
//           );

//           if (!response.ok) {
//             throw new Error(`Server error: ${response.status}`);
//           }

//           const data = await response.json();

//           if (data.revNo !== undefined) {
//             setRevNo(data.revNo.toString());
//           } else {
//             setRevNo("0");
//           }
//         } catch (error) {
//           console.error("Error fetching revision number:", error);
//           setRevNo("0");
//         }
//       };

//       fetchRevisionNumber();
//     }
//   }, [selectedSchedule, selectedPlant, dateType]);

//   const fetchBlockData = async () => {
//     try {
//       const queryParams = new URLSearchParams({
//         dateType: dateType,
//         ...(selectedSchedule && { schedule: selectedSchedule }),
//       });

//       const response = await fetch(
//         `${API_BASE_URL}/screen2/getBlocks?${queryParams.toString()}`,
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Raw backend data:", data);

//       const transformedData = data.map((doc) => {
//         // Parse the timestamp string directly
//         const timestamp = doc.TimeStamp;
//         // Extract date and time parts
//         const [datePart, timePart] = timestamp.split("T");
//         const [year, month, day] = datePart.split("-");
//         const [hourStr, minuteStr] = timePart.split(":");

//         // Parse hours and minutes as integers
//         let hours = parseInt(hourStr);
//         let minutes = parseInt(minuteStr);

//         // Convert UTC to IST by adding 5:30
//         hours += 5;
//         minutes += 30;

//         // Handle minute overflow
//         if (minutes >= 60) {
//           hours += 1;
//           minutes -= 60;
//         }

//         // Handle hour overflow (next day)
//         let displayDay = parseInt(day);
//         let displayMonth = parseInt(month);
//         let displayYear = parseInt(year);
//         if (hours >= 24) {
//           hours -= 24;
//           displayDay += 1;

//           // Handle month overflow
//           const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();
//           if (displayDay > daysInMonth) {
//             displayDay = 1;
//             displayMonth += 1;
//             if (displayMonth > 12) {
//               displayMonth = 1;
//               displayYear += 1;
//             }
//           }
//         }

//         // Calculate block number based on IST time (hours and minutes)
//         // Each block is 15 minutes starting from 00:15
//         const totalMinutesFromMidnight = hours * 60 + minutes;

//         let blockNo;
//         if (totalMinutesFromMidnight >= 0 && totalMinutesFromMidnight < 15) {
//           // 00:00-00:14 is Block 96 (spans from previous day 23:45)
//           blockNo = 96;
//         } else if (
//           totalMinutesFromMidnight >= 15 &&
//           totalMinutesFromMidnight < 1440
//         ) {
//           // 00:15 onwards: subtract 15 minutes then calculate
//           blockNo = Math.floor((totalMinutesFromMidnight - 15) / 15) + 1;
//         } else {
//           // This should not happen, but safety fallback
//           blockNo = 95;
//         }

//         // Format date and time for display
//         const formattedDate = `${displayDay
//           .toString()
//           .padStart(2, "0")}/${displayMonth
//           .toString()
//           .padStart(2, "0")}/${displayYear}`;
//         const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
//           .toString()
//           .padStart(2, "0")}:00`;

//         console.log(
//           `Original UTC: ${timestamp} -> IST: ${formattedDate}, ${formattedTime} (Block ${blockNo})`
//         );

//         // Get measurand data
//         let mwValue = "NA"; // Default to "NA" when value is absent
//         if (selectedSchedule && selectedPlant) {
//           // Get the correct measurand name based on schedule and plant
//           let measurandName;
//           if (selectedSchedule === "SI") {
//             switch (selectedPlant) {
//               case "SI":
//                 measurandName = "NetInjSch_MW";
//                 break;
//               case "RTC CDR":
//                 measurandName = "RTCDR_MW";
//                 break;
//               case "RTC THV":
//                 measurandName = "RTTHV_MW";
//                 break;
//             }
//           } else if (selectedSchedule === "Auxiliary") {
//             switch (selectedPlant) {
//               case "Aux CDR":
//                 measurandName = "AUX_CDR";
//                 break;
//               case "Aux THV":
//                 measurandName = "AUX_THV";
//                 break;
//             }
//           } else {
//             // ✅ Fix: Use same logic as backend for plant number calculation
//             const plantNumber = selectedPlant.includes("THVPL")
//               ? parseInt(selectedPlant.replace("THVPL", "")) + 3
//               : parseInt(selectedPlant.replace(/\D/g, ""));

//             measurandName = `${selectedSchedule}${plantNumber}`;
//           }

//           const measurand = doc.MeasurandData?.find(
//             (m) => m.MeasurandName === measurandName
//           );
//           if (
//             measurand &&
//             measurand.MeasurandValue !== undefined &&
//             measurand.MeasurandValue !== null
//           ) {
//             mwValue = Number(measurand.MeasurandValue);
//           }
//         } else {
//           // If no schedule/plant selected, try to show ANY MW value from common measurands
//           const commonMeasurands = doc.MeasurandData?.filter(
//             (m) =>
//               m.MeasurandName.match(
//                 /^(PGC|FCC|RFD|RFA|NetInjSch_MW|RTCDR_MW|RTTHV_MW|AUX_CDR|AUX_THV)\d*$/
//               ) &&
//               m.MeasurandValue !== undefined &&
//               m.MeasurandValue !== null &&
//               m.MeasurandName !== "RevNo" &&
//               m.MeasurandName !== "Remarks"
//           );

//           if (commonMeasurands && commonMeasurands.length > 0) {
//             // Show the first available MW value
//             mwValue = Number(commonMeasurands[0].MeasurandValue);
//           }
//         }

//         // For RevNo and Remarks, keep the same logic but ensure proper type handling
//         const revNoMeasurand = doc.MeasurandData?.find(
//           (m) => m.MeasurandName === "RevNo"
//         );
//         const remarksMeasurand = doc.MeasurandData?.find(
//           (m) => m.MeasurandName === "Remarks"
//         );

//         return {
//           BlockNo: blockNo,
//           BlockTime: `${formattedDate}, ${formattedTime}`,
//           MW: mwValue,
//           RevNo: revNoMeasurand
//             ? revNoMeasurand.MeasurandValue !== null &&
//               revNoMeasurand.MeasurandValue !== undefined &&
//               !isNaN(revNoMeasurand.MeasurandValue)
//               ? Number(revNoMeasurand.MeasurandValue)
//               : "NA"
//             : "NA",
//           Remarks: remarksMeasurand
//             ? remarksMeasurand.MeasurandValue || ""
//             : "",
//         };
//       });

//       // Sort by block number only, ignore dates since it's all one logical day
//       transformedData.sort((a, b) => {
//         return a.BlockNo - b.BlockNo;
//       });

//       // Assign sequential IDs after sorting
//       const finalData = transformedData.map((item, index) => ({
//         ...item,
//         id: index + 1,
//       }));

//       console.log("Final transformed data:", finalData);
//       setTableData(finalData);
//     } catch (error) {
//       console.error("Error in fetchBlockData:", error);
//       setTableData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getExistingMeasurands = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/screen2/getBlocks?dateType=${dateType}`,
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Server Error:", errorText);
//         throw new Error(`Server error: ${response.status}`);
//       }

//       const data = await response.json();

//       const existingMeasurands = {
//         FCC: new Set(),
//         PGC: new Set(),
//         RFA: new Set(),
//         RFD: new Set(),
//       };

//       data.forEach((doc) => {
//         doc.MeasurandData.forEach((m) => {
//           Object.keys(existingMeasurands).forEach((prefix) => {
//             if (m.MeasurandName.startsWith(prefix)) {
//               const num = parseInt(m.MeasurandName.replace(prefix, ""));
//               existingMeasurands[prefix].add(num);
//             }
//           });
//         });
//       });

//       return existingMeasurands;
//     } catch (error) {
//       console.error("Error in getExistingMeasurands:", error);
//       return { FCC: new Set(), PGC: new Set(), RFA: new Set(), RFD: new Set() };
//     }
//   };

//   // Update the schedule change handler
//   const handleScheduleChange = async (e) => {
//     const newSchedule = e.target.value;
//     console.log("Schedule selected:", newSchedule);
//     setSelectedSchedule(newSchedule);
//     setSelectedPlant("");

//     // For SI and Auxiliary, we don't need to check existing measurands
//     if (newSchedule === "SI" || newSchedule === "Auxiliary") {
//       return;
//     }

//     const existingMeasurands = await getExistingMeasurands();

//     switch (newSchedule) {
//       case "RFD":
//         // ✅ Stricter validation: Need BOTH PGC AND FCC entries
//         const hasPGC = existingMeasurands.PGC.size > 0;
//         const hasFCC = existingMeasurands.FCC.size > 0;

//         if (!hasPGC || !hasFCC) {
//           alert(
//             "Both PGC and FCC entries must exist before creating RFD entries. Please create both PGC and FCC entries first."
//           );
//           setSelectedSchedule(""); // Reset selection
//           return;
//         }
//         break;

//       case "RFA":
//         // This validation is already correct
//         if (existingMeasurands.FCC.size === 0) {
//           alert("No FCC entries exist. Please create FCC entries first.");
//           setSelectedSchedule(""); // Reset selection
//           return;
//         }
//         break;

//       case "FCC":
//         // For FCC, we'll check if there are any existing entries
//         // If not, we'll allow creation of new ones
//         break;

//       case "PGC":
//         // PGC can always be selected as it's a primary entry
//         break;
//     }
//   };

//   // Update the plant selection handler
//   const handlePlantChange = async (e) => {
//     const newPlant = e.target.value;
//     setSelectedPlant(newPlant);
//   };

//   const handleAdd = async () => {
//     if (
//       !selectedSchedule ||
//       !selectedPlant ||
//       !fromBlock ||
//       !toBlock ||
//       !mw ||
//       !revNo
//     ) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setIsUpdating(true);
//     try {
//       const requestData = {
//         schedule: selectedSchedule,
//         plant: selectedPlant,
//         fromBlock: parseInt(fromBlock),
//         toBlock: parseInt(toBlock),
//         mw: parseFloat(mw),
//         revNo: parseFloat(revNo),
//         remark: remark,
//         dateType: dateType,
//         isAutoIncrement:
//           selectedSchedule === "RFA" || selectedSchedule === "RFD",
//       };

//       console.log("Sending request with data:", requestData);

//       const response = await fetch(`${API_BASE_URL}/screen2/updateBlocks`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify(requestData),
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         console.error("Server error response:", responseData);
//         throw new Error(JSON.stringify(responseData));
//       }

//       console.log("Server response:", responseData);

//       setMW("");
//       setRevNo("");
//       setRemark("");
//       alert(
//         `${selectedSchedule} uploaded successfully for revision number (${revNo})`
//       );
//       fetchBlockData();
//     } catch (error) {
//       console.error("Error in handleAdd:", error);
//       const errorMessage = error.message.includes("{")
//         ? JSON.parse(error.message).error
//         : error.message;
//       alert(`Failed to update blocks: ${errorMessage}`);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Update table headers
//   const tableHeaders = [
//     // { id: "id", label: "ID" },
//     { id: "BlockNo", label: "Block No" },
//     { id: "BlockTime", label: "Block Time" },
//     { id: "MW", label: "MW" },
//     { id: "RevNo", label: "Rev No" },
//     { id: "Remarks", label: "Remarks" },
//   ];

//   // Update the getPlantOptions function
//   const getPlantOptions = (schedule) => {
//     if (!schedule) return [];

//     // Base options for each schedule
//     const baseOptions = {
//       PGC: ["GEN 1", "GEN 2", "GEN 3", "GEN 4", "GEN 5"],
//       FCC: ["CCP1", "CCP2", "CCP3", "THVPL1", "THVPL2", "THVPL3"],
//       RFA: ["CCP1", "CCP2", "CCP3", "THVPL1", "THVPL2", "THVPL3"],
//       RFD: ["CCP1", "CCP2", "CCP3", "THVPL1", "THVPL2", "THVPL3"],
//       SI: ["SI", "RTC CDR", "RTC THV"],
//       Auxiliary: ["Aux CDR", "Aux THV"],
//     };

//     // Filter options based on user's access role
//     if (userAccessRole === "RC0") {
//       return baseOptions[schedule] || [];
//     } else if (userAccessRole === "CCP1") {
//       return ["CCP1"];
//     } else if (userAccessRole === "CCP2") {
//       return ["CCP2"];
//     } else if (userAccessRole === "CCP3") {
//       return ["CCP3"];
//     }

//     return baseOptions[schedule] || [];
//   };

//   // Update the getCurrentBlock function
//   const getCurrentBlock = () => {
//     const now = new Date();
//     // Get current IST hour and minute
//     const istHour = now.getHours();
//     const istMinute = now.getMinutes();
//     const totalMinutes = istHour * 60 + istMinute;

//     // If current time is between 00:00-00:15, it's Block 96
//     if (totalMinutes >= 0 && totalMinutes < 15) {
//       return 96;
//     }

//     // Otherwise calculate normally with 15-minute offset
//     return Math.floor((totalMinutes - 15) / 15) + 1; // SUBTRACT 15 then calculate
//   };

//   // Add this helper function to get the minimum allowed block for today
//   const getMinAllowedBlock = () => {
//     const currentBlock = getCurrentBlock();
//     return currentBlock + 4; // 1 hour = 4 blocks ahead
//   };

//   // Update the timeBlocks generation
//   const getTimeBlocks = () => {
//     const blocks = Array.from({ length: 96 }, (_, i) => {
//       const totalMinutes = i * 15 + 15;
//       const istHour = Math.floor(totalMinutes / 60);
//       const istMinute = totalMinutes % 60;

//       // Format time for display
//       const timeLabel = `${istHour.toString().padStart(2, "0")}:${istMinute
//         .toString()
//         .padStart(2, "0")}`;

//       return {
//         value: i + 1,
//         label: `Block ${i + 1} (${timeLabel})`,
//         istHour,
//         istMinute,
//         disabled: dateType === "today" && i + 1 < getMinAllowedBlock(),
//       };
//     });
//     return blocks;
//   };

//   // Update the fromBlock handler
//   const handleFromBlockChange = (e) => {
//     const newFromBlock = parseInt(e.target.value);
//     setFromBlock(newFromBlock);

//     // If toBlock is less than fromBlock, reset it
//     if (toBlock && parseInt(toBlock) < newFromBlock) {
//       setToBlock("");
//     }
//   };

//   // Update the toBlock handler
//   const handleToBlockChange = (e) => {
//     const newToBlock = parseInt(e.target.value);
//     if (fromBlock && newToBlock < parseInt(fromBlock)) {
//       alert("To Block must be greater than or equal to From Block");
//       return;
//     }
//     setToBlock(newToBlock);
//   };

//   const handleRemarksClick = (remarks, blockNumber) => {
//     setSelectedBlockRemarks(remarks || "No remarks available");
//     setSelectedBlockNumber(blockNumber);
//     setRemarksModalOpen(true);
//   };

//   const formatRemarksForDisplay = (remarks) => {
//     if (!remarks) return "No remarks";

//     // Split by newlines and show only the latest (last) remark
//     const lines = remarks.split("\n").filter((line) => line.trim());
//     if (lines.length === 0) return "No remarks";

//     // Get the last (most recent) remark
//     let latestRemark = lines[lines.length - 1].trim();

//     // Parse the remark to show only the text (remove timestamp and revision)
//     const parts = latestRemark.split(" - ");
//     if (parts.length >= 3) {
//       // Return just the remark text (after timestamp and revision)
//       return parts.slice(2).join(" - ");
//     }
//     return latestRemark;
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         sx={{
//           bgcolor: "background.default",
//           minHeight: "100vh",
//           // width: '100vw',
//           p: 3,
//           boxSizing: "border-box",
//         }}
//       >
//         {/* Header */}
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 3,
//             mt: 10,
//           }}
//         >
//           <img
//             src="/INFAlogo.jpg"
//             alt="IMFA Logo"
//             style={{ width: "100px", height: "50px" }}
//           />
//           <Typography
//             variant="h4"
//             sx={{
//               fontWeight: "bold",
//               color: "text.primary",
//               fontFamily: "Times New Roman",
//             }}
//           >
//             Schedule Entry
//             {selectedPlant && selectedSchedule
//               ? ` - ${selectedPlant} - ${selectedSchedule}`
//               : ""}
//           </Typography>
//           <img
//             src="/logo1.png"
//             alt="CMS Logo"
//             style={{ width: "100px", height: "50px" }}
//           />
//         </Box>

//         {/* Main Content */}
//         <Paper
//           sx={{
//             width: "100%",
//             bgcolor: "background.paper",
//             borderRadius: "12px",
//             overflow: "hidden",
//             boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
//           }}
//         >
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
//             {/* Main Row */}
//             <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
//               {/* Schedule and Plant Column */}
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 <FormControl sx={{ minWidth: 200 }}>
//                   <Select
//                     value={selectedSchedule}
//                     onChange={handleScheduleChange}
//                     displayEmpty
//                     size="small"
//                     sx={{
//                       fontFamily: "Times New Roman",
//                     }}
//                   >
//                     <MenuItem value="" disabled>
//                       Select Schedule
//                     </MenuItem>
//                     {allowedSchedules.map((schedule) => (
//                       <MenuItem
//                         key={schedule}
//                         value={schedule}
//                         sx={{ fontFamily: "Times New Roman" }}
//                       >
//                         {schedule}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <FormControl sx={{ minWidth: 200 }}>
//                   <Select
//                     value={selectedPlant}
//                     onChange={(e) => setSelectedPlant(e.target.value)}
//                     displayEmpty
//                     size="small"
//                     disabled={!selectedSchedule}
//                     sx={{
//                       fontFamily: "Times New Roman",
//                     }}
//                   >
//                     <MenuItem value="" disabled>
//                       Select Plant
//                     </MenuItem>
//                     {availablePlants.map((plant) => (
//                       <MenuItem
//                         key={plant}
//                         value={plant}
//                         sx={{ fontFamily: "Times New Roman" }}
//                       >
//                         {plant}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* Date Type Radio Column */}
//               <RadioGroup
//                 value={dateType}
//                 onChange={(e) => setDateType(e.target.value)}
//                 sx={{ ml: 2, fontFamily: "Times New Roman" }}
//               >
//                 <FormControlLabel
//                   value="today"
//                   control={<Radio />}
//                   label="Today"
//                   sx={{
//                     fontFamily: "Times New Roman",
//                   }}
//                 />
//                 <FormControlLabel
//                   value="tomorrow"
//                   control={<Radio />}
//                   label="Tomorrow"
//                   sx={{
//                     fontFamily: "Times New Roman",
//                   }}
//                 />
//               </RadioGroup>

//               {/* Block Selection Column */}
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 <FormControl sx={{ minWidth: 200 }}>
//                   <Select
//                     value={fromBlock}
//                     onChange={handleFromBlockChange}
//                     displayEmpty
//                     size="small"
//                     sx={{
//                       fontFamily: "Times New Roman",
//                     }}
//                   >
//                     <MenuItem value="" disabled>
//                       From Block
//                     </MenuItem>
//                     {timeBlocks.map((block) => (
//                       <MenuItem
//                         key={block.value}
//                         value={block.value}
//                         disabled={block.disabled}
//                       >
//                         {block.label}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <FormControl sx={{ minWidth: 200 }}>
//                   <Select
//                     value={toBlock}
//                     onChange={handleToBlockChange}
//                     displayEmpty
//                     size="small"
//                     disabled={!fromBlock}
//                     sx={{
//                       fontFamily: "Times New Roman",
//                     }}
//                   >
//                     <MenuItem value="" disabled>
//                       To Block
//                     </MenuItem>
//                     {timeBlocks
//                       .filter(
//                         (block) =>
//                           !fromBlock || block.value >= parseInt(fromBlock)
//                       )
//                       .map((block) => (
//                         <MenuItem
//                           key={block.value}
//                           value={block.value}
//                           disabled={block.disabled}
//                         >
//                           {block.label}
//                         </MenuItem>
//                       ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* MW and Rev No Column */}
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 <TextField
//                   type="number"
//                   label="MW"
//                   value={mw}
//                   onChange={(e) => setMW(e.target.value)}
//                   size="small"
//                   inputProps={{ step: "any" }}
//                   sx={{ width: 200 }}
//                   style={{ fontFamily: "Times New Roman" }}
//                 />
//                 <TextField
//                   type="number"
//                   label="Rev No"
//                   value={revNo}
//                   size="small"
//                   inputProps={{
//                     step: "any",
//                     readOnly: true, // ✅ Make the field read-only
//                   }}
//                   disabled={true} // ✅ Disable the field completely
//                   sx={{
//                     width: 200,
//                     fontFamily: "Times New Roman",
//                     "& .MuiInputBase-input.Mui-disabled": {
//                       WebkitTextFillColor: "#ffffff", // Keep text color visible even when disabled
//                       opacity: 1, // Maintain full opacity
//                     },
//                   }}
//                 />
//               </Box>

//               {/* Remarks and Save Button */}
//               <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
//                 <TextField
//                   label="Remarks"
//                   value={remark}
//                   onChange={(e) => setRemark(e.target.value)}
//                   size="small"
//                   multiline
//                   rows={4}
//                   sx={{ width: 300 }}
//                 />
//                 <Button
//                   variant="contained"
//                   onClick={handleAdd}
//                   disabled={isUpdating}
//                   startIcon={
//                     isUpdating ? (
//                       <CircularProgress size={20} color="inherit" />
//                     ) : null
//                   }
//                   sx={{
//                     height: 40,
//                     alignSelf: "flex-end",
//                     fontFamily: "Times New Roman",
//                   }}
//                 >
//                   {isUpdating ? "Saving..." : "Save"}
//                 </Button>
//               </Box>
//             </Box>

//             {/* Table */}
//             {selectedPlant && (
//               <Typography
//                 variant="h5"
//                 align="center"
//                 sx={{
//                   color: "#FFFFFF",
//                   fontWeight: "bold",
//                   mb: 1,
//                   fontFamily: "Times New Roman",
//                 }}
//               >
//                 {selectedPlant}
//               </Typography>
//             )}
//             <TableContainer
//               sx={{ maxHeight: "calc(100vh - 200px)", position: "relative" }}
//             >
//               {/* Plant Name Header above MW column */}
//               {selectedPlant && (
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "center",
//                     position: "relative",
//                   }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       color: "#FFFFFF",
//                       fontWeight: "bold",
//                       position: "absolute",
//                       left: "58%", // Adjust this value to align with MW column
//                       transform: "translateX(-50%)",
//                       mb: 1,
//                       fontFamily: "Times New Roman",
//                       fontSize: "1.2rem",
//                     }}
//                   >
//                     {`${selectedSchedule}${selectedPlant.replace(/\D/g, "")}`}
//                   </Typography>
//                 </Box>
//               )}

//               {isLoading && (
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: "rgba(0, 0, 0, 0.5)",
//                     zIndex: 1,
//                   }}
//                 >
//                   <CircularProgress />
//                 </Box>
//               )}
//               <Table stickyHeader size="small">
//                 <TableHead>
//                   <TableRow>
//                     {tableHeaders.map((header) => (
//                       <TableCell
//                         key={header.blockNo}
//                         sx={{
//                           backgroundColor: "#00B050",
//                           color: "#FFFFFF",
//                           fontWeight: 600,
//                           fontSize: "1.2rem",
//                           padding: "12px 16px",
//                           borderBottom: "2px solid #008040",
//                           "&:first-of-type": {
//                             borderTopLeftRadius: "4px",
//                           },
//                           "&:last-child": {
//                             borderTopRightRadius: "4px",
//                           },
//                           fontFamily: "Times New Roman",
//                         }}
//                       >
//                         {header.label}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {tableData.map((row) => (
//                     <TableRow
//                       key={row.blockNo}
//                       sx={{
//                         bgcolor: "background.paper",
//                         color: "text.primary",
//                         fontFamily: "Times New Roman",
//                         fontSize: "1.2rem",
//                       }}
//                     >
//                       <TableCell
//                         sx={{
//                           color: "text.primary",
//                           fontSize: "1.2rem",
//                           fontWeight: "600",
//                           fontFamily: "Times New Roman",
//                         }}
//                       >
//                         {row.BlockNo}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           color: "text.primary",
//                           fontSize: "1.2rem",
//                           fontWeight: "600",
//                           fontFamily: "Times New Roman",
//                         }}
//                       >
//                         {row.BlockTime}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           color: "text.primary",
//                           fontSize: "1.2rem",
//                           fontWeight: "600",
//                           fontFamily: "Times New Roman",
//                         }}
//                       >
//                         {row.MW}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           color: "text.primary",
//                           fontSize: "1.2rem",
//                           fontWeight: "600",
//                           fontFamily: "Times New Roman",
//                         }}
//                       >
//                         {row.RevNo === "NA" ? "NA" : row.RevNo}
//                       </TableCell>
//                       <TableCell
//                         sx={{
//                           color: "text.primary",
//                           fontSize: "1.2rem",
//                           fontWeight: "600",
//                           fontFamily: "Times New Roman",
//                           cursor: row.Remarks ? "pointer" : "default",
//                         }}
//                       >
//                         <Box
//                           sx={{ display: "flex", alignItems: "center", gap: 1 }}
//                         >
//                           <span>{formatRemarksForDisplay(row.Remarks)}</span>
//                           {row.Remarks && (
//                             <IconButton
//                               size="small"
//                               onClick={() =>
//                                 handleRemarksClick(row.Remarks, row.BlockNo)
//                               }
//                               sx={{ color: "primary.main" }}
//                             >
//                               <ExpandMoreIcon fontSize="small" />
//                             </IconButton>
//                           )}
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {!isLoading && tableData.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={6} align="center">
//                         No data available
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>
//         </Paper>

//         {/* Remarks Modal */}
//         <Dialog
//           open={remarksModalOpen}
//           onClose={() => setRemarksModalOpen(false)}
//           maxWidth="md"
//           fullWidth
//           PaperProps={{
//             sx: {
//               bgcolor: "background.paper",
//               color: "text.primary",
//             },
//           }}
//         >
//           <DialogTitle
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               bgcolor: "#00B050",
//               color: "#FFFFFF",
//               fontFamily: "Times New Roman",
//             }}
//           >
//             <span>Remarks History - Block {selectedBlockNumber}</span>
//             <IconButton
//               onClick={() => setRemarksModalOpen(false)}
//               sx={{ color: "#FFFFFF" }}
//             >
//               <CloseIcon />
//             </IconButton>
//           </DialogTitle>
//           <DialogContent sx={{ mt: 2 }}>
//             <Box
//               sx={{
//                 fontFamily: "Times New Roman",
//                 fontSize: "1.1rem",
//                 lineHeight: 1.6,
//               }}
//             >
//               {selectedBlockRemarks
//                 .split("\n")
//                 .filter((line) => line.trim())
//                 .map((line, index) => {
//                   // Parse the line parts
//                   const parts = line.trim().split(" - ");
//                   const timestamp = parts[0];
//                   const revision = parts[1] || ""; // This will now contain "Rev(X)"
//                   const remarkText = parts.slice(2).join(" - ");

//                   return (
//                     <Box
//                       key={index}
//                       sx={{
//                         mb: 1,
//                         p: 1,
//                         bgcolor:
//                           index % 2 === 0
//                             ? "rgba(0,176,80,0.1)"
//                             : "transparent",
//                         borderRadius: 1,
//                       }}
//                     >
//                       <Typography
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           color: "text.secondary",
//                           fontSize: "0.9rem",
//                           mb: 0.5,
//                         }}
//                       >
//                         <span>{timestamp}</span>
//                         <span style={{ color: "#00B050", fontWeight: "bold" }}>
//                           {revision}
//                         </span>
//                       </Typography>
//                       <Typography>{remarkText}</Typography>
//                     </Box>
//                   );
//                 })}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button
//               onClick={() => setRemarksModalOpen(false)}
//               variant="outlined"
//               sx={{ fontFamily: "Times New Roman" }}
//             >
//               Close
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </ThemeProvider>
//   );
// }

// export default SheduleEntry;
