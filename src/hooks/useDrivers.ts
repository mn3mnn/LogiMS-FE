import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchDrivers = async (companyCode: string | null) => {
  const { data } = await axios.get("http://localhost:8000/api/v1/drivers/", {
    headers: {
      Authorization: "Token f1a83e3f53f4aa7afcecc8398e5d328512c4d387",
      accept: 'application/json'
    },
    params: companyCode && companyCode !== "All" ? { company_code: companyCode } : {},
  });
  return data;
};

export const useDrivers = (companyCode: string | null) => {
  return useQuery({
    queryKey: ["drivers", companyCode],
    queryFn: () => fetchDrivers(companyCode),
  });
};