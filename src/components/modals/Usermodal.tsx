import { useState } from 'react';
import { useAddUser, UserData } from '../../hooks/useAddUser';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onUserAdded?: () => void;
}

export default function UserModal({ isOpen, onClose, onSubmit, onUserAdded }: UserModalProps) {
  const [formData, setFormData] = useState<UserData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    company_code: 'talabat', // default value
  });

  const { addUser, isLoading, error, resetError } = useAddUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await addUser(formData);
      onSubmit(result); // نمرر الـ response من الـ API
      onUserAdded?.(); // علشان ت refresh ال table
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        phone_number: '',
        company_code: 'talabat',
      });
      
      resetError(); // نمسح أي أخطاء
    } catch (err) {
      // الخطأ هيظهر من ال hook
      console.error('Failed to add user:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    resetError(); // نمسح الأخطاء لما ن close
    setFormData({
      first_name: '',
      last_name: '',
      phone_number: '',
      company_code: 'talabat',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Driver</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter last name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., 11234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Company *</label>
              <select
                name="company_code"
                value={formData.company_code}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="talabat">Talabat</option>
                <option value="uber_eats">Uber Eats</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding Driver...' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}