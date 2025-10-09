// src/pages/Payroll/PayrollUpload.tsx
import { useState } from "react";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { useCompanies } from "../../hooks/useCompanies"; // Import the same hook

interface PayrollConfig {
  company_code: string;
  tax_percentage: number;
  company_share_percentage: number;
  insurance_eur: number;
}

export default function PayrollUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  // Use the same companies hook that works in your table
  const { companies, isLoading: companiesLoading, error: companiesError } = useCompanies();
  
  // Payroll configuration state
  const [payrollConfig, setPayrollConfig] = useState<PayrollConfig>({
    company_code: "",
    tax_percentage: 0,
    company_share_percentage: 0,
    insurance_eur: 0
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadStatus("idle");
    setMessage("");
  };

  const handleConfigChange = (field: keyof PayrollConfig, value: string) => {
    setPayrollConfig(prev => ({
      ...prev,
      [field]: field.includes("percentage") || field === "insurance_eur" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first");
      setUploadStatus("error");
      return;
    }

    if (!payrollConfig.company_code) {
      setMessage("Please select a company");
      setUploadStatus("error");
      return;
    }

    // Validate file type (Excel or CSV)
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      setMessage("Please upload an Excel (.xlsx, .xls) or CSV file");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("payroll_file", selectedFile);
      formData.append("company_code", payrollConfig.company_code);
      formData.append("tax_percentage", payrollConfig.tax_percentage.toString());
      formData.append("company_share_percentage", payrollConfig.company_share_percentage.toString());
      formData.append("insurance_eur", payrollConfig.insurance_eur.toString());

      const response = await fetch("/api/v1/payroll/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("Payroll file uploaded and processed successfully!");
        setUploadStatus("success");
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById("payroll-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to upload payroll file");
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Network error. Please try again.");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!payrollConfig.company_code) {
      setMessage("Please select a company first");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const response = await fetch("/api/v1/payroll/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          company_code: payrollConfig.company_code,
          tax_percentage: payrollConfig.tax_percentage,
          company_share_percentage: payrollConfig.company_share_percentage,
          insurance_eur: payrollConfig.insurance_eur
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'payroll-report.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) filename = filenameMatch[1];
        }
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        setMessage("Report generated and downloaded successfully!");
        setUploadStatus("success");
      } else {
        const error = await response.json();
        setMessage(error.message || "Failed to generate report");
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Report generation error:", error);
      setMessage("Network error. Please try again.");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Payroll Upload & Configuration
        </h2>
      </div>

      {/* Configuration Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Payroll Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Dropdown - Using the same pattern as your table */}
          <div>
            <Label htmlFor="company_code">Company *</Label>
            <select
              id="company_code"
              value={payrollConfig.company_code}
              onChange={(e) => handleConfigChange("company_code", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={companiesLoading}
            >
              {companiesLoading ? (
                <option value="">Loading companies...</option>
              ) : companiesError ? (
                <option value="">Error loading companies</option>
              ) : (
                <>
                  <option value="">Select a company</option>
                  {companies
                    .filter(company => company.is_active)
                    .map((company) => (
                      <option key={company.code} value={company.code}>
                        {company.name}
                      </option>
                    ))
                  }
                </>
              )}
            </select>
            
            {companiesLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading companies...</p>
            )}
            {companiesError && (
              <p className="text-xs text-red-500 mt-1">Failed to load companies</p>
            )}
          </div>

          {/* Tax Percentage */}
          <div>
            <Label htmlFor="tax_percentage">Tax (%)</Label>
            <input
              id="tax_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={payrollConfig.tax_percentage}
              onChange={(e) => handleConfigChange("tax_percentage", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
            />
          </div>

          {/* Company Share Percentage */}
          <div>
            <Label htmlFor="company_share_percentage">Company Share (%)</Label>
            <input
              id="company_share_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={payrollConfig.company_share_percentage}
              onChange={(e) => handleConfigChange("company_share_percentage", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
            />
          </div>

          {/* Insurance (EUR) */}
          <div>
            <Label htmlFor="insurance_eur">Insurance (EUR)</Label>
            <input
              id="insurance_eur"
              type="number"
              min="0"
              step="0.01"
              value={payrollConfig.insurance_eur}
              onChange={(e) => handleConfigChange("insurance_eur", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Upload Payroll File
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Upload an Excel (.xlsx, .xls) or CSV file containing payroll data. The system will process the file and update payroll records accordingly.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payroll-file">Select Payroll File</Label>
              <input
                id="payroll-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: Excel (.xlsx, .xls) or CSV files
              </p>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Selected file:</strong> {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  uploadStatus === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !payrollConfig.company_code || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload Payroll'
                )}
              </Button>
              
              <Button
                onClick={handleGenerateReport}
                disabled={!payrollConfig.company_code || isUploading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
              
              {selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setMessage("");
                    setUploadStatus("idle");
                    const fileInput = document.getElementById("payroll-file") as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  Clear File
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          File Requirements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Columns (Excel/CSV)
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Driver ID / Employee ID</li>
              <li>• Driver Name</li>
              <li>• Hours Worked</li>
              <li>• Rate per Hour</li>
              <li>• Total Amount</li>
              <li>• Payment Date</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format Guidelines
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• File size limit: 10MB</li>
              <li>• Dates should be in YYYY-MM-DD format</li>
              <li>• Currency values should be numeric</li>
              <li>• First row should contain headers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}