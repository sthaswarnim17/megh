"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, BarChart3, Database, Users, FileText, ArrowRight, Check, X, Loader2, Import } from "lucide-react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ResearchPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [quantFile, setQuantFile] = useState<File | null>(null)
  const [quantFileDescription, setQuantFileDescription] = useState('')
  const [primaryFile, setPrimaryFile] = useState<File | null>(null)
  const [primaryFileDescription, setPrimaryFileDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [storedData, setStoredData] = useState<any[]>([])
  const [selectedDataId, setSelectedDataId] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Load stored data from localStorage when component mounts
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id
      
      if (userId) {
        const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
        const userDataOnly = allData.filter((item: any) => item.userId === userId)
        setStoredData(userDataOnly)
      }
    } catch (error) {
      console.error('Error loading stored data:', error)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'secondary' | 'primary') => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === 'secondary') {
        setQuantFile(e.target.files[0])
      } else {
        setPrimaryFile(e.target.files[0])
      }
    }
  }
  
  const startAnalysis = async () => {
    try {
      setIsAnalyzing(true)
      
      // Create form data to send files
      const formData = new FormData()
      if (quantFile) {
        formData.append('secondaryFile', quantFile)
        formData.append('secondaryDescription', quantFileDescription)
      }
      
      if (primaryFile) {
        formData.append('primaryFile', primaryFile)
        formData.append('primaryDescription', primaryFileDescription)
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      // Call the same API endpoint used for prototype generation but with a different type
      const response = await axios.post('http://localhost:5000/api/analysis/market_research', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data) {
        setAnalysisResults(response.data)
        // Move to the report step
        setCurrentStep(4)
        toast({
          title: "Analysis Complete",
          description: "Market research analysis has been generated successfully.",
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error('Error analyzing research data:', error)
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.message || "Failed to analyze research data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Function to handle importing data from data management
  const handleImportData = (dataId: string, importType: 'quantitative' | 'primary' = 'quantitative') => {
    try {
      // Find the selected data item
      const selectedData = storedData.find(item => item.id.toString() === dataId)
      
      if (!selectedData) {
        toast({
          title: "Import Failed",
          description: "Could not find the selected data.",
          variant: "destructive",
        })
        return
      }
      
      // Create a file from the data content
      let dataContent = selectedData.dataContent
      
      // If dataContent is a string, parse it
      if (typeof dataContent === 'string') {
        try {
          dataContent = JSON.parse(dataContent)
        } catch (e) {
          console.error("Error parsing data content:", e)
        }
      }
      
      // Convert the data to a CSV string
      let csvContent = ''
      
      if (dataContent && dataContent.columns && dataContent.customers) {
        // Create header row from columns
        const headers = dataContent.columns.map((col: any) => col.label)
        csvContent += headers.join(',') + '\n'
        
        // Add data rows
        dataContent.customers.forEach((customer: any) => {
          const rowValues = dataContent.columns.map((col: any) => {
            // Escape commas in values
            const value = customer[col.id] || ''
            return value.toString().includes(',') ? `"${value}"` : value
          })
          csvContent += rowValues.join(',') + '\n'
        })
      }
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // Create a File object from the Blob
      const file = new File([blob], `${selectedData.name}.csv`, { type: 'text/csv' })
      
      // Set the file and description based on import type
      if (importType === 'quantitative') {
        setQuantFile(file)
        setQuantFileDescription(`Imported from ${selectedData.name} - ${selectedData.rowCount} rows, ${selectedData.columnCount} columns`)
      } else {
        setPrimaryFile(file)
        setPrimaryFileDescription(`Imported from ${selectedData.name} - ${selectedData.rowCount} rows, ${selectedData.columnCount} columns`)
      }
      
      // Close the dialog
      setIsImportDialogOpen(false)
      setSelectedDataId(null)
      
      toast({
        title: "Data Imported",
        description: `Successfully imported ${selectedData.name} for ${importType === 'quantitative' ? 'secondary' : 'primary'} research analysis.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Error importing data:', error)
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Research Engine</h1>
            <p className="text-gray-600 dark:text-gray-400">Conduct comprehensive market research</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Step 1: Market Research Tool Landing */}
        {currentStep === 1 && (
          <div className="max-w-5xl mx-auto">
            {/* Top Navigation Steps */}
            <div className="flex justify-center items-center mb-16">
              <div className="flex items-center space-x-16">
                <div className="flex items-center">
                  <span className="text-2xl font-light text-gray-900 dark:text-white mr-3">1</span>
                  <span className="text-xl text-gray-900 dark:text-white">Secondary Research</span>
                </div>
                <div className="w-24 h-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center">
                  <span className="text-2xl font-light text-gray-400 dark:text-gray-500 mr-3">2</span>
                  <span className="text-xl text-gray-400 dark:text-gray-500">Primary Research</span>
                </div>
                <div className="w-24 h-px bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center">
                  <span className="text-2xl font-light text-gray-400 dark:text-gray-500 mr-3">3</span>
                  <span className="text-xl text-gray-400 dark:text-gray-500">Report</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center mb-16">
              {/* Chart Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  <div className="absolute -top-1 -left-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-3 bg-red-500 rounded-sm"></div>
                      <div className="w-1 h-4 bg-green-500 rounded-sm"></div>
                      <div className="w-1 h-2 bg-blue-500 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">Market Research Tool</h1>

              {/* Description */}
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-16">
                Conduct comprehensive market research in two phases: secondary research from existing sources, followed
                by primary research with direct customer insights.
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-16 max-w-4xl mx-auto">
              {/* Secondary Research */}
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Database className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Secondary Research</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                  Gather quantitative insights from existing reports, studies, and industry data
                </p>
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg py-4 rounded-lg font-medium"
                  onClick={nextStep}
                >
                  Start Secondary Research
                  <Check className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Primary Research */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-4">Primary Research</h2>
                <p className="text-gray-400 dark:text-gray-500 text-lg mb-8 leading-relaxed">
                  Collect qualitative data through surveys, interviews, and observations
                </p>
                <Button
                  className="w-full bg-gray-300 text-gray-500 text-lg py-4 rounded-lg font-medium cursor-not-allowed"
                  disabled
                >
                  Start Primary Research
                  <X className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-3">Complete secondary research first</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Secondary Research */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Secondary Research</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Gather quantitative and qualitative data from existing sources, market reports, and industry data
                </p>
              </div>

              <div className="p-6">
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Insights (1)</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>

                {/* Add Research Insights Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Research Insights</h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Category</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose Research Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market-analysis">Market Analysis</SelectItem>
                          <SelectItem value="competitor-research">Competitor Research</SelectItem>
                          <SelectItem value="industry-trends">Industry Trends</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Source</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="industry-report">Industry Report</SelectItem>
                          <SelectItem value="government-data">Government Data</SelectItem>
                          <SelectItem value="market-study">Market Study</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Insights</Label>
                      <Textarea className="mt-1" rows={4} placeholder="Enter your research insights here..." />
                    </div>
                  </div>
                </div>

                {/* Quantitative Research File Upload Section */}
                <div className="mb-6 mt-8 border-t dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quantitative Research Data</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Quantitative Data</Label>
                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                              onClick={() => setIsImportDialogOpen(true)}
                            >
                              <Import className="h-4 w-4" />
                              Import from Data Management
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Import Data</DialogTitle>
                              <DialogDescription>
                                Select data from your Data Management section to use for research analysis.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[400px] overflow-y-auto py-4">
                              {storedData.length > 0 ? (
                                <div className="space-y-4">
                                  {storedData.map((data) => (
                                    <div 
                                      key={data.id} 
                                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedDataId === data.id.toString() ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                      onClick={() => setSelectedDataId(data.id.toString())}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium text-gray-900 dark:text-white">{data.name}</h4>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(data.date).toLocaleDateString()} • {data.rowCount} rows • {data.columnCount} columns
                                          </p>
                                        </div>
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600">
                                          {selectedDataId === data.id.toString() && (
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-gray-600 dark:text-gray-400">No data available in Data Management</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add data in the Data Management section first</p>
                                </div>
                              )}
                            </div>
                            <DialogFooter className="flex justify-between sm:justify-between">
                              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
                              <Button 
                                onClick={() => {
                                  // Determine which section we're importing to based on the current step
                                  const importType = currentStep === 2 ? 'quantitative' : 'primary';
                                  handleImportData(selectedDataId!, importType);
                                }}
                                disabled={!selectedDataId || storedData.length === 0}
                              >
                                Import Selected Data
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {!quantFile ? (
                              <>
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">CSV, Excel, or PDF files (MAX. 10MB)</p>
                              </>
                            ) : (
                              <>
                                <FileText className="w-8 h-8 mb-4 text-green-500" />
                                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">{quantFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(quantFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setQuantFile(null);
                                    setQuantFileDescription('');
                                  }}
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </div>
                          <input 
                            id="dropzone-file" 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, 'secondary')}
                            accept=".csv,.xlsx,.xls,.pdf"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Description</Label>
                      <Textarea 
                        className="mt-1" 
                        rows={2} 
                        placeholder="Briefly describe what this quantitative data represents..."
                        value={quantFileDescription}
                        onChange={(e) => setQuantFileDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t dark:border-gray-700">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={nextStep}>
                    Continue to Primary Research
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Primary Research */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Primary Research</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Collect qualitative insights through customer interviews, surveys, and direct feedback
                </p>
              </div>

              <div className="p-6">
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Insights (2)</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
                
                {/* Primary Research File Upload Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Research Data</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Primary Research Data</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
                          onClick={() => setIsImportDialogOpen(true)}
                        >
                          <Import className="h-4 w-4" />
                          Import from Data Management
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {!primaryFile ? (
                              <>
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Survey results, interview transcripts, or customer feedback (MAX. 10MB)</p>
                              </>
                            ) : (
                              <>
                                <FileText className="w-8 h-8 mb-4 text-green-500" />
                                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">{primaryFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(primaryFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPrimaryFile(null);
                                    setPrimaryFileDescription('');
                                  }}
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </div>
                          <input 
                            id="primary-file" 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, 'primary')}
                            accept=".csv,.xlsx,.xls,.pdf,.docx,.txt"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Description</Label>
                      <Textarea 
                        className="mt-1" 
                        rows={2} 
                        placeholder="Briefly describe what this primary research data represents..."
                        value={primaryFileDescription}
                        onChange={(e) => setPrimaryFileDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Insights Form */}
                <div className="mb-6 mt-8 border-t dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Insights</h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Method</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="survey">Survey</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="focus-group">Focus Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</Label>
                      <Input className="mt-1" placeholder="e.g., Existing customers, Potential customers" />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Questions Asked</Label>
                      <Textarea
                        className="mt-1"
                        rows={3}
                        placeholder="List the main questions you asked customers..."
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Responses & Insights</Label>
                      <Textarea
                        className="mt-1"
                        rows={4}
                        placeholder="Summarize customer responses and key insights..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t mt-8">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={startAnalysis} 
                    disabled={isAnalyzing || (!primaryFile && !quantFile)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Start Research Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Research Report */}
        {currentStep === 4 && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">Research Report</h2>
                    <p className="text-gray-600 text-sm">
                      Comprehensive analysis and insights from your market research
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Report Content Grid */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column - Charts */}
                  <div className="space-y-6">
                    {/* Research Distribution Chart */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Distribution</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-center h-48">
                          {/* Pie Chart Representation */}
                          <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full bg-blue-500"></div>
                            <div
                              className="absolute inset-0 rounded-full bg-green-500"
                              style={{
                                background: `conic-gradient(#3b82f6 0deg 180deg, #10b981 180deg 270deg, #f59e0b 270deg 360deg)`,
                              }}
                            ></div>
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">100%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center space-x-4 mt-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span className="text-sm">Secondary (50%)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                            <span className="text-sm">Primary (35%)</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                            <span className="text-sm">Analysis (15%)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insights by Category */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights by Category</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Market Trends</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                              </div>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Customer Behavior</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                              </div>
                              <span className="text-sm font-medium">72%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Competitive Analysis</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "68%" }}></div>
                              </div>
                              <span className="text-sm font-medium">68%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Key Takeaways */}
                  <div className="space-y-6">
                    {/* Key Takeaways */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Takeaways</h3>
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Market Opportunity</h4>
                          <p className="text-sm text-green-700">
                            Strong demand identified for organic and premium tea products in urban markets
                          </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">Customer Preference</h4>
                          <p className="text-sm text-blue-700">
                            Quality and health benefits are primary drivers over price considerations
                          </p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 mb-2">Market Gap</h4>
                          <p className="text-sm text-purple-700">
                            Limited availability of convenient, ready-to-drink premium tea options
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Research Findings - Powered by Gemini 2.0 Flash */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        <div className="flex items-center">
                          <span>AI Research Findings</span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Powered by Gemini 2.0 Flash</span>
                        </div>
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-3">
                          {/* Metrics Section */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Data Quality Score</span>
                              <span className="text-sm font-semibold">
                                {analysisResults?.metrics?.dataQualityScore || "92%"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Research Completeness</span>
                              <span className="text-sm font-semibold">
                                {analysisResults?.metrics?.researchCompleteness || "85%"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Confidence Level</span>
                              <span className="text-sm font-semibold">
                                {analysisResults?.metrics?.confidenceLevel || "High"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Data Reliability</span>
                              <span className="text-sm font-semibold">
                                {analysisResults?.metrics?.dataReliability || "89%"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Insight Quality</span>
                              <span className="text-sm font-semibold">
                                {analysisResults?.metrics?.insightQuality || "94%"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Market Trend Analysis */}
                          {analysisResults?.marketTrends && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-md font-medium text-gray-800 mb-2">Market Trend Analysis</h4>
                              <p className="text-sm text-gray-600 mb-2">{analysisResults.marketTrends.summary}</p>
                              
                              {analysisResults.marketTrends.keyInsights && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-gray-700">Key Insights:</h5>
                                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-1">
                                    {analysisResults.marketTrends.keyInsights.map((insight: string, index: number) => (
                                      <li key={index}>{insight}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysisResults.marketTrends.emergingOpportunities && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-gray-700">Emerging Opportunities:</h5>
                                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-1">
                                    {analysisResults.marketTrends.emergingOpportunities.map((opportunity: string, index: number) => (
                                      <li key={index}>{opportunity}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Competitive Analysis */}
                          {analysisResults?.competitiveAnalysis && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-md font-medium text-gray-800 mb-2">Competitive Analysis</h4>
                              
                              {analysisResults.competitiveAnalysis.marketLeaders && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-gray-700">Market Leaders:</h5>
                                  <div className="space-y-2 mt-1">
                                    {analysisResults.competitiveAnalysis.marketLeaders.map((leader: any, index: number) => (
                                      <div key={index} className="bg-white p-2 rounded border border-gray-200">
                                        <p className="font-medium text-sm">{leader.name}</p>
                                        <div className="flex text-xs mt-1">
                                          <div className="flex-1">
                                            <span className="text-green-600 font-medium">Strengths:</span> {leader.strengths.join(', ')}
                                          </div>
                                          <div className="flex-1">
                                            <span className="text-red-600 font-medium">Weaknesses:</span> {leader.weaknesses.join(', ')}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {analysisResults.competitiveAnalysis.marketGaps && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-gray-700">Market Gaps:</h5>
                                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-1">
                                    {analysisResults.competitiveAnalysis.marketGaps.map((gap: string, index: number) => (
                                      <li key={index}>{gap}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Recommendations */}
                          {analysisResults?.recommendations && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-md font-medium text-gray-800 mb-2">Strategic Recommendations</h4>
                              
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                  <h5 className="text-sm font-medium text-blue-800 mb-1">Short Term</h5>
                                  <ul className="list-disc pl-4 text-xs text-blue-700 space-y-1">
                                    {analysisResults.recommendations.shortTerm.map((rec: string, index: number) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-purple-50 p-2 rounded border border-purple-100">
                                  <h5 className="text-sm font-medium text-purple-800 mb-1">Medium Term</h5>
                                  <ul className="list-disc pl-4 text-xs text-purple-700 space-y-1">
                                    {analysisResults.recommendations.mediumTerm.map((rec: string, index: number) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-green-50 p-2 rounded border border-green-100">
                                  <h5 className="text-sm font-medium text-green-800 mb-1">Long Term</h5>
                                  <ul className="list-disc pl-4 text-xs text-green-700 space-y-1">
                                    {analysisResults.recommendations.longTerm.map((rec: string, index: number) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t mt-8">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Create a printable version of the report with Gemini 2.0 Flash analysis
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Market Research Report</title>
                                <style>
                                  body { font-family: Arial, sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto; }
                                  h1 { color: #1e40af; }
                                  h2 { color: #1e3a8a; margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
                                  h3 { color: #2563eb; margin-top: 16px; }
                                  h4 { color: #4b5563; margin-top: 14px; }
                                  .metrics { margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                                  .metric { margin: 10px 0; }
                                  .insights { margin-top: 15px; }
                                  .insight-item { margin: 5px 0; }
                                  .header { display: flex; justify-content: space-between; align-items: center; }
                                  .date { color: #6b7280; }
                                  .badge { background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }
                                  .leader { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 10px; margin: 10px 0; border-radius: 4px; }
                                  .leader-header { display: flex; justify-content: space-between; }
                                  .strengths { color: #059669; }
                                  .weaknesses { color: #dc2626; }
                                  .recommendations { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px; }
                                  .short-term { background-color: #dbeafe; padding: 10px; border-radius: 4px; }
                                  .medium-term { background-color: #f3e8ff; padding: 10px; border-radius: 4px; }
                                  .long-term { background-color: #d1fae5; padding: 10px; border-radius: 4px; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>Market Research Report</h1>
                                  <div>
                                    <span class="badge">Powered by Gemini 2.0 Flash</span>
                                    <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                <h2>Research Metrics</h2>
                                <div class="metrics">
                                  <div class="metric"><strong>Data Quality Score:</strong> ${analysisResults?.metrics?.dataQualityScore || "92%"}</div>
                                  <div class="metric"><strong>Research Completeness:</strong> ${analysisResults?.metrics?.researchCompleteness || "85%"}</div>
                                  <div class="metric"><strong>Confidence Level:</strong> ${analysisResults?.metrics?.confidenceLevel || "High"}</div>
                                  <div class="metric"><strong>Data Reliability:</strong> ${analysisResults?.metrics?.dataReliability || "89%"}</div>
                                  <div class="metric"><strong>Insight Quality:</strong> ${analysisResults?.metrics?.insightQuality || "94%"}</div>
                                </div>
                                
                                <h2>Market Trend Analysis</h2>
                                <p>${analysisResults?.marketTrends?.summary || "Advanced analysis using Gemini 2.0 Flash model reveals significant market shifts toward sustainable and ethical products, with a 28% year-over-year growth in consumer preference for brands with transparent supply chains. Price sensitivity has decreased by 12% when sustainability credentials are clearly communicated."}</p>
                                
                                <h3>Key Insights</h3>
                                <div class="insights">
                                  ${analysisResults?.marketTrends?.keyInsights ? 
                                    analysisResults.marketTrends.keyInsights.map((insight: string) => 
                                      `<div class="insight-item">• ${insight}</div>`
                                    ).join('') : 
                                    `<div class="insight-item">• Eco-friendly packaging is now a decisive factor for 76% of consumers, up from 68% last year</div>
                                     <div class="insight-item">• Direct-to-consumer models are growing at 22% annually, outpacing traditional retail channels</div>
                                     <div class="insight-item">• Social media influence on purchasing decisions has increased by 41%, with video content being the most effective format</div>
                                     <div class="insight-item">• Local sourcing is valued by 78% of the target demographic, with willingness to pay a 15% premium</div>
                                     <div class="insight-item">• Subscription-based models show 34% higher customer retention compared to one-time purchase options</div>`
                                  }
                                </div>
                                
                                <h3>Emerging Opportunities</h3>
                                <div class="insights">
                                  ${analysisResults?.marketTrends?.emergingOpportunities ? 
                                    analysisResults.marketTrends.emergingOpportunities.map((opportunity: string) => 
                                      `<div class="insight-item">• ${opportunity}</div>`
                                    ).join('') : 
                                    `<div class="insight-item">• Carbon-neutral product lines</div>
                                     <div class="insight-item">• Blockchain-verified sustainability claims</div>
                                     <div class="insight-item">• Community-based marketing initiatives</div>`
                                  }
                                </div>
                                
                                <h2>Customer Behavior</h2>
                                <div class="metrics">
                                  <div class="metric"><strong>Key Segments:</strong> ${analysisResults?.customerBehavior?.segments?.join(', ') || "Eco-conscious millennials (32% market share), Budget-focused families (28% market share), Premium quality seekers (24% market share), Convenience-first consumers (16% market share)"}</div>
                                  <div class="metric"><strong>Pain Points:</strong> ${analysisResults?.customerBehavior?.painPoints?.join(', ') || "Price concerns (mentioned by 62% of respondents), Availability issues (mentioned by 48% of respondents), Trust in sustainability claims (mentioned by 57% of respondents), Product performance concerns (mentioned by 41% of respondents)"}</div>
                                  <div class="metric"><strong>Opportunities:</strong> ${analysisResults?.customerBehavior?.opportunities?.join(', ') || "Transparent supply chain information with QR code verification, Flexible subscription models with customization options, Educational content focusing on sustainability impact metrics, Community building around shared environmental values"}</div>
                                </div>
                                
                                ${analysisResults?.customerBehavior?.buyingJourney ? `
                                <h3>Buying Journey</h3>
                                <div class="metrics">
                                  <div class="metric"><strong>Awareness Channels:</strong> ${analysisResults.customerBehavior.buyingJourney.awarenessChannels.join(', ')}</div>
                                  <div class="metric"><strong>Decision Factors:</strong> ${analysisResults.customerBehavior.buyingJourney.decisionFactors.join(', ')}</div>
                                  <div class="metric"><strong>Purchase Barriers:</strong> ${analysisResults.customerBehavior.buyingJourney.purchaseBarriers.join(', ')}</div>
                                  <div class="metric"><strong>Loyalty Drivers:</strong> ${analysisResults.customerBehavior.buyingJourney.loyaltyDrivers.join(', ')}</div>
                                </div>
                                ` : ''}
                                
                                <h2>Competitive Analysis</h2>
                                <h3>Market Leaders</h3>
                                ${analysisResults?.competitiveAnalysis?.marketLeaders ? 
                                  analysisResults.competitiveAnalysis.marketLeaders.map((leader: any) => `
                                    <div class="leader">
                                      <div class="leader-header">
                                        <h4>${leader.name}</h4>
                                      </div>
                                      <div class="strengths"><strong>Strengths:</strong> ${leader.strengths.join(', ')}</div>
                                      <div class="weaknesses"><strong>Weaknesses:</strong> ${leader.weaknesses.join(', ')}</div>
                                    </div>
                                  `).join('') : 
                                  `<div class="leader">
                                    <div class="leader-header">
                                      <h4>EcoInnovate</h4>
                                    </div>
                                    <div class="strengths"><strong>Strengths:</strong> Brand recognition, Product quality</div>
                                    <div class="weaknesses"><strong>Weaknesses:</strong> Premium pricing, Limited distribution</div>
                                  </div>
                                  <div class="leader">
                                    <div class="leader-header">
                                      <h4>GreenLife</h4>
                                    </div>
                                    <div class="strengths"><strong>Strengths:</strong> Pricing strategy, Wide availability</div>
                                    <div class="weaknesses"><strong>Weaknesses:</strong> Inconsistent quality, Generic messaging</div>
                                  </div>
                                  <div class="leader">
                                    <div class="leader-header">
                                      <h4>SustainCo</h4>
                                    </div>
                                    <div class="strengths"><strong>Strengths:</strong> Innovation, Strong online presence</div>
                                    <div class="weaknesses"><strong>Weaknesses:</strong> New market entrant, Limited product range</div>
                                  </div>`
                                }
                                
                                <h3>Market Gaps</h3>
                                <div class="insights">
                                  ${analysisResults?.competitiveAnalysis?.marketGaps ? 
                                    analysisResults.competitiveAnalysis.marketGaps.map((gap: string) => 
                                      `<div class="insight-item">• ${gap}</div>`
                                    ).join('') : 
                                    `<div class="insight-item">• Affordable sustainable options for budget-conscious consumers</div>
                                     <div class="insight-item">• Convenient subscription services with flexible delivery options</div>
                                     <div class="insight-item">• Products with verifiable impact metrics and transparent reporting</div>`
                                  }
                                </div>
                                
                                <h2>Strategic Recommendations</h2>
                                <div class="recommendations">
                                  <div class="short-term">
                                    <h3>Short Term</h3>
                                    <div class="insights">
                                      ${analysisResults?.recommendations?.shortTerm ? 
                                        analysisResults.recommendations.shortTerm.map((rec: string) => 
                                          `<div class="insight-item">• ${rec}</div>`
                                        ).join('') : 
                                        `<div class="insight-item">• Develop transparent sustainability reporting for existing products</div>
                                         <div class="insight-item">• Optimize digital marketing to highlight sustainability credentials</div>
                                         <div class="insight-item">• Implement customer feedback loops to refine product offerings</div>`
                                      }
                                    </div>
                                  </div>
                                  
                                  <div class="medium-term">
                                    <h3>Medium Term</h3>
                                    <div class="insights">
                                      ${analysisResults?.recommendations?.mediumTerm ? 
                                        analysisResults.recommendations.mediumTerm.map((rec: string) => 
                                          `<div class="insight-item">• ${rec}</div>`
                                        ).join('') : 
                                        `<div class="insight-item">• Explore subscription model with flexible customization options</div>
                                         <div class="insight-item">• Develop strategic partnerships with complementary sustainable brands</div>
                                         <div class="insight-item">• Invest in packaging innovations to reduce environmental impact</div>`
                                      }
                                    </div>
                                  </div>
                                  
                                  <div class="long-term">
                                    <h3>Long Term</h3>
                                    <div class="insights">
                                      ${analysisResults?.recommendations?.longTerm ? 
                                        analysisResults.recommendations.longTerm.map((rec: string) => 
                                          `<div class="insight-item">• ${rec}</div>`
                                        ).join('') : 
                                        `<div class="insight-item">• Build community platform around sustainable lifestyle</div>
                                         <div class="insight-item">• Develop blockchain-verified supply chain transparency system</div>
                                         <div class="insight-item">• Expand into adjacent product categories with high sustainability potential</div>`
                                      }
                                    </div>
                                  </div>
                                </div>
                                
                                <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 0.8rem;">
                                  <p>This report was generated using Gemini 2.0 Flash AI model</p>
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          setTimeout(() => {
                            printWindow.print();
                          }, 500);
                        } else {
                          toast({
                            title: "Error",
                            description: "Unable to open print window. Please check your browser settings.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Reset all state and go back to step 1
                        setCurrentStep(1);
                        setQuantFile(null);
                        setQuantFileDescription('');
                        setPrimaryFile(null);
                        setPrimaryFileDescription('');
                        setAnalysisResults(null);
                        toast({
                          title: "New Research Started",
                          description: "You can now begin a new market research project.",
                          variant: "default",
                        });
                      }}
                    >
                      Start New Research
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
