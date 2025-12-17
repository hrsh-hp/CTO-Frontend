
import type { FailureReport, RelayRoomLog, MaintenanceReport, IPSReport, ACFailureReport, OfficerNode } from './types';

// --- Master Data Hierarchy ---
// Updated Structure: Officer -> CSI -> SI -> Stations
export const OFFICER_HIERARCHY: OfficerNode[] = [
  {
    name: 'DSTE I',
    csis: [
      { 
        name: 'ADI', 
        sis: [
          { name: 'ADI RRI', stations: ['ADI'] },
          { name: 'SI VTA', stations: ['VAT', 'GER'] },
          { name: 'SI ASV', stations: ['ASV', 'BJD'] }, // Added ASV for demo
          { name: 'SI HMT', stations: ['HMT'] } 
        ]
      },
      { 
        name: 'SBI', 
        sis: [
          { name: 'SI SBI', stations: ['SBI'] },
          { name: 'SI SHB', stations: ['SHB', 'KHDB'] },
          { name: 'SI KLL', stations: ['KLL', 'JKA', 'CLDY', 'CDK'] }
        ]
      }
    ]
  },
  {
    name: 'DSTE II',
    csis: [
      { 
        name: 'VG', 
        sis: [
          { name: 'VG RRI', stations: ['VG'] },
          { name: 'SI SUNR', stations: ['SUNR'] },
          { name: 'SI JTN', stations: ['JTN'] }
        ]
      },
      { 
        name: 'MSH', 
        sis: [
          { name: 'MSH RRI', stations: ['MSH'] },
          { name: 'SI UJA', stations: ['UJA'] },
          { name: 'SI KMLI', stations: ['KMLI'] }
        ]
      }
    ]
  },
  {
    name: 'ADSTE ADI',
    csis: [
      { 
        name: 'GIM', 
        sis: [
          { name: 'SI GIM', stations: ['GIM'] },
          { name: 'SI BCOB', stations: ['BCOB'] },
          { name: 'SI SIOB', stations: ['SIOB'] }
        ]
      }
    ]
  },
  {
    name: 'ADSTE DHG',
    csis: [
      { 
        name: 'DHG', 
        sis: [
          { name: 'SI DHG', stations: ['DHG'] }
        ]
      },
      { 
        name: 'MALB', 
        sis: [
          { name: 'SI MALB', stations: ['MALB'] },
          { name: 'SI FL', stations: ['FL'] },
          { name: 'SI HALV', stations: ['HALV'] }
        ]
      },
      {
        name: 'PNU',
        sis: [
          { name: 'PNU RRI', stations: ['PNU'] },
          { name: 'SI DISA', stations: ['DISA'] }
        ]
      }
    ]
  },
  {
    name: 'ADSTE RDHP',
    csis: [
      {
        name: 'RDHP',
        sis: [
          { name: 'SI RDHP', stations: ['RDHP'] },
          { name: 'SI BLDI', stations: ['BLDI'] }
        ]
      }
    ]
  }
];

// Helper to get flat lists for backward compatibility or simple lookups
// Note: These flat lists are now simple aggregations. The Context handles the intelligent lineage.
export const SECTIONAL_OFFICERS = OFFICER_HIERARCHY.map(o => o.name);
export const CSIS = OFFICER_HIERARCHY.flatMap(o => o.csis.map(c => c.name));
// Flatten all SIs to get all stations
export const STATION_CODES = OFFICER_HIERARCHY.flatMap(o => 
  o.csis.flatMap(c => 
    (c.sis || []).flatMap(s => s.stations.map(st => typeof st === 'string' ? st : st.code))
  )
);

// --- Other Constants ---

export const DESIGNATIONS = ['CSI', 'SSE', 'JE', 'ESM-I', 'ESM-II', 'ESM-III', 'Helper'];
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

// Strict list as requested
export const MAINTENANCE_TYPES = [
  'Point Maintenance',
  'Signal Maintenance',
  'IPS/Power Supply',
  'LC Gate Maintenance'
];

// --- Movement Form Constants ---
export const MOVEMENT_DESIGNATIONS = ['CSI', 'SSE', 'JE'];

export const MOVEMENT_REASONS = [
  'Scheduled Inspection',
  'Outdoor Maintenance',
  'Indoor Maintenance',
  'AMC Visit',
  'Attending Failure',
  'Post Failure Analysis or troubleshooting',
  'System improvements like ferule, earthing, fuse related work',
  'Joint work with engineering',
  'JPC deficiency compliance',
  'S&T works survey, inspection, planning related work',
  'LED, charger or component replacement work',
  'Joint survey, inspection with other departments',
  'Other(Specify in remarks)'
];

export const MOVEMENT_STATIONS = [
  'VTA', 'KKEC', 'ADI RRI', 'SBI A', 'SBIB', 'SBID', 'KHD', 'GNC', 'AJM', 'KLL', 'KADI', 'JUL', 'DNW', 'UMN', 'JDN', 'MSH', 'BHU', 'UJA', 'KMLI', 'SID', 'DRW', 'CHP', 'UM', 'PNU', 'SBI-E', 'SBI-F', 'CLDY \'A\'', 'CLDY \'B\'', 'ABD', 'GGM', 'SAU', 'CE', 'VCN', 'JKA', 'VG', 'JN', 'SADL', 'BJAN', 'JTX', 'VSV', 'HPR', 'DHG', 'GSY', 'CUL', 'SUK', 'HVD', 'DHNL', 'DVY', 'KHXB', 'WDHR', 'MALB', 'SRBR', 'KATR', 'SIOB', 'VONDH', 'BCOB', 'CHIB', 'BMSR', 'GIMC', 'GIM-B', 'GIM-A', 'SRVA', 'AI', 'AJE', 'RUT', 'KEMA', 'BHUJ', 'SUKP', 'DSLP', 'SNSR', 'MTLA', 'QTR', 'NLC', 'NLY', 'CDQ', 'CDS', 'DISA', 'LW', 'BLDI', 'JSI', 'DKW', 'DEOR', 'MITA', 'BAH', 'DVGM', 'RDHP', 'PLE', 'VRX', 'VU', 'CASA', 'SNLR', 'GM', 'PFL', 'LAA', 'AAR', 'BUBR', 'PDF', 'KYG', 'COE', 'SIA', 'LKZ', 'LCH', 'JTN', 'KTRD', 'DTJ', 'BKD', 'JKS', 'DHJ', 'RUJ', 'PTN', 'KHPR', 'KASA', 'WAAD', 'SIHI', 'ASV', 'NRD', 'DBO', 'NHM', 'RKH', 'TOD', 'PRJ', 'SNSN', 'HMT', 'VNG', 'VDG', 'KRU', 'VTDI', 'BHRJ', 'CSMA', 'IDAR', 'KDBM', 'VJF', 'Division office', 'Other'
];

export const JPC_STATIONS = [
    "VATVA", "KANKARIA", "ADISECA", "ADISECB", "ADISECC", "ADISECD", "SBIA", "SBIANZ", "SBIB", "SBID", "KHD", "GNC", "AJM", "KLL", "JUL", "DNW", "UMN", "JDN", "MSH", "BHU", "UJA", "KMLI", "SID", "DRW", "CHP", "UM", "PNU", "SBTE", "SBTF", "CLDYA", "CLDYB", "ABD", "GGM", "SAU", "CE", "VCN", "JKA", "VIRAMGAM", "JN", "SADL", "BAJN", "JTX", "VSV", "DHG", "GSY", "CUL", "SUK", "HVD", "DHNL", "DVY", "KHXB", "WDHR", "MALB", "SRBR", "KATR", "SIOB", "VOND", "BCOB", "CHIB", "BMSR", "GIMC", "GIMB", "GIMA", "AI", "AJE", "RUT", "KEMA", "BHUJ", "SHIRVA", "LCH", "JTN", "KTRD", "DTJ", "BKD", "JKS", "CDQ", "CDS", "DISA", "LW", "BHILDI", "JSI", "DKW", "DEOR", "MITA", "BAH", "DVGM", "RDHP", "PLE", "VRX", "VU", "CASA", "SNLR", "GM", "PFL", "LAA", "AAR", "BUBR", "PDF", "KYG", "COE", "SIA", "LKZ", "DHJ", "RUJ", "PTN", "KHPR", "KASA", "WAAD", "SIHI", "ASV", "NRD", "DBO", "NHM", "RKH", "TOD", "PRJ", "SNSN", "HMT", "VNG", "VDG", "KRU", "VTDI", "SUKP", "DSLP", "SNSR", "MTLA", "QTR", "NLC", "NLY", "KADI", "IDAR", "KDBM", "VJF", "BHRJ", "CSMA"
];

// IPS Constants
export const IPS_CSIS = CSIS; 

export const IPS_MODULES = [
  'SMR',
  'Inverter',
  'DC-DC Converter',
  'Transformer',
  'AVR/CVT',
  'CSU',
  'SM Status Monitoring Panel'
];

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
    name: 'Suresh Patel',
    designation: 'ESM-I',
    stationPosted: 'PNU',
    sectionalOfficer: 'ADSTE DHG',
    csi: 'PNU',
    date: '2023-10-28',
    maintenanceType: 'Signal Maintenance',
    section: 'PNU-DISA',
    assetNumbers: 'S-22, S-24',
    workDescription: 'Visibility check and lens cleaning.',
    remarks: 'All working fine.',
    submittedAt: new Date().toISOString()
  },
  {
    id: '7002',
    type: 'maintenance',
    name: 'Amit Shah',
    designation: 'ESM-II',
    stationPosted: 'ADI',
    sectionalOfficer: 'DSTE I',
    csi: 'ADI',
    date: '2023-10-29',
    maintenanceType: 'Point Maintenance',
    assetNumbers: 'Pt-101, Pt-102, Pt-103, Pt-104, Pt-105',
    section: 'ADI-GER',
    workDescription: 'Points cleaning and lubrication.',
    remarks: 'Points checked and lubricated.',
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
      }
    ]
  }
];

export const MOCK_AC_REPORTS: ACFailureReport[] = [
  {
    id: '9001',
    type: 'ac',
    name: 'Vikram Sarabhai',
    designation: 'JE',
    sectionalOfficer: 'DSTE I',
    csi: 'ADI',
    date: '2023-11-01',
    locationCode: 'ADI',
    totalACUnits: 4,
    acType: 'Split',
    totalFailCount: '1',
    failureDateTime: '2023-11-01T10:00',
    underWarranty: 'No',
    underAMC: 'Yes',
    remarks: 'Compressor faulty.',
    submittedAt: new Date().toISOString()
  }
];
