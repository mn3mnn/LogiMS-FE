import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import config from '../config/env';


interface Contract {
  id: number;
  driver_id: number;
  file: string;
  notes: string;
  issue_date: string;
  expiry_date: string;
  contract_number: string;
}

interface License {
  id: number;
  driver_id: number;
  file: string;
  notes: string;
  issue_date: string;
  expiry_date: string;
  license_number: string;
  license_type: string;
}

interface NationalIdDoc {
  id: number;
  driver_id: number;
  file: string;
  notes: string;
  issue_date: string;
  expiry_date: string;
}

interface VehicleLicense {
  id: number;
  driver_id: number;
  file: string;
  notes: string;
  issue_date: string;
  expiry_date: string;
  license_number: string;
  license_plate: string;
  license_type: string;
  vehicle_type: string;
}

interface DriverProfile {
  id: number;
  first_name: string;
  last_name: string;
  nid: string | null;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
  company_name: string;
  contracts: Contract[];
  license: License | null;
  national_id_doc: NationalIdDoc | null;
  vehicle_license: VehicleLicense | null;
  created_at: string;
  updated_at: string;
  insurance: number;
  agency_share: number;
}

const fetchDriverProfile = async (driverId: number, token: string) => {
  const { data } = await axios.get<DriverProfile>(`${config.API_BASE_URL}/v1/drivers/${driverId}/`, {
    headers: {
      Authorization: `Token ${token}`,
      accept: 'application/json'
    },
  });
  
  return data;
};

export const useDriverProfile = (driverId: number) => {
  const { token } = useAuth();

  return useQuery<DriverProfile>({
    queryKey: ["driverProfile", driverId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchDriverProfile(driverId, token);
    },
    enabled: !!driverId && !!token,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export type { DriverProfile, Contract, License, NationalIdDoc, VehicleLicense };