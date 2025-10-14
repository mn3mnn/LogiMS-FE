import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import config from '../config/env';


interface Contract {
  id: number;
  driver_id: number;
  contract_number: string;
  issue_date: string;
  expiry_date: string;
  notes: string;
  file?: string;
  created_at: string;
  updated_at: string;
}

interface ContractsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contract[];
}

interface UploadContractData {
  driver_id: string;
  contract_number: string;
  issue_date: string;
  expiry_date: string;
  notes: string;
  file: File;
}

const fetchContracts = async (page: number = 1, token: string) => {
  const { data } = await axios.get<ContractsResponse>(`${config.API_BASE_URL}/contracts/`, {
    headers: {
      Authorization: `Token ${token}`,
      accept: 'application/json'
    },
    params: {
      page: page
    },
  });
  
  return data;
};

const uploadContract = async (contractData: UploadContractData, token: string) => {
  const formData = new FormData();
  formData.append("driver_id", contractData.driver_id);
  formData.append("contract_number", contractData.contract_number);
  formData.append("issue_date", contractData.issue_date);
  formData.append("expiry_date", contractData.expiry_date);
  formData.append("notes", contractData.notes);
  formData.append("file", contractData.file);

  const { data } = await axios.post("http://localhost:8000/api/v1/contracts/", formData, {
    headers: {
      Authorization: `Token ${token}`,
      accept: 'application/json'
    },
  });
  
  return data;
};

export const useContracts = (page: number = 1, refreshKey?: number) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["contracts", page, refreshKey],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchContracts(page, token);
    },
    enabled: !!token,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadContract = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: (contractData: UploadContractData) => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return uploadContract(contractData, token);
    },
    onSuccess: () => {
      // Invalidate and refetch contracts data
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};

export type { Contract, UploadContractData };