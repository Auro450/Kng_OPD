"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Doctor {
  name: string;
  specialty: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoctor?: string;
}


const REASON_OPTIONS = [
  "Doctors Appointment",
  "Post Check-up Consultation"
];

export function BookingModal({ isOpen, onClose, defaultDoctor }: BookingModalProps) {
  const { user, openLoginModal } = useAuth();
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    phone: "",
    date: "",
    doctor: "Select a Doctor",
    reason: "Select Reason",
    type: "Clinic Appointment"
  });

  const [allDoctors, setAllDoctors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShow(true);
      if (defaultDoctor) {
        setFormData(prev => ({ ...prev, doctor: defaultDoctor }));
      }
      // Fetch doctors
      fetch("/api/doctors")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAllDoctors(data.map(d => d.name));
          }
        })
        .catch(err => console.error("Error fetching doctors:", err));
    } else {
      setShow(false);
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }
  }, [isOpen, defaultDoctor]);


  const submitBooking = async (dataToSubmit: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();
      if (result.success) {
        alert("Booking request sent successfully! We will contact you shortly.");
        onClose();
        setFormData({
          name: user?.name || "", gender: "Male", phone: user?.phone || "", date: "", doctor: "Select a Doctor", reason: "Select Reason", type: "Clinic Appointment"
        });
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.doctor === "Select a Doctor") {
      alert("Please select a doctor for visit.");
      return;
    }

    if (!formData.date) {
      alert("Please select a preferred date for your visit.");
      return;
    }
    
    if (!user) {
      openLoginModal(() => submitBooking(formData));
      return;
    }
    submitBooking(formData);
  };

  if (!isOpen && !show) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-on-background/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className={`relative bg-white dark:bg-surface-container-high w-full max-w-xl rounded-[3rem] shadow-elevation-5 overflow-hidden transition-all duration-300 ${show ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary">Patient Registration</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Patient Full Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Enter patient name" type="text" />
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Phone Number</label>
                <input required maxLength={10} pattern="[0-9]{10}" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Contact number" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Preferred Date</label>
                <input required min={today} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Doctor to Visit</label>
                <select required value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option disabled value="Select a Doctor">Choose Specialist...</option>
                  {allDoctors.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Reason for Visit</label>
                <select value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option value="Select Reason">Choose Reason...</option>
                  {REASON_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <button disabled={isSubmitting} className="w-full bg-primary text-on-primary py-5 rounded-2xl font-bold text-lg shadow-elevation-3 hover:shadow-elevation-4 transition-all active:scale-95">
              {isSubmitting ? "Processing Appointment..." : "Confirm Appointment"}
            </button>
            <p className="text-center text-on-surface-variant text-sm mt-4">By clicking confirm, you agree to our patient care terms.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
