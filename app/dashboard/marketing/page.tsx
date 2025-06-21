"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, Users, DollarSign, Calendar, Edit } from "lucide-react"

export default function MarketingPage() {
  const [editingPlan, setEditingPlan] = useState<number | null>(null)

  const marketingPlans = [
    {
      id: 1,
      name: "Health-Conscious Millennials",
      description: "Target young professionals interested in wellness and organic products",
      audience: "Ages 25-35, Urban, Health-focused",
      channels: ["Instagram", "LinkedIn", "Health Blogs"],
      budget: "₹50,000",
      timeline: "3 months",
      status: "Active",
      kpis: ["Brand Awareness: +25%", "Lead Generation: 150/month", "Conversion Rate: 8%"],
    },
    {
      id: 2,
      name: "Premium Tea Enthusiasts",
      description: "Target affluent customers who appreciate premium tea experiences",
      audience: "Ages 35-55, High income, Quality-focused",
      channels: ["Facebook", "Email", "Premium Stores"],
      budget: "₹75,000",
      timeline: "6 months",
      status: "Planning",
      kpis: ["Premium Sales: +40%", "Customer LTV: ₹5,000", "Retention: 85%"],
    },
  ]

  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    audience: "",
    budget: "",
    timeline: "",
  })

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Niche Marketing</h1>
            <p className="text-gray-600 dark:text-gray-400">Build personalized marketing plans for target groups</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Create New Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Create Marketing Plan
            </CardTitle>
            <CardDescription>Design a targeted marketing strategy for a specific customer segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input placeholder="e.g., Office Workers Campaign" />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input placeholder="e.g., Working professionals, 25-40 years" />
              </div>
              <div className="space-y-2">
                <Label>Budget</Label>
                <Input placeholder="e.g., ₹25,000" />
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your marketing strategy and goals..." />
              </div>
            </div>
            <Button className="mt-4">Create Plan</Button>
          </CardContent>
        </Card>

        {/* Existing Plans */}
        <div className="grid gap-6">
          {marketingPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={plan.status === "Active" ? "default" : "secondary"}>{plan.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => setEditingPlan(plan.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Target Audience</div>
                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">{plan.audience}</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">Budget</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{plan.budget}</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Timeline</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">{plan.timeline}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Channels</div>
                    <div className="text-xs text-orange-600 dark:text-orange-300">{plan.channels.join(", ")}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 dark:text-white">Key Performance Indicators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {plan.kpis.map((kpi, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{kpi}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    View Analytics
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Edit Strategy
                  </Button>
                  <Button className="flex-1">Launch Campaign</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
