"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Factory, Bell, Settings, LogOut, Search, BarChart3, Lightbulb, Target, Megaphone, Upload, FileUp, Database, Eye } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [userName, setUserName] = useState("")
  const [companyName, setCompanyName] = useState("Your Company")
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedData, setUploadedData] = useState<any[]>([])

  // Check authentication and fetch user data
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

        // Fetch user profile from API
        const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!profileResponse.ok) {
          // If API call fails, user might be unauthorized
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        const profileData = await profileResponse.json()
        setUserName(profileData.name || "User")

        // Fetch business data for company name
        try {
          const businessDataResponse = await fetch('http://localhost:5000/api/business-data/type/company_profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (businessDataResponse.ok) {
            const businessData = await businessDataResponse.json()
            if (businessData.length > 0 && businessData[0].data_content.companyName) {
              setCompanyName(businessData[0].data_content.companyName)
            }
          }
        } catch (error) {
          console.error("Error fetching company data:", error)
        }

        // For demo purposes, set a random number of notifications
        setUnreadNotifications(Math.floor(Math.random() * 5))
        
        // Load uploaded data from localStorage - only for current user
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

  const handleLogout = async () => {
    try {
      // In a real app with a backend logout endpoint:
      // const token = localStorage.getItem('token')
      // await fetch('http://localhost:5000/api/users/logout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      
      // Clear local storage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

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

  const dashboardCards = [
    {
      title: "Data Management",
      description: "Upload, view and analyze your business data",
      icon: Database,
      href: "/dashboard/data",
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
    },
    {
      title: "Start Research",
      description: "Begin collecting Secondary & Primary data",
      icon: Search,
      href: "/dashboard/research",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
    },
    {
      title: "BCG Matrix Analysis",
      description: "Analyze product performance by market share vs growth",
      icon: BarChart3,
      href: "/dashboard/bcg-matrix",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
    },
    {
      title: "Product Prototype",
      description: "Manage product ideas, test acceptability",
      icon: Lightbulb,
      href: "/dashboard/prototype",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
    },
    {
      title: "Niche Marketing",
      description: "Build personalized marketing plans for target groups",
      icon: Target,
      href: "/dashboard/marketing",
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
    },
    {
      title: "Marketing Strategies",
      description: "Build campaign strategies based on customer behavior",
      icon: Megaphone,
      href: "/dashboard/strategies",
      color: "from-pink-500 to-pink-600",
      hoverColor: "hover:from-pink-600 hover:to-pink-700",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 relative overflow-hidden rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
              <Image 
                src="/logo/505475357_778369911241595_2236897200594352465_n.png"
                alt="Company Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{companyName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Business Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/notifications">
              <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {userName} 👋</h2>
          <p className="text-gray-600 dark:text-gray-400">Choose a tool to start optimizing your business strategy</p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link key={index} href={card.href}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-white dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} ${card.hoverColor} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Products</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">78%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Research Complete</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Strategies Created</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Prototypes Testing</div>
          </div>
        </div>
      </div>
    </div>
  )
}
