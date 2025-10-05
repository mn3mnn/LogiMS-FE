import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
}

const fetchDriverProfile = async (driverId: number) => {
  const { data } = await axios.get<DriverProfile>(`http://localhost:8000/api/v1/drivers/${driverId}/`, {
    headers: {
      Authorization: "Token f1a83e3f53f4aa7afcecc8398e5d328512c4d387",
      accept: 'application/json'
    },
  });
  
  return data;
};

export const useDriverProfile = (driverId: number) => {
  return useQuery<DriverProfile>({
    queryKey: ["driverProfile", driverId],
    queryFn: () => fetchDriverProfile(driverId),
    enabled: !!driverId,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export type { DriverProfile, Contract, License, NationalIdDoc, VehicleLicense };
