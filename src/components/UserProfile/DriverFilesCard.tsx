import { DriverProfile } from "../../hooks/useDriverProfile";
import { useTranslation } from "react-i18next";

interface DriverFilesCardProps {
  driverData: DriverProfile;
}

export default function DriverFilesCard({ driverData }: DriverFilesCardProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow && new Date(expiryDate) >= new Date();
  };

  const getStatusBadge = (expiryDate: string) => {
    if (isExpired(expiryDate)) {
      return (
        <span className="inline-flex rounded-full bg-red-100 bg-opacity-10 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
          {t('driverFilesCard.status.expired')}
        </span>
      );
    } else if (isExpiringSoon(expiryDate)) {
      return (
        <span className="inline-flex rounded-full bg-yellow-100 bg-opacity-10 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          {t('driverFilesCard.status.expiringSoon')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex rounded-full bg-green-100 bg-opacity-10 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          {t('driverFilesCard.status.active')}
        </span>
      );
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        {t('driverFilesCard.title')}
      </h4>
      
      <div className="space-y-6">
        {/* Contracts Section */}
        <div>
          <h5 className="mb-3 text-md font-medium text-gray-700 dark:text-gray-300">
            {t('driverFilesCard.sections.contracts', { count: driverData.contracts.length })}
          </h5>
          <div className="space-y-3">
            {driverData.contracts.map((contract) => (
              <div key={contract.id} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-800 dark:text-white">
                    {contract.contract_number}
                  </h6>
                  {getStatusBadge(contract.expiry_date)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">{t('driverFilesCard.fields.issueDate')}:</span> {formatDate(contract.issue_date)}
                  </div>
                  <div>
                    <span className="font-medium">{t('driverFilesCard.fields.expiryDate')}:</span> {formatDate(contract.expiry_date)}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">{t('driverFilesCard.fields.notes')}:</span> {contract.notes || t('driverFilesCard.noNotes')}
                  </div>
                </div>
                {contract.file && (
                  <div className="mt-3">
                    <a
                      href={contract.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t('driverFilesCard.buttons.viewContract')}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* License Section */}
        {driverData.license && (
          <div>
            <h5 className="mb-3 text-md font-medium text-gray-700 dark:text-gray-300">
              {t('driverFilesCard.sections.driverLicense')}
            </h5>
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-medium text-gray-800 dark:text-white">
                  {driverData.license.license_number} - {t('driverFilesCard.fields.type')} {driverData.license.license_type}
                </h6>
                {getStatusBadge(driverData.license.expiry_date)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.issueDate')}:</span> {formatDate(driverData.license.issue_date)}
                </div>
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.expiryDate')}:</span> {formatDate(driverData.license.expiry_date)}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">{t('driverFilesCard.fields.notes')}:</span> {driverData.license.notes || t('driverFilesCard.noNotes')}
                </div>
              </div>
              {driverData.license.file && (
                <div className="mt-3">
                  <a
                    href={driverData.license.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('driverFilesCard.buttons.viewLicense')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* National ID Section */}
        {driverData.national_id_doc && (
          <div>
            <h5 className="mb-3 text-md font-medium text-gray-700 dark:text-gray-300">
              {t('driverFilesCard.sections.nationalId')}
            </h5>
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-medium text-gray-800 dark:text-white">
                  {t('driverFilesCard.sections.nationalId')}
                </h6>
                {getStatusBadge(driverData.national_id_doc.expiry_date)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.issueDate')}:</span> {formatDate(driverData.national_id_doc.issue_date)}
                </div>
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.expiryDate')}:</span> {formatDate(driverData.national_id_doc.expiry_date)}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">{t('driverFilesCard.fields.notes')}:</span> {driverData.national_id_doc.notes || t('driverFilesCard.noNotes')}
                </div>
              </div>
              {driverData.national_id_doc.file && (
                <div className="mt-3">
                  <a
                    href={driverData.national_id_doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('driverFilesCard.buttons.viewNationalId')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle License Section */}
        {driverData.vehicle_license && (
          <div>
            <h5 className="mb-3 text-md font-medium text-gray-700 dark:text-gray-300">
              {t('driverFilesCard.sections.vehicleLicense')}
            </h5>
            <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-medium text-gray-800 dark:text-white">
                  {driverData.vehicle_license.license_plate} - {driverData.vehicle_license.vehicle_type}
                </h6>
                {getStatusBadge(driverData.vehicle_license.expiry_date)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.licenseNumber')}:</span> {driverData.vehicle_license.license_number}
                </div>
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.licenseType')}:</span> {driverData.vehicle_license.license_type}
                </div>
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.issueDate')}:</span> {formatDate(driverData.vehicle_license.issue_date)}
                </div>
                <div>
                  <span className="font-medium">{t('driverFilesCard.fields.expiryDate')}:</span> {formatDate(driverData.vehicle_license.expiry_date)}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">{t('driverFilesCard.fields.notes')}:</span> {driverData.vehicle_license.notes || t('driverFilesCard.noNotes')}
                </div>
              </div>
              {driverData.vehicle_license.file && (
                <div className="mt-3">
                  <a
                    href={driverData.vehicle_license.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('driverFilesCard.buttons.viewVehicleLicense')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}