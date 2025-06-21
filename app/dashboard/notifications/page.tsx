"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, CheckCheck, FileText, Calendar, Users, Clock, Settings, AlertTriangle } from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  
  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "BCG Matrix Analysis Complete",
      description: "Your BCG Matrix analysis for 'Q2 Product Line' is ready to view.",
      icon: FileText,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      date: "Today, 10:45 AM",
      read: false,
      link: "/dashboard/bcg-matrix"
    },
    {
      id: 2,
      title: "Research Report Generated",
      description: "Your market research report has been generated.",
      icon: FileText,
      iconColor: "text-green-500",
      iconBg: "bg-green-100",
      date: "Today, 9:30 AM",
      read: false,
      link: "/dashboard/research"
    },
    {
      id: 3,
      title: "Calendar Event: Strategy Meeting",
      description: "Reminder: Strategy review meeting at 3:00 PM today.",
      icon: Calendar,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
      date: "Today, 8:15 AM",
      read: false,
      link: "#"
    },
    {
      id: 4,
      title: "New User: Rajesh Sharma",
      description: "Rajesh Sharma has joined your team.",
      icon: Users,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100",
      date: "Yesterday, 4:23 PM",
      read: true,
      link: "#"
    },
    {
      id: 5,
      title: "System Update Complete",
      description: "The system has been updated to version 2.3.0.",
      icon: Settings,
      iconColor: "text-gray-500",
      iconBg: "bg-gray-100",
      date: "Yesterday, 1:45 PM",
      read: true,
      link: "#"
    },
    {
      id: 6,
      title: "Data Upload in Dashboard",
      description: "New data has been uploaded to your dashboard.",
      icon: AlertTriangle,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
      date: "2 days ago",
      read: true,
      link: "/dashboard/add-data"
    },
    {
      id: 7,
      title: "Subscription Renewal",
      description: "Your subscription will renew in 7 days.",
      icon: Clock,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-100",
      date: "3 days ago",
      read: true,
      link: "#"
    }
  ])

  // Check authentication
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

        // Fetch user profile from API to verify token is valid
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

        // In a real app, we would fetch notifications from the API here
        // For now, we'll just use the sample data
        
        setIsLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // In a real app, we would call an API to mark notifications as read
    // For now, we'll just update the local state
    setNotifications(notifications.map(notification => ({ ...notification, read: true })))
  }

  // Mark a specific notification as read
  const markAsRead = async (id: number) => {
    // In a real app, we would call an API to mark a specific notification as read
    // For now, we'll just update the local state
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400">Stay updated with important alerts and updates</p>
            </div>
          </div>
          <Button onClick={markAllAsRead} variant="ghost" size="sm" className="flex items-center dark:text-gray-300 dark:hover:bg-gray-700">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {unreadCount > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Badge variant="destructive" className="mr-2">{unreadCount}</Badge>
                New Notifications
              </h2>
              <div className="space-y-3">
                {notifications
                  .filter(notification => !notification.read)
                  .map(notification => (
                    <Link href={notification.link} key={notification.id} onClick={() => markAsRead(notification.id)}>
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${notification.iconBg} flex items-center justify-center mr-4 dark:bg-opacity-20`}>
                            {notification.icon && <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-900 dark:text-white">{notification.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{notification.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.date}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Earlier</h2>
            <div className="space-y-3">
              {notifications
                .filter(notification => notification.read)
                .map(notification => (
                  <Link href={notification.link} key={notification.id}>
                    <Card className="p-4 hover:shadow-sm transition-shadow cursor-pointer bg-white/70 dark:bg-gray-800/70 dark:border-gray-700">
                      <div className="flex">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${notification.iconBg} flex items-center justify-center mr-4 dark:bg-opacity-20`}>
                          {notification.icon && <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-800 dark:text-gray-200">{notification.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notification.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.date}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 