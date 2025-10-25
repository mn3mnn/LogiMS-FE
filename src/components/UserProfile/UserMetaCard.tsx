import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useDriverProfile } from "../../hooks/useDriverProfile";
import EditDriverModal from "../modals/AddDriverModal";
import { useTranslation } from "react-i18next";

interface UserMetaCardProps {
  driverId?: number;
}

export default function UserMetaCard({ driverId = 1117 }: UserMetaCardProps) {
  const { t } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();
  const { data: driverData, isLoading, error } = useDriverProfile(driverId);
  
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">{t('userMetaCard.loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !driverData) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{t('userMetaCard.errors.loadFailed')}</p>
        </div>
      </div>
    );
  }

  // Type assertion to ensure driverData has the correct type
  const driver = driverData as any;
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src="/images/user/owner.jpg" alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {driver.first_name} {driver.last_name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {driver.company_name} {t('userMetaCard.driver')}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {driver.phone_number}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  driver.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {driver.is_active ? t('userMetaCard.status.active') : t('userMetaCard.status.inactive')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditDriverModal isOpen={isOpen} onClose={closeModal} onSave={handleSave} />
    </>
  );
}