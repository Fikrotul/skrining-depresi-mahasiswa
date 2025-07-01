"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  HeartPulse,
  User,
  History,
  Settings,
  LogOut,
  Plus,
  Calendar,
  TrendingUp,
  Activity,
  Loader2,
  ArrowRight,
  Brain,
  Shield,
} from "lucide-react"

interface ScreeningResult {
  id: number
  screening_date: string
  result_disease_code: string
  confidence_level: number
  disease_name?: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          // Fetch screening results
          fetchScreeningResults()
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchScreeningResults = async () => {
    try {
      const response = await fetch("/api/screening/history")
      if (response.ok) {
        const data = await response.json()
        setScreeningResults(data.results)
      }
    } catch (error) {
      console.error("Error fetching screening results:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header
        className={`bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-500 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <Link
                href="/"
                className="flex items-center space-x-2 transition-transform duration-300 group-hover:scale-105"
              >
                <div className="relative">
                  <HeartPulse className="h-8 w-8 text-rose-500 animate-pulse" />
                  <div className="absolute inset-0 h-8 w-8 text-rose-300 animate-ping opacity-75"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MentalCare
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Halo, {user?.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <span className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div
            className={`lg:col-span-1 transition-all duration-1000 ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user?.fullName}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { icon: Activity, label: "Dashboard", href: "#", active: true },
                  { icon: History, label: "Riwayat Skrining", href: "#screening-history" },
                  // { icon: Settings, label: "Pengaturan Profil", href: "#profile" },
                ].map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      item.active
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${item.active ? "text-blue-500" : "text-gray-400"}`} />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Card */}
            <div
              className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden transition-all duration-1000 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative">
                <h2 className="text-3xl font-black mb-4">Selamat Datang di Dashboard</h2>
                <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                  Lihat riwayat hasil skrining dan mulai skrining baru untuk memantau kesehatan mental Anda.
                </p>
                <Link
                  href="/screening"
                  className="group inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Brain className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                  Mulai Skrining Baru
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-1000 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              {[
                {
                  icon: History,
                  title: "Total Skrining",
                  value: screeningResults.length.toString(),
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "from-blue-50 to-cyan-50",
                },
                {
                  icon: TrendingUp,
                  title: "Skrining Bulan Ini",
                  value: screeningResults
                    .filter((r) => new Date(r.screening_date).getMonth() === new Date().getMonth())
                    .length.toString(),
                  color: "from-green-500 to-emerald-500",
                  bgColor: "from-green-50 to-emerald-50",
                },
                // {
                //   icon: Shield,
                //   title: "Status Kesehatan",
                //   value: screeningResults.length > 0 ? "Ada Data" : "Belum Ada Data",
                //   color: "from-purple-500 to-pink-500",
                //   bgColor: "from-purple-50 to-pink-50",
                // },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200/50`}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 font-medium">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Screening History */}
            <div
              id="screening-history"
              className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50 transition-all duration-1000 delay-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 flex items-center">
                  <History className="w-7 h-7 mr-3 text-blue-600" />
                  Riwayat Skrining
                </h2>
                <Link
                  href="/screening"
                  className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Skrining Baru
                  </span>
                </Link>
              </div>

              {screeningResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Hasil
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Tingkat Kepercayaan
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {screeningResults.map((result, index) => (
                        <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(result.screening_date).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                result.result_disease_code === "P01"
                                  ? "bg-green-100 text-green-800"
                                  : result.result_disease_code === "P02"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {result.disease_name || result.result_disease_code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    result.result_disease_code === "P01"
                                      ? "bg-green-500"
                                      : result.result_disease_code === "P02"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.round(result.confidence_level * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round(result.confidence_level * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/screening/result/${result.id}`}
                              className="group text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-300"
                            >
                              <span className="flex items-center">
                                Lihat Detail
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada riwayat skrining</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Mulai skrining baru untuk melihat hasilnya di sini dan memantau kesehatan mental anda
                  </p>
                  <Link
                    href="/screening"
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Brain className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                    Mulai Skrining Pertama
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
