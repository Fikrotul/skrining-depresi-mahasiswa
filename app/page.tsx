"use client"

import Link from "next/link"
import { HeartPulse, Sparkles, Shield, Brain, Users, TrendingUp, CheckCircle, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsLoaded(true)

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav
        className={`bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-500 ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
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

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#about"
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium"
              >
                Tentang
              </a>
              <a
                href="#features"
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 font-medium"
              >
                Fitur
              </a>
              <Link
                href="/login"
                className="group px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
              >
                <span className="flex items-center">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`mb-16 transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            {/* Floating Badge */}
            {/* <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-8 animate-bounce">
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Sistem Berbasis AI & Machine Learning
            </div> */}

            <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
              <span className="block">Sistem Skrining</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Depresi Mahasiswa
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
              Kenali kesehatan mental anda dengan mudah, aman, dan terpercaya
              <br />
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Langkah awal menuju kesehatan mental yang lebih baik
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/login"
                className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 text-lg"
              >
                <span className="flex items-center">
                  <Brain className="mr-3 h-6 w-6 animate-pulse" />
                  Mulai Skrining
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </span>
              </Link>
            </div>
          </div>

          {/* Animated Stats */}
          <div
            className={`grid md:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            {[
              { icon: Users, number: "1000+", label: "Mahasiswa Terbantu", color: "from-blue-500 to-cyan-500" },
              { icon: Shield, number: "99.9%", label: "Akurasi Sistem", color: "from-green-500 to-emerald-500" },
              { icon: TrendingUp, number: "95%", label: "Tingkat Kepuasan", color: "from-purple-500 to-pink-500" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-gray-200/50"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform duration-300`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div
            id="features"
            className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            {[
              {
                icon: Brain,
                title: "Apa Itu Depresi?",
                description:
                  "Depresi adalah gangguan suasana hati yang dapat mempengaruhi cara berpikir dan bertindak seseorang.",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-50 to-cyan-50",
              },
              {
                icon: CheckCircle,
                title: "Tujuan Skrining",
                description:
                  "Membantu mengenali tingkat kemungkinan depresi berdasarkan gejala yang dialami untuk deteksi dini.",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
              },
              {
                icon: Shield,
                title: "Privasi Terjaga",
                description:
                  "Data ditampilkan secara pribadi dengan keamanan yang terjamin menggunakan enkripsi tingkat tinggi.",
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${feature.bgColor} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-200/50`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-all duration-300 shadow-lg`}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      {/* About Section */}
<section
  id="about"
  className="py-20 px-4 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm relative"
>
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tentang Sistem
        </span>
      </h2>
      <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
        Sistem skrining depresi ini dikembangkan untuk membantu mahasiswa dalam mengenali gejala dini depresi
        sehingga dapat memberikan penanganan yang tepat
      </p>
    </div>

    {/* Perubahan utama di sini - menambahkan container dengan padding dan margin yang lebih baik */}
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      {/* Manfaat Skrining - ditambahkan padding dan height full */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 h-full">
        <h3 className="text-3xl font-bold text-gray-900 mb-6">Manfaat Skrining</h3>
        <div className="space-y-6">
          {[
            "Deteksi dini gejala depresi dengan akurasi tinggi",
            "Rekomendasi penanganan sesuai pengetahuan psikolog berpengalaman",
            "Meningkatkan kesadaran tentang kesehatan mental",
            "Mendorong untuk mencari bantuan profesional yang tepat",
          ].map((item, i) => (
            <div key={i} className="flex items-start group">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cara Kerja Sistem - ditambahkan padding dan height full */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-2xl border border-gray-200/50 h-full">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Cara Kerja Sistem</h3>
        <div className="space-y-6">
          {[
            "Pengguna menjawab serangkaian pertanyaan tentang gejala yang dialami",
            "Sistem menghitung setiap gejala dari jawaban pengguna berdasarkan perhitungan metode Certainty Factor",
            "Hasil skrining dan rekomendasi penanganan ditampilkan kepada pengguna",
          ].map((item, i) => (
            <div key={i} className="flex items-start group">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center mr-4 font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                {i + 1}
              </div>
              <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
      {/* <section
        id="about"
        className="py-20 px-4 bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm relative"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tentang Sistem
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Sistem skrining depresi ini dikembangkan untuk membantu mahasiswa dalam mengenali gejala dini depresi
              sehingga dapat memberikan penanganan yang tepat
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Manfaat Skrining</h3>
              {[
                "Deteksi dini gejala depresi dengan akurasi tinggi",
                "Rekomendasi penanganan sesuai pengetahuan psikolog berpengalaman",
                "Meningkatkan kesadaran tentang kesehatan mental",
                "Mendorong untuk mencari bantuan profesional yang tepat",
              ].map((item, i) => (
                <div key={i} className="flex items-start group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-2xl border border-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cara Kerja Sistem</h3>
              <div className="space-y-6">
                {[
                  "Pengguna menjawab serangkaian pertanyaan tentang gejala yang dialami",
                  "Sistem menghitung nilai CF untuk setiap gejala berdasarkan jawaban pengguna",
                  "Hasil skrining dan rekomendasi penanganan ditampilkan kepada pengguna",
                ].map((item, i) => (
                  <div key={i} className="flex items-start group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center mr-4 font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {i + 1}
                    </div>
                    <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <Link href="/" className="flex items-center space-x-2 group">
                  <HeartPulse className="h-8 w-8 text-rose-400 group-hover:animate-pulse" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MentalCare
                  </span>
                </Link>
              </div>
              <p className="text-gray-300 max-w-md leading-relaxed">
                Deteksi dini gejala depresi pada mahasiswa untuk kesehatan mental yang lebih baik
              </p>
            </div>

            <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-16">
              <div>
                <h4 className="font-bold text-lg mb-4 text-blue-300">Navigasi</h4>
                <ul className="space-y-3">
                  {[
                    { name: "Beranda", href: "/" },
                    { name: "Tentang", href: "#about" },
                    { name: "Fitur", href: "#features" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4 text-blue-300">Akun</h4>
                <ul className="space-y-3">
                  {[
                    { name: "Masuk", href: "/login" },
                    { name: "Daftar", href: "/register" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} MentalCare
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
