
export type ReportStatus = 'Open' | 'Resolved';

// --- Master Data Interfaces ---
export interface StationNode {
  id?: string | number;
  code: string;
  name: string;
}

export interface SINode {
  id?: string | number;
  name: string; // e.g., "SI ADI", "SI VTA"
  stations: (string | StationNode)[]; // Station Codes
}

export interface CSINode {
  id?: string | number;
  name: string;
  sis?: SINode[]; // Changed from direct stations to SIs
  si_units?: SINode[];
  stations?: (string | StationNode)[];
}

export interface OfficerNode {
  id?: string | number;
  name: string;
  csis: CSINode[];
}

export interface FailureReport {
  id: string;
  type: 'failure';
  // Personal / Location
  name: string;
  date: string; // YYYY-MM-DD
  sectionalOfficer: string;
  csi: string;
  designation: string;
  postingStationCode: string;
  toLocation: string;
  route: string;
  
  // Failure Details
  make: 'Ravel' | 'Vighnharta';
  failureDateTime: string;
  reason: string[]; 
  remarks: string;
  amc: 'Yes' | 'No';
  warranty: 'Yes' | 'No';
  
  // Meta
  status: ReportStatus;
  submittedAt: string;
}

export interface RelayRoomLog {
  id: string;
  type: 'relayRoom';
  // Personal Details
  name: string;
  designation: string;
  stationPosted: string;
  sectionalOfficer: string;
  csi: string;
  
  // Log Details
  date: string;
  location: string;
  openingTime: string;
  closingTime: string;
  
  // Auth Details
  snOpening: string;
  snClosing: string;
  openingCode: string;
  remarks: string;
  
  submittedAt: string;
}

export interface MaintenanceReport {
  id: string;
  type: 'maintenance';
  name: string;
  designation: string;
  stationPosted: string;
  date: string;
  sectionalOfficer: string;
  csi: string;
  maintenanceType: string;
  
  assetNumbers: string; // Point Nos, Signal Nos, Gate Nos
  section: string;
  workDescription: string; // What was done
  remarks: string;
  submittedAt: string;
}

export interface ACFailureReport {
  id: string;
  type: 'ac';
  name: string;
  designation: string;
  sectionalOfficer: string;
  csi: string;
  
  // AC Details
  date: string; // Reporting Date
  locationCode: string; // Station/Location faulty at
  totalACUnits: number;
  acType: 'Split' | 'Window';
  totalFailCount: string; // 1, 2, ... All
  failureDateTime: string;
  underWarranty: 'Yes' | 'No';
  underAMC: 'Yes' | 'No';
  remarks: string;

  submittedAt: string;
}

export interface MovementReport {
  id: string;
  type: 'movement';
  date: string;
  name: string;
  designation: string; // Combined e.g. "JE/VTA"
  sectionalOfficer: string;
  csi: string;
  
  moveFrom: string;
  moveTo: string;
  workDone: string;
  
  submittedAt: string;
}

export interface JPCReport {
  id: string;
  type: 'jpc';
  station: string;
  totalPoints: number;
  inspectedToday: number;
  jpcDate: string; // JPC Done on
  totalInspectedCum: number; // Cumulated
  pendingPoints: number;
  inspectionBy: 'SI' | 'CSI';
  inspectorName: string;
  submittedAt: string;
}

export interface IPSModuleEntry {
  id: string;
  moduleType: string;
  company: string;
  qtyDefective: number;        // Def.
  qtySpare: number;            // Spare
  qtySpareAMC: number;         // Spare mod under AMC/ARC
  qtyDefectiveAMC: number;     // Def mod under AMC/ARC
}

export interface IPSReport {
  id: string;
  type: 'ips';
  // Week Details
  submissionDate: string; // Must be Monday
  weekFrom: string;
  weekTo: string;
  csi: string;
  remarks: string;
  
  // Data
  entries: IPSModuleEntry[];
  
  submittedAt: string;
}

// --- Disconnection Report Interfaces ---

export interface DisconnectionCounts {
  d: number; // Disconnection / Duration?
  a: number; // Allowed / Authority?
  n: number; // Not Allowed / Nil?
}

export interface DisconnectionEntry {
  id: string;
  siName: string; // The row identifier
  catA: DisconnectionCounts; // Replacement of Gear
  catB: DisconnectionCounts; // Engg Work
  catC: DisconnectionCounts; // Maintenance
  catD: DisconnectionCounts; // Failure
}

export interface DisconnectionReport {
  id: string;
  type: 'disconnection';
  date: string;
  sectionalOfficer: string;
  csi: string;
  entries: DisconnectionEntry[];
  submittedAt: string;
}

export type AnyReport = FailureReport | RelayRoomLog | MaintenanceReport | IPSReport | ACFailureReport | DisconnectionReport | MovementReport | JPCReport;

export interface FilterState {
  sectionalOfficer: string;
  csi: string;
  stationCode: string;
  route: string;
  make: string;
  reason: string;
  amc: string;
  warranty: string;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export const INITIAL_FILTERS: FilterState = {
  sectionalOfficer: '',
  csi: '',
  stationCode: '',
  route: '',
  make: '',
  reason: '',
  amc: '',
  warranty: '',
  dateRangeStart: '',
  dateRangeEnd: '',
};
