
export type ReportStatus = 'Open' | 'Resolved';

// --- Master Data Interfaces ---
export interface StationNode {
  code: string;
  name: string;
}

export interface CSINode {
  name: string;
  stations: string[]; // Station Codes
}

export interface OfficerNode {
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
  // Personal Details
  name: string;
  designation: string;
  stationPosted: string;
  sectionalOfficer: string;
  csi: string;
  date: string;

  // Work Details
  stationMaintained: string;
  maintenanceType: string;
  workDescription: string;
  remarks: string;

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

export type AnyReport = FailureReport | RelayRoomLog | MaintenanceReport | IPSReport;

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