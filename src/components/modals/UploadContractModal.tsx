import { useState } from 'react';
import { useUploadContract, UploadContractData } from '../../hooks/useContracts';

interface UploadContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadContractModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: UploadContractModalProps) {
  const { uploadContract, isLoading, error, reset } = useUploadContract();
  const [validationError, setValidationError] = useState<string>('');
  
  const [formData, setFormData] = useState<UploadContractData>({
    driver_id: '',
    contract_number: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
    file: null as any,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.driver_id.trim() || !formData.contract_number.trim() || !formData.issue_date || !formData.expiry_date || !formData.file) {
        setValidationError('Driver ID, contract number, issue date, expiry date, and file are required');
        return;
      }

      // Validate dates
      if (new Date(formData.issue_date) >= new Date(formData.expiry_date)) {
        setValidationError('Expiry date must be after issue date');
        return;
      }

      await uploadContract.mutateAsync(formData);
      setValidationError('');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        driver_id: '',
        contract_number: '',
        issue_date: '',
        expiry_date: '',
        notes: '',
        file: null as any,
      });
    } catch (err) {
      console.error('Failed to upload contract:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setValidationError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Upload Contract
          </h2>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || validationError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Driver ID *
                </label>
                <input
                  type="text"
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter driver ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Contract Number *
                </label>
                <input
                  type="text"
                  name="contract_number"
                  value={formData.contract_number}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter contract number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Issue Date *
                </label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Additional notes about the contract..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Contract File *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Upload contract document (PDF, JPG, PNG)</p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Contract'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
