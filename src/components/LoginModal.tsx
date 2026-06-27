"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, onLoginSuccessCallback } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Show/Hide classes
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (isLoginModalOpen) {
      setShow(true);
      setStep(1);
      setOtp("");
    } else {
      setShow(false);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen && !show) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate verifying OTP (accepts 1234 or anything really for now)
    setTimeout(() => {
      setIsSubmitting(false);
      login(name, phone);
      closeLoginModal();
      
      // Execute the callback (e.g. submit the booking)
      if (onLoginSuccessCallback) {
        onLoginSuccessCallback();
      }
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isLoginModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-on-background/60 backdrop-blur-md" onClick={closeLoginModal}></div>
      
      <div className={`relative bg-white dark:bg-surface-container-high w-full max-w-md rounded-[3rem] shadow-elevation-5 overflow-hidden transition-all duration-300 ${show ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline-lg text-headline-lg text-primary">
              {step === 1 ? "Login / Sign Up" : "Verify OTP"}
            </h2>
            <button onClick={closeLoginModal} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <p className="text-on-surface-variant mb-8 text-sm">
            {step === 1 
              ? "Please enter your details to login or create a new account before booking an appointment." 
              : `Enter the 4-digit OTP sent to ${phone}. (Mock: use 1234)`}
          </p>

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Full Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="John Doe" type="text" />
              </div>

              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Phone Number</label>
                <input required maxLength={10} pattern="[0-9]{10}" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="10-digit mobile number" type="tel" />
              </div>
              
              <button disabled={isSubmitting} className="w-full bg-[#5adace] text-[#0a3f41] py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#48b5ab] transition-all active:scale-[0.98] mt-4">
                {isSubmitting ? "Sending OTP..." : "Get OTP"}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Enter OTP</label>
                <input required maxLength={4} pattern="[0-9]{4}" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center tracking-[1em] text-2xl" placeholder="••••" type="text" />
              </div>
              
              <button disabled={isSubmitting} className="w-full bg-[#5adace] text-[#0a3f41] py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#48b5ab] transition-all active:scale-[0.98] mt-4">
                {isSubmitting ? "Verifying..." : "Verify & Login"}
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-[#0a3f41] font-bold mt-4 hover:underline">
                Back to Edit Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
