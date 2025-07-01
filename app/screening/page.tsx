"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import {
  Brain,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Heart,
  Shield,
  Clock,
  User,
  ChevronDown,
  Sparkles,
  Activity,
} from "lucide-react"

interface Symptom {
  id: number
  code: string
  name: string
  description: string | null
}

interface Option {
  value: string
  text: string
  color: string
  bgColor: string
  icon: React.ReactNode
}

export default function ScreeningPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  const options: Option[] = [
    {
      value: "0",
      text: "Tidak Sama Sekali",
      color: "text-gray-600",
      bgColor: "from-gray-100 to-gray-200",
      icon: <div className="w-3 h-3 bg-gray-400 rounded-full"></div>,
    },
    {
      value: "0.2",
      text: "Kemungkinan Kecil",
      color: "text-blue-600",
      bgColor: "from-blue-100 to-blue-200",
      icon: <div className="w-3 h-3 bg-blue-400 rounded-full"></div>,
    },
    {
      value: "0.4",
      text: "Mungkin",
      color: "text-green-600",
      bgColor: "from-green-100 to-green-200",
      icon: <div className="w-3 h-3 bg-green-400 rounded-full"></div>,
    },
    {
      value: "0.6",
      text: "Kemungkinan Besar",
      color: "text-yellow-600",
      bgColor: "from-yellow-100 to-yellow-200",
      icon: <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>,
    },
    {
      value: "0.8",
      text: "Hampir Yakin",
      color: "text-orange-600",
      bgColor: "from-orange-100 to-orange-200",
      icon: <div className="w-3 h-3 bg-orange-400 rounded-full"></div>,
    },
    {
      value: "1.0",
      text: " Yakin",
      color: "text-red-600",
      bgColor: "from-red-100 to-red-200",
      icon: <div className="w-3 h-3 bg-red-400 rounded-full"></div>,
    },
  ]

  useEffect(() => {
    setIsLoaded(true)

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

    setSessionId(uuidv4())

    const fetchSymptoms = async () => {
      try {
        const response = await fetch("/api/symptoms")
        if (response.ok) {
          const data = await response.json()
          setSymptoms(data.symptoms)
        } else {
          setError("Gagal memuat data gejala.")
        }
      } catch (error) {
        setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    fetchSymptoms()
  }, [router])

  useEffect(() => {
    const answeredQuestions = Object.keys(answers).length
    const totalQuestions = symptoms.length
    setProgress(totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0)
  }, [answers, symptoms.length])

  const handleAnswerChange = (symptomCode: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [symptomCode]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const filteredAnswers: { [key: string]: string } = {}

      for (const [key, value] of Object.entries(answers)) {
        if (value !== "0") {
          filteredAnswers[key] = value
        }
      }

      if (Object.keys(filteredAnswers).length === 0) {
        setError("Silakan pilih setidaknya satu gejala yang Anda alami.")
        setSubmitting(false)
        return
      }

      const response = await fetch("/api/screening/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: filteredAnswers,
          sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/screening/result/${data.result.screeningId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Gagal mengirim hasil skrining.")
      }
    } catch (error) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedOption = (value: string) => {
    return options.find((option) => option.value === value) || options[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="text-center relative">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Memuat Skrining...</h2>
          <p className="text-gray-600">Menyiapkan pertanyaan untuk anda</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skrining Depresi
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Jawab pertanyaan berikut sesuai dengan gejala yang anda alami
            dalam 2 minggu terakhir
          </p>

          {/* Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress Skrining</span>
              <span>{Math.round(progress)}% Selesai</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div
          className={`mb-8 transition-all duration-1000 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="group inline-flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl shadow-lg animate-shake">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 mr-3 text-red-500" />
              <div>
                <h3 className="font-bold text-red-800">Terjadi Kesalahan</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div
          className={`grid md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          {[
            {
              icon: Clock,
              title: "Waktu Pengerjaan",
              description: "5-10 menit",
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-50 to-cyan-50",
            },
            {
              icon: Shield,
              title: "Privasi Terjaga",
              description: "Data aman & rahasia",
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-50 to-emerald-50",
            },
            {
              icon: Heart,
              title: "Hasil Akurat",
              description: "Berdasarkan standar medis",
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-50 to-pink-50",
            },
          ].map((info, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${info.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200/50`}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
              >
                <info.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-600 text-sm">{info.description}</p>
            </div>
          ))}
        </div>

        {/* Screening Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 transition-all duration-1000 delay-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="space-y-8">
              {symptoms.map((symptom, index) => (
                <div
                  key={symptom.id}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <label className="block text-lg font-bold text-gray-900 mb-3">
                        Apakah anda mengalami <span className="text-blue-600">{symptom.name.toLowerCase()}</span>?
                        {symptom.description && (
                          <span className="block mt-2 text-sm text-gray-600 font-normal bg-white/80 p-3 rounded-xl border border-gray-200">
                            💡 {symptom.description}
                          </span>
                        )}
                      </label>

                      <div className="relative">
                        <select
                          value={answers[symptom.code] || "0"}
                          onChange={(e) => handleAnswerChange(symptom.code, e.target.value)}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm appearance-none cursor-pointer text-lg font-medium"
                        >
                          {options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.text}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 pointer-events-none" />

                        {/* Visual Indicator */}
                        {answers[symptom.code] && answers[symptom.code] !== "0" && (
                          <div className="mt-3 flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getSelectedOption(answers[symptom.code]).icon}
                              <span
                                className={`text-sm font-semibold ${getSelectedOption(answers[symptom.code]).color}`}
                              >
                                {getSelectedOption(answers[symptom.code]).text}
                              </span>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Section */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200/50 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Siap untuk melihat hasil?</h3>
                <p className="text-gray-600 mb-6">
                  Pastikan anda telah menjawab pertanyaan sesuai kondisi yang anda alami
                </p>

                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    <span>
                      Terjawab: {Object.keys(answers).length}/{symptoms.length}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                    <span>
                      Gejala Dialami: {Object.values(answers).filter((value) => value !== "0" && value !== "").length}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || Object.keys(answers).length === 0}
                  className="group px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 mr-3" />
                      Memproses Hasil...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Brain className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                      Lihat Hasil Skrining
                      <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2" />
                    </span>
                  )}
                </button>
              </div>

              {/* Important Note */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-lg">
                <div className="flex">
                  <Shield className="w-6 h-6 text-yellow-500 mr-4 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-bold text-yellow-800 text-lg mb-2">Catatan Penting:</h3>
                    <p className="text-yellow-700 leading-relaxed">
                      Hasil skrining ini digunakan untuk tujuan deteksi dini berdasarkan gejala depresi yang dialami.
                      Jika anda merasa membutuhkan bantuan lebih lanjut, segera konsultasikan dengan tenaga kesehatan
                      mental yang profesional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
