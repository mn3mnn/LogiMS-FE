import { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useContracts } from "../../../hooks/useContracts";
import UploadContractModal from "../../modals/UploadContractModal";
import { generatePaginationPages } from "../../../utils/pagination";

export default function ContractsTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error, isFetching } = useContracts(currentPage, refreshKey);
  
  const contracts = data?.results || [];
  const totalCount = data?.count || 0; 
  
  const contractsPerPage = 10;
  const totalPages = Math.ceil(totalCount / contractsPerPage);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load contracts</p>;

  const filteredData = contracts.filter((contract: any) => {
    const matchesId = contract?.id?.toString().includes(searchTerm);
    const matchesContractNumber = contract?.contract_number
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDriverId = contract?.driver_id?.toString().includes(searchTerm);
    return matchesId || matchesContractNumber || matchesDriverId;
  });

  const handleContractUploaded = () => {
    setRefreshKey(prev => prev + 1);
    setCurrentPage(1); // Reset to first page after upload
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="hidden lg:block my-2 mx-4">
        <form>
          <div className="relative">
            <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill=""
                />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by ID, contract number, or driver ID..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
          </div>
        </form>
      </div>
      
      <div className="flex justify-between items-end m-4">
        <div className="p-2">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Expired Driver Contracts
          </h4>
        </div>
        <div className="p-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
          >
            Upload Contract
          </button>
        </div>
      </div>

      {/* Add max-w-full overflow-x-auto wrapper for the table */}
      <div className="max-w-full overflow-x-auto">
  <Table>
    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
      <TableRow>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          ID
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          Driver ID
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          Contract Number
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          Issue Date
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          Expiry Date
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          Status
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          Notes
        </TableCell>
        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
          File
        </TableCell>
      </TableRow>
    </TableHeader>

    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
      {filteredData.length === 0 ? (
        <TableRow>
          <TableCell colSpan={8} className="px-5 py-4 text-center text-gray-500">
            {contracts.length === 0 ? "No contracts found" : "No contracts match your search"}
          </TableCell>
        </TableRow>
      ) : (
        filteredData.map((contract: any) => (
          <TableRow key={contract.id}>
            <TableCell className="px-1 py-4 sm:px-6 text-start">
              <div className="flex items-center gap-3">
                <div>
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {contract.id}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-5 py-4 sm:px-6 text-start">
              <div className="flex items-center gap-3">
                <div>
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {contract.driver_id}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {contract.contract_number}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {formatDate(contract.issue_date)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {formatDate(contract.expiry_date)}
            </TableCell>
            <TableCell className="px-4 py-3 text-start text-theme-sm">
              {isExpired(contract.expiry_date) ? (
                <span className="inline-flex rounded-full bg-red-100 bg-opacity-10 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  Expired
                </span>
              ) : isExpiringSoon(contract.expiry_date) ? (
                <span className="inline-flex rounded-full bg-yellow-100 bg-opacity-10 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Expiring Soon
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-green-100 bg-opacity-10 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              )}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              <span className="truncate" title={contract.notes}>
                {contract.notes || '-'}
              </span>
            </TableCell>
            <TableCell className="px-4 py-3 text-start text-theme-sm">
              {contract.file ? (
                <a
                  href={contract.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ffb433] hover:text-[#cc8c29] dark:text-[#feb273] dark:hover:text-[#feb273] transition-colors"
                >
                  View File
                </a>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">No file</span>
              )}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>
      
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center justify-center gap-1 flex-1">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded disabled:opacity-30 bg-[#ffb433] text-white"
          >
            Prev
          </button>

          {totalPages > 0 && generatePaginationPages(currentPage, totalPages).map((pageNum, index) => {
            if (pageNum === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 ${
                  currentPage === pageNum
                    ? "bg-[#ffb433] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded disabled:opacity-30 bg-[#ffb433] text-white"
          >
            Next
          </button>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-[#ffb433] text-white rounded-lg hover:bg-[#e6a02e]"
          >
            Export
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleContractUploaded}
      />
    </div>
  );
}