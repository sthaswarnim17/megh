import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Search, Lightbulb, Target, BarChart3, Zap, Globe, Factory, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Factory className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">ProductionCoach AI</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-purple-100 text-purple-800">AI-Powered Business Intelligence</Badge>
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Transform Your Production Business with <span className="text-purple-600">Smart Coaching</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
          From BCG Matrix analysis to niche marketing strategies, get AI-powered insights for product development,
          market research, and strategic planning. Perfect for Nepali production businesses ready to scale.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8 py-4">
            Get Your Business Coach
          </Button>
        </Link>
      </section>

      {/* Core Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Complete Business Intelligence Suite</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>AI Research Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automated primary & secondary research with market analysis, competitor insights, and trend
                identification
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>BCG Matrix Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic portfolio analysis with strategies to convert Question Marks to Stars and manage Cash Cows
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>Product Prototyping</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-generated product concepts, feature recommendations, and development roadmaps based on market data
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Lifecycle Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Strategic guidance for each product phase with specific tactics to overcome decline and extend lifecycle
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Niche Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Identify untapped market segments and develop targeted strategies for bigger businesses and enterprises
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time market data, consumer behavior analysis, and strategic recommendations for Nepali businesses
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Perfect for Production Businesses</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <Factory className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Manufacturing</h4>
              <p className="text-sm text-gray-600">Optimize production lines and develop new products</p>
            </div>
            <div className="text-center p-6">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">FMCG</h4>
              <p className="text-sm text-gray-600">Fast-moving consumer goods strategy and positioning</p>
            </div>
            <div className="text-center p-6">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">B2B Products</h4>
              <p className="text-sm text-gray-600">Enterprise solutions and industrial products</p>
            </div>
            <div className="text-center p-6">
              <Search className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Startups</h4>
              <p className="text-sm text-gray-600">New product development and market entry</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Scale Your Production Business?</h3>
          <p className="text-xl mb-8">Join innovative Nepali businesses using AI-powered coaching</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
