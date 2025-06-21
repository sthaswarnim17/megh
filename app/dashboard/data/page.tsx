"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Database, 
  Upload, 
  Eye, 
  Trash2, 
  CloudUpload, 
  Download, 
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DataPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [dataToDelete, setDataToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  const [syncingId, setSyncingId] = useState<string | number | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token')
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        
        if (!token || !userData.id) {
          // If no token or user data, redirect to login
          router.push('/login')
          return
        }

        // Load uploaded data from localStorage
        const savedData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
        const userSpecificData = savedData.filter((item: any) => item.userId === userData.id)
        setUploadedData(userSpecificData)
        
        setIsLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteData = (data: any) => {
    setDataToDelete(data)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!dataToDelete) return

    try {
      // Remove from localStorage
      const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
      const filteredData = allData.filter((item: any) => item.id !== dataToDelete.id)
      localStorage.setItem('uploadedData', JSON.stringify(filteredData))
      
      // Update state
      setUploadedData(filteredData)
      
      // If this data is in the database, we should also delete it there
      if (dataToDelete.dbReference && dataToDelete.dbReference.id) {
        // In a real app, you would call an API to delete from database
        console.log(`Would delete data with ID ${dataToDelete.dbReference.id} from database`)
        // For now, we'll just show a message
        alert(`Data "${dataToDelete.name}" has been deleted.${dataToDelete.dbReference ? ' Database records may take some time to update.' : ''}`)
      } else {
        alert(`Data "${dataToDelete.name}" has been deleted.`)
      }
    } catch (error) {
      console.error("Error deleting data:", error)
      alert("Error deleting data. Please try again.")
    } finally {
      setIsDeleteDialogOpen(false)
      setDataToDelete(null)
    }
  }

  const handleDownload = async (data: any) => {
    if (!data) return;
    
    try {
      setDownloadingId(data.id);
      
      // Get the actual data content
      let csvContent = "";
      let dataFromDB = null;
      
      // If this data has a database reference, fetch it from the database
      if (data.dbReference && data.dbReference.id) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          const response = await fetch(`http://localhost:5000/api/business-data/${data.dbReference.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            dataFromDB = await response.json();
            console.log("Retrieved data from database:", dataFromDB);
          } else {
            console.error("Failed to fetch data from database:", await response.text());
          }
        } catch (error) {
          console.error("Error fetching data from database:", error);
        }
      }
      
      try {
        // Try to parse the data content - first from DB, then from localStorage
        let parsedContent;
        
        if (dataFromDB && dataFromDB.data_content) {
          // If we have DB data, use that
          if (typeof dataFromDB.data_content === 'string') {
            parsedContent = JSON.parse(dataFromDB.data_content);
          } else {
            parsedContent = dataFromDB.data_content;
          }
        } else if (data.dataContent) {
          // Fall back to localStorage data
          if (typeof data.dataContent === 'string') {
            parsedContent = JSON.parse(data.dataContent);
          } else {
            parsedContent = data.dataContent;
          }
        }
        
        if (parsedContent && parsedContent.columns && parsedContent.customers) {
          // Create header row from columns
          const headers = parsedContent.columns.map((col: any) => col.label);
          csvContent += headers.join(',') + '\n';
          
          // Add data rows
          parsedContent.customers.forEach((customer: any) => {
            const rowValues = parsedContent.columns.map((col: any) => {
              // Escape commas in values
              const value = customer[col.id] || '';
              return value.toString().includes(',') ? `"${value}"` : value;
            });
            csvContent += rowValues.join(',') + '\n';
          });
        }
      } catch (e) {
        console.error("Error parsing data content:", e);
      }
      
      // If we couldn't get the actual data, create a simple metadata export
      if (!csvContent) {
        // Create header row
        csvContent = "Data Type,Name,Upload Date,Row Count,Column Count\n";
        
        // Add data row
        csvContent += `${data.type},${data.name},${data.date},${data.rowCount},${data.columnCount}\n\n`;
        
        // Add note
        csvContent += "Note: This is a simplified download. The actual data could not be retrieved.";
      }
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data.name.replace(/\s+/g, '_')}.csv`);
      
      // Append to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Error downloading data. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const syncToDatabase = async (data: any) => {
    if (!data || !data.localOnly) return;
    
    try {
      setSyncingId(data.id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You need to be logged in to sync data");
        router.push('/login');
        return;
      }
      
      // Prepare the data to submit to the API
      const dataToSubmit = {
        dataType: data.type,
        dataName: data.name,
        dataContent: data.dataContent // This should contain the full data content
      };
      
      // Submit to API
      const response = await fetch('http://localhost:5000/api/business-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      });
      
      if (response.ok) {
        // Get response data
        const responseData = await response.json();
        
        // Update localStorage
        const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]');
        const updatedData = allData.map((item: any) => {
          if (item.id === data.id) {
            return {
              ...item,
              localOnly: false,
              dbReference: {
                id: responseData.id,
                createdAt: responseData.created_at || new Date().toISOString()
              }
            };
          }
          return item;
        });
        
        localStorage.setItem('uploadedData', JSON.stringify(updatedData));
        
        // Update state
        setUploadedData(updatedData.filter((item: any) => 
          item.userId === JSON.parse(localStorage.getItem('user') || '{}').id
        ));
        
        alert("Data successfully synced with database!");
      } else {
        let errorMessage = "Failed to sync with database";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
        
        alert(`Error syncing with database: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error syncing with database:", error);
      alert(`Error syncing with database: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View, analyze, and manage your uploaded data
              </p>
            </div>
          </div>
          <Link href="/dashboard/add-data">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Data
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {uploadedData.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                  <Database className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Data Found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                  You haven't uploaded any data yet. Start by uploading customer data to get AI-powered insights.
                </p>
                <Link href="/dashboard/add-data">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Dataset
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Datasets</h2>
                <div className="flex items-center gap-2">
                  <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                    <option value="recent">Most Recent</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="rows">Row Count</option>
                    <option value="type">Data Type</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedData.slice().reverse().map((data) => (
                  <Card key={data.id} className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base font-medium text-gray-900 dark:text-white">{data.name}</CardTitle>
                              {data.localOnly && (
                                <span className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                                  Local Only
                                </span>
                              )}
                              {data.dbReference && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                                  Database Synced
                                </span>
                              )}
                            </div>
                            <CardDescription className="text-xs dark:text-gray-400">
                              {formatDate(data.date)}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-400">Rows:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{data.rowCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 dark:text-gray-400">Columns:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{data.columnCount}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/view-data?id=${data.id}`}>
                            <Button size="sm" variant="outline" className="h-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            onClick={() => handleDeleteData(data)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                        
                        {data.localOnly && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            onClick={() => syncToDatabase(data)}
                            disabled={syncingId === data.id}
                          >
                            {syncingId === data.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <CloudUpload className="h-3.5 w-3.5 mr-1" />
                                Sync
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          onClick={() => handleDownload(data)}
                          disabled={downloadingId === data.id}
                        >
                          {downloadingId === data.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Download
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this data? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {dataToDelete && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-400">{dataToDelete.name}</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {dataToDelete.rowCount} rows • {dataToDelete.columnCount} columns • Uploaded on {formatDate(dataToDelete.date)}
                </p>
                {dataToDelete.dbReference && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    This will also remove the data from the database.
                  </p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 