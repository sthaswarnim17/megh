"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Star, 
  DollarSign, 
  HelpCircle, 
  TrendingDown, 
  BarChart3, 
  TrendingUp,
  FileSpreadsheet,
  Loader2,
  BarChart,
  Share2,
  Download
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// Define TypeScript interfaces for better type checking
interface Product {
  name: string;
  category: 'star' | 'cashCow' | 'questionMark' | 'dog';
  marketShare: number;
  growthRate: number;
  revenue: number;
  description: string;
  position: { x: number; y: number };
  strategy: string;
  keyMetrics: {
    monthlyGrowth: string;
    customerSatisfaction: string;
    profitMargin: string;
  };
}

interface CategoryConfig {
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

// Add a new interface for BCG Analysis result
interface BCGAnalysisResult {
  id: string;
  data_name: string;
  image: string;
  summary: {
    thresholds: {
      market_share: number;
      growth_rate: number;
    };
    counts: {
      star: number;
      cash_cow: number;
      question_mark: number;
      dog: number;
      total: number;
    };
    top_products?: { name: string; quantity: number; category: string }[];
  };
  analysis: string;
}

export default function BCGMatrixPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDataId, setLoadingDataId] = useState<string | number | null>(null)
  
  // Add new states for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<BCGAnalysisResult | null>(null)
  const [showAnalysisResult, setShowAnalysisResult] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([
    {
      name: "Premium Tea Blend",
      category: "star",
      marketShare: 25,
      growthRate: 18,
      revenue: 2500000,
      description: "High-quality premium tea blend targeting affluent consumers",
      position: { x: 75, y: 80 },
      strategy: "Invest to maintain market leadership and capitalize on high growth",
      keyMetrics: {
        monthlyGrowth: "+12%",
        customerSatisfaction: "4.8/5",
        profitMargin: "35%",
      },
    },
    {
      name: "Standard Tea Packets",
      category: "cashCow",
      marketShare: 45,
      growthRate: 3,
      revenue: 5000000,
      description: "Mass market tea packets - primary revenue generator",
      position: { x: 85, y: 20 },
      strategy: "Harvest cash flow to fund growth in other products",
      keyMetrics: {
        monthlyGrowth: "+2%",
        customerSatisfaction: "4.2/5",
        profitMargin: "28%",
      },
    },
    {
      name: "Organic Herbal Tea",
      category: "questionMark",
      marketShare: 8,
      growthRate: 22,
      revenue: 800000,
      description: "Organic herbal tea targeting health-conscious consumers",
      position: { x: 25, y: 85 },
      strategy: "Invest heavily to gain market share or consider divestment",
      keyMetrics: {
        monthlyGrowth: "+18%",
        customerSatisfaction: "4.6/5",
        profitMargin: "15%",
      },
    },
    {
      name: "Ready-to-Drink Tea",
      category: "questionMark",
      marketShare: 5,
      growthRate: 35,
      revenue: 500000,
      description: "Convenient RTD tea for on-the-go consumption",
      position: { x: 15, y: 90 },
      strategy: "High potential - invest aggressively to capture market share",
      keyMetrics: {
        monthlyGrowth: "+28%",
        customerSatisfaction: "4.4/5",
        profitMargin: "12%",
      },
    },
    {
      name: "Instant Tea Mix",
      category: "dog",
      marketShare: 12,
      growthRate: -5,
      revenue: 300000,
      description: "Instant tea mix facing declining market demand",
      position: { x: 35, y: 15 },
      strategy: "Consider divestment or find niche market opportunities",
      keyMetrics: {
        monthlyGrowth: "-3%",
        customerSatisfaction: "3.8/5",
        profitMargin: "8%",
      },
    },
  ])

  useEffect(() => {
    // Load user data from localStorage when component mounts
    const loadUserData = () => {
      try {
        // Get user ID from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData.id;
        
        if (!userId) {
          console.warn("No user ID found in localStorage");
          return [];
        }
        
        // Get all uploaded data from localStorage
        const allData = JSON.parse(localStorage.getItem('uploadedData') || '[]');
        
        // Filter data for current user
        const userSpecificData = allData.filter((item: any) => item.userId === userId);
        
        // Add sample data for demo purposes
        const sampleData = {
          id: 'sample-data-1',
          name: 'Sample Sales Data',
          type: 'Sales Data',
          date: new Date().toISOString(),
          userId: userId,
          rowCount: 50,
          columnCount: 6,
          file: {
            path: './sample.csv'
          },
          description: 'Demo dataset for BCG Matrix analysis'
        };
        
        // Add sample data if it doesn't exist already
        if (!userSpecificData.find((item: any) => item.id === sampleData.id)) {
          userSpecificData.unshift(sampleData);
        }
        
        return userSpecificData;
      } catch (error) {
        console.error("Error loading user data:", error);
        return [];
      }
    };

    const userData = loadUserData();
    setUploadedData(userData);
  }, [router])

  const categoryConfig: Record<string, CategoryConfig> = {
    star: {
      title: "Stars",
      icon: Star,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      description: "High Growth, High Market Share",
    },
    cashCow: {
      title: "Cash Cows",
      icon: DollarSign,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      description: "Low Growth, High Market Share",
    },
    questionMark: {
      title: "Question Marks",
      icon: HelpCircle,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      description: "High Growth, Low Market Share",
    },
    dog: {
      title: "Dogs",
      icon: TrendingDown,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      description: "Low Growth, Low Market Share",
    },
  }

  const getProductsByCategory = (category: string) => {
    return products.filter((product) => product.category === category)
  }

  // Function to process CSV data and convert it to product format
  const processCSVData = (data: any): Product[] => {
    try {
      // Parse the data content if it's a string
      let parsedContent;
      
      if (data.dataContent) {
        if (typeof data.dataContent === 'string') {
          try {
            parsedContent = JSON.parse(data.dataContent);
          } catch (e) {
            console.error("Error parsing data content:", e);
            return [];
          }
        } else {
          parsedContent = data.dataContent;
        }
      } else {
        console.error("No data content found");
        return [];
      }
      
      // Handle data that's already structured
      if (parsedContent && parsedContent.customers && parsedContent.columns) {
        const products: Product[] = [];
        const customers = parsedContent.customers;
        
        // Find relevant column indexes from the columns definition
        const nameIndex = parsedContent.columns.findIndex((col: any) => 
          col.label.toLowerCase().includes('product') || 
          col.label.toLowerCase().includes('name') || 
          col.label.toLowerCase().includes('item')
        );
        
        const marketShareIndex = parsedContent.columns.findIndex((col: any) => 
          col.label.toLowerCase().includes('market') && col.label.toLowerCase().includes('share')
        );
        
        const growthRateIndex = parsedContent.columns.findIndex((col: any) => 
          col.label.toLowerCase().includes('growth') || col.label.toLowerCase().includes('rate')
        );
        
        const revenueIndex = parsedContent.columns.findIndex((col: any) => 
          col.label.toLowerCase().includes('revenue') || 
          col.label.toLowerCase().includes('sales') ||
          col.label.toLowerCase().includes('income')
        );
        
        const descriptionIndex = parsedContent.columns.findIndex((col: any) => 
          col.label.toLowerCase().includes('desc') || col.label.toLowerCase().includes('detail')
        );
        
        // Process each customer/product entry
        customers.forEach((customer: any, i: number) => {
          // Get data from the row based on column indexes
          const name = nameIndex >= 0 ? customer[parsedContent.columns[nameIndex].id] : `Product ${i + 1}`;
          
          // Parse market share as a number
          let marketShare = 0;
          if (marketShareIndex >= 0) {
            const marketShareValue = customer[parsedContent.columns[marketShareIndex].id];
            marketShare = parseFloat(marketShareValue?.toString() || "0");
          }
          
          // Parse growth rate as a number
          let growthRate = 0;
          if (growthRateIndex >= 0) {
            const growthRateValue = customer[parsedContent.columns[growthRateIndex].id];
            growthRate = parseFloat(growthRateValue?.toString() || "0");
          }
          
          // Parse revenue as a number
          let revenue = 0;
          if (revenueIndex >= 0) {
            const revenueValue = customer[parsedContent.columns[revenueIndex].id];
            revenue = parseFloat(revenueValue?.toString().replace(/[^\d.-]/g, '') || "0");
          }
          
          // Get description
          const description = descriptionIndex >= 0 ? 
            customer[parsedContent.columns[descriptionIndex].id] || 
            `Product description for ${name}` : 
            `Product description for ${name}`;
          
          // Determine category based on market share and growth rate
          let category: 'star' | 'cashCow' | 'questionMark' | 'dog' = 'questionMark';
          
          if (marketShare >= 20) {
            if (growthRate >= 10) {
              category = 'star';
            } else {
              category = 'cashCow';
            }
          } else {
            if (growthRate >= 10) {
              category = 'questionMark';
            } else {
              category = 'dog';
            }
          }
          
          // Calculate position on the matrix
          const x = Math.min(100, Math.max(0, marketShare * 2)); // Adjust based on your scale
          const y = Math.min(100, Math.max(0, growthRate * 2)); // Adjust based on your scale
          
          // Generate strategy based on category
          let strategy = '';
          switch (category) {
            case 'star':
              strategy = 'Invest to maintain market leadership and capitalize on high growth';
              break;
            case 'cashCow':
              strategy = 'Harvest cash flow to fund growth in other products';
              break;
            case 'questionMark':
              strategy = 'Invest selectively to improve market position or divest';
              break;
            case 'dog':
              strategy = 'Consider divestment or find niche market opportunities';
              break;
          }
          
          // Create product object
          products.push({
            name,
            category,
            marketShare,
            growthRate,
            revenue: revenue * 1000, // Convert to a larger number for visualization
            description,
            position: { x, y },
            strategy,
            keyMetrics: {
              monthlyGrowth: growthRate > 0 ? `+${(growthRate / 12).toFixed(1)}%` : `${(growthRate / 12).toFixed(1)}%`,
              customerSatisfaction: '3.7/5', // Default value
              profitMargin: '15%', // Default value
            }
          });
        });
        
        return products;
      }
      
      return [];
    } catch (error) {
      console.error("Error processing CSV data:", error);
      return [];
    }
  };

  const selectDataForAnalysis = async (data: any) => {
    try {
      setIsLoading(true)
      setLoadingDataId(data.id)
      
      console.log("Selecting data for analysis:", data);
      
      // Check if this is the sample data
      if (data.file && data.file.path === './sample.csv') {
        console.log("Using sample data");
        // Process the data and update the products
        const processedProducts = processCSVData(data);
        
        if (processedProducts.length > 0) {
          setProducts(processedProducts);
          setSelectedData(data);
          setIsDataDialogOpen(false);
          
          // Show success message
          alert(`Successfully selected "${data.name}" for BCG Matrix analysis. Click "Analyze with AI" to generate insights.`);
        } else {
          // Show error message if no products were generated
          alert(`Could not process data from "${data.name}". Please make sure the CSV contains columns for product name, market share, growth rate, and revenue.`);
        }
        return;
      }
      
      // For user uploaded data
      console.log("Processing user uploaded data");
      
      // Try to extract CSV content
      let extracted = false;
      
      // Check if this is raw CSV content or structured data
      if (data.csvContent) {
        console.log("Data has csvContent property");
        // This data already has CSV content
        extracted = true;
      } else if (data.dataContent) {
        console.log("Data has dataContent property");
        // Try to parse the data content if it's a string
        try {
          let parsedContent;
          
          if (typeof data.dataContent === 'string') {
            parsedContent = JSON.parse(data.dataContent);
          } else {
            parsedContent = data.dataContent;
          }
          
          if (parsedContent && parsedContent.customers && parsedContent.columns) {
            console.log("Valid data structure found in dataContent");
            // Data is already extracted in the right format - nothing more to do
            extracted = true;
          } else {
            console.log("dataContent doesn't have expected structure:", parsedContent);
          }
        } catch (error) {
          console.error("Error parsing dataContent:", error);
        }
      } else {
        console.log("No data content found in expected properties");
      }
      
      // If we couldn't extract the data, try to load it
      if (!extracted && data.dbReference) {
        console.log("Attempting to fetch data from database reference");
        try {
          // In a real implementation we would fetch from the backend
          // For now, just assume we couldn't retrieve it
          console.log("Would fetch data with ID:", data.dbReference.id);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      
      // If we still don't have the raw content or structured data,
      // try to use whatever we have
      const processedProducts = processCSVData(data);
      
      if (processedProducts.length > 0) {
        setProducts(processedProducts);
        setSelectedData(data);
        setIsDataDialogOpen(false);
        
        // Show success message
        alert(`Successfully selected "${data.name}" for BCG Matrix analysis. Click "Analyze with AI" to generate insights.`);
      } else {
        // Show error message if no products were generated
        alert(`Could not process data from "${data.name}". Please select another dataset with CSV data containing product name, market share, growth rate, and revenue columns.`);
      }
    } catch (error) {
      console.error("Error selecting data for analysis:", error)
      alert("Error processing data. Please try again with a different dataset.")
    } finally {
      setIsLoading(false)
      setLoadingDataId(null)
    }
  }

  // Add new function to analyze data using backend API
  const analyzeDataWithAI = async () => {
    if (!selectedData) {
      alert("Please select data first");
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      console.log("Selected data for analysis:", selectedData);
      
      // Prepare request data
      let requestData = {};
      let endpoint = 'http://localhost:5000/api/bcg-matrix/analyze';
      
      if (selectedData.file && selectedData.file.path === './sample.csv') {
        console.log("Using demo dataset...");
        // Use the demo endpoint for sample.csv
        endpoint = 'http://localhost:5000/api/bcg-matrix/demo';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to analyze data');
        }

        const result = await response.json();
        handleAnalysisResponse(result);
      } else {
        // For user data, we need to extract the CSV content
        console.log("Using user data:", selectedData.name);
        
        // Get CSV content from the data
        let csvContent = "";
        
        // Try to get the data content from the selected data
        if (selectedData.dataContent) {
          try {
            console.log("Data has dataContent, attempting to parse...");
            // Parse the data content
            let parsedContent;
            if (typeof selectedData.dataContent === 'string') {
              parsedContent = JSON.parse(selectedData.dataContent);
              console.log("Parsed content from string:", parsedContent ? "Success" : "Failed");
            } else {
              parsedContent = selectedData.dataContent;
              console.log("Used object dataContent directly");
            }
            
            if (parsedContent && parsedContent.columns && parsedContent.customers) {
              console.log("Found valid data structure with columns and customers");
              console.log("Number of columns:", parsedContent.columns.length);
              console.log("Number of customers/rows:", parsedContent.customers.length);
              
              // Create header row from columns
              const headers = parsedContent.columns.map((col: any) => col.label);
              csvContent += headers.join(',') + '\n';
              
              // Add data rows
              parsedContent.customers.forEach((customer: any) => {
                const rowValues = parsedContent.columns.map((col: any) => {
                  // Escape commas and quotes in values to prevent CSV parsing issues
                  const value = customer[col.id] || '';
                  const strValue = value.toString();
                  if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    // Properly escape quotes by doubling them and wrap in quotes
                    return `"${strValue.replace(/"/g, '""')}"`;
                  }
                  return strValue;
                });
                csvContent += rowValues.join(',') + '\n';
              });
              
              console.log("Generated CSV content, length:", csvContent.length);
              console.log("First 100 chars of CSV:", csvContent.substring(0, 100));
            } else {
              console.log("Invalid data structure in parsedContent:", parsedContent);
            }
          } catch (e) {
            console.error("Error parsing data content:", e);
            throw new Error("Could not parse the selected data content");
          }
        } else if (selectedData.csvContent) {
          // If CSV content is directly available, use it
          csvContent = selectedData.csvContent;
          console.log("Using direct csvContent, length:", csvContent.length);
          console.log("First 100 chars of CSV:", csvContent.substring(0, 100));
        } else if (selectedData.rawContent) {
          // If raw content is available
          csvContent = selectedData.rawContent;
          console.log("Using rawContent, length:", csvContent.length);
          console.log("First 100 chars of CSV:", csvContent.substring(0, 100));
        } else {
          console.error("No usable data content found in the selected data:", selectedData);
          throw new Error("The selected data doesn't contain any processable content");
        }
        
        if (!csvContent) {
          throw new Error("Unable to extract CSV data from the selected source");
        }
        
        // Send the data to the BCG matrix analysis endpoint
        console.log(`Sending data to ${endpoint} with ${csvContent.length} bytes of CSV content`);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataName: selectedData.name,
            csvContent: csvContent
          })
        });

        if (!response.ok) {
          console.error("API error status:", response.status);
          const errorText = await response.text();
          console.error("API error response:", errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: errorText };
          }
          throw new Error(errorData.message || 'Failed to analyze data');
        }

        const result = await response.json();
        console.log("API response:", result);
        handleAnalysisResponse(result);
      }
    } catch (error) {
      console.error("Error analyzing data:", error);
      setAnalysisError(error instanceof Error ? error.message : "An unknown error occurred");
      
      // Show user-friendly error message
      alert(`Error analyzing data: ${error instanceof Error ? error.message : "An unknown error occurred"}. Please try another file or contact support.`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to handle API response
  const handleAnalysisResponse = (result: any) => {
    if (result.success && result.data) {
      // Set empty analysis temporarily if not available
      if (!result.data.analysis) {
        result.data.analysis = "Generating AI analysis...";
        
        // Start polling for analysis results
        setTimeout(async () => {
          try {
            // In a real implementation, you would have an endpoint to check analysis status
            // For now, we'll just show the existing result
            setAnalysisResult((prev) => {
              if (prev && !prev.analysis) {
                return {
                  ...prev,
                  analysis: "Analysis could not be generated. Please try again."
                };
              }
              return prev;
            });
          } catch (pollError) {
            console.error("Error updating analysis results:", pollError);
          }
        }, 3000);
      }
      
      setAnalysisResult(result.data);
      setShowAnalysisResult(true);
    } else {
      throw new Error(result.message || 'Analysis did not return expected data');
    }
  };

  // Add function to download analysis result as PNG
  const downloadAnalysisImage = () => {
    if (!analysisResult) return;
    
    const link = document.createElement('a');
    link.href = analysisResult.image;
    link.download = `BCG_Matrix_${analysisResult.data_name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    })
  }

  // Helper function to render category badges
  const renderCategoryBadge = (category: string) => {
    switch (category) {
      case 'Star':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Star
          </span>
        );
      case 'Cash Cow':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Cash Cow
          </span>
        );
      case 'Question Mark':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Question Mark
          </span>
        );
      case 'Dog':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Dog
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
            {category}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BCG Matrix Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400">Strategic portfolio analysis for your product lineup</p>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsDataDialogOpen(true)} className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Select Data
              </Button>
              {selectedData && (
                <Button 
                  onClick={analyzeDataWithAI} 
                  variant="default" 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart className="h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {selectedData && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <FileSpreadsheet className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-400">Using Data: {selectedData.name}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {selectedData.rowCount} rows • {selectedData.columnCount} columns • Uploaded on {formatDate(selectedData.date)}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => setIsDataDialogOpen(true)}
                >
                  Change Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-6">
        {/* Show analysis results if available */}
        {analysisResult && showAnalysisResult ? (
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    BCG Matrix Analysis - {analysisResult.data_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAnalysisResult(false)}
                    >
                      Back to Chart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadAnalysisImage}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" /> 
                      Download
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Analysis generated using AI based on your product data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                  {/* Left column: BCG Matrix Image */}
                  <div className="col-span-1 lg:col-span-3">
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {analysisResult.image ? (
                        <img 
                          src={analysisResult.image} 
                          alt="BCG Matrix Analysis" 
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            console.error("Error loading image:", e);
                            e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent png
                            e.currentTarget.style.height = '300px';
                            e.currentTarget.style.width = '100%';
                          }}
                        />
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 h-[300px] flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400">Image not available</p>
                        </div>
                      )}
                    </div>
                    
                  </div>

                  {/* Right column: AI Analysis */}
                  <div className="col-span-1 lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">AI Strategic Analysis</h3>
                      
                      {analysisResult.analysis ? (
                        <div className="prose dark:prose-invert max-w-none">
                          {analysisResult.analysis.split('\n').map((paragraph, i) => {
                            // Check if paragraph is a header
                            if (paragraph.trim().startsWith('#') || /^\d+\./.test(paragraph.trim())) {
                              return <h4 key={i} className="text-base font-semibold mt-4 mb-2">{paragraph.replace(/^#+ |^\d+\.\s*/, '')}</h4>;
                            }
                            // Regular paragraph
                            return paragraph.trim() ? (
                              <p key={i} className="text-gray-700 dark:text-gray-300 mb-3">{paragraph}</p>
                            ) : <br key={i} />;
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">Waiting for AI analysis...</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            The AI is analyzing your data. This may take a moment.
                          </p>
                        </div>
                      )}
                      
                      {/* Show error if there is one */}
                      {analysisError && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Error generating analysis</h4>
                          <p className="text-red-700 dark:text-red-400">{analysisError}</p>
                        </div>
                      )}
                      
                      {/* Top Products Section */}
                      {analysisResult.summary?.top_products && analysisResult.summary.top_products.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-base mb-3">Top Products by Quantity</h4>
                          <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                  <th className="py-2 px-3 text-left">Product</th>
                                  <th className="py-2 px-3 text-right">Quantity</th>
                                  <th className="py-2 px-3 text-center">Category</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {analysisResult.summary.top_products.map((product, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                                    <td className="py-2 px-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={product.name}>
                                      {product.name}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium">
                                      {product.quantity.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      {renderCategoryBadge(product.category)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Analysis Thresholds</h4>
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Market Share</p>
                            <p className="font-medium">{analysisResult.summary?.thresholds?.market_share?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Growth Rate</p>
                            <p className="font-medium">{analysisResult.summary?.thresholds?.growth_rate?.toFixed(2) || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
        {/* BCG Matrix Visual */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Product Portfolio Matrix
            </CardTitle>
            <CardDescription>
              Visual representation of your products based on market growth rate and relative market share
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 h-96">
              {/* Axis Labels */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600 dark:text-gray-300">
                Market Growth Rate (%)
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Relative Market Share (%)
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-8 border-l-2 border-b-2 border-gray-300 dark:border-gray-600">
                <div className="absolute top-1/2 left-0 right-0 border-t border-gray-200 dark:border-gray-600"></div>
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-gray-200 dark:border-gray-600"></div>
              </div>

              {/* Quadrant Labels */}
              <div className="absolute top-12 left-12 text-xs font-medium text-blue-600">Question Marks</div>
              <div className="absolute top-12 right-12 text-xs font-medium text-yellow-600">Stars</div>
              <div className="absolute bottom-12 left-12 text-xs font-medium text-red-600">Dogs</div>
              <div className="absolute bottom-12 right-12 text-xs font-medium text-green-600">Cash Cows</div>

              {/* Product Bubbles */}
              {products.map((product, index) => {
                const config = categoryConfig[product.category as keyof typeof categoryConfig]
                const Icon = config.icon
                const size = Math.max(40, Math.min(80, (product.revenue / 100000) * 2))

                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${20 + product.position.x * 0.6}%`,
                      top: `${80 - product.position.y * 0.6}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                    onClick={() => setSelectedCategory(product.category)}
                  >
                    <div
                      className={`w-full h-full rounded-full ${config.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {product.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

            {/* Show error message if analysis failed */}
            {analysisError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">Analysis Error</h3>
                <p className="text-red-700 dark:text-red-300">{analysisError}</p>
              </div>
            )}

        {/* Product Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(categoryConfig).map(([categoryKey, config]) => {
            const categoryProducts = getProductsByCategory(categoryKey)
            const Icon = config.icon

            return (
              <Card key={categoryKey} className={`${config.borderColor} border-2`}>
                <CardHeader className={`${config.bgColor} dark:bg-gray-800`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${config.textColor} dark:text-white`}>{config.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {categoryProducts.length} Products
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {categoryProducts.length > 0 ? (
                    <div className="space-y-0">
                      {categoryProducts.map((product, index) => (
                        <div key={index} className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{(product.revenue / 100000).toFixed(1)}L
                              </p>
                              <p className="text-xs text-gray-500">Annual Revenue</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Market Share: </span>
                              <span className="text-sm font-medium">{product.marketShare}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Growth Rate: </span>
                              <span
                                className={`text-sm font-medium ${product.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {product.growthRate > 0 ? "+" : ""}
                                {product.growthRate}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-500">Monthly Growth</p>
                              <p className="text-sm font-medium">{product.keyMetrics.monthlyGrowth}</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-500">Satisfaction</p>
                              <p className="text-sm font-medium">{product.keyMetrics.customerSatisfaction}</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="text-xs text-gray-500">Profit Margin</p>
                              <p className="text-sm font-medium">{product.keyMetrics.profitMargin}</p>
                            </div>
                          </div>

                          <div
                            className={`p-3 rounded-lg ${config.bgColor} border-l-4 ${config.color.replace("bg-", "border-l-")}`}
                          >
                            <p className="text-xs font-medium text-gray-700 mb-1">Strategic Recommendation:</p>
                            <p className="text-sm text-gray-600">{product.strategy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No products in this category</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Strategic Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Portfolio Strategic Summary
            </CardTitle>
            <CardDescription>Key insights and recommended actions for your product portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Stars Strategy</h4>
                <p className="text-sm text-yellow-700">
                  Continue heavy investment to maintain market leadership and high growth trajectory.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Cash Cows Strategy</h4>
                <p className="text-sm text-green-700">
                  Harvest cash flow efficiently while maintaining market position to fund other products.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Question Marks Strategy</h4>
                <p className="text-sm text-blue-700">
                  Invest selectively in high-potential products or consider divestment for underperformers.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Dogs Strategy</h4>
                <p className="text-sm text-red-700">
                  Minimize investment, find niche markets, or consider discontinuation to free up resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      {/* Data Selection Dialog */}
      <Dialog open={isDataDialogOpen} onOpenChange={setIsDataDialogOpen}>
        <DialogContent className="max-w-3xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Select Data for BCG Matrix Analysis</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Choose a dataset from your uploaded data to perform BCG Matrix analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto py-4">
            {uploadedData.length === 0 ? (
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 mx-auto">
                  <FileSpreadsheet className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You haven't uploaded any data yet. Upload data in the Data Management section first.
                </p>
                <Link href="/dashboard/add-data">
                  <Button>Upload Data</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {uploadedData.slice().reverse().map((data) => (
                  <Card key={data.id} className="bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{data.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {data.rowCount} rows • {data.columnCount} columns • {formatDate(data.date)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => selectDataForAnalysis(data)}
                          disabled={isLoading && loadingDataId === data.id}
                        >
                          {isLoading && loadingDataId === data.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDataDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
