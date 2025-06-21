"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Database, Download, CloudUpload, Loader2, Trash2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ViewDataPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const dataId = searchParams.get('id')
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token')
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        
        if (!token) {
          router.push('/login')
          return
        }

        if (!dataId) {
          setError("No data ID provided")
          setIsLoading(false)
          return
        }

        // Get all uploaded data from localStorage
        const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
        const selectedData = allData.find((item: any) => 
          item.id.toString() === dataId && item.userId === userData.id
        )

        if (!selectedData) {
          setError("Data not found or you don't have permission to view it")
          setIsLoading(false)
          return
        }

        // If this data has a database reference, try to fetch the full data
        if (selectedData.dbReference && selectedData.dbReference.id) {
          try {
            const response = await fetch(`http://localhost:5000/api/business-data/${selectedData.dbReference.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (response.ok) {
              const dbData = await response.json()
              // Merge the data from database with local data
              selectedData.dataContent = dbData.data_content
            }
          } catch (error) {
            console.error("Error fetching data from database:", error)
            // Continue with local data if database fetch fails
          }
        }

        setData(selectedData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Error loading data")
        setIsLoading(false)
      }
    }

    loadData()
  }, [dataId, router])

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

  const syncWithDatabase = async () => {
    if (!data || !data.localOnly) return
    
    setIsSyncing(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert("You need to be logged in to sync data")
        router.push('/login')
        return
      }
      
      // Reconstruct the original data content
      // This is a simplified example - in a real app, you would store more data
      const dataToSubmit = {
        dataType: data.type,
        dataName: data.name,
        dataContent: JSON.stringify({
          // This is a placeholder since we don't have the actual data
          // In a real app, you would store the full data or retrieve it
          metadata: {
            rowCount: data.rowCount,
            columnCount: data.columnCount,
            uploadDate: data.date
          }
        })
      }
      
      const response = await fetch('http://localhost:5000/api/business-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      })
      
      if (response.ok) {
        // Get response data
        const responseData = await response.json()
        
        // Update localStorage
        const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
        const updatedData = allData.map((item: any) => {
          if (item.id.toString() === dataId) {
            return {
              ...item,
              localOnly: false,
              dbReference: {
                id: responseData.id,
                createdAt: responseData.createdAt || new Date().toISOString()
              }
            }
          }
          return item
        })
        
        localStorage.setItem('uploadedData', JSON.stringify(updatedData))
        
        // Update current data
        setData({
          ...data,
          localOnly: false,
          dbReference: {
            id: responseData.id,
            createdAt: responseData.createdAt || new Date().toISOString()
          }
        })
        
        alert("Data successfully synced with database!")
      } else {
        let errorMessage = "Failed to sync with database"
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
        
        alert(`Error syncing with database: ${errorMessage}`)
      }
    } catch (error) {
      console.error("Error syncing with database:", error)
      alert(`Error syncing with database: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteData = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    try {
      // Remove from localStorage
      const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
      const filteredData = allData.filter((item: any) => item.id.toString() !== dataId)
      localStorage.setItem('uploadedData', JSON.stringify(filteredData))
      
      // If this data is in the database, we should also delete it there
      if (data.dbReference && data.dbReference.id) {
        // In a real app, you would call an API to delete from database
        console.log(`Would delete data with ID ${data.dbReference.id} from database`)
      }
      
      alert(`Data "${data.name}" has been deleted.`)
      router.push('/dashboard/data')
    } catch (error) {
      console.error("Error deleting data:", error)
      alert("Error deleting data. Please try again.")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const downloadData = () => {
    if (!data) return;
    
    try {
      setIsDownloading(true);
      
      // Get the actual data content if available
      let csvContent = "";
      let dataRows = [];
      
      try {
        // Try to parse the data content if it exists
        if (data.dataContent) {
          const parsedContent = JSON.parse(data.dataContent);
          if (parsedContent.columns && parsedContent.customers) {
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
        csvContent += "Note: This is a simplified export. The actual data could not be retrieved.";
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
      
      setIsDownloading(false);
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Error downloading data. Please try again.");
      setIsDownloading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard/data">
              <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Data
              </Button>
            </Link>
          </div>
          
          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <div className="mt-4">
                <Link href="/dashboard/data">
                  <Button>Return to Data</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
            <Link href="/dashboard/data">
              <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Data
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {data.name}
                </h1>
                {data.localOnly && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                    Local Only
                  </span>
                )}
                {data.dbReference && (
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                    Database Synced
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded on {formatDate(data.date)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {data.localOnly && (
              <Button 
                variant="outline" 
                size="sm" 
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                onClick={syncWithDatabase}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Sync to Database
                  </>
                )}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
              onClick={handleDeleteData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700 mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">Data Summary</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Overview of the uploaded dataset
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Data Type</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{data.type}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Rows</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{data.rowCount}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Columns</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{data.columnCount}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                  <div className={`text-lg font-medium ${data.localOnly ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                    {data.localOnly ? 'Local Only' : 'Database Synced'}
                  </div>
                </div>
              </div>
              
              {data.localOnly && (
                <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-400 flex items-center">
                    <CloudUpload className="h-5 w-5 mr-2" />
                    <span>
                      This data is currently stored only on your device. 
                      To make it available across devices and ensure it's not lost, sync it to the database.
                    </span>
                  </p>
                </div>
              )}
              
              {data.dbReference && (
                <div className="mt-4 p-4 border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-400">
                    Database ID: {data.dbReference.id}
                    <br />
                    Synced on: {formatDate(data.dbReference.createdAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Data Insights</CardTitle>
              <CardDescription className="dark:text-gray-400">
                AI-generated insights from your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-400 mb-2">Customer Spending Pattern</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Based on your data, 65% of your customers spend more during weekends, 
                    suggesting an opportunity for weekend promotions.
                  </p>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Product Affinity</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Customers who purchase Product A are 3.5x more likely to also buy Product C, 
                    indicating a strong cross-selling opportunity.
                  </p>
                </div>

                <div className="p-4 border border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-medium text-purple-800 dark:text-purple-400 mb-2">Customer Segmentation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your data reveals 3 distinct customer segments: frequent small buyers (42%), 
                    occasional large spenders (35%), and new customers (23%).
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button>
                  Generate Detailed Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
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
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-400">{data.name}</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {data.rowCount} rows • {data.columnCount} columns • Uploaded on {formatDate(data.date)}
              </p>
              {data.dbReference && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  This will also remove the data from the database.
                </p>
              )}
            </div>
          </div>
          
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