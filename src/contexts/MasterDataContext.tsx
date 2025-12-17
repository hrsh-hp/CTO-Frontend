
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { 
  OFFICER_HIERARCHY as FALLBACK_HIERARCHY, 
  DESIGNATIONS as FALLBACK_DESIGNATIONS,
  MAKES as FALLBACK_MAKES,
  REASONS as FALLBACK_REASONS,
  IPS_COMPANIES,
  IPS_MODULES
} from '../constants';
import type { OfficerNode } from '../types';

// Helper interfaces for flat lists with relationships
export interface FlatCSI {
  id?: string | number;
  name: string;
  parentOfficer: string;
}

export interface FlatSI {
  id?: string | number;
  name: string;
  parentCSI: string;
  parentOfficer: string;
}

export interface FlatStation {
  id?: string | number;
  code: string;
  parentSI: string; // New field
  parentCSI: string;
  parentOfficer: string;
}

interface MasterDataState {
  officerHierarchy: OfficerNode[];
  designations: string[];
  makes: string[];
  reasons: string[];
  
  // Raw Data with IDs
  rawDesignations: { id: number; title: string }[];
  rawMakes: { id: number; name: string }[];
  rawReasons: { id: number; text: string }[];

  // Intelligent Flat Lists (with lineage)
  flatOfficers: string[];
  flatOfficersList: { id?: string | number; name: string }[]; // New list with IDs
  flatCSIs: FlatCSI[];
  flatSIs: FlatSI[]; // New flat list for Disconnection Form
  flatStations: FlatStation[];

  // IPS Specific
  ipsModules: string[];
  ipsCompanies: string[];
  
  loading: boolean;
  source: 'API' | 'CONSTANTS';
  refreshData: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataState | undefined>(undefined);

export const MasterDataProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [data, setData] = useState({
    officerHierarchy: FALLBACK_HIERARCHY,
    designations: FALLBACK_DESIGNATIONS,
    makes: FALLBACK_MAKES,
    reasons: FALLBACK_REASONS,
    rawDesignations: [] as { id: number; title: string }[],
    rawMakes: [] as { id: number; name: string }[],
    rawReasons: [] as { id: number; text: string }[],
    loading: true,
    source: 'CONSTANTS' as 'API' | 'CONSTANTS',
  });

  const refreshData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      console.log("🔌 Attempting to fetch Master Data from Django API...");

      // Parallel fetch for speed
      const [hierarchyRes, masterRes] = await Promise.all([
        fetch('/api/office/hierarchy/'),
        fetch('/api/office/master-data/')
      ]);

      if (hierarchyRes.ok && masterRes.ok) {
        const hierarchyData = await hierarchyRes.json();
        const masterData = await masterRes.json();

        console.log("✅ API Connection Successful! Using Live Database Data.");

        setData({
          officerHierarchy: hierarchyData.length > 0 ? hierarchyData : FALLBACK_HIERARCHY,
          designations: masterData.designations?.length ? masterData.designations.map((d: any) => d.title) : FALLBACK_DESIGNATIONS,
          makes: masterData.makes?.length ? masterData.makes.map((m: any) => m.name) : FALLBACK_MAKES,
          reasons: masterData.reasons?.length ? masterData.reasons.map((r: any) => r.text) : FALLBACK_REASONS,
          rawDesignations: masterData.designations || [],
          rawMakes: masterData.makes || [],
          rawReasons: masterData.reasons || [],
          loading: false,
          source: 'API'
        });
      } else {
        throw new Error(`API Status: ${hierarchyRes.status} / ${masterRes.status}`);
      }
    } catch (error) {
      console.warn("⚠️ API Connection Failed or Refused. Using Fallback Constants.", error);
      setData(prev => ({ ...prev, loading: false, source: 'CONSTANTS' }));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute "Universal Lists" from the hierarchy tree
  const derived = useMemo(() => {
    const h = data.officerHierarchy;
    
    const flatOfficers: string[] = h.map(o => o.name);
    const flatOfficersList = h.map(o => ({ id: o.id, name: o.name }));
    
    const flatCSIs: FlatCSI[] = [];
    const flatSIs: FlatSI[] = [];
    const flatStations: FlatStation[] = [];

    // Defensive check to ensure hierarchy is iterable
    if (Array.isArray(h)) {
        h.forEach(officer => {
          if (officer.csis && Array.isArray(officer.csis)) {
              officer.csis.forEach(csi => {
                // Add to flat CSI list
                flatCSIs.push({
                  id: csi.id,
                  name: csi.name,
                  parentOfficer: officer.name
                });

                if (csi.sis && Array.isArray(csi.sis)) {
                    // Loop through SIs (New Layer)
                    csi.sis.forEach(si => {
                        flatSIs.push({
                            id: si.id,
                            name: si.name,
                            parentCSI: csi.name,
                            parentOfficer: officer.name
                        });

                        // Loop through Stations
                        // Handle potential API variance where stations might be objects or strings
                        if (si.stations && Array.isArray(si.stations)) {
                            si.stations.forEach(stationData => {
                                // Check if stationData is string or object
                                const stationCode = typeof stationData === 'string' ? stationData : (stationData as any).code || (stationData as any).name;
                                const stationId = typeof stationData === 'object' ? (stationData as any).id : undefined;
                                
                                if (stationCode) {
                                    flatStations.push({
                                        id: stationId,
                                        code: stationCode,
                                        parentSI: si.name,
                                        parentCSI: csi.name, 
                                        parentOfficer: officer.name
                                    });
                                }
                            });
                        }
                    });
                }

                // Loop through SIs (New API Structure)
                if (csi.si_units && Array.isArray(csi.si_units)) {
                    csi.si_units.forEach(si => {
                        flatSIs.push({
                            id: si.id,
                            name: si.name,
                            parentCSI: csi.name,
                            parentOfficer: officer.name
                        });

                        // If the new structure includes stations inside si_units
                        if (si.stations && Array.isArray(si.stations)) {
                             si.stations.forEach((station: any) => {
                                // Handle both string codes and object stations
                                const code = typeof station === 'string' ? station : station.code || station.name;
                                const stationId = typeof station === 'object' ? station.id : undefined;
                                if (code) {
                                    flatStations.push({
                                        id: stationId,
                                        code: code,
                                        parentSI: si.name,
                                        parentCSI: csi.name,
                                        parentOfficer: officer.name
                                    });
                                }
                            });
                        }
                    });
                }

                // Handle direct stations under CSI (if any)
                if (csi.stations && Array.isArray(csi.stations)) {
                     csi.stations.forEach((station: any) => {
                        const code = typeof station === 'string' ? station : station.code || station.name;
                        const stationId = typeof station === 'object' ? station.id : undefined;
                        if (code) {
                            flatStations.push({
                                id: stationId,
                                code: code,
                                parentSI: '', // No SI parent
                                parentCSI: csi.name,
                                parentOfficer: officer.name
                            });
                        }
                    });
                }
              });
          }
        });
    }
    
    return {
      flatOfficers,
      flatOfficersList,
      flatCSIs,
      flatSIs,
      flatStations,
      ipsModules: IPS_MODULES, 
      ipsCompanies: IPS_COMPANIES
    };
  }, [data.officerHierarchy]);

  const value = {
    ...data,
    ...derived,
    refreshData
  };

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>;
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) throw new Error("useMasterData must be used within MasterDataProvider");
  return context;
};
