"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, DollarSign, HelpCircle, TrendingDown, BarChart3, TrendingUp } from "lucide-react"

export default function BCGMatrixPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const products = [
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
  ]

  const categoryConfig = {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
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

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const count = getProductsByCategory(key).length
              const Icon = config.icon
              return (
                <div key={key} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{config.title}</p>
                    <p className="text-xl font-bold dark:text-white">{count}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <div className="p-6">
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
      </div>
    </div>
  )
}
