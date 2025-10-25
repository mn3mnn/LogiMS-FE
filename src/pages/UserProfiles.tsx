import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import DriverFilesCard from "../components/UserProfile/DriverFilesCard";
import PageMeta from "../components/common/PageMeta";
import { useDriverProfile } from "../hooks/useDriverProfile";
import { useParams } from "react-router"; // Add this import

export default function UserProfiles() { // Remove the id parameter
  const { id } = useParams<{ id: string }>(); // Get id from URL params
  
  // Use the id from URL params, fallback to a default if needed
  const driverId = id ? parseInt(id) : 0; // You can set a default or handle the null case
  
  const { data: driverData, isLoading, error } = useDriverProfile(driverId);

  const driver = driverData as any;

  // Handle loading and error states
  if (isLoading) return <div>Loading driver profile...</div>;
  if (error) return <div>Error loading driver profile</div>;
  if (!driverData) return <div>Driver not found</div>;

  return (
    <>
      <PageMeta
        title="Driver Profile Dashboard | LogiMS - Driver Management System"
        description="View driver profile information and documents"
      />
      <PageBreadcrumb pageTitle="Driver Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Driver Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard driverId={driverId} />
          <UserInfoCard 
            name={driver?.first_name} 
            lastName={driver?.last_name} 
            email={driver?.email} 
            phone={driver?.phone_number} 
            nid={driver?.nid} 
            uuid={driver?.uuid} 
            insurance={driver?.insurance}
            agency_share={driver?.agency_share}
          />
          {driverData && <DriverFilesCard driverData={driverData as any} />}
        </div>
      </div>
    </>
  );
}