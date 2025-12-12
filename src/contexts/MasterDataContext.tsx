import React, { createContext, useContext, useEffect, useState, useMemo,  } from 'react';
import { 
  OFFICER_HIERARCHY as FALLBACK_HIERARCHY, 
  DESIGNATIONS as FALLBACK_DESIGNATIONS,
  MAKES as FALLBACK_MAKES,
  REASONS as FALLBACK_REASONS,
  IPS_COMPANIES,
  IPS_MODULES
} from '../constants';
import type { OfficerNode ,} from '../types';
import type { ReactNode ,PropsWithChildren } from 'react';

// Helper interfaces for flat lists with relationships
export interface FlatCSI {
  name: string;
  parentOfficer: string;
}

export interface FlatStation {
  code: string;
  parentCSI: string;
  parentOfficer: string;
}

interface MasterDataState {
  officerHierarchy: OfficerNode[];
  designations: string[];
  makes: string[];
  reasons: string[];
  
  // Intelligent Flat Lists (with lineage)
  flatOfficers: string[];
  flatCSIs: FlatCSI[];
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
  // This satisfies the requirement: "When hierarchy received, put data accordingly"
  // It flattens the tree so we can list ALL stations or ALL CSIs if needed.
  const derived = useMemo(() => {
    const h = data.officerHierarchy;
    
    const flatOfficers: string[] = h.map(o => o.name);
    
    const flatCSIs: FlatCSI[] = [];
    const flatStations: FlatStation[] = [];

    h.forEach(officer => {
      officer.csis.forEach(csi => {
        // Add to flat CSI list
        flatCSIs.push({
          name: csi.name,
          parentOfficer: officer.name
        });

        // Add to flat Station list
        if (Array.isArray(csi.stations)) {
          csi.stations.forEach(stationCode => {
            flatStations.push({
              code: stationCode,
              parentCSI: csi.name,
              parentOfficer: officer.name
            });
          });
        }
      });
    });
    
    console.log(`📊 Master Data Processed: ${flatOfficers.length} Officers, ${flatCSIs.length} CSIs, ${flatStations.length} Stations`);
    
    return {
      flatOfficers,
      flatCSIs,
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