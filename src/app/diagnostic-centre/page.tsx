"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/context/AuthContext";

interface TestItem {
  code: string;
  name: string;
}


export default function DiagnosticCentrePage() {
  const [isHomeCollectionOpen, setIsHomeCollectionOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [allTests, setAllTests] = useState<TestItem[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionForm, setCollectionForm] = useState({
    name: "", phone: "", age: "", gender: "Male", address: "", streetNo: "", buildingNo: "", landmark: "", pincode: "", lat: null as number | null, lon: null as number | null, date: "", timeSlot: "07:00 AM - 09:00 AM", notes: "", referralDoctor: "", prescription: null as File | null
  });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const { user, openLoginModal } = useAuth();


  const handleHomeCollectionClick = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsHomeCollectionOpen(true);
    }
  };

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setCollectionForm(prev => ({ ...prev, address: data.display_name, lat: latitude, lon: longitude }));
          } else {
            alert("Could not fetch address for this location.");
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          alert("Error fetching address.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get your location. Please check permissions.");
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch(`${"https://13-207-203-76.nip.io"}/api/tests`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setAllTests(data);
      } catch (err) {}
    }
    fetchTests();
  }, []);

  const filteredTests = allTests.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleTests = searchTerm.length > 0 ? filteredTests : (showAll ? filteredTests : filteredTests.slice(0, 15));

  const toggleTest = (code: string) => {
    setSelectedTests(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

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
      const orderResponse = await fetch(`${"https://13-207-203-76.nip.io"}/api/create-order`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100 })
      });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert("Failed to create order");
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: "rzp_live_TN3sscaEW0fMq4",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Ray's Medical",
        description: "Home Collection Request Fee",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch(`${"https://13-207-203-76.nip.io"}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            submitCollection(collectionForm, selectedTests, response.razorpay_payment_id);
          } else {
            alert("Payment verification failed!");
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: collectionForm.name || user?.name || "",
          email: user?.email || "",
          contact: collectionForm.phone || user?.phone || ""
        },
        theme: { color: "#0a3f41" },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed! Reason: " + response.error.description);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error initiating payment.");
      setIsSubmitting(false);
    }
  };

  const submitCollection = async (dataToSubmit: any, selectedTestsList: string[], paymentId?: string) => {
    setIsSubmitting(true);
    const submissionData = {
      ...dataToSubmit,
      prescription: undefined, // Don't include file in the JSON data string
      selectedTests: selectedTestsList.map(code => {
        const test = allTests.find(t => t.code === code);
        return `${test?.code}: ${test?.name}`;
      }).join(", "),
      type: "Home Collection Request",
      userEmail: user?.email,
      userPhone: user?.phone,
      paymentId
    };
    
    const formData = new FormData();
    formData.append('bookingData', JSON.stringify(submissionData));
    if (dataToSubmit.prescription) {
      formData.append('prescription', dataToSubmit.prescription);
    }
    
    try {
      const res = await fetch(`${"https://13-207-203-76.nip.io"}/api/submit`, {
        method: "POST",
        body: formData,
      });
      if ((await res.json()).success) {
        alert("Home collection requested successfully! Our team will contact you.");
        setIsHomeCollectionOpen(false);
        setCollectionForm({ name: user?.name || "", phone: user?.phone || "", age: "", gender: "Male", address: "", streetNo: "", buildingNo: "", landmark: "", pincode: "", lat: null, lon: null, date: "", timeSlot: "07:00 AM - 09:00 AM", notes: "", referralDoctor: "", prescription: null });
        setSelectedTests([]);
      }
    } catch (error) { alert("Error sending request."); }
    finally { setIsSubmitting(false); }
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) { alert("Please select at least one test."); return; }
    
    if (!collectionForm.date) {
      alert("Please select a preferred date for the collection.");
      return;
    }
    
    if (!user) {
      openLoginModal(() => handlePayment());
      return;
    }
    handlePayment();
  };

  return (
    <>
      <Navbar onOpenModal={() => setIsBookingModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />

      <main className="bg-background text-on-surface">
        {/* ── Section 1: Hero ── */}
        <section className="relative h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuATaXL3a8hWM6oaw-6UZ3THWT0LcnTsv4OHJieuICNKcjN-2RkqfNZv4oGPo6gvc_mWeFy0d7iMcZe_YYZ3mLctivTe7mfTnydnc4rhNzPD5uTdlYm4YmyqIUvRbJ0XrzzCZpCzrkFi7CC7HqvVCdH0q0GKQDYNuNOeBWvjvqe5MuRl_oH50lSc6iUycN9P2Js8F2AwkRO0UeW240xtEl1NkmC7ytAiD1ho2jDIx5fwVCDFxlwm1Xydto8w6-t5T8k9f_BxVApb5r8" className="w-full h-full object-cover" alt="Laboratory" />
            <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-white">
            <span className="font-label-sm text-label-sm tracking-widest uppercase mb-4 block">Metropolis Healthcare Partner</span>
            <h1 className="font-headline-xl text-headline-xl md:text-7xl mb-6 font-bold">Diagnostic Centre</h1>
            <p className="font-body-lg text-body-lg max-w-2xl opacity-90 leading-relaxed mb-8">
              We provide the most accurate and reliable pathology services in Krishnanagar, backed by global quality standards and Metropolis precision.
            </p>
            <button 
              onClick={handleHomeCollectionClick}
              className="bg-white text-primary px-8 py-4 rounded-full font-label-lg font-bold shadow-elevation-3 hover:shadow-elevation-4 hover:scale-105 transition-all flex items-center gap-2 w-fit"
            >
              <span className="material-symbols-outlined">home_health</span>
              Book Home Collection
            </button>
          </div>
        </section>

        {/* ── Section 2: Why Choose Our Lab ── */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: "biotech", title: "Global Standards", desc: "Our laboratory follows global gold-standard protocols for sample processing." },
              { icon: "speed", title: "Fast Reporting", desc: "Get your results delivered digitally via WhatsApp or Email within 24 hours." },
              { icon: "home_health", title: "Home Collection", desc: "Expert phlebotomists available for safe and painless home sample collection." }
            ].map((item, i) => (
              <div key={i} className="p-8">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-4">{item.title}</h3>
                <p className="text-on-surface-variant font-body-md">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Test Directory ── */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
              <div>
                <h2 className="font-headline-lg text-headline-lg mb-2">Search Pathology Tests</h2>
                <p className="text-on-surface-variant font-body-lg">Explore our database of 130+ specialized tests.</p>
              </div>
              <div className="w-full md:w-96 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-5 bg-white dark:bg-surface-container rounded-2xl border border-outline-variant outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="Enter test name or code..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>

            <div className="bg-white dark:bg-surface-container rounded-[2.5rem] border border-outline-variant/30 overflow-hidden shadow-elevation-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-primary text-on-primary">
                    <tr>
                      <th className="px-3 py-4 md:px-8 md:py-6 text-[10px] md:font-label-lg uppercase tracking-wider w-[25%] md:w-auto">Test Code</th>
                      <th className="px-2 py-4 md:px-8 md:py-6 text-[10px] md:font-label-lg uppercase tracking-wider">Test Name</th>
                      <th className="px-3 py-4 md:px-8 md:py-6 text-[10px] md:font-label-lg uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {visibleTests.map((t, i) => (
                      <tr key={t.code} className={`hover:bg-primary/5 transition-all ${i % 2 === 1 ? 'bg-surface-container-low/30' : ''}`}>
                        <td className="px-3 py-4 md:px-8 md:py-6 font-bold text-primary text-xs md:text-base">{t.code}</td>
                        <td className="px-2 py-4 md:px-8 md:py-6 text-xs md:font-body-lg leading-tight">{t.name}</td>
                        <td className="px-3 py-4 md:px-8 md:py-6 text-right">
                          <button 
                            onClick={() => { if(!selectedTests.includes(t.code)) toggleTest(t.code); setIsHomeCollectionOpen(true); }}
                            className="bg-primary/10 text-primary px-3 py-1.5 md:px-6 md:py-3 rounded-full font-bold hover:bg-primary hover:text-on-primary transition-all whitespace-nowrap text-[10px] md:text-sm"
                          >
                            Select Test
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-10 text-center bg-surface-container/20 border-t border-outline-variant/20">
                <button onClick={() => setShowAll(!showAll)} className="text-primary font-bold text-lg hover:underline">
                  {showAll ? "Show Fewer Tests" : `View Full Test Catalog (${allTests.length} Tests)`}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Metropolis Partnership ── */}
        <section className="py-24 bg-[#0a3f41] text-white">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-8">World-Class Diagnostics<br/>in Krishnanagar</h2>
              <p className="font-body-lg text-white/80 leading-relaxed mb-8">
                Through our partnership with Metropolis Healthcare, we ensure that every sample collected is analyzed with the highest level of precision. Our systems are fully automated, minimizing human error and maximizing reliability.
              </p>
              <ul className="space-y-4">
                {["NABL Accredited Laboratory", "Global Quality Control Standards", "Expert Pathologist Supervision", "Certified Phlebotomists"].map(item => (
                  <li key={item} className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#5adace]">check_circle</span>
                    <span className="font-label-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#073031] p-12 rounded-[4rem] border border-[#145f63] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Metropolis_Healthcare_Logo_Green_Background.png/500px-Metropolis_Healthcare_Logo_Green_Background.png" className="w-full max-w-[280px] h-auto mb-10 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500" alt="Metropolis Healthcare" />
              <p className="text-center italic text-white/80 font-medium tracking-wide">"Leading the way in precision diagnostics across the globe."</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Home Collection Modal */}
      {isHomeCollectionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-background/70 backdrop-blur-md" onClick={() => setIsHomeCollectionOpen(false)}></div>
          <div className="relative bg-[#f5f7f7] w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 md:p-10 flex justify-between items-center bg-[#0a3f41] text-white">
              <h2 className="font-headline-md text-3xl font-bold">Home Collection Request</h2>
              <button onClick={() => setIsHomeCollectionOpen(false)} className="material-symbols-outlined text-2xl hover:text-white/70 transition-colors">close</button>
            </div>
            <div className="p-8 md:p-10 overflow-y-auto">
              <form className="space-y-6" onSubmit={handleCollectionSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Patient Name</label>
                    <input required value={collectionForm.name} onChange={e => setCollectionForm({...collectionForm, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" placeholder="Full name" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Gender</label>
                    <select value={collectionForm.gender} onChange={e => setCollectionForm({...collectionForm, gender: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all appearance-none cursor-pointer">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Phone</label>
                    <input required type="tel" maxLength={10} pattern="[0-9]{10}" value={collectionForm.phone} onChange={e => setCollectionForm({...collectionForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" placeholder="Contact number (10 digits)" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Preferred Date</label>
                    <input required min={today} value={collectionForm.date} onChange={e => setCollectionForm({...collectionForm, date: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all" type="date" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Full Address</label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Street No." value={collectionForm.streetNo} onChange={e => setCollectionForm({...collectionForm, streetNo: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" />
                    <input type="text" placeholder="Building No." value={collectionForm.buildingNo} onChange={e => setCollectionForm({...collectionForm, buildingNo: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Landmark" value={collectionForm.landmark} onChange={e => setCollectionForm({...collectionForm, landmark: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" />
                    <input type="text" placeholder="Pincode" value={collectionForm.pincode} onChange={e => setCollectionForm({...collectionForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" />
                  </div>

                  <textarea required value={collectionForm.address} onChange={e => setCollectionForm({...collectionForm, address: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" rows={3} placeholder="House number, street, landmark..." />
                  
                  <button
                    type="button"
                    onClick={handleUpdateLocation}
                    disabled={isFetchingLocation}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#e8ecec] hover:bg-[#d4dede] text-[#0a3f41] rounded-2xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isFetchingLocation ? 'hourglass_empty' : 'my_location'}
                    </span>
                    {isFetchingLocation ? 'Detecting Location...' : 'Update Current Location'}
                  </button>

                  {collectionForm.lat && collectionForm.lon && (
                    <div className="w-full h-48 rounded-2xl overflow-hidden mt-2">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${collectionForm.lat},${collectionForm.lon}&z=16&output=embed`}
                      ></iframe>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Referral Doctor's Name</label>
                    <input value={collectionForm.referralDoctor} onChange={e => setCollectionForm({...collectionForm, referralDoctor: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" placeholder="Dr. Name (Optional)" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#0a3f41] ml-1">Upload Prescription (Optional)</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCollectionForm({...collectionForm, prescription: e.target.files?.[0] || null})} className="w-full px-5 py-3.5 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#5adace]/20 file:text-[#0a3f41] hover:file:bg-[#5adace]/30" />
                  </div>
                </div>
                
                <div className="p-6 bg-[#e8ecec]/50 rounded-[2rem] border border-[#6b8c8c]/20 space-y-4">
                  <h4 className="font-bold text-[#0a3f41] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0a3f41]">biotech</span>
                    Pathology Services ({selectedTests.length} Selected)
                  </h4>
                  
                  <div className="relative">
                    <div className="w-full px-5 py-4 rounded-xl bg-white flex items-center justify-between border-none focus-within:ring-2 focus-within:ring-[#5adace]/50 transition-all cursor-text">
                      <input 
                        type="text" 
                        placeholder="+ Add a test to your booking..." 
                        className="bg-transparent outline-none text-[#0a3f41] w-full placeholder:text-[#9baea9]"
                        value={dropdownSearch}
                        onChange={(e) => {
                          setDropdownSearch(e.target.value);
                          if (!isDropdownOpen) setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      />
                      <span className="material-symbols-outlined text-[#6b8c8c]" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>expand_more</span>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_30px_rgba(10,63,65,0.15)] border border-[#6b8c8c]/10 max-h-60 overflow-y-auto z-50">
                        {allTests.filter(t => t.name.toLowerCase().includes(dropdownSearch.toLowerCase()) || t.code.toLowerCase().includes(dropdownSearch.toLowerCase())).length > 0 ? (
                          allTests
                            .filter(t => t.name.toLowerCase().includes(dropdownSearch.toLowerCase()) || t.code.toLowerCase().includes(dropdownSearch.toLowerCase()))
                            .map(t => {
                              const isSelected = selectedTests.includes(t.code);
                              return (
                                <button
                                  key={t.code}
                                  type="button"
                                  disabled={isSelected}
                                  onClick={() => {
                                    if (!isSelected) {
                                      toggleTest(t.code);
                                      setDropdownSearch("");
                                      setIsDropdownOpen(false);
                                    }
                                  }}
                                  className={`w-full text-left px-5 py-3 hover:bg-[#e8ecec]/50 transition-colors ${isSelected ? 'opacity-50 bg-[#e8ecec]/30 cursor-not-allowed text-[#6b8c8c]' : 'text-[#0a3f41]'}`}
                                >
                                  {t.name} <span className="text-xs text-[#6b8c8c] ml-1">({t.code})</span>
                                </button>
                              );
                            })
                        ) : (
                          <div className="px-5 py-4 text-center text-[#6b8c8c] text-sm">No tests found matching "{dropdownSearch}"</div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedTests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTests.map(code => {
                        const test = allTests.find(t => t.code === code);
                        return (
                          <span key={code} className="bg-[#0a3f41] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                            {test?.name || code} <button type="button" onClick={() => toggleTest(code)} className="hover:text-red-300 ml-1">×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button disabled={isSubmitting} className="w-full bg-[#0a3f41] text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#073031] transition-all active:scale-[0.98]">
                    {isSubmitting ? "Submitting Request..." : "Confirm Home Collection"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
