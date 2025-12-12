
import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport, OfficerNode } from './types';

// --- Master Data Hierarchy ---
// This structure supports the flow: Sectional Officer -> CSI -> Stations
export const OFFICER_HIERARCHY: OfficerNode[] = [
  {
    name: 'DSTE I',
    csis: [
      { 
        name: 'ADI', 
        stations: ['ADI', 'MAN', 'VAT', 'GER', 'BJD'] 
      },
      { 
        name: 'SBI', 
        stations: ['SBI', 'KLL', 'JKA', 'KHDB', 'CLDY', 'CDK'] 
      }
    ]
  },
  {
    name: 'DSTE II',
    csis: [
      { 
        name: 'VG', 
        stations: ['VG', 'JTN', 'SUNR'] 
      },
      { 
        name: 'MSH', 
        stations: ['MSH', 'UJA', 'KMLI'] 
      }
    ]
  },
  {
    name: 'ADSTE ADI',
    csis: [
      { 
        name: 'GIM', 
        stations: ['GIM', 'BCOB', 'SIOB'] 
      }
    ]
  },
  {
    name: 'ADSTE DHG',
    csis: [
      { 
        name: 'DHG', 
        stations: ['DHG'] 
      },
      { 
        name: 'MALB', 
        stations: ['MALB', 'FL', 'HALV'] 
      },
      {
        name: 'PNU',
        stations: ['PNU', 'DISA']
      }
    ]
  },
  {
    name: 'ADSTE RDHP',
    csis: [
      {
        name: 'RDHP',
        stations: ['RDHP', 'BLDI']
      }
    ]
  }
];

export const SECTIONAL_OFFICERS = [
  'DSTE I', 
  'DSTE II', 
  'ADSTE ADI', 
  'ADSTE DHG'
];

export const CSIS = [
  'ADI', 
  'SBI', 
  'KLL', 
  'PNU', 
  'RDHP', 
  'VG', 
  'DHG'
];

export const DESIGNATIONS = ['CSI', 'SSE', 'JE'];
export const STATION_CODES = ['NDLS', 'CSMT', 'HWH', 'MAS', 'BCT', 'CNB', 'LKO', 'ADI', 'SBI', 'VG', 'DHG'];
export const ROUTES = ['A', 'B', 'D', 'D-SPL'];
export const MAKES = ['Ravel', 'Vighnharta'];

export const REASONS = [
  'Aspirating System Defective',
  'Heat & Smoke Multisensor Defective',
  'SMPS Defective',
  'MCP Defective',
  'Hooter/ Sounder Defective',
  'Mother Board Defective',
  'Flame Sensor Defective',
  'Battery Wiring Fault',
  'Power Supply PCB Defective',
  'Battery Defective',
  'System Software Defective'
];

export const RELAY_AUTH_CODES = [
  'INSP/ O',
  'INSP/ SSE',
  'AMC/ EI',
  'AMC/ UFSBI',
  'AMC/ DL',
  'AMC/ AFDAS',
  'REG/ MNT',
  'ANALYSIS',
  'SIG FAIL',
  'FAIL/ ANALYSIS',
  'MEGGER',
  'WORK/ CON',
  'WORK/ OL',
  'PREP WORK/ CON',
  'PREP WORK/ OL',
  'CIVIL/MNT',
  'ELECT/MNT',
  'MISC (Specify in Remarks)'
];

export const MAINTENANCE_TYPES = [
  'Routine Check',
  'Preventive Maintenance',
  'Corrective Maintenance',
  'Quarterly Inspection',
  'Joint Inspection',
  'Emergency Repair'
];

// IPS Constants
export const IPS_CSIS = [
  'SBI', 'SIOB', 'VG', 'BR-MSH', 'RDHP', 'GIM', 'PNU', 'ADI', 'N-MSH', 'MALB', 'DHG', 'KLL'
];

export const IPS_MODULES = [
  'SMR',
  'Inverter',
  'DC-DC Converter',
  'Transformer',
  'AVR/CVT',
  'CSU',
  'SM Status Monitoring Panel'
];

// Updated to match Excel Template exactly
export const IPS_COMPANIES = [
  'AMARARAJA',
  'HBL',
  'STATCON',
  'STATCON INERTIA',
  'SUKHILA'
];

export const MOCK_FAILURES: FailureReport[] = [
  {
    id: '1001',
    type: 'failure',
    name: 'Rajesh Kumar',
    date: '2023-10-15',
    sectionalOfficer: 'DSTE I',
    csi: 'ADI',
    designation: 'SSE',
    postingStationCode: 'ADI',
    toLocation: 'ADI',
    route: 'A',
    make: 'Ravel',
    failureDateTime: '2023-10-14T14:30',
    reason: ['Power Supply PCB Defective', 'Battery Defective'],
    remarks: 'UPS battery drained completely.',
    amc: 'Yes',
    warranty: 'No',
    status: 'Resolved',
    submittedAt: new Date().toISOString()
  },
  {
    id: '1002',
    type: 'failure',
    name: 'Vikram Singh',
    date: '2023-10-16',
    sectionalOfficer: 'ADSTE ADI',
    csi: 'SBI',
    designation: 'JE',
    postingStationCode: 'SBI',
    toLocation: 'SBI',
    route: 'B',
    make: 'Vighnharta',
    failureDateTime: '2023-10-16T09:15',
    reason: ['Heat & Smoke Multisensor Defective'],
    remarks: 'Smoke detector in Room 404 fluctuating.',
    amc: 'No',
    warranty: 'Yes',
    status: 'Open',
    submittedAt: new Date().toISOString()
  },
  {
    id: '1003',
    type: 'failure',
    name: 'Amit Patel',
    date: '2023-10-18',
    sectionalOfficer: 'DSTE II',
    csi: 'VG',
    designation: 'SSE',
    postingStationCode: 'VG',
    toLocation: 'VG',
    route: 'D-SPL',
    make: 'Ravel',
    failureDateTime: '2023-10-17T22:00',
    reason: ['Battery Wiring Fault'],
    remarks: 'Rat bite on main loop cable.',
    amc: 'Yes',
    warranty: 'No',
    status: 'Open',
    submittedAt: new Date().toISOString()
  },
  {
    id: '1004',
    type: 'failure',
    name: 'Suresh Raina',
    date: '2023-10-20',
    sectionalOfficer: 'ADSTE DHG',
    csi: 'DHG',
    designation: 'JE',
    postingStationCode: 'DHG',
    toLocation: 'DHG',
    route: 'A',
    make: 'Ravel',
    failureDateTime: '2023-10-20T08:00',
    reason: ['SMPS Defective', 'System Software Defective'],
    remarks: '',
    amc: 'Yes',
    warranty: 'No',
    status: 'Resolved',
    submittedAt: new Date().toISOString()
  }
];

export const MOCK_RELAY_LOGS: RelayRoomLog[] = [
  {
    id: '5001',
    type: 'relayRoom',
    name: 'Ravi Verma',
    designation: 'SSE',
    stationPosted: 'ADI',
    sectionalOfficer: 'ADSTE ADI',
    csi: 'ADI',
    date: '2023-10-25',
    location: 'ADI',
    openingTime: '10:00',
    closingTime: '11:30',
    snOpening: '42',
    snClosing: '43',
    openingCode: 'REG/ MNT',
    remarks: 'Routine cable check up.',
    submittedAt: new Date().toISOString()
  },
  {
    id: '5002',
    type: 'relayRoom',
    name: 'Anil Gupta',
    designation: 'JE',
    stationPosted: 'SBI',
    sectionalOfficer: 'DSTE I',
    csi: 'SBI',
    date: '2023-10-26',
    location: 'SBI',
    openingTime: '14:00',
    closingTime: '14:45',
    snOpening: '12',
    snClosing: '13',
    openingCode: 'SIG FAIL',
    remarks: 'Relay replacement.',
    submittedAt: new Date().toISOString()
  }
];

export const MOCK_MAINTENANCE_LOGS: MaintenanceReport[] = [
  {
    id: '7001',
    type: 'maintenance',
    name: 'Manoj Tiwari',
    designation: 'JE',
    stationPosted: 'PNU',
    sectionalOfficer: 'ADSTE DHG',
    csi: 'PNU',
    date: '2023-10-28',
    stationMaintained: 'PNU',
    maintenanceType: 'Routine Check',
    workDescription: 'Checked all smoke detectors in Control Room. Cleaning done.',
    remarks: 'All working fine.',
    submittedAt: new Date().toISOString()
  },
  {
    id: '7002',
    type: 'maintenance',
    name: 'Kishan Lal',
    designation: 'SSE',
    stationPosted: 'ADI',
    sectionalOfficer: 'DSTE I',
    csi: 'ADI',
    date: '2023-10-29',
    stationMaintained: 'ADI',
    maintenanceType: 'Preventive Maintenance',
    workDescription: 'Quarterly maintenance of Ravel Panel. Battery voltage checked.',
    remarks: 'Battery replacement recommended in next visit.',
    submittedAt: new Date().toISOString()
  }
];

export const MOCK_IPS_REPORTS: IPSReport[] = [
  {
    id: '8001',
    type: 'ips',
    submissionDate: '2023-10-30',
    weekFrom: '2023-10-23',
    weekTo: '2023-10-29',
    csi: 'ADI',
    remarks: 'Routine check complete.',
    submittedAt: new Date().toISOString(),
    entries: [
      {
        id: 'e1',
        moduleType: 'Inverter',
        company: 'STATCON',
        qtyDefective: 1,
        qtySpare: 0,
        qtySpareAMC: 2,
        qtyDefectiveAMC: 0
      },
       {
        id: 'e2',
        moduleType: 'SMR',
        company: 'HBL',
        qtyDefective: 0,
        qtySpare: 1,
        qtySpareAMC: 5,
        qtyDefectiveAMC: 1
      }
    ]
  }
];