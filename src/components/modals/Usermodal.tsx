import React, { useState } from "react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; role: string; projectName: string }) => void;
}

export default function UserModal({ isOpen, onClose, onSubmit }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    projectName: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error while typing
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (!formData.projectName.trim()) newErrors.projectName = "Project Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    setFormData({ name: "", role: "", projectName: "" }); // reset form
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4">Add User</h2>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        {/* Role */}
        <input
          type="text"
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded mt-2"
        />
        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}

        {/* Project */}
        <input
          type="text"
          name="projectName"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full border p-2 mb-1 rounded mt-2"
        />
        {errors.projectName && <p className="text-red-500 text-sm">{errors.projectName}</p>}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
