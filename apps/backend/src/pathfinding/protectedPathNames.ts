// Add protected protected nodes here if you want
const chestnutHillParkingProc: string[] = [
  "Lot A1",
  "Lot B1",
  "Lot C1",
  "South Entrance",
  "West Entrance",
];
const chestnutHillHospitalProc: string[] = [
  "South Entrance",
  "West Entrance",
  "Reception Desk",
  "Suite 100 Reception Desk",
  "Suite 130 Reception Desk",
  "Suite 102B Reception Desk",
];
const patriotPlaceParkingProc: string[] = [
  "Patriot Lot 22C",
  "Lot 23B",
  "22 Patriot Place Entrance",
  "20 Patriot Place Entrance",
];
const patriotPlaceHospitalProc: string[] = [
  "P20 F1 SW Corner Entrance",
  "P20 F1 SW Side Entrance",
  "P22 F2 Patriot 22 Entrance West",
  "P22 F3 Elevator 2",
  "P22 F4 Elevator 2",
  "P20 F1 Check-In Reception",
  "P20 F1 Elevator 1",
  "P22 F3 Check-In Desk",
  "P22 F4 Check-In Desk",
];
const faulknerBelkinHospitalProc: string[] = [
  "2004 Parking Entrance",
  "Faulkner Information Desk",
  "1975 Parking Entrance",
  "Belkin Lobby",
  "Faulkner Information Desk",
];

const mainCampusProc: string[] = [
  "MC Garage Entrance",
  "MC Entrance 1",
  "MC Entrance 2",
  "MC Lobby 1",
  "MC Reception",
];

export function getProtectedNodes(mapLocation: string) {
  switch (mapLocation) {
    case "Chestnut Hill Parking Lot":
      return chestnutHillParkingProc;
    case "Chestnut Hill Hospital":
      return chestnutHillHospitalProc;
    case "Patriot Place Parking Lot":
      return patriotPlaceParkingProc;
    case "Patriot Place Hospital":
      return patriotPlaceHospitalProc;
    case "Faulkner-Belkin Hospital Map":
      return faulknerBelkinHospitalProc;
    case "Main Campus":
      return mainCampusProc;
    default:
      return [""];
  }
}
