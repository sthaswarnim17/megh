"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Lightbulb, Plus, Star, Users, TrendingUp, BrainCircuit, Loader2, Check, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function PrototypePage() {
  const [newPrototype, setNewPrototype] = useState({
    name: "",
    description: "",
    category: "",
    targetMarket: "",
  })
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [aiPrototypes, setAiPrototypes] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>("existing")
  
  // Function to fetch prototypes
  const fetchPrototypes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Authentication required");
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/analysis/type/product_prototype', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prototypes');
      }
      
      const data = await response.json();
      
      // Transform data format with better error handling
      const prototypes = data.map((item: any) => {
        try {
          // Handle both string and object formats
          let content;
          if (typeof item.analysis_content === 'string') {
            content = JSON.parse(item.analysis_content);
          } else {
            content = item.analysis_content;
          }
          
          // Check if the content has a prototype property
          if (!content.prototype) {
            console.error('Missing prototype in content:', content);
            return {
              id: item.id,
              name: 'Untitled Prototype',
              description: 'No description available',
              created_at: item.created_at,
              error: true
            };
          }
          
          return {
            id: item.id,
            ...content.prototype,
            created_at: item.created_at
          };
        } catch (error) {
          console.error('Error parsing prototype data:', error, item);
          return {
            id: item.id,
            name: 'Error: Corrupted Prototype',
            description: 'There was an error loading this prototype data',
            created_at: item.created_at,
            error: true
          };
        }
      });
      
      setAiPrototypes(prototypes);
    } catch (error) {
      console.error('Error fetching prototypes:', error);
    }
  };
  
  // Fetch existing AI prototypes when the page loads
  useEffect(() => {
    fetchPrototypes();
  }, []);

  const prototypes = [
    {
      id: 1,
      name: "Cold Brew Tea Concentrate",
      description: "Ready-to-mix concentrated tea for instant cold brew preparation",
      category: "Beverages",
      status: "Testing",
      acceptability: 78,
      feedback: [
        { user: "Ram K.", rating: 4, comment: "Great taste, convenient packaging" },
        { user: "Sita M.", rating: 5, comment: "Perfect for office use" },
        { user: "Hari T.", rating: 3, comment: "Price seems high for the quantity" },
      ],
    },
    {
      id: 2,
      name: "Herbal Immunity Blend",
      description: "Organic herbal tea blend focused on immunity boosting",
      category: "Health & Wellness",
      status: "Concept",
      acceptability: 65,
      feedback: [
        { user: "Maya S.", rating: 4, comment: "Love the health benefits focus" },
        { user: "Bikash L.", rating: 4, comment: "Taste could be improved" },
      ],
    },
  ]

  // Function to delete a prototype
  const handleDeletePrototype = async (prototypeId: number) => {
    if (!confirm('Are you sure you want to delete this prototype?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Authentication required. Please login again.");
        setIsDeleting(false);
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/analysis/${prototypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prototype');
      }
      
      // Remove the deleted prototype from the state
      setAiPrototypes(aiPrototypes.filter(prototype => prototype.id !== prototypeId));
      alert('Prototype deleted successfully!');
    } catch (error) {
      console.error('Error deleting prototype:', error);
      alert('Failed to delete prototype. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPrototype.name || !newPrototype.description) {
      alert("Product name and description are required");
      return;
    }
    
    setIsGenerating(true)
    setGenerationError(null)
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setGenerationError("Authentication required. Please login again.");
        setIsGenerating(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/analysis/prototype', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productName: newPrototype.name,
          productDescription: newPrototype.description,
          category: newPrototype.category,
          targetMarket: newPrototype.targetMarket
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate prototype');
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing response JSON:", jsonError);
        setGenerationError("Server returned invalid JSON. Please try again.");
        return;
      }
      
      if (data && data.prototype) {
        // Fetch all prototypes to ensure we have the latest data including IDs
        await fetchPrototypes();
        
        // Switch to AI tab to show the newly generated prototype
        setActiveTab("ai");
        
        // Show appropriate notification based on whether it's a fallback
        if (data.isFallback) {
          alert(`API connection failed. Generated a fallback prototype for "${data.prototype.name}" using local system.`);
        } else {
          alert(`Successfully generated prototype for "${data.prototype.name}"!`);
        }
        
        // Scroll to the AI prototypes section
        setTimeout(() => {
          const aiTabElement = document.getElementById("ai-tab");
          if (aiTabElement) {
            aiTabElement.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
        
    // Reset form
        setNewPrototype({ name: "", description: "", category: "", targetMarket: "" });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error("Error generating prototype:", error);
      setGenerationError(error.message || 'An error occurred while generating the prototype');
    } finally {
      setIsGenerating(false);
    }
  }

  const displayPrototypes = activeTab === "existing" ? prototypes : aiPrototypes;

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Prototype</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage product ideas and test market acceptability</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Add New Prototype */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Create New Prototype
            </CardTitle>
            <CardDescription>Add a new product idea for testing and validation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Green Tea Blend"
                    value={newPrototype.name}
                    onChange={(e) => setNewPrototype({ ...newPrototype, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setNewPrototype({ ...newPrototype, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="snacks">Snacks</SelectItem>
                      <SelectItem value="organic">Organic Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product concept..."
                  value={newPrototype.description}
                  onChange={(e) => setNewPrototype({ ...newPrototype, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Market</Label>
                <Input
                  id="target"
                  placeholder="e.g., Health-conscious millennials, Office workers"
                  value={newPrototype.targetMarket}
                  onChange={(e) => setNewPrototype({ ...newPrototype, targetMarket: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="w-full md:w-auto" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Prototype...
                    </>
                  ) : (
                    <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Create Prototype
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full md:w-auto" 
                  onClick={() => {
                    setNewPrototype({ 
                      ...newPrototype, 
                      name: newPrototype.name || "Product Concept", 
                      description: newPrototype.description || "Brief product description" 
                    });
                    handleSubmit(new Event('submit') as any);
                  }} 
                  disabled={isGenerating}
                >
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Generate AI Prototype
              </Button>
                
                {generationError && (
                  <div className="mt-2 p-3 bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Prototype Tabs */}
        <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="existing">Existing Prototypes</TabsTrigger>
            <TabsTrigger value="ai" id="ai-tab">
              AI-Generated Prototypes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing" className="mt-6">
        <div className="grid gap-6">
          {prototypes.map((prototype) => (
                <PrototypeCard key={prototype.id} prototype={prototype} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-6">
            {aiPrototypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No AI Prototypes Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Generate AI-powered product prototypes by filling out the form above with your product idea.
                </p>
                <Button 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Create AI Prototype
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {aiPrototypes.map((prototype, index) => (
                  <AIPrototypeCard 
                    key={index} 
                    prototype={prototype}
                    onDelete={handleDeletePrototype}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Component for displaying regular prototypes
function PrototypeCard({ prototype }: { prototype: any }) {
  return (
            <Card key={prototype.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{prototype.name}</CardTitle>
                    <CardDescription className="mt-1">{prototype.description}</CardDescription>
                  </div>
                  <Badge variant={prototype.status === "Testing" ? "default" : "secondary"}>{prototype.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{prototype.acceptability}%</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Market Acceptability</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{prototype.feedback.length}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">User Feedback</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Star className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(prototype.feedback.reduce((acc: number, f: any) => acc + f.rating, 0) / prototype.feedback.length).toFixed(
                        1,
                      )}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Avg Rating</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 dark:text-white">User Feedback</h4>
                  <div className="space-y-3">
            {prototype.feedback.map((feedback: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium dark:text-white">{feedback.user}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    Edit Prototype
                  </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Prototype - {prototype.name}</DialogTitle>
                <DialogDescription>
                  Update your product prototype details.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-amber-600 dark:text-amber-400">Edit functionality coming soon!</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    Collect Feedback
                  </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Collect Feedback - {prototype.name}</DialogTitle>
                <DialogDescription>
                  Set up a feedback collection campaign for this prototype.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-amber-600 dark:text-amber-400">Feedback collection functionality coming soon!</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
                  <Button className="flex-1">Launch Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Launch Product - {prototype.name}</DialogTitle>
                <DialogDescription>
                  Start the process of launching this product to market.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-amber-600 dark:text-amber-400">Product launch functionality coming soon!</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
                </div>
              </CardContent>
            </Card>
  );
}

// Component for displaying AI-generated prototypes
function AIPrototypeCard({ 
  prototype, 
  onDelete 
}: { 
  prototype: any; 
  onDelete: (prototypeId: number) => Promise<void>;
}) {
  // State for expanded sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Add error handling for missing properties
  const safePrototype = {
    id: prototype.id || 0,
    name: prototype.name || "Untitled Prototype",
    description: prototype.description || "No description available",
    category: prototype.category || "Uncategorized",
    features: Array.isArray(prototype.features) ? prototype.features : [],
    usps: Array.isArray(prototype.usps) ? prototype.usps : [],
    variations: Array.isArray(prototype.variations) ? prototype.variations : [],
    packaging: prototype.packaging || "",
    pricing: prototype.pricing || "",
    production: prototype.production || "",
    marketing: prototype.marketing || "",
    marketPotential: prototype.marketPotential || "",
    acceptabilityScore: prototype.acceptabilityScore || 0,
    feedback: Array.isArray(prototype.feedback) ? prototype.feedback : [],
    generatedBy: prototype.generatedBy || "AI",
    status: prototype.status || "Concept",
    error: prototype.error || false
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{safePrototype.name}</CardTitle>
              <Badge className={safePrototype.generatedBy === "Fallback System" 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-blue-500 hover:bg-blue-600"
              }>
                {safePrototype.generatedBy === "Fallback System" ? "Fallback System" : "Gemini AI"}
              </Badge>
              <Badge variant={safePrototype.status === "Testing" ? "default" : "secondary"}>{safePrototype.status}</Badge>
            </div>
            <CardDescription className="mt-1">{safePrototype.description}</CardDescription>
            {safePrototype.category && (
              <div className="mt-2">
                <Badge variant="outline" className="mr-2">
                  {safePrototype.category}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{safePrototype.acceptabilityScore || 0}%</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Market Acceptability</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{safePrototype.feedback?.length || 0}</div>
            <div className="text-sm text-green-700 dark:text-green-300">User Feedback</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <Star className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {safePrototype.feedback && safePrototype.feedback.length > 0 
                ? (safePrototype.feedback.reduce((acc: number, f: any) => acc + f.rating, 0) / safePrototype.feedback.length).toFixed(1)
                : "0.0"}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Avg Rating</div>
          </div>
        </div>

        {safePrototype.features && safePrototype.features.length > 0 && (
          <div>
            <Button 
              variant="ghost" 
              className="w-full justify-between mb-2" 
              onClick={() => toggleSection('features')}
            >
              <span className="font-semibold">Features & Specifications</span>
              <span>{expandedSection === 'features' ? '−' : '+'}</span>
            </Button>
            {expandedSection === 'features' && (
              <div className="p-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {safePrototype.features.map((feature: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {safePrototype.usps && safePrototype.usps.length > 0 && (
          <div>
            <Button 
              variant="ghost" 
              className="w-full justify-between mb-2" 
              onClick={() => toggleSection('usps')}
            >
              <span className="font-semibold">Unique Selling Points</span>
              <span>{expandedSection === 'usps' ? '−' : '+'}</span>
            </Button>
            {expandedSection === 'usps' && (
              <div className="p-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {safePrototype.usps.map((usp: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{usp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {safePrototype.variations && safePrototype.variations.length > 0 && (
          <div>
            <Button 
              variant="ghost" 
              className="w-full justify-between mb-2" 
              onClick={() => toggleSection('variations')}
            >
              <span className="font-semibold">Product Variations</span>
              <span>{expandedSection === 'variations' ? '−' : '+'}</span>
            </Button>
            {expandedSection === 'variations' && (
              <div className="p-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <ul className="list-disc pl-5 space-y-1">
                  {safePrototype.variations.map((variation: string, index: number) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{variation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div>
          <Button 
            variant="ghost" 
            className="w-full justify-between mb-2" 
            onClick={() => toggleSection('details')}
          >
            <span className="font-semibold">Additional Details</span>
            <span>{expandedSection === 'details' ? '−' : '+'}</span>
          </Button>
          {expandedSection === 'details' && (
            <div className="space-y-3">
              {safePrototype.packaging && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h5 className="font-medium mb-1">Packaging</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{safePrototype.packaging}</p>
                </div>
              )}
              {safePrototype.pricing && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h5 className="font-medium mb-1">Pricing Strategy</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{safePrototype.pricing}</p>
                </div>
              )}
              {safePrototype.production && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h5 className="font-medium mb-1">Production & Sourcing</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{safePrototype.production}</p>
                </div>
              )}
              {safePrototype.marketing && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h5 className="font-medium mb-1">Marketing Positioning</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{safePrototype.marketing}</p>
                </div>
              )}
              {safePrototype.marketPotential && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h5 className="font-medium mb-1">Market Potential</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{safePrototype.marketPotential}</p>
                </div>
              )}
              
              {/* Show error message if prototype has error flag */}
              {safePrototype.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                  <h5 className="font-medium mb-1 text-red-600 dark:text-red-400">Error Loading Complete Data</h5>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    There was an error loading the complete prototype data. Some information may be missing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {safePrototype.feedback && safePrototype.feedback.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 dark:text-white">User Feedback</h4>
            <div className="space-y-3">
              {safePrototype.feedback.map((feedback: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium dark:text-white">{feedback.user}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < feedback.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feedback.comment}</p>
                </div>
              ))}
      </div>
    </div>
        )}

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Edit Prototype
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Prototype - {safePrototype.name}</DialogTitle>
                <DialogDescription>
                  Update your product prototype details.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-amber-600 dark:text-amber-400">Edit functionality coming soon!</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                Collect Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Collect Feedback - {safePrototype.name}</DialogTitle>
                <DialogDescription>
                  Set up a feedback collection campaign for this prototype.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-amber-600 dark:text-amber-400">Feedback collection functionality coming soon!</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1">
                Launch Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Launch Product - {safePrototype.name}</DialogTitle>
                <DialogDescription>
                  Start the process of launching this product to market.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-amber-600 dark:text-amber-400">Product launch functionality coming soon!</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="destructive" 
            onClick={() => onDelete(safePrototype.id)}
            className="w-auto"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
