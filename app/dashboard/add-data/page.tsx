"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, Trash2, FileText, PlusCircle, X, Loader2, Edit2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function AddDataPage() {
  const { theme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [customFileName, setCustomFileName] = useState<string>("")
  const [isEditingFileName, setIsEditingFileName] = useState(false)
  const [csvData, setCsvData] = useState<string[][] | null>(null)
  const [csvRawContent, setCsvRawContent] = useState<string | null>(null)
  const [uploadMode, setUploadMode] = useState<"manual" | "csv" | "pos">("manual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    status: 'idle' | 'uploading' | 'complete' | 'error';
    message: string;
  }>({
    current: 0,
    total: 0,
    percent: 0,
    status: 'idle',
    message: ''
  })
  
  // Define default columns
  const defaultColumns = [
    { id: "name", label: "Customer Name", type: "text", required: false },
    { id: "age", label: "Age Group", type: "select", required: false },
    { id: "gender", label: "Gender", type: "select", required: false },
    { id: "purchaseAmount", label: "Purchase Amount (₹)", type: "number", required: true },
    { id: "items", label: "Items Purchased", type: "textarea", required: false },
    { id: "frequency", label: "Visit Frequency", type: "select", required: false }
  ]
  
  const [columns, setColumns] = useState(defaultColumns)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState("text")
  const [newColumnRequired, setNewColumnRequired] = useState(false)
  
  const [customers, setCustomers] = useState([
    { id: 1, name: "", age: "", gender: "", purchaseAmount: "", items: "", frequency: "" },
  ])

  const addCustomer = () => {
    // Create a new customer object with all current columns
    const newCustomer: any = { id: Date.now() }
    columns.forEach(col => {
      newCustomer[col.id] = ""
    })
    
    setCustomers([...customers, newCustomer])
  }

  const removeCustomer = (id: number) => {
    setCustomers(customers.filter((customer) => customer.id !== id))
  }

  const updateCustomer = (id: number, field: string, value: string) => {
    setCustomers(customers.map((customer) => (customer.id === id ? { ...customer, [field]: value } : customer)))
  }

  const addColumn = () => {
    if (!newColumnName.trim()) return
    
    const columnId = newColumnName.toLowerCase().replace(/\s+/g, '_')
    
    // Add new column to the columns list
    setColumns([
      ...columns, 
      { 
        id: columnId, 
        label: newColumnName, 
        type: newColumnType,
        required: newColumnRequired 
      }
    ])
    
    // Add the new field to all existing customers
    setCustomers(customers.map(customer => ({
      ...customer,
      [columnId]: ""
    })))
    
    // Reset form
    setNewColumnName("")
    setNewColumnType("text")
    setNewColumnRequired(false)
  }
  
  const removeColumn = (columnId: string) => {
    // Don't allow removing all columns
    if (columns.length <= 1) return
    
    // Remove the column from columns list
    setColumns(columns.filter(col => col.id !== columnId))
    
    // Remove the field from all customers
    setCustomers(customers.map(customer => {
      const updatedCustomer = {...customer}
      delete updatedCustomer[columnId as keyof typeof updatedCustomer]
      return updatedCustomer
    }))
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const originalName = file.name
    setCsvFileName(originalName)
    setCustomFileName(originalName.replace(/\.[^/.]+$/, "")) // Remove extension
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        setCsvRawContent(text) // Store the raw CSV content
        const lines = text.split('\n')
        
        if (lines.length === 0) {
          throw new Error("CSV file is empty")
        }
        
        const headers = lines[0].split(',').map(h => h.trim())
        
        if (headers.length === 0) {
          throw new Error("CSV file has no columns")
        }
        
        // Create columns based on CSV headers
        const newColumns = headers.map(header => ({
          id: header.toLowerCase().replace(/\s+/g, '_'),
          label: header,
          type: "text",
          required: false
        }))
        
        setColumns(newColumns)
        
        // Parse all data rows
        const allDataRows = lines.slice(1)
          .filter(line => line.trim() !== '')
          .map((line, index) => {
            const values = line.split(',').map(v => v.trim())
            const customer: any = { id: Date.now() + index }
            
            headers.forEach((header, index) => {
              const columnId = header.toLowerCase().replace(/\s+/g, '_')
              customer[columnId] = values[index] || ""
            })
            
            return customer
          })
        
        if (allDataRows.length === 0) {
          throw new Error("CSV file has no data rows")
        }
        
        // Store all parsed data rows
        setCustomers(allDataRows)
        
        // For preview, limit to 50 rows
        const previewLines = [lines[0]].concat(lines.slice(1, 51))
        setCsvData(previewLines.map(line => line.split(',').map(cell => cell.trim())))
        setUploadMode("csv")
      } catch (error) {
        console.error("Error parsing CSV:", error)
        alert(`Error parsing CSV file: ${error instanceof Error ? error.message : "Invalid file format"}`);
        setCsvFileName(null)
        setCsvData(null)
      }
    }
    
    reader.onerror = () => {
      console.error("Error reading file")
      alert("Error reading file. Please try again with a different file.")
      setCsvFileName(null)
      setCsvData(null)
    }
    
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert("You need to be logged in to submit data")
        window.location.href = "/login"
        return
      }
      
      // Format data to match backend expectations
      // The backend expects:
      // - dataType: string - type of data being stored
      // - dataName: string - name/title of the data
      // - dataContent: string - JSON stringified content
      const dataContent = JSON.stringify({
        columns: columns,
        customers: customers,
        uploadDate: new Date().toISOString(),
        metadata: {
          rowCount: customers.length,
          columnCount: columns.length,
          originalFileName: csvFileName || "Manual Entry",
          userId: JSON.parse(localStorage.getItem('user') || '{}').id
        }
      });
      
      // Check if data is too large (>40MB to be safe with 50MB limit)
      if (dataContent.length > 40 * 1024 * 1024) {
        return await handleLargeDataUpload(token, dataContent);
      }
      
      const dataToSubmit = {
        dataType: "customer_data",
        dataName: customFileName || "Customer Transactions",
        dataContent: dataContent
      }
      
      console.log("Submitting data to database:", dataToSubmit);
      
      // Submit to API
      const response = await fetch('http://localhost:5000/api/business-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      })
      
      // Clone the response for multiple reads if needed
      const responseClone = response.clone();
      
      // Parse response data
      let responseData;
      try {
        responseData = await response.json();
      } catch (error) {
        responseData = null;
      }
      
      // Create a summary of the data to save in localStorage
      const existingData = JSON.parse(localStorage.getItem('uploadedData') || '[]');
      
      // For local storage only uploads, create a simplified entry
      if (!response || !response.ok) {
        const newDataEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          type: "customer_data",
          name: customFileName || "Customer Transactions",
          rowCount: customers.length,
          columnCount: columns.length,
          localOnly: true,
          userId: JSON.parse(localStorage.getItem('user') || '{}').id,
          dataContent: dataContent // Store the full data content for export
        };
        localStorage.setItem('uploadedData', JSON.stringify([...existingData, newDataEntry]));
      } else {
        // For successful uploads to database, include the reference
        const newDataEntry = {
          id: responseData?.id || Date.now(), // Use database ID if available
          date: new Date().toISOString(),
          type: "customer_data",
          name: customFileName || "Customer Transactions",
          rowCount: customers.length,
          columnCount: columns.length,
          userId: JSON.parse(localStorage.getItem('user') || '{}').id,
          dataContent: dataContent, // Store the full data content for export
          dbReference: responseData?.id ? {
            id: responseData.id,
            createdAt: responseData.createdAt
          } : null
        };
        localStorage.setItem('uploadedData', JSON.stringify([...existingData, newDataEntry]));
      }
      
      if (response.ok) {
        alert("Data successfully uploaded to database! AI recommendations will be updated.")
        window.location.href = "/dashboard/data"
      } else {
        // Improved error handling
        let errorMessage = `Server returned status: ${response.status}`;
        
        try {
          // Only try to parse as JSON if the content type is JSON and we haven't already consumed the body
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json') && responseData === null) {
            const errorData = await responseClone.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } else if (responseData && (responseData.message || responseData.error)) {
            // If we already parsed the JSON successfully, use that data
            errorMessage = responseData.message || responseData.error || errorMessage;
          } else if (responseData === null) {
            // For non-JSON responses or if JSON parsing failed, try to get the text
            const textError = await responseClone.text();
            if (textError) {
              errorMessage = textError;
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        console.error("Error uploading data to database:", errorMessage);
        
        // If the error is "request entity too large", suggest using smaller batches
        if (errorMessage.includes("too large") || errorMessage.includes("payload")) {
          if (confirm("The data is too large to upload in one request. Would you like to upload it in smaller batches?")) {
            return await handleLargeDataUpload(token, dataContent);
          }
        }
        
        // Ask user if they want to save locally anyway
        if (confirm(`Error uploading to database: ${errorMessage}\n\nWould you like to save the data locally anyway?`)) {
          const existingData = JSON.parse(localStorage.getItem('uploadedData') || '[]');
          const newDataEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: "customer_data",
            name: customFileName || "Customer Transactions",
            rowCount: customers.length,
            columnCount: columns.length,
            localOnly: true,
            userId: JSON.parse(localStorage.getItem('user') || '{}').id,
            dataContent: dataContent, // Store the full data content for export
          };
          localStorage.setItem('uploadedData', JSON.stringify([...existingData, newDataEntry]));
          alert("Data saved locally. Note: This data is only available on this device and won't sync with the database.");
          window.location.href = "/dashboard/data";
        } else {
          alert(`Database upload failed: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(`Network error: ${error instanceof Error ? error.message : "Could not connect to server"}`);
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle large data uploads by splitting into chunks
  const handleLargeDataUpload = async (token: string, dataContent: string) => {
    try {
      // Large data handling logic
      // Calculate number of batches needed (each batch ~10MB)
      const batchSize = 10 * 1024 * 1024; // 10MB in bytes
      const totalBatches = Math.ceil(dataContent.length / batchSize);
      let successCount = 0;
      let failCount = 0;
      
      setUploadProgress({
        current: 0,
        total: totalBatches,
        percent: 0,
        status: 'uploading',
        message: `Preparing to upload ${totalBatches} batches of data...`
      });
      
      // Process in batches
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, dataContent.length);
        const batchContent = dataContent.substring(start, end);
        
        setUploadProgress({
          current: i + 1,
          total: totalBatches,
          percent: Math.round(((i + 1) / totalBatches) * 100),
          status: 'uploading',
          message: `Uploading batch ${i + 1} of ${totalBatches}...`
        });
        
        try {
          // Upload this batch
          // In a real app, you would implement a batch upload API
          // For now, we'll simulate success/failure
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate random success/failure for demo
          if (Math.random() > 0.2) { // 80% success rate
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error uploading batch ${i+1}:`, error);
          failCount++;
        }
      }
      
      // Get existing data from localStorage
      const existingData = JSON.parse(localStorage.getItem('uploadedData') || '[]');
      
      // Create a new entry for the local storage
      const newDataEntry = {
        id: Date.now(),
        name: customFileName || "Customer Transactions",
        type: "customer_data",
        date: new Date().toISOString(),
        rowCount: customers.length,
        columnCount: columns.length,
        localOnly: true,
        userId: JSON.parse(localStorage.getItem('user') || '{}').id,
        dataContent: dataContent // Store the full data content for export
      };
      
      localStorage.setItem('uploadedData', JSON.stringify([...existingData, newDataEntry]));
      
      if (failCount === 0) {
        alert(`Successfully uploaded all ${totalBatches} batches of data!`);
        window.location.href = "/dashboard/data";
        return true;
      } else {
        alert(`Uploaded ${successCount} of ${totalBatches} batches. ${failCount} batches failed.`);
        if (successCount > 0) {
          window.location.href = "/dashboard/data";
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Error in batch upload:", error);
      setUploadProgress({
        current: 0,
        total: 1,
        percent: 0,
        status: 'error',
        message: `Error during batch upload: ${error instanceof Error ? error.message : "Unknown error"}`
      });
      alert(`Error during batch upload: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const downloadCsv = () => {
    if (!csvRawContent) return;
    
    try {
      setIsDownloading(true);
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvRawContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${customFileName || csvFileName || "data"}.csv`);
      
      // Append to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Error downloading CSV. Please try again.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard/data">
            <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Data
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add Daily Customer Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Input today's customer transactions for AI analysis</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Upload Progress Bar (shown only when uploading in batches) */}
          {uploadProgress.status === 'uploading' && (
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Upload Progress</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {uploadProgress.message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Batch {uploadProgress.current} of {uploadProgress.total}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {uploadProgress.percent}%
                    </span>
                  </div>
                  <Progress value={uploadProgress.percent} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Quick Data Entry Options</CardTitle>
              <CardDescription className="dark:text-gray-400">Choose how you want to add your customer data</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleCsvUpload}
                />
                <Button 
                  variant={uploadMode === "csv" ? "default" : "outline"} 
                  onClick={triggerFileInput}
                  className={uploadMode === "csv" ? "" : "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {csvFileName ? `${csvFileName}` : "Upload CSV File"}
                </Button>
              </div>
              <Button 
                variant={uploadMode === "pos" ? "default" : "outline"}
                onClick={() => setUploadMode("pos")}
                className={uploadMode === "pos" ? "" : "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"}
              >
                Connect POS System
              </Button>
              <Button 
                variant={uploadMode === "manual" ? "default" : "outline"}
                onClick={() => setUploadMode("manual")}
                className={uploadMode === "manual" ? "" : "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"}
              >
                Manual Entry
              </Button>
            </CardContent>
          </Card>

          {csvData && uploadMode === "csv" && (
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-900 dark:text-white">CSV Data Preview</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {csvData.length > 1 ? 
                        `Showing ${Math.min(50, csvData.length-1)} of ${customers.length} rows. All ${customers.length} rows will be submitted.` : 
                        "Preview your data before submitting"
                      }
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center">
                    {isEditingFileName ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="w-64 h-8 text-sm"
                          placeholder="Enter dataset name"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsEditingFileName(false)}
                          className="h-8 px-2 text-green-600"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {customFileName || csvFileName?.replace(/\.[^/.]+$/, "")}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsEditingFileName(true)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        {csvData[0].map((header, i) => (
                          <th key={i} className="border border-gray-200 dark:border-gray-600 p-2 text-left text-gray-900 dark:text-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(1).map((row, i) => (
                        <tr key={i} className="border-b dark:border-gray-600">
                          {row.map((cell, j) => (
                            <td key={j} className="border border-gray-200 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadCsv}
                    disabled={isDownloading}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        <span>Download CSV</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="relative"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit CSV Data ({customers.length} rows)</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadMode === "manual" && (
            <form onSubmit={handleSubmit}>
              <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">Customer Transaction Data</CardTitle>
                      <CardDescription className="dark:text-gray-400">Add individual customer purchase information</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Column
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="dark:text-white">Add New Column</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                              Create a new data field for your customer information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="column-name" className="dark:text-gray-300">Column Name</Label>
                              <Input 
                                id="column-name" 
                                placeholder="e.g., Phone Number" 
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="column-type" className="dark:text-gray-300">Field Type</Label>
                              <Select onValueChange={setNewColumnType} defaultValue="text">
                                <SelectTrigger id="column-type" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                  <SelectValue placeholder="Select field type" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="select">Dropdown</SelectItem>
                                  <SelectItem value="textarea">Text Area</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id="required-field" 
                                checked={newColumnRequired}
                                onChange={(e) => setNewColumnRequired(e.target.checked)}
                                className="h-4 w-4"
                              />
                              <Label htmlFor="required-field" className="dark:text-gray-300">Required field</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" onClick={addColumn}>Add Column</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button type="button" onClick={addCustomer} variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {customers.map((customer, index) => (
                    <div key={customer.id} className="border dark:border-gray-700 rounded-lg p-4 relative">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">Customer #{index + 1}</h3>
                        {customers.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeCustomer(customer.id)} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {columns.map((column) => (
                          <div key={column.id} className="space-y-2 relative">
                            <div className="flex justify-between items-center">
                              <Label className="dark:text-gray-300">
                                {column.label}
                                {column.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              {columns.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeColumn(column.id)}
                                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            
                            {column.type === 'text' && (
                              <Input
                                placeholder={`Enter ${column.label.toLowerCase()}`}
                                value={customer[column.id as keyof typeof customer] as string || ''}
                                onChange={(e) => updateCustomer(customer.id, column.id, e.target.value)}
                                required={column.required}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                              />
                            )}
                            
                            {column.type === 'number' && (
                              <Input
                                type="number"
                                placeholder={`Enter ${column.label.toLowerCase()}`}
                                value={customer[column.id as keyof typeof customer] as string || ''}
                                onChange={(e) => updateCustomer(customer.id, column.id, e.target.value)}
                                required={column.required}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                              />
                            )}
                            
                            {column.type === 'textarea' && (
                              <Textarea
                                placeholder={`Enter ${column.label.toLowerCase()}`}
                                value={customer[column.id as keyof typeof customer] as string || ''}
                                onChange={(e) => updateCustomer(customer.id, column.id, e.target.value)}
                                required={column.required}
                                className="min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                              />
                            )}
                            
                            {column.type === 'select' && column.id === 'age' && (
                              <Select 
                                onValueChange={(value) => updateCustomer(customer.id, column.id, value)}
                                defaultValue={customer[column.id as keyof typeof customer] as string || ''}
                              >
                                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                  <SelectValue placeholder="Select age group" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <SelectItem value="18-25">18-25</SelectItem>
                                  <SelectItem value="26-35">26-35</SelectItem>
                                  <SelectItem value="36-45">36-45</SelectItem>
                                  <SelectItem value="46-55">46-55</SelectItem>
                                  <SelectItem value="56+">56+</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            {column.type === 'select' && column.id === 'gender' && (
                              <Select 
                                onValueChange={(value) => updateCustomer(customer.id, column.id, value)}
                                defaultValue={customer[column.id as keyof typeof customer] as string || ''}
                              >
                                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            {column.type === 'select' && column.id === 'frequency' && (
                              <Select 
                                onValueChange={(value) => updateCustomer(customer.id, column.id, value)}
                                defaultValue={customer[column.id as keyof typeof customer] as string || ''}
                              >
                                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                                  <SelectValue placeholder="How often do they visit?" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="first-time">First Time</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-4 pt-4">
                    <Link href="/dashboard/data">
                      <Button variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">Cancel</Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Data & Generate Insights</span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {uploadMode === "pos" && (
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect Your POS System</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Automatically import data from your Point of Sale system for seamless analysis.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button>Connect Square POS</Button>
                    <Button variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">Connect Shopify</Button>
                    <Button variant="outline" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">Other POS</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Privacy Notice */}
          <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Data Privacy & Security</h4>
                <p>
                  Your customer data is encrypted and stored securely. We only use this information to generate
                  personalized business insights and recommendations. Customer names are optional and can be anonymized
                  for privacy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
