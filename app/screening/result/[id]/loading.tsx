"use client"

import { Brain, Heart, Sparkles } from "lucide-react"

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="text-center z-10">
        {/* Enhanced Loading Animation */}
        <div className="relative mb-8">
          {/* Main Spinner */}
          <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

          {/* Secondary Spinner */}
          <div
            className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>

          {/* Inner Spinner */}
          <div
            className="absolute inset-2 w-20 h-20 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto"
            style={{ animationDuration: "2s" }}
          ></div>

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Loading Text with Animation */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 animate-pulse">Memuat hasil skrining...</h2>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 space-y-3 max-w-md mx-auto">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Menganalisis jawaban Anda...</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div
                className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Menghitung nilai CF...</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div
                className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center animate-pulse"
                style={{ animationDelay: "1s" }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Menyiapkan rekomendasi...</span>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 animate-float">
            <Heart className="w-6 h-6 text-rose-400 opacity-60" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: "1s" }}>
            <Sparkles className="w-5 h-5 text-blue-400 opacity-60" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float" style={{ animationDelay: "2s" }}>
            <Brain className="w-5 h-5 text-purple-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
