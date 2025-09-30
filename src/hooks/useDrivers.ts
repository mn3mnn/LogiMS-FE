import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface DriversResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

const fetchDrivers = async (companyCode: string | null, page: number = 1) => {
  const params: any = {
    page: page 
  };

  if (companyCode && companyCode !== "All") {
    params.company_code = companyCode;
  }

  const { data } = await axios.get<DriversResponse>("http://localhost:8000/api/v1/drivers/", {
    headers: {
      Authorization: "Token f1a83e3f53f4aa7afcecc8398e5d328512c4d387",
      accept: 'application/json'
    },
    params: params,
  });
  
  return data;
};

export const useDrivers = (companyCode: string | null, page: number = 1, refreshKey?: number) => {
  return useQuery({
    queryKey: ["drivers", companyCode, page, refreshKey],
    queryFn: () => fetchDrivers(companyCode, page),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};