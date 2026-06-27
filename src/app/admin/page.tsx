"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === "Ray's_medical" && password === "2026") {
      // Successful login
      setError("");
      // In a real app we'd set a cookie/token here, but for now we just redirect
      router.push("/admin/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f7] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl w-full max-w-md border border-[#0a3f41]/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0a3f41] text-[#5adace] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0a3f41] font-headline-md">Admin Portal</h1>
          <p className="text-[#6b8c8c] mt-2">Sign in to manage Ray's Medical</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" 
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" 
              placeholder="Enter password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#0a3f41] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#073031] transition-all active:scale-[0.98] mt-4"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
