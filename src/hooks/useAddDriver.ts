// hooks/useAddDriver.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8000/api/v1";

// -------------------- Interfaces --------------------
export interface DriverData {
  first_name: string;
  last_name: string;
  nid: string;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
}

export interface LicenseData {
  driver_id: number;
  file: string | File;
  notes: string;
  issue_date: string;
  expiry_date: string;
  license_number: string;
  license_type: string;
}

export interface NationalIdData {
  driver_id: number;
  file: string | File;
  notes: string;
  issue_date: string;
  expiry_date: string;
}

export interface VehicleLicenseData {
  driver_id: number;
  file: string | File;
  notes: string;
  issue_date: string;
  expiry_date: string;
  license_number: string;
  license_plate: string;
  license_type: string;
  vehicle_type: string;
}

export interface ContractData {
  driver_id: number;
  file: string | File;
  notes: string;
  issue_date: string;
  expiry_date: string;
  contract_number: string;
}

export interface AddDriverPayload {
  driverData: DriverData;
  licenseData?: Omit<LicenseData, "driver_id">;
  nationalIdData?: Omit<NationalIdData, "driver_id">;
  vehicleLicenseData?: Omit<VehicleLicenseData, "driver_id">;
  contractsData?: Omit<ContractData, "driver_id">[];
}

// -------------------- Helper Functions --------------------
const createFormData = (data: any, fileFields: string[]): FormData => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value === null || value === undefined || value === "") return;
    if (fileFields.includes(key) && value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

// -------------------- Hook Definition --------------------
export const useAddDriver = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // Dynamic headers
  const getHeaders = () => ({
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  });

  const getMultipartHeaders = () => ({
    Authorization: `Token ${token}`,
  });

  const addDriverMutation = useMutation({
    mutationFn: async (payload: AddDriverPayload) => {
      if (!token) throw new Error("User not authenticated");

      const {
        driverData,
        licenseData,
        nationalIdData,
        vehicleLicenseData,
        contractsData,
      } = payload;

      // Step 1: Create driver
      const driverResponse = await axios.post(
        `${API_BASE_URL}/drivers/`,
        driverData,
        { headers: getHeaders() }
      );

      const driver = driverResponse.data;
      const driverId = driver.id;
      console.log("✅ Driver created with ID:", driverId);

      // Step 2: Prepare documents to upload (only available)
      const documentPromises: Promise<any>[] = [];

      const addIfFileExists = (
        endpoint: string,
        data?: Record<string, any> | null
      ) => {
        if (!data || !data.file) return; // Skip if no file
        const formData = createFormData({ ...data, driver_id: driverId }, ["file"]);
        documentPromises.push(
          axios.post(`${API_BASE_URL}/${endpoint}/`, formData, {
            headers: getMultipartHeaders(),
          })
        );
      };

      addIfFileExists("licenses", licenseData);
      addIfFileExists("national-ids", nationalIdData);
      addIfFileExists("vehicle-licenses", vehicleLicenseData);

      if (contractsData && contractsData.length > 0) {
        contractsData.forEach((contract) => {
          if (!contract.file) return;
          const formData = createFormData({ ...contract, driver_id: driverId }, ["file"]);
          documentPromises.push(
            axios.post(`${API_BASE_URL}/contracts/`, formData, {
              headers: getMultipartHeaders(),
            })
          );
        });
      }

      // Step 3: Upload only available files
      const responses = await Promise.allSettled(documentPromises);
      const failed = responses.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.warn("⚠️ Some documents failed:", failed);
      }

      return { driver, responses };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      // Removed navigation to let the modal handle success
      console.log("✅ Driver added successfully - cache invalidated");
    },

    onError: (error: any) => {
      console.error("❌ Add driver failed:", error);
    },
  });

  return {
    addDriver: addDriverMutation.mutateAsync,
    isLoading: addDriverMutation.isPending,
    isSuccess: addDriverMutation.isSuccess,
    isError: addDriverMutation.isError,
    error: addDriverMutation.error,
    reset: addDriverMutation.reset,
  };
};