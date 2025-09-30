"use client";

import { useState } from "react";

export default function ChatLogin({ onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Input validation
    if (!userId.trim()) {
      setError("User ID দিতে হবে");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Parent component কে জানানো যে login successful
      await onLoginSuccess(userId.trim());
    } catch (err) {
      setError("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Agora Chat
        </h1>
        <p className="text-center text-gray-600 mb-6">
          তোমার User ID দিয়ে login করো
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="উদাহরণ: user123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Login হচ্ছে..." : "Login করো"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>নোট:</strong> যেকোনো unique User ID দিয়ে login করতে পারবে।
            অন্য user এর সাথে chat করতে তার User ID জানতে হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
