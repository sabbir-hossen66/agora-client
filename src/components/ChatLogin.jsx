"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Loader2,
  MessageCircle,
  Zap,
  Shield,
  TypeIcon,
  Loader,
} from "lucide-react";

export default function ChatLogin({ onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      alert("⚠️ Please enter a User ID");
      return;
    }

    setLoading(true);
    try {
      await onLoginSuccess(userId.trim());
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="text-white space-y-8 hidden md:block">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Agora Chat
              </span>
            </h1>
            <p className="text-xl text-purple-100">
              Connect instantly with real-time messaging powered by Agora
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 transform hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Messaging</h3>
                <p className="text-purple-200 text-sm">
                  Instant message delivery with typing indicators
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 transform hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Read Receipts</h3>
                <p className="text-purple-200 text-sm">
                  Know when your messages are delivered and read
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 transform hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Offline Support</h3>
                <p className="text-purple-200 text-sm">
                  Messages delivered even when users are offline
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 transform hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <TypeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Typing Indecator</h3>
                <p className="text-purple-200 text-sm">
                  showing when the other user is typing
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 transform hover:scale-105 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Loader className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Previous Message Loading
                </h3>
                <p className="text-purple-200 text-sm">
                  Load previous messages when you scroll up
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-6 transition-transform">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your User ID to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your unique user ID"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">
                Example: user123, john_doe, alice2024
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !userId.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                🔒 Secure authentication with Agora tokens
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Online
                </span>
                <span>•</span>
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view features */}
      <div className="md:hidden absolute bottom-8 left-0 right-0 px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white text-center">
          <p className="text-sm">⚡ Real-time • 💬 Read Receipts • 🔒 Secure</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
