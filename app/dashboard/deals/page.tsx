"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, TrendingUp, Users, DollarSign, Target } from "lucide-react"

export default function DealsPage() {
  const [activeTab, setActiveTab] = useState("active")

  const activeDeals = [
    {
      id: 1,
      title: "Weekend Family Bundle",
      description: "Rice, Dal, Oil combo for families",
      discount: "15%",
      targetCustomers: "Families with 3+ members",
      startDate: "2024-01-15",
      endDate: "2024-01-21",
      performance: {
        customers: 45,
        revenue: 12500,
        conversionRate: 23.5,
        progress: 65,
      },
      status: "active",
    },
    {
      id: 2,
      title: "New Customer Welcome",
      description: "First-time shopper discount",
      discount: "20%",
      targetCustomers: "First-time visitors",
      startDate: "2024-01-10",
      endDate: "2024-01-31",
      performance: {
        customers: 67,
        revenue: 15600,
        conversionRate: 31.2,
        progress: 78,
      },
      status: "active",
    },
  ]

  const suggestedDeals = [
    {
      id: 3,
      title: "Churn Prevention Special",
      description: "Target customers who haven't visited in 2+ weeks",
      discount: "25%",
      targetCustomers: "At-risk customers (123 identified)",
      estimatedImpact: "₹18,500 potential recovery",
      confidence: 87,
      aiReason: "High success rate with similar customer segments",
    },
    {
      id: 4,
      title: "Premium Customer Loyalty",
      description: "Exclusive deals for top 10% spenders",
      discount: "12%",
      targetCustomers: "High-value customers (89 identified)",
      estimatedImpact: "₹25,000 additional revenue",
      confidence: 92,
      aiReason: "These customers respond well to exclusive offers",
    },
    {
      id: 5,
      title: "Weekday Boost Campaign",
      description: "Increase Tuesday-Thursday footfall",
      discount: "10%",
      targetCustomers: "Regular customers who usually shop weekends",
      estimatedImpact: "₹8,200 weekday revenue increase",
      confidence: 74,
      aiReason: "Weekday sales are 30% below weekend average",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Deal Management</h1>
            <p className="text-sm text-gray-500">Create and manage personalized deals for your customers</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Deal
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button variant={activeTab === "active" ? "default" : "outline"} onClick={() => setActiveTab("active")}>
            Active Deals ({activeDeals.length})
          </Button>
          <Button variant={activeTab === "suggested" ? "default" : "outline"} onClick={() => setActiveTab("suggested")}>
            AI Suggestions ({suggestedDeals.length})
          </Button>
          <Button variant={activeTab === "history" ? "default" : "outline"} onClick={() => setActiveTab("history")}>
            Deal History
          </Button>
        </div>

        {/* Active Deals */}
        {activeTab === "active" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeDeals.map((deal) => (
                <Card key={deal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <CardDescription>{deal.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Discount</p>
                        <p className="font-semibold text-lg">{deal.discount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Target</p>
                        <p className="font-medium">{deal.targetCustomers}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Campaign Progress</span>
                        <span>{deal.performance.progress}%</span>
                      </div>
                      <Progress value={deal.performance.progress} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-lg font-semibold">{deal.performance.customers}</p>
                        <p className="text-xs text-gray-500">Customers</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-lg font-semibold">₹{deal.performance.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-lg font-semibold">{deal.performance.conversionRate}%</p>
                        <p className="text-xs text-gray-500">Conversion</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit Deal
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggested Deals */}
        {activeTab === "suggested" && (
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  AI-Powered Deal Recommendations
                </CardTitle>
                <CardDescription>
                  These deals are generated based on your customer data and proven to increase revenue and reduce churn
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {suggestedDeals.map((deal) => (
                <Card key={deal.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <CardDescription>{deal.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{deal.confidence}% Confidence</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Suggested Discount</p>
                        <p className="font-semibold text-lg">{deal.discount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Target Group</p>
                        <p className="font-medium text-sm">{deal.targetCustomers}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Estimated Impact</p>
                      <p className="text-lg font-bold text-green-900">{deal.estimatedImpact}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">AI Insight:</p>
                      <p className="text-sm text-gray-700">{deal.aiReason}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Launch Deal
                      </Button>
                      <Button size="sm" variant="outline">
                        Customize
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Deal History */}
        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Deal Performance History</CardTitle>
              <CardDescription>Review past campaigns and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Deal history will be displayed here</p>
                <p className="text-sm">Run a few campaigns to see historical data</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
