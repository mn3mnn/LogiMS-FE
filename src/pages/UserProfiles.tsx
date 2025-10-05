import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import DriverFilesCard from "../components/UserProfile/DriverFilesCard";
import PageMeta from "../components/common/PageMeta";
import { useDriverProfile } from "../hooks/useDriverProfile";

export default function UserProfiles() {
  const driverId = 1117; // You can make this dynamic or get from URL params
  const { data: driverData } = useDriverProfile(driverId);

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
          <UserInfoCard />
          {driverData && <DriverFilesCard driverData={driverData as any} />}
          
          {/* <UserAddressCard /> */}
        </div>
      </div>
    </>
  );
}
