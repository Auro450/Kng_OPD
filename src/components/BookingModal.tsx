"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/utils/apiConfig";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  const [allDoctors, setAllDoctors] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setShow(true);
      if (defaultDoctor) {
        setFormData(prev => ({ ...prev, doctor: defaultDoctor }));
      }
      // Fetch doctors
      fetch(`${getApiBaseUrl()}/api/doctors`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAllDoctors(data);
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


  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-order`, { method: "POST" });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert("Failed to create order");
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: "rzp_live_TN2NYyCgJVpg7x", // HARDCODED LIVE KEY
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Ray's Medical",
        description: "Booking Confirmation Fee",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            submitBooking(formData, response.razorpay_payment_id);
          } else {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: formData.name,
          email: user?.email || "",
          contact: formData.phone
        },
        theme: { color: "#0a3f41" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed! Reason: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error initiating payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBooking = async (dataToSubmit: any, razorpayPaymentId?: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dataToSubmit, userEmail: user?.email, userPhone: user?.phone, razorpayPaymentId }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Booking request sent successfully and payment verified!");
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

  const isDateAvailable = (date: Date) => {
    const selectedDoc = allDoctors.find(d => d.name === formData.doctor);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return false;
    
    if (!selectedDoc) return true;

    const { availableDays, availableWeeks } = selectedDoc;
    
    if ((!availableDays || availableDays.length === 0) && (!availableWeeks || availableWeeks.length === 0)) {
      return true;
    }

    const dayOfWeek = date.getDay();
    const weekOfMonth = Math.ceil(date.getDate() / 7);

    const dayMatches = (!availableDays || availableDays.length === 0) || availableDays.includes(dayOfWeek);
    const weekMatches = (!availableWeeks || availableWeeks.length === 0) || availableWeeks.includes(weekOfMonth);

    return dayMatches && weekMatches;
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
      openLoginModal(() => handlePayment());
      return;
    }
    handlePayment();
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
                <input required maxLength={10} pattern="[0-9]{10}" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Contact number (10 digits)" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Doctor to Visit</label>
                <select required value={formData.doctor} onChange={(e) => setFormData({...formData, doctor: e.target.value, date: ""})} className="w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                  <option disabled value="Select a Doctor">Choose Specialist...</option>
                  {allDoctors.map((doc, idx) => (
                    <option key={idx} value={doc.name}>{doc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 uppercase tracking-widest font-bold">Preferred Date</label>
                <div title={formData.doctor === "Select a Doctor" ? "Please select a doctor first" : ""}>
                  <DatePicker
                    selected={formData.date ? new Date(formData.date) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                        setFormData({...formData, date: offsetDate.toISOString().split("T")[0]});
                      } else {
                        setFormData({...formData, date: ""});
                      }
                    }}
                    filterDate={isDateAvailable}
                    minDate={new Date()}
                    placeholderText={formData.doctor === "Select a Doctor" ? "Select doctor first..." : "Select Date"}
                    disabled={formData.doctor === "Select a Doctor"}
                    className={`w-full p-5 rounded-2xl bg-surface-container border border-outline-variant text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all ${formData.doctor === "Select a Doctor" ? "opacity-60 cursor-not-allowed" : ""}`}
                    wrapperClassName="w-full block"
                  />
                </div>
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
