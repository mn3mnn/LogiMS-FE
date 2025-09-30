export const fetchDrivers = async () => {
  const res = await fetch("http://localhost:8000/api/v1/drivers/");
  if (!res.ok) {
    throw new Error("Failed to fetch drivers");
  }
  return res.json();
};