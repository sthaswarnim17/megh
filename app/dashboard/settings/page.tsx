"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle, Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    notificationsEmail: true,
    notificationsBrowser: true,
    darkMode: false,
    dataSharing: true
  })

  useEffect(() => {
    const loadUserData = async () => {
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
              setFormData(prev => ({
                ...prev,
                name: profileData.name || "",
                email: profileData.email || "",
                companyName: businessData[0].data_content.companyName || "",
                // Set dark mode based on current theme
                darkMode: theme === 'dark'
              }))
            } else {
              setFormData(prev => ({
                ...prev,
                name: profileData.name || "",
                email: profileData.email || "",
                // Set dark mode based on current theme
                darkMode: theme === 'dark'
              }))
            }
          }
        } catch (error) {
          console.error("Error fetching company data:", error)
          setFormData(prev => ({
            ...prev,
            name: profileData.name || "",
            email: profileData.email || "",
            // Set dark mode based on current theme
            darkMode: theme === 'dark'
          }))
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push('/login')
      }
    }

    loadUserData()
  }, [router, theme])

  const handleChange = (field: string, value: string | boolean) => {
    if (field === 'darkMode') {
      // Update theme when dark mode toggle changes
      setTheme(value ? 'dark' : 'light')
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("Authentication required")
      }

      // Update user profile (name)
      const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name
        })
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile")
      }

      // Update company name in business data
      const businessDataResponse = await fetch('http://localhost:5000/api/business-data/type/company_profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      let companyDataId = null;
      let existingData = {};

      if (businessDataResponse.ok) {
        const businessData = await businessDataResponse.json()
        if (businessData.length > 0) {
          // Store existing data ID
          companyDataId = businessData[0].id;
          existingData = businessData[0].data_content || {};
        }
      }

      // If company profile exists, update it
      if (companyDataId) {
        const updateResponse = await fetch(`http://localhost:5000/api/business-data/${companyDataId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            dataName: "Company Profile",
            dataContent: JSON.stringify({
              ...existingData,
              companyName: formData.companyName,
              preferences: {
                darkMode: formData.darkMode,
                notificationsEmail: formData.notificationsEmail,
                notificationsBrowser: formData.notificationsBrowser,
                dataSharing: formData.dataSharing
              }
            })
          })
        });

        if (!updateResponse.ok) {
          console.error("Failed to update company settings");
          const errorText = await updateResponse.text();
          console.error("Error details:", errorText);
        }
      } else {
        // If company profile doesn't exist, create it
        const createResponse = await fetch('http://localhost:5000/api/business-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            dataType: "company_profile",
            dataName: "Company Profile",
            dataContent: JSON.stringify({
              companyName: formData.companyName,
              preferences: {
                darkMode: formData.darkMode,
                notificationsEmail: formData.notificationsEmail,
                notificationsBrowser: formData.notificationsBrowser,
                dataSharing: formData.dataSharing
              }
            })
          })
        });

        if (!createResponse.ok) {
          console.error("Failed to create company settings");
          const errorText = await createResponse.text();
          console.error("Error details:", errorText);
        }
      }

      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      userData.name = formData.name
      localStorage.setItem('user', JSON.stringify(userData))

      // Save theme preference to localStorage
      localStorage.setItem('theme', formData.darkMode ? 'dark' : 'light')
      
      // Apply theme change immediately
      setTheme(formData.darkMode ? 'dark' : 'light')

      setSuccess("Settings saved successfully!")
      
      // Force a refresh to apply changes
      window.location.reload();
    } catch (err: any) {
      console.error("Error saving settings:", err)
      setError(err.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Profile Settings */}
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Profile Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Update your company profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-300">Your Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled
                      title="Email cannot be changed"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="dark:text-gray-300">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Notification Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Configure how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium dark:text-gray-200">Email Notifications</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications about your account and analysis results</p>
                  </div>
                  <Switch 
                    checked={formData.notificationsEmail}
                    onCheckedChange={(checked) => handleChange('notificationsEmail', checked)}
                  />
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium dark:text-gray-200">Browser Notifications</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications in your browser when analysis is complete</p>
                  </div>
                  <Switch 
                    checked={formData.notificationsBrowser}
                    onCheckedChange={(checked) => handleChange('notificationsBrowser', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Appearance</CardTitle>
                <CardDescription className="dark:text-gray-400">Customize the appearance of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {formData.darkMode ? (
                        <Moon className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium dark:text-gray-200">Dark Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode for the application interface</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.darkMode}
                    onCheckedChange={(checked) => handleChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Privacy Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Manage your data and privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium dark:text-gray-200">Data Sharing</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow anonymous usage data to be collected for service improvement</p>
                  </div>
                  <Switch 
                    checked={formData.dataSharing}
                    onCheckedChange={(checked) => handleChange('dataSharing', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSaving} className="dark:bg-blue-600 dark:hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 