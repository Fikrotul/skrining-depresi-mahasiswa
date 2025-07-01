"use client"

import React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Heart,
  Brain,
  Shield,
  Calendar,
  Loader2,
  RefreshCw,
  Home,
} from "lucide-react"

interface Treatment {
  id: number
  treatment_name: string
  description: string | null
}

interface ScreeningResult {
  id: number
  screening_date: string
  result_disease_code: string
  confidence_level: number
  disease_name: string
  disease_description: string
  treatments: Treatment[]
}

export default function ScreeningResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [result, setResult] = useState<ScreeningResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)

    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          router.push("/login")
          return
        }
      } catch (error) {
        router.push("/login")
        return
      }
    }

    // Fetch screening result
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/screening/result/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setResult(data.result)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to load result")
        }
      } catch (error) {
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    fetchResult()
  }, [resolvedParams.id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium text-lg">Memuat hasil skrining...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-gray-200/50">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 px-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-gray-200/50">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hasil Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">Hasil skrining tidak ditemukan atau telah dihapus.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Determine colors and icons based on disease severity
  let iconColor, bgColor, barColor, levelColor, resultIcon
  if (result.result_disease_code === "P01") {
    iconColor = "text-green-600"
    bgColor = "from-green-100 to-emerald-100"
    barColor = "from-green-500 to-emerald-500"
    levelColor = "bg-green-100 text-green-800 border-green-200"
    resultIcon = CheckCircle
  } else if (result.result_disease_code === "P02") {
    iconColor = "text-yellow-600"
    bgColor = "from-yellow-100 to-orange-100"
    barColor = "from-yellow-500 to-orange-500"
    levelColor = "bg-yellow-100 text-yellow-800 border-yellow-200"
    resultIcon = AlertTriangle
  } else {
    iconColor = "text-red-600"
    bgColor = "from-red-100 to-pink-100"
    barColor = "from-red-500 to-pink-500"
    levelColor = "bg-red-100 text-red-800 border-red-200"
    resultIcon = AlertTriangle
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div
          className={`mb-8 transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Kembali ke Dashboard
          </Link>
        </div>

        <div
          className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 transition-all duration-1000 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="p-8 md:p-12">
            <div className="text-center mb-12">
              <div
                className={`w-24 h-24 bg-gradient-to-r ${bgColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
              >
                {React.createElement(resultIcon, { className: `w-12 h-12 ${iconColor}` })}
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-4">Hasil Skrining Depresi</h1>
              <div className="flex items-center justify-center text-gray-500 mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {new Date(result.screening_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Diagnosis Result */}
              <div className={`bg-gradient-to-r ${bgColor} rounded-2xl p-8 shadow-lg border border-gray-200/50`}>
                <h2 className="font-bold text-gray-900 mb-6 text-xl flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-blue-600" />
                  Diagnosis:
                </h2>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-black text-gray-900">{result.disease_name}</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border ${levelColor}`}>
                    {result.result_disease_code}
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>Tingkat Kepercayaan</span>
                    <span>{Math.round(result.confidence_level * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div
                      className={`h-4 rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 shadow-lg`}
                      style={{ width: `${Math.round(result.confidence_level * 100)}%` }}
                    ></div>
                  </div>
                </div>
                {result.disease_description && (
                  <p className="text-gray-700 leading-relaxed bg-white/50 rounded-xl p-4 border border-gray-200/50">
                    {result.disease_description}
                  </p>
                )}
              </div>

              {/* Treatment Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-gray-200/50">
                <h2 className="font-bold text-gray-900 mb-6 text-xl flex items-center">
                  <Heart className="w-6 h-6 mr-3 text-red-500" />
                  Rekomendasi Penanganan:
                </h2>
                <div className="grid gap-4">
                  {result.treatments.map((treatment, index) => (
                    <div
                      key={treatment.id}
                      className="flex items-start bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-bold text-lg mb-2">{treatment.treatment_name}</h3>
                        {treatment.description && (
                          <p className="text-gray-600 leading-relaxed">{treatment.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-lg">
                <div className="flex">
                  <Shield className="w-6 h-6 text-yellow-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-800 text-lg mb-2">Catatan Penting:</h3>
                    <p className="text-yellow-700 leading-relaxed">
                      Hasil ini hanya sebagai skrining awal dan tidak menggantikan diagnosis medis profesional. Untuk
                      diagnosis yang akurat dan penanganan yang tepat, sangat disarankan untuk berkonsultasi dengan
                      profesional kesehatan mental, psikolog, atau psikiater.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Link
                href="/screening"
                className="group flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-center shadow-lg"
              >
                <span className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-3 group-hover:animate-spin" />
                  Skrining Ulang
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="group flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 text-center"
              >
                <span className="flex items-center justify-center">
                  <Home className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                  Kembali ke Dashboard
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
