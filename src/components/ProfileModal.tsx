"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function ProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, logout } = useAuth();
  
  const [show, setShow] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"doctors" | "pathology">("doctors");

  useEffect(() => {
    if (isProfileModalOpen) {
      document.body.style.overflow = "hidden";
      setShow(true);
      fetchBookings();
    } else {
      setShow(false);
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }
  }, [isProfileModalOpen, user]);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings?phone=${user.phone}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.filter(b => b.id !== id));
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } catch (e) {
      alert("Error cancelling booking.");
    }
  };

  const handleLogout = () => {
    logout();
    closeProfileModal();
    window.location.reload(); // Refresh to reset any active forms
  };

  if (!isProfileModalOpen && !show) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isProfileModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-on-background/70 backdrop-blur-md" onClick={closeProfileModal}></div>
      
      <div className={`relative bg-white dark:bg-surface-container-high w-full max-w-2xl rounded-[3rem] shadow-elevation-5 overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${show ? "translate-y-0 scale-100" : "translate-y-10 scale-95"}`}>
        <div className="p-8 md:p-10 border-b border-outline-variant/20 flex justify-between items-center bg-primary text-on-primary">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold">My Profile</h2>
            {user && <p className="text-on-primary/80 mt-1">{user.name} • {user.phone}</p>}
          </div>
          <button onClick={closeProfileModal} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-8 md:p-10 overflow-y-auto flex-grow bg-surface">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-6">Booking History</h3>
          
          <div className="flex gap-4 mb-6 border-b border-outline-variant/30 pb-2">
            <button 
              onClick={() => setActiveTab("doctors")}
              className={`pb-2 font-bold transition-all ${activeTab === "doctors" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Doctor Appointments
            </button>
            <button 
              onClick={() => setActiveTab("pathology")}
              className={`pb-2 font-bold transition-all ${activeTab === "pathology" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Pathology Services
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === "doctors" ? bookings.filter(b => (b.type === "Clinic Appointment" || b.type === "Homepage Appointment" || !b.type) && b.status !== "Deleted") : bookings.filter(b => b.type === "Home Collection Request" && b.status !== "Deleted")).length === 0 ? (
                <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant/50">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">event_busy</span>
                  <p className="text-on-surface text-lg font-medium">No {activeTab === "doctors" ? "doctor appointments" : "pathology services"} found</p>
                </div>
              ) : (
                (activeTab === "doctors" ? bookings.filter(b => (b.type === "Clinic Appointment" || b.type === "Homepage Appointment" || !b.type) && b.status !== "Deleted") : bookings.filter(b => b.type === "Home Collection Request" && b.status !== "Deleted")).map((booking) => (
                  <div key={booking.id} className="p-5 rounded-2xl border border-outline-variant bg-surface-container hover:shadow-elevation-1 transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10px] font-mono text-on-surface-variant bg-surface px-2 py-1 rounded">
                          ID: {booking.bookingNumber || booking.id?.split('-')[0] || "N/A"}
                        </span>
                        {booking.status === "Completed" ? (
                          <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Completed
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Scheduled
                          </span>
                        )}
                      </div>
                      <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">history</span>
                        Booked: {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {booking.doctor && booking.doctor !== "Select a Doctor" && (
                      <p className="text-on-surface font-bold text-lg flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary">stethoscope</span>
                        {booking.doctor}
                      </p>
                    )}
                    
                    {booking.selectedTests && (
                      <div className="mb-2">
                        <p className="text-on-surface font-bold text-md flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">science</span>
                          Pathology Services
                        </p>
                        <p className="text-sm text-on-surface-variant mt-1 pl-7">{booking.selectedTests}</p>
                      </div>
                    )}

                    {booking.reason && booking.reason !== "Select Reason" && (
                      <p className="text-sm text-on-surface-variant flex items-center gap-2 mb-3 pl-1">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        {booking.reason}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-outline-variant/50 flex flex-wrap gap-y-2 justify-between text-sm bg-surface-container-low p-3 rounded-xl">
                      <div className="text-on-surface-variant flex-1 min-w-[120px]">
                        <span className="text-xs uppercase tracking-wider block mb-1">Patient Name</span> 
                        <span className="font-bold text-on-surface">{booking.name}</span>
                      </div>
                      {booking.date && (
                        <div className="text-on-surface-variant text-right">
                          <span className="text-xs uppercase tracking-wider block mb-1">Appointment Date</span> 
                          <span className="font-bold text-primary">{booking.date}</span>
                        </div>
                      )}
                    </div>
                    {booking.type === "Home Collection Request" && (
                      <div className="mt-3 flex gap-3">
                        {booking.billUrl ? (
                          <a href={booking.billUrl} target="_blank" download className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 px-4 rounded-xl text-xs font-bold transition-colors">
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            Download Bill
                          </a>
                        ) : (
                          <div className="flex-1 flex items-center justify-center gap-2 bg-surface-variant/30 text-on-surface-variant/50 py-2.5 px-4 rounded-xl text-xs font-bold cursor-not-allowed">
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            Bill Not Ready
                          </div>
                        )}
                        
                        {booking.reportUrl ? (
                          <a href={booking.reportUrl} target="_blank" download className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 px-4 rounded-xl text-xs font-bold transition-colors">
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            Download Report
                          </a>
                        ) : (
                          <div className="flex-1 flex items-center justify-center gap-2 bg-surface-variant/30 text-on-surface-variant/50 py-2.5 px-4 rounded-xl text-xs font-bold cursor-not-allowed">
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            Report Not Ready
                          </div>
                        )}
                      </div>
                    )}
                    {booking.status !== "Completed" && (
                      <div className="mt-3">
                        <button onClick={() => handleCancelBooking(booking.id)} className="w-full flex items-center justify-center gap-2 bg-error/10 hover:bg-error/20 text-error py-2.5 px-4 rounded-xl text-xs font-bold transition-colors">
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-surface-container-high border-t border-outline-variant flex justify-end">
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-error text-error hover:bg-error/10 font-bold transition-colors">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
