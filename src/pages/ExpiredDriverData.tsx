import ContractsTable from "../components/tables/ContractsTable/ContractsTable";
import PageMeta from "../components/common/PageMeta";

export default function ExpiredDriverData() {
  return (
    <>
      <PageMeta
        title="Expired Driver Data | LogiMS - Driver Management System"
        description="View and manage expired driver contracts and documents"
      />
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Expired Driver Data
          </h2>
        </div>

        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <ContractsTable />
        </div>
      </div>
    </>
  );
}
