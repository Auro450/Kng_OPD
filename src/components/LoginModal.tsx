"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, onLoginSuccessCallback } = useAuth();

  const [show, setShow] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoginModalOpen) {
      setShow(true);
      setStep(1);
      setPendingUser(null);
      setPhone("");
    } else {
      setShow(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen && !show) return null;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);

      // Check if user already exists
      const res = await fetch(`${"https://13-207-203-76.nip.io"}/api/users?email=${encodeURIComponent(decoded.email)}`);
      const data = await res.json();

      if (data.success && data.user && data.user.phone) {
        // User exists and has a phone number
        completeLogin(decoded.name, decoded.email, decoded.picture, data.user.phone);
      } else {
        // New user, ask for phone number
        setPendingUser(decoded);
        setStep(2);
      }
    } catch (e) {
      console.error("Failed to authenticate with backend", e);
      alert("Login failed: " + (e instanceof Error ? e.message : JSON.stringify(e)));
    }
  };

  const handleGoogleError = () => {
    alert("Google Login Failed");
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    setIsSubmitting(true);
    completeLogin(pendingUser.name, pendingUser.email, pendingUser.picture, phone);
    setIsSubmitting(false);
  };

  const completeLogin = (name: string, email: string, picture: string | undefined, phoneNumber: string) => {
    login(name, email, picture, phoneNumber);
    closeLoginModal();
    if (onLoginSuccessCallback) {
      onLoginSuccessCallback();
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isLoginModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-on-background/60 backdrop-blur-md" onClick={closeLoginModal}></div>

      <div className={`relative bg-white dark:bg-surface-container-high w-full max-w-md rounded-[3rem] shadow-elevation-5 overflow-hidden transition-all duration-300 ${show ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
        <div className="p-8 md:p-12 text-center">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline-lg text-headline-lg text-primary">
              {step === 1 ? "Sign In" : "Complete Profile"}
            </h2>
            <button onClick={closeLoginModal} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {step === 1 ? (
            <>
              <p className="text-on-surface-variant mb-8 text-sm">
                Please sign in with your Google account to continue.
              </p>
              <div className="flex justify-center mt-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape="pill"
                  size="large"
                />
              </div>
            </>
          ) : (
            <form className="space-y-6 text-left" onSubmit={handlePhoneSubmit}>
              <p className="text-on-surface-variant mb-6 text-sm text-center">
                Welcome, {pendingUser?.name}! Please provide your 10-digit phone number to complete registration.
              </p>

              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Phone Number</label>
                <input
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="10-digit mobile number"
                  type="tel"
                />
              </div>

              <button disabled={isSubmitting} className="w-full bg-[#5adace] text-[#0a3f41] py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#48b5ab] transition-all active:scale-[0.98] mt-4">
                {isSubmitting ? "Completing..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
