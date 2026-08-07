"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/utils/apiConfig";

export function ProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, logout, login } = useAuth();
  
  const [show, setShow] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"doctors" | "pathology" | "medicines">("doctors");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const [reviewingBooking, setReviewingBooking] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<string[]>([]);

  useEffect(() => {
    if (isProfileModalOpen) {
      document.body.style.overflow = "hidden";
      setShow(true);
      setNewPhone(user?.phone || "");
      fetchBookings();
    } else {
      setShow(false);
      setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
    }
  }, [isProfileModalOpen, user]);

  const handleSavePhone = async () => {
    if (!newPhone.match(/^[0-9]{10}$/)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    if (!user) return;
    setIsSavingPhone(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, phone: newPhone })
      });
      const data = await res.json();
      if (data.success) {
        login(user.name, user.email, user.picture, newPhone);
        setIsEditingPhone(false);
      } else {
        alert("Failed to update phone number.");
      }
    } catch (e) {
      alert("Error updating phone number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewingBooking || !user) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: reviewingBooking.id,
          type: reviewingBooking.cart ? "Medicine" : (reviewingBooking.type === "Home Collection Request" ? "Pathology" : "Doctor"),
          doctorName: reviewingBooking.cart ? undefined : (reviewingBooking.type === "Home Collection Request" ? undefined : reviewingBooking.doctor),
          patientName: user.name,
          patientEmail: user.email,
          patientPhone: user.phone,
          rating,
          text: reviewText
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewedBookingIds([...reviewedBookingIds, reviewingBooking.id]);
        setReviewingBooking(null);
        setRating(5);
        setReviewText("");
        alert("Review submitted successfully!");
      } else {
        alert(data.message || "Failed to submit review.");
      }
    } catch (e) {
      alert("Error submitting review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/bookings?email=${user.email}&phone=${user.phone}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
      // Fetch medicine orders
      const medRes = await fetch(`${getApiBaseUrl()}/api/medicine-orders?phone=${user.phone}`);
      const medData = await medRes.json();
      if(medData) {
        setMedicineOrders(Array.isArray(medData) ? medData : []);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings?id=${id}`, { method: 'DELETE' });
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
            {user && (
              <div className="flex items-center gap-3 mt-2">
                {user.picture && <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full" />}
                <div className="text-on-primary/80 font-medium">
                  <p>{user.name} • {user.email}</p>
                  {isEditingPhone ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input 
                        value={newPhone} 
                        onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        maxLength={10} 
                        className="px-3 py-1 text-sm text-gray-900 rounded outline-none" 
                        placeholder="10-digit number"
                      />
                      <button onClick={handleSavePhone} disabled={isSavingPhone} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors">
                        {isSavingPhone ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => { setIsEditingPhone(false); setNewPhone(user.phone || ""); }} className="text-white hover:text-white/70">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm opacity-90">Phone: {user.phone}</p>
                      <button onClick={() => setIsEditingPhone(true)} className="text-white hover:text-white/70">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            <button 
              onClick={() => setActiveTab("medicines")}
              className={`pb-2 font-bold transition-all ${activeTab === "medicines" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Medicine Orders
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "medicines" ? (
                medicineOrders.length === 0 ? (
                  <div className="text-center py-12 bg-surface-container rounded-2xl border border-outline-variant/50">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">medication</span>
                    <p className="text-on-surface text-lg font-medium">No medicine orders found</p>
                  </div>
                ) : (
                  medicineOrders.map((order: any) => (
                    <div key={order.id} className="p-5 rounded-2xl border border-outline-variant bg-surface-container hover:shadow-elevation-1 transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#5adace]"></div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-mono text-on-surface-variant bg-surface px-2 py-1 rounded">
                            Order ID: {order.id}
                          </span>
                          {(() => {
                            const status = order.status || "Placed";
                            let bgColor = "bg-blue-100";
                            let textColor = "text-blue-700";
                            let icon = "schedule";
                            if (status === "Delivered") {
                              bgColor = "bg-green-100";
                              textColor = "text-green-700";
                              icon = "check_circle";
                            } else if (status === "Cancelled") {
                              bgColor = "bg-red-100";
                              textColor = "text-red-700";
                              icon = "cancel";
                            }
                            return (
                              <span className={`${bgColor} ${textColor} text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold flex items-center gap-1`}>
                                <span className="material-symbols-outlined text-[12px]">{icon}</span>
                                {status}
                              </span>
                            );
                          })()}
                        </div>
                        <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">history</span>
                          Placed: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 bg-white p-3 rounded-lg border border-[#e8ecec]">
                        <h4 className="text-xs font-bold text-[#6b8c8c] uppercase tracking-wider mb-2">Items Ordered:</h4>
                        {order.cart?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm mb-1 text-[#0a3f41]">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-bold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.prescriptionUrl && (
                        <div className="mt-3 bg-amber-50 p-2.5 rounded-xl flex items-center justify-between border border-amber-200">
                           <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                             <span className="material-symbols-outlined text-base text-amber-600">description</span>
                             Prescription Attached
                           </div>
                           <a 
                             href={`${getApiBaseUrl()}${order.prescriptionUrl}`}
                             target="_blank"
                             rel="noreferrer"
                             className="text-xs bg-white text-amber-900 px-3 py-1 rounded-lg shadow-2xs hover:shadow transition-all font-bold flex items-center gap-1 border border-amber-200"
                           >
                             <span className="material-symbols-outlined text-sm">visibility</span>
                             View Prescription
                           </a>
                        </div>
                      )}
                      {order.billUrl && (
                        <div className="mt-3 bg-[#e8ecec] p-2 rounded-lg flex items-center justify-between border border-outline-variant/30">
                           <div className="flex items-center gap-2 text-[#0a3f41] text-xs font-bold">
                             <span className="material-symbols-outlined text-base text-[#5adace]">receipt</span>
                             Purchase Bill Available
                           </div>
                           <a 
                             href={`${getApiBaseUrl()}${order.billUrl}`}
                             target="_blank"
                             download
                             rel="noreferrer"
                             className="text-xs bg-white text-[#0a3f41] px-3 py-1 rounded shadow-sm hover:shadow transition-shadow font-bold flex items-center gap-1"
                           >
                             <span className="material-symbols-outlined text-sm">download</span>
                             Download
                           </a>
                        </div>
                      )}
                      <div className="mt-3 flex justify-between items-center border-t border-outline-variant/30 pt-3">
                        <div className="text-xs text-on-surface-variant">
                           Delivery to: <span className="font-bold">{order.patientDetails?.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-on-surface-variant mr-2">Total Paid:</span>
                          <span className="text-lg font-black text-[#0a3f41]">₹{order.finalTotal?.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {order.status === "Delivered" && !reviewedBookingIds.includes(order.id) && (
                        <div className="mt-3 border-t border-outline-variant/30 pt-3">
                          {reviewingBooking?.id === order.id ? (
                            <div className="bg-surface p-3 rounded-xl border border-outline-variant/50">
                              <p className="text-sm font-bold text-primary mb-2">
                                Rate Medicine Service
                              </p>
                              <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button 
                                    key={star} 
                                    onClick={() => setRating(star)} 
                                    className={`material-symbols-outlined text-2xl transition-colors ${rating >= star ? 'text-orange-400' : 'text-gray-300 hover:text-orange-200'}`}
                                    style={rating >= star ? { fontVariationSettings: "'FILL' 1, 'wght' 700" } : { fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                                  >
                                    star
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                placeholder="Share your experience (optional)..."
                                className="w-full p-2 text-sm text-[#0a3f41] bg-white border border-outline-variant rounded-lg mb-3 outline-none focus:ring-2 focus:ring-primary/30"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors">
                                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                </button>
                                <button onClick={() => setReviewingBooking(null)} className="px-4 bg-surface-variant text-on-surface-variant py-2 rounded-lg text-xs font-bold hover:bg-surface-variant/80 transition-colors">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setReviewingBooking(order); setRating(5); setReviewText(""); }} className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors border border-orange-100">
                              <span className="material-symbols-outlined text-[16px]">star_rate</span>
                              Review Service
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                (activeTab === "doctors" ? bookings.filter(b => (b.type === "Clinic Appointment" || b.type === "Homepage Appointment" || !b.type) && b.status !== "Deleted") : bookings.filter(b => b.type === "Home Collection Request" && b.status !== "Deleted")).length === 0 ? (
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
                    {booking.status === "Completed" && (booking.doctor || booking.type === "Home Collection Request") && !reviewedBookingIds.includes(booking.id) && (
                      <div className="mt-3 border-t border-outline-variant/30 pt-3">
                        {reviewingBooking?.id === booking.id ? (
                          <div className="bg-surface p-3 rounded-xl border border-outline-variant/50">
                            <p className="text-sm font-bold text-primary mb-2">
                              Rate {booking.type === "Home Collection Request" ? "Pathology Services" : booking.doctor}
                            </p>
                            <div className="flex gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                  key={star} 
                                  onClick={() => setRating(star)} 
                                  className={`material-symbols-outlined text-2xl transition-colors ${rating >= star ? 'text-orange-400' : 'text-gray-300 hover:text-orange-200'}`}
                                  style={rating >= star ? { fontVariationSettings: "'FILL' 1, 'wght' 700" } : { fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                                >
                                  star
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={reviewText}
                              onChange={e => setReviewText(e.target.value)}
                              placeholder="Share your experience (optional)..."
                              className="w-full p-2 text-sm text-[#0a3f41] bg-white border border-outline-variant rounded-lg mb-3 outline-none focus:ring-2 focus:ring-primary/30"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors">
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                              </button>
                              <button onClick={() => setReviewingBooking(null)} className="px-4 bg-surface-variant text-on-surface-variant py-2 rounded-lg text-xs font-bold hover:bg-surface-variant/80 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setReviewingBooking(booking); setRating(5); setReviewText(""); }} className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors border border-orange-100">
                            <span className="material-symbols-outlined text-[16px]">star_rate</span>
                            Review {booking.type === "Home Collection Request" ? "Service" : "Doctor"}
                          </button>
                        )}
                      </div>
                    )}
                    {booking.status === "Completed" && reviewedBookingIds.includes(booking.id) && (
                       <div className="mt-3 text-center py-2.5 bg-green-50 text-green-700 text-xs font-bold rounded-xl flex justify-center items-center gap-1 border border-green-100">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Review Submitted
                       </div>
                    )}
                  </div>
                ))
              )
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
