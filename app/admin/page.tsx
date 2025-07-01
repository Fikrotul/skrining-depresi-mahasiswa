"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  HeartPulse,
  Users,
  Brain,
  Edit,
  Trash2,
  Loader2,
  BarChart3,
  LogOut,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  User,
} from "lucide-react"

interface Symptom {
  id: number
  code: string
  name: string
  description: string
  cf_rules?: CFRule[]
  cf_statistics?: {
    total_rules: number
    min_cf: number
    has_cf: boolean
  }
}

interface CFRule {
  id: number
  symptom_code: string
  disease_code: string
  cf_expert: number
  symptom_name: string
  symptom_description: string
  disease_name: string
}

interface UserType {
  id: number
  username: string
  email: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

interface CFValue {
  diseaseCode: string
  cfExpert: string
}

interface SymptomsResponse {
  symptoms: Symptom[]
  total_symptoms: number
  total_cf_rules: number
  symptoms_with_cf: number
  symptoms_without_cf: number
}

export default function AdminDashboard() {
  const [editingSymptomId, setEditingSymptomId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("symptoms")
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [cfRules, setCfRules] = useState<CFRule[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [symptomsStats, setSymptomsStats] = useState<{
    total_symptoms: number
    total_cf_rules: number
    symptoms_with_cf: number
    symptoms_without_cf: number
  }>({
    total_symptoms: 0,
    total_cf_rules: 0,
    symptoms_with_cf: 0,
    symptoms_without_cf: 0,
  })
  const router = useRouter()

  // State untuk form gejala
  const [symptomForm, setSymptomForm] = useState({
    code: "",
    name: "",
    description: "",
  })

  // State untuk form CF yang terintegrasi dengan form gejala
  const [cfValues, setCfValues] = useState<CFValue[]>([{ diseaseCode: "", cfExpert: "" }])

  // State untuk form CF terpisah
  const [cfForm, setCfForm] = useState({
    symptomCode: "",
    diseaseCode: "",
    cfExpert: "",
  })

  // State untuk edit nama gejala di CF rules
  const [selectedSymptomForEdit, setSelectedSymptomForEdit] = useState<Symptom | null>(null)
  const [editingSymptomName, setEditingSymptomName] = useState("")
  const [editingSymptomDescription, setEditingSymptomDescription] = useState("")
  const [isEditingSymptomName, setIsEditingSymptomName] = useState(false)

  // State untuk edit user
  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
  })

  useEffect(() => {
    setIsLoaded(true)
    fetchSymptoms()
    fetchCFRules()
    fetchUsers()
  }, [])

  // Auto-populate nama gejala ketika kode gejala dipilih
  useEffect(() => {
    if (cfForm.symptomCode) {
      const selectedSymptom = symptoms.find((s) => s.code === cfForm.symptomCode)
      if (selectedSymptom) {
        setSelectedSymptomForEdit(selectedSymptom)
        setEditingSymptomName(selectedSymptom.name)
        setEditingSymptomDescription(selectedSymptom.description || "")
        setIsEditingSymptomName(false)
      }
    } else {
      setSelectedSymptomForEdit(null)
      setEditingSymptomName("")
      setEditingSymptomDescription("")
      setIsEditingSymptomName(false)
    }
  }, [cfForm.symptomCode, symptoms])

  // Fungsi untuk mengambil data gejala dengan CF rules
  const fetchSymptoms = async () => {
    try {
      setDataLoading(true)
      const response = await fetch("/api/admin/symptoms")
      if (response.ok) {
        const data: SymptomsResponse = await response.json()
        setSymptoms(data.symptoms || [])
        setSymptomsStats({
          total_symptoms: data.total_symptoms || 0,
          total_cf_rules: data.total_cf_rules || 0,
          symptoms_with_cf: data.symptoms_with_cf || 0,
          symptoms_without_cf: data.symptoms_without_cf || 0,
        })
      } else {
        console.error("Error fetching symptoms:", response.statusText)
        setSymptoms([])
      }
    } catch (error) {
      console.error("Error mengambil data gejala:", error)
      setSymptoms([])
    } finally {
      setDataLoading(false)
    }
  }

  // Fungsi untuk mengambil data CF rules
  const fetchCFRules = async () => {
    try {
      const response = await fetch("/api/admin/cf-rules")
      if (response.ok) {
        const data = await response.json()
        setCfRules(data.cfRules || [])
      } else {
        console.error("Error fetching CF rules:", response.statusText)
        setCfRules([])
      }
    } catch (error) {
      console.error("Error mengambil data CF rules:", error)
      setCfRules([])
    }
  }

  // Fungsi untuk mengambil data users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error("Error fetching users:", response.statusText)
        setUsers([])
      }
    } catch (error) {
      console.error("Error mengambil data users:", error)
      setUsers([])
    }
  }

  // Fungsi untuk memperbarui semua data
  const refreshData = async () => {
    setDataLoading(true)
    try {
      await Promise.all([fetchSymptoms(), fetchCFRules()])
    } finally {
      setDataLoading(false)
    }
  }

  // Fungsi untuk mendapatkan CF values untuk gejala tertentu (dari data yang sudah terintegrasi)
  const getCFValuesForSymptom = (symptomCode: string) => {
    const symptom = symptoms.find((s) => s.code === symptomCode)
    return symptom?.cf_rules || []
  }

  // Fungsi untuk mendapatkan nama penyakit berdasarkan kode
  const getDiseaseName = (diseaseCode: string) => {
    const diseaseMap: { [key: string]: string } = {
      P01: "Depresi Ringan",
      P02: "Depresi Sedang",
      P03: "Depresi Berat",
    }
    return diseaseMap[diseaseCode] || diseaseCode
  }

  // Fungsi untuk mendapatkan warna berdasarkan nilai CF
  const getCFColor = (cfValue: number) => {
    if (cfValue >= 0.8) return "from-red-500 to-red-600"
    if (cfValue >= 0.6) return "from-orange-500 to-orange-600"
    if (cfValue >= 0.4) return "from-yellow-500 to-yellow-600"
    if (cfValue >= 0.2) return "from-blue-500 to-blue-600"
    return "from-gray-500 to-gray-600"
  }

  // Fungsi untuk mendapatkan warna text berdasarkan nilai CF
  const getCFTextColor = (cfValue: number) => {
    if (cfValue >= 0.8) return "text-red-700 bg-red-100 border-red-200"
    if (cfValue >= 0.6) return "text-orange-700 bg-orange-100 border-orange-200"
    if (cfValue >= 0.4) return "text-yellow-700 bg-yellow-100 border-yellow-200"
    if (cfValue >= 0.2) return "text-blue-700 bg-blue-100 border-blue-200"
    return "text-gray-700 bg-gray-100 border-gray-200"
  }

  // Fungsi untuk menambah/mengurangi input CF
  const addCFInput = () => {
    setCfValues([...cfValues, { diseaseCode: "", cfExpert: "" }])
  }

  const removeCFInput = (index: number) => {
    if (cfValues.length > 1) {
      const newCfValues = cfValues.filter((_, i) => i !== index)
      setCfValues(newCfValues)
    }
  }

  const updateCFValue = (index: number, field: keyof CFValue, value: string) => {
    const newCfValues = [...cfValues]
    newCfValues[index][field] = value
    setCfValues(newCfValues)
  }

  // Fungsi submit form gejala dengan CF values
  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi CF values jika ada yang diisi
      const validCfValues = cfValues.filter((cf) => cf.diseaseCode && cf.cfExpert)

      // Validasi nilai CF
      for (const cf of validCfValues) {
        const cfValue = Number.parseFloat(cf.cfExpert)
        if (isNaN(cfValue) || cfValue < 0 || cfValue > 1) {
          alert("Nilai CF harus berupa angka antara 0 dan 1")
          setLoading(false)
          return
        }
      }

      // Submit gejala terlebih dahulu
      const method = editingSymptomId ? "PUT" : "POST"
      const body = editingSymptomId ? { id: editingSymptomId, ...symptomForm } : symptomForm

      const symptomResponse = await fetch("/api/admin/symptoms", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!symptomResponse.ok) {
        const error = await symptomResponse.json()
        alert(`Error menyimpan gejala: ${error.error}`)
        setLoading(false)
        return
      }

      const symptomResult = await symptomResponse.json()

      // Jika ada CF values yang valid, simpan juga
      if (validCfValues.length > 0) {
        // Tunggu sebentar untuk memastikan gejala sudah tersimpan di database
        await new Promise((resolve) => setTimeout(resolve, 500))

        for (const cf of validCfValues) {
          try {
            const cfResponse = await fetch("/api/admin/cf-rules", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                symptomCode: symptomForm.code,
                diseaseCode: cf.diseaseCode,
                cfExpert: Number.parseFloat(cf.cfExpert),
              }),
            })

            if (!cfResponse.ok) {
              const cfError = await cfResponse.json()
              console.error(`Error menyimpan CF rule untuk ${cf.diseaseCode}:`, cfError.error)
            }
          } catch (error) {
            console.error(`Error saat menyimpan CF rule:`, error)
          }
        }
      }

      alert(editingSymptomId ? "Data Gejala berhasil diperbarui" : `Data Gejala berhasil ditambahkan`)

      // Reset form
      setSymptomForm({ code: "", name: "", description: "" })
      setCfValues([{ diseaseCode: "", cfExpert: "" }])
      setEditingSymptomId(null)

      // Refresh data dengan delay untuk memastikan database sudah diupdate
      setTimeout(async () => {
        await refreshData()
      }, 1000)
    } catch (error) {
      alert(editingSymptomId ? "Error memperbarui gejala" : "Error menambah gejala")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi batal edit gejala
  const handleCancelEdit = () => {
    setEditingSymptomId(null)
    setSymptomForm({ code: "", name: "", description: "" })
    setCfValues([{ diseaseCode: "", cfExpert: "" }])
  }

  // Fungsi edit gejala
  const handleEditSymptom = (symptom: Symptom) => {
    setSymptomForm({
      code: symptom.code,
      name: symptom.name,
      description: symptom.description,
    })
    setEditingSymptomId(symptom.id)

    // Load existing CF values for this symptom dari data yang sudah terintegrasi
    const existingCfValues = symptom.cf_rules || []
    if (existingCfValues.length > 0) {
      setCfValues(
        existingCfValues.map((cf) => ({
          diseaseCode: cf.disease_code,
          cfExpert: cf.cf_expert.toString(),
        })),
      )
    } else {
      setCfValues([{ diseaseCode: "", cfExpert: "" }])
    }
  }

// const handleDeleteSymptom = async (id: number, deleteType: "soft" | "hard" = "soft") => {
//   const confirmMessage =
//     deleteType === "hard"
//       ? "Apakah Anda yakin ingin menghapus permanen data gejala ini? Tindakan ini akan menghapus semua data terkait (termasuk aturan CF) dan tidak dapat dibatalkan."
//       : "Apakah Anda yakin ingin menonaktifkan data gejala ini? Data tidak akan dihapus permanen dan dapat diaktifkan kembali.";
  
//   if (!confirm(confirmMessage)) return;

//   setLoading(true);
//   try {
//     const response = await fetch(`/api/admin/symptoms?id=${id}&type=${deleteType}`, {
//       method: "DELETE",
//     });

//     if (response.ok) {
//       const result = await response.json();
//       alert(result.message);

//       await fetchSymptoms();
//       await fetchCFRules();

//       if (editingSymptomId === id) {
//         setEditingSymptomId(null);
//         setSymptomForm({ code: "", name: "", description: "" });
//         setCfValues([{ diseaseCode: "", cfExpert: "" }]);
//       }

//       if (selectedSymptomForEdit?.id === id) {
//         setSelectedSymptomForEdit(null);
//         setEditingSymptomName("");
//         setEditingSymptomDescription("");
//         setIsEditingSymptomName(false);
//         setCfForm({ ...cfForm, symptomCode: "" });
//       }
//     } else {
//       const error = await response.json();
//       alert(`Error: ${error.error}`);
//     }
//   } catch (error) {
//     alert(`Error menghapus gejala: ${error}`);
//     console.error("Error:", error);
//   } finally {
//     setLoading(false);
//   }
// };

  // Fungsi hapus gejala
  const handleDeleteSymptom = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Data Gejala ini?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/symptoms?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)

        await fetchSymptoms()
        await fetchCFRules()

        if (editingSymptomId === id) {
          setEditingSymptomId(null)
          setSymptomForm({ code: "", name: "", description: "" })
          setCfValues([{ diseaseCode: "", cfExpert: "" }])
        }

        if (selectedSymptomForEdit?.id === id) {
          setSelectedSymptomForEdit(null)
          setEditingSymptomName("")
          setEditingSymptomDescription("")
          setIsEditingSymptomName(false)
          setCfForm({ ...cfForm, symptomCode: "" })
        }
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert("Error menghapus gejala")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi submit form CF
  const handleCFSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/cf-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomCode: cfForm.symptomCode,
          diseaseCode: cfForm.diseaseCode,
          cfExpert: Number.parseFloat(cfForm.cfExpert),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setCfForm({ symptomCode: "", diseaseCode: "", cfExpert: "" })
        fetchCFRules()
        fetchSymptoms() // Refresh symptoms to get updated CF data
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert("Error menyimpan CF rule")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi hapus CF rule
  const handleDeleteCFRule = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aturan nilai CF ini?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/cf-rules?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchCFRules()
        fetchSymptoms() // Refresh symptoms to get updated CF data
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert("Error menghapus aturan CF")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk update nama gejala dari CF rules
  const handleSymptomNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSymptomForEdit) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/cf-rules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: selectedSymptomForEdit.code,
          name: editingSymptomName,
          description: editingSymptomDescription,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setIsEditingSymptomName(false)
        fetchSymptoms()
        fetchCFRules()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert("Error memperbarui data gejala")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi batal edit nama gejala
  const handleCancelSymptomNameEdit = () => {
    if (selectedSymptomForEdit) {
      setEditingSymptomName(selectedSymptomForEdit.name)
      setEditingSymptomDescription(selectedSymptomForEdit.description || "")
    }
    setIsEditingSymptomName(false)
  }

  // Fungsi edit user
  const handleEditUser = (user: UserType) => {
    setEditingUserId(user.id)
    setUserForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      date_of_birth: user.date_of_birth || "",
      gender: user.gender || "",
    })
  }

  // Fungsi submit form user
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUserId) return

    setLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUserId,
          ...userForm,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setEditingUserId(null)
        setUserForm({
          full_name: "",
          email: "",
          phone: "",
          date_of_birth: "",
          gender: "",
        })
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert("Error memperbarui data user")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi batal edit user
  const handleCancelUserEdit = () => {
    setEditingUserId(null)
    setUserForm({
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
    })
  }

  // Fungsi hapus user
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus User ini?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchUsers()
        if (editingUserId === id) {
          handleCancelUserEdit()
        }
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert("Error menghapus user")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Fungsi logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
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
              <div className="flex items-center space-x-2 transition-transform duration-300 group-hover:scale-105">
                <div className="relative">
                  <HeartPulse className="h-8 w-8 text-rose-500 animate-pulse" />
                  <div className="absolute inset-0 h-8 w-8 text-rose-300 animate-ping opacity-75"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MentalCare
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <span className="flex items-center">
                <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1" />
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Loading Indicator */}
      {dataLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-lg font-semibold text-gray-700 animate-pulse">Memuat data...</div>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!dataLoading && (
        <>
          {/* Statistics Dashboard */}
          <div
            className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  icon: Brain,
                  title: "Total Gejala",
                  value: symptomsStats.total_symptoms,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "from-blue-50 to-cyan-50",
                },
                {
                  icon: BarChart3,
                  title: "Total CF Rules",
                  value: symptomsStats.total_cf_rules,
                  color: "from-green-500 to-emerald-500",
                  bgColor: "from-green-50 to-emerald-50",
                },
                {
                  icon: CheckCircle,
                  title: "Gejala dengan CF",
                  value: symptomsStats.symptoms_with_cf,
                  color: "from-purple-500 to-pink-500",
                  bgColor: "from-purple-50 to-pink-50",
                },
                {
                  icon: AlertTriangle,
                  title: "Gejala tanpa CF",
                  value: symptomsStats.symptoms_without_cf,
                  color: "from-orange-500 to-red-500",
                  bgColor: "from-orange-50 to-red-50",
                },
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
                  <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200/50 mb-8 bg-white/50 backdrop-blur-sm rounded-t-2xl">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "symptoms", name: "Data Gejala", icon: Brain },
                  // { id: "cf-rules", name: "Aturan Nilai CF", icon: BarChart3 },
                  { id: "users", name: "Manajemen Pengguna", icon: Users },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group py-4 px-2 border-b-4 transition-all duration-300 font-semibold tracking-wide flex items-center ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon
                      className={`w-5 h-5 mr-2 ${activeTab === tab.id ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}`}
                    />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Konten: Data Gejala */}
            {activeTab === "symptoms" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Form Tambah/Edit Gejala dengan CF Values */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <Brain className="w-6 h-6 mr-3 text-blue-600" />
                    {editingSymptomId ? "Edit Data Gejala" : "Tambah Data Gejala"}
                  </h3>
                  <form onSubmit={handleSymptomSubmit} className="space-y-6 flex-1 flex flex-col">
                    {/* Form Data Gejala */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kode Gejala</label>
                        <input
                          type="text"
                          value={symptomForm.code}
                          onChange={(e) => setSymptomForm({ ...symptomForm, code: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          placeholder="G01 - G15"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Gejala</label>
                        <input
                          type="text"
                          value={symptomForm.name}
                          onChange={(e) => setSymptomForm({ ...symptomForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          placeholder="Masukkan nama gejala"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                        <textarea
                          value={symptomForm.description}
                          onChange={(e) => setSymptomForm({ ...symptomForm, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          rows={3}
                          placeholder="Masukkan deskripsi gejala"
                        />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                        Nilai CF untuk Setiap Penyakit
                      </h4>
                      <div className="space-y-4">
                        {cfValues.map((cf, index) => (
                          <div
                            key={index}
                            className="flex gap-3 items-end p-4 bg-white/80 rounded-xl border border-gray-200"
                          >
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Tingkat Penyakit</label>
                              <select
                                value={cf.diseaseCode}
                                onChange={(e) => updateCFValue(index, "diseaseCode", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Pilih Tingkat</option>
                                <option value="P01">P01 - Depresi Ringan</option>
                                <option value="P02">P02 - Depresi Sedang</option>
                                <option value="P03">P03 - Depresi Berat</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Nilai CF</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={cf.cfExpert}
                                onChange={(e) => updateCFValue(index, "cfExpert", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.0 - 1.0"
                              />
                            </div>
                            {cfValues.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCFInput(index)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Hapus CF"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* <button
                        type="button"
                        onClick={addCFInput}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 font-medium flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Nilai CF
                      </button> */}

                      <div className="text-xs text-gray-500 mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        💡 <strong>:</strong> Nilai CF menunjukkan tingkat kepercayaan pakar terhadap gejala untuk
                        setiap tingkat depresi. Semakin tinggi nilai (mendekati 1), semakin kuat indikasi gejala
                        tersebut.
                      </div>
                    </div>

                    {/* CF Values Section */}
                    {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200/50 flex-1">
                      
                    </div> */}

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-bold"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Menyimpan...
                          </div>
                        ) : editingSymptomId ? (
                          "Perbarui Gejala"
                        ) : (
                          "Simpan Data Gejala"
                        )}
                      </button>
                      {editingSymptomId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Daftar Gejala dengan Nilai CF yang Ditingkatkan */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center">
                      <Brain className="w-6 h-6 mr-3 text-blue-600" />
                      Data Gejala Depresi
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                        {symptoms.length} Gejala
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                        {symptomsStats.total_cf_rules} CF Rules
                      </span>
                    </div>
                  </div>

                  {/* Container dengan tinggi tetap dan scroll */}
                  <div className="space-y-4 h-[800px] overflow-y-auto custom-scrollbar flex-1">
                    {(symptoms || []).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Belum ada data gejala</p>
                    ) : (
                      // Mengelompokkan gejala menjadi 2 per tampilan
                      Array.from({ length: Math.ceil(symptoms.length / 2) }).map((_, groupIndex) => {
                        const startIndex = groupIndex * 2
                        const groupSymptoms = symptoms.slice(startIndex, startIndex + 2)
                        
                        return (
                          <div key={groupIndex} className="space-y-4 pb-4 border-b border-gray-200 last:border-b-0">
                            {groupSymptoms.map((symptom) => {
                              const cfValues = symptom.cf_rules || []
                              const stats = symptom.cf_statistics

                              return (
                                <div
                                  key={symptom.id}
                                  className={`border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300 ${
                                    editingSymptomId === symptom.id ? "border-blue-500 bg-blue-50 shadow-lg" : "bg-white/80"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div onClick={() => handleEditSymptom(symptom)} className="flex-1 cursor-pointer">
                                      {/* Header Gejala dengan CF Summary */}
                                      <div className="flex items-center gap-3 mb-4">
                                        <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg text-sm">
                                          {symptom.code}
                                        </span>
                                        <h4 className="font-bold text-gray-900 flex-1 text-lg">{symptom.name}</h4>

                                        {/* CF Summary Badges */}
                                        {stats?.has_cf ? (
                                          <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              {stats.total_rules} CF
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            No CF
                                          </span>
                                        )}
                                      </div>

                                      {/* Deskripsi Gejala */}
                                      {symptom.description && (
                                        <p className="text-sm text-gray-600 mb-4 pl-4 border-l-4 border-blue-200 italic bg-blue-50/50 py-2 rounded-r-lg">
                                          {symptom.description}
                                        </p>
                                      )}

                                      {/* Detail Nilai CF */}
                                      {cfValues.length > 0 ? (
                                        <div className="space-y-3">
                                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                            <div className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
                                              <BarChart3 className="w-4 h-4" />
                                              NILAI CERTAINTY FACTOR (CF)
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                              {cfValues.map((cfRule) => (
                                                <div
                                                  key={cfRule.id}
                                                  className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                        {cfRule.disease_code}
                                                      </span>
                                                      <span className="text-xs text-gray-700 font-medium">
                                                        {getDiseaseName(cfRule.disease_code)}
                                                      </span>
                                                    </div>
                                                  </div>

                                                  <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                      <div className="text-xs text-gray-500">CF Value</div>
                                                      <span
                                                        className={`px-2 py-1 rounded text-xs font-bold border ${getCFTextColor(cfRule.cf_expert)}`}
                                                      >
                                                        {cfRule.cf_expert}
                                                      </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-20 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                                      <div
                                                        className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r ${getCFColor(cfRule.cf_expert)}`}
                                                        style={{ width: `${cfRule.cf_expert * 100}%` }}
                                                      ></div>
                                                      <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-white drop-shadow">
                                                          {Math.round(cfRule.cf_expert * 100)}%
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500 italic bg-yellow-50 px-4 py-4 rounded-xl border border-yellow-200 flex items-center gap-3">
                                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                          <div>
                                            <div className="font-bold text-yellow-700">
                                              Belum ada nilai CF untuk gejala ini
                                            </div>
                                            <div className="text-yellow-600">
                                              Klik untuk mengedit dan menambahkan nilai CF
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteSymptom(symptom.id)
                                      }}
                                      disabled={loading}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-100 disabled:opacity-50 p-2 rounded-lg transition-all duration-300 ml-3"
                                      title="Hapus gejala"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Konten: Aturan Nilai CF */}
            {activeTab === "cf-rules" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form CF Rules */}
                <div className="space-y-6">
                  {/* Form Perbarui Nilai CF */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-gray-900 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                        Perbarui Nilai CF
                      </h3>
                      <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                        {symptoms.length} gejala tersedia
                      </div>
                    </div>
                    <form onSubmit={handleCFSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Kode Gejala
                          <span className="text-xs text-gray-500 ml-2 font-normal">
                            (Data otomatis diperbarui saat menambah gejala baru)
                          </span>
                        </label>
                        <select
                          value={cfForm.symptomCode}
                          onChange={(e) => setCfForm({ ...cfForm, symptomCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          required
                        >
                          <option value="">Pilih Data Gejala</option>
                          {(symptoms || []).map((symptom) => (
                            <option key={symptom.code} value={symptom.code}>
                              {symptom.code} - {symptom.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tingkat Penyakit</label>
                        <select
                          value={cfForm.diseaseCode}
                          onChange={(e) => setCfForm({ ...cfForm, diseaseCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          required
                        >
                          <option value="">Pilih Tingkat Penyakit</option>
                          <option value="P01">P01 - Depresi Ringan</option>
                          <option value="P02">P02 - Depresi Sedang</option>
                          <option value="P03">P03 - Depresi Berat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nilai CF Pakar (0-1)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={cfForm.cfExpert}
                          onChange={(e) => setCfForm({ ...cfForm, cfExpert: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          placeholder="0.0 - 1.0"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-bold"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Menyimpan...
                          </div>
                        ) : (
                          "Simpan Nilai CF"
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Form Edit Data Gejala */}
                  {selectedSymptomForEdit && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-l-4 border-green-500 border border-gray-200/50">
                      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                        <Edit className="w-6 h-6 mr-3 text-green-600" />
                        <span className="text-green-600">Edit Data Gejala</span>
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Kode Gejala</label>
                          <input
                            type="text"
                            value={selectedSymptomForEdit.code}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Nama Gejala</label>
                          {isEditingSymptomName ? (
                            <form onSubmit={handleSymptomNameUpdate} className="space-y-3">
                              <input
                                type="text"
                                value={editingSymptomName}
                                onChange={(e) => setEditingSymptomName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                placeholder="Masukkan nama gejala"
                                required
                              />
                              <textarea
                                value={editingSymptomDescription}
                                onChange={(e) => setEditingSymptomDescription(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                rows={3}
                                placeholder="Masukkan deskripsi gejala"
                              />
                              <div className="flex gap-3">
                                <button
                                  type="submit"
                                  disabled={loading}
                                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-bold"
                                >
                                  {loading ? (
                                    <div className="flex items-center justify-center">
                                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                      Menyimpan...
                                    </div>
                                  ) : (
                                    "💾 Simpan Perubahan"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelSymptomNameEdit}
                                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                                >
                                  ❌ Batal
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={selectedSymptomForEdit.name}
                                  disabled
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                                />
                                <button
                                  onClick={() => setIsEditingSymptomName(true)}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
                                >
                                  ✏️ Edit
                                </button>
                              </div>
                              {selectedSymptomForEdit.description && (
                                <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi</label>
                                  <textarea
                                    value={selectedSymptomForEdit.description}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                                    rows={3}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-xl border border-green-200">
                          <p>
                            <strong>💡 Petunjuk:</strong> Form ini muncul otomatis ketika Anda memilih kode gejala di
                            atas. Anda dapat mengedit data gejala langsung dari sini tanpa perlu ke tab "Data Gejala".
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Daftar CF Rules */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                    Data Aturan Nilai CF
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {cfRules.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Belum ada data aturan CF</p>
                    ) : (
                      cfRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-white/80"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-lg text-sm">
                                  {rule.symptom_code}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-lg text-sm">
                                  {rule.disease_code}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold border ml-auto ${getCFTextColor(rule.cf_expert)}`}
                                >
                                  CF: {rule.cf_expert}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-900">
                                  <span className="text-blue-600">{rule.symptom_code}:</span>{" "}
                                  {rule.symptom_name || "Nama gejala tidak tersedia"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="text-purple-600">{rule.disease_code}:</span>{" "}
                                  {getDiseaseName(rule.disease_code)}
                                </p>
                                {rule.symptom_description && (
                                  <p className="text-xs text-gray-500 italic mt-2 pl-3 border-l-2 border-gray-200 bg-gray-50 py-2 rounded-r-lg">
                                    {rule.symptom_description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteCFRule(rule.id)}
                              disabled={loading}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 disabled:opacity-50 p-2 rounded-lg transition-all duration-300 ml-3"
                              title="Hapus aturan CF"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Konten: Manajemen Pengguna */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Edit User */}
                {editingUserId && (
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200/50">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                      <Edit className="w-6 h-6 mr-3 text-blue-600" />
                      Edit Data Pengguna
                    </h3>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                        <input
                          type="text"
                          value={userForm.full_name}
                          onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon</label>
                        <input
                          type="tel"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={userForm.date_of_birth}
                          onChange={(e) => setUserForm({ ...userForm, date_of_birth: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Kelamin</label>
                        <select
                          value={userForm.gender}
                          onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-bold"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="animate-spin h-5 w-5 mr-2" />
                              Menyimpan...
                            </div>
                          ) : (
                            "Perbarui Data"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelUserEdit}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Daftar Users */}
                <div
                  className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 ${editingUserId ? "lg:col-span-2" : "lg:col-span-3"}`}
                >
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-gray-900 flex items-center">
                        <Users className="w-6 h-6 mr-3 text-blue-600" />
                        Manajemen Pengguna
                      </h3>
                      <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                        Total: {users.length} pengguna
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Pengguna
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Informasi Pribadi
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Tanggal Daftar
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(users || []).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              Belum ada data pengguna
                            </td>
                          </tr>
                        ) : (
                          (users || []).map((user) => (
                            <tr key={user.id} className="hover:bg-blue-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                                      <span className="text-sm font-bold text-white">
                                        {user.full_name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-bold text-gray-900">{user.full_name}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <User className="w-3 h-3 mr-1" />@{user.username}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 space-y-1">
                                  {user.date_of_birth && (
                                    <div className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                                      Lahir: {formatDate(user.date_of_birth)}
                                    </div>
                                  )}
                                  {user.gender && (
                                    <div className="flex items-center">
                                      <User className="w-3 h-3 mr-2 text-gray-400" />
                                      {user.gender === "male"
                                        ? "Laki-laki"
                                        : user.gender === "female"
                                          ? "Perempuan"
                                          : "Lainnya"}
                                    </div>
                                  )}
                                  {user.phone && (
                                    <div className="flex items-center">
                                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  {formatDate(user.created_at)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  )
}