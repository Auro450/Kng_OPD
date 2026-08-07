"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { getApiBaseUrl } from "@/utils/apiConfig";

interface Medicine {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  description?: string;
  inStock?: boolean;
  isPrescriptionRequired?: boolean;
  imageurl: string;
}

interface CartItem extends Medicine {
  quantity: number;
}

export default function MedicinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [patientDetails, setPatientDetails] = useState<{name: string, phone: string, address: string, streetNo: string, buildingNo: string, landmark: string, pincode: string, lat: number | null, lon: number | null}>({ name: "", phone: "", address: "", streetNo: "", buildingNo: "", landmark: "", pincode: "", lat: null, lon: null });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    fetchMedicines();
    // Load cart from local storage if available
    const savedCart = localStorage.getItem("medicine_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("medicine_cart", JSON.stringify(cart));
  }, [cart]);

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicines`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMedicines(data);
      }
    } catch (e) {
      console.error("Error fetching medicines", e);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (medicine: Medicine) => {
    if (medicine.inStock === false) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
    
    // Simple visual feedback
    const btn = document.getElementById(`add-btn-${medicine.id}`);
    if (btn) {
      btn.innerText = "Added!";
      btn.classList.add("bg-[#5adace]", "text-[#0a3f41]");
      btn.classList.remove("bg-[#0a3f41]", "text-white");
      setTimeout(() => {
        btn.innerText = "Add to Cart";
        btn.classList.remove("bg-[#5adace]", "text-[#0a3f41]");
        btn.classList.add("bg-[#0a3f41]", "text-white");
      }, 1000);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = Math.min(cartTotalPrice, discount);
  const finalTotal = Math.max(0, cartTotalPrice - discountAmount);

  // Reset coupon if cart total drops to 0
  useEffect(() => {
    if (cartTotalPrice === 0 && discount > 0) {
      setDiscount(0);
      setCouponMsg({ type: "", text: "" });
    }
  }, [cartTotalPrice]);

  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);

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
            setPatientDetails(prev => ({ ...prev, address: data.display_name, lat: latitude, lon: longitude }));
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coupons/medicine`);
      const coupons = await res.json();

      if (!Array.isArray(coupons)) {
        setDiscount(0);
        setCouponMsg({ type: "error", text: "Unable to validate coupon." });
        return;
      }

      const match = coupons.find((c: any) => c.code === code && c.isActive);

      if (!match) {
        setDiscount(0);
        setCouponMsg({ type: "error", text: "Invalid or inactive coupon code." });
        return;
      }

      const todayStr = new Date().toISOString().split("T")[0];
      if (match.validFrom && todayStr < match.validFrom) {
        setDiscount(0);
        setCouponMsg({ type: "error", text: `Coupon valid from ${match.validFrom}` });
        return;
      }
      if (match.validTo && todayStr > match.validTo) {
        setDiscount(0);
        setCouponMsg({ type: "error", text: "Coupon has expired." });
        return;
      }

      if (match.minOrder && cartTotalPrice < Number(match.minOrder)) {
        setDiscount(0);
        setCouponMsg({ type: "error", text: `Minimum order of ₹${match.minOrder} required for this coupon.` });
        return;
      }

      let calcDiscount = 0;
      if (match.discountType === "percentage") {
        calcDiscount = (cartTotalPrice * Number(match.discount)) / 100;
        if (match.maxDiscount && Number(match.maxDiscount) > 0) {
          calcDiscount = Math.min(calcDiscount, Number(match.maxDiscount));
        }
      } else {
        calcDiscount = Number(match.discount);
      }

      setDiscount(calcDiscount);
      setCouponMsg({ type: "success", text: `Coupon applied! Saved ₹${calcDiscount.toFixed(0)}` });
    } catch (err) {
      console.error(err);
      setDiscount(0);
      setCouponMsg({ type: "error", text: "Error applying coupon." });
    }
  };

  const handleCheckout = async () => {
    if (!patientDetails.name || !patientDetails.phone || !patientDetails.address) {
      alert("Please fill in all your details for delivery.");
      return;
    }

    try {
      const orderPayload = {
        patientDetails,
        userPhone: user?.phone || patientDetails.phone,
        items: cart,
        cart,
        subtotal: cartTotalPrice,
        discountAmount,
        finalAmount: finalTotal,
        finalTotal,
        couponCode: couponCode || null
      };

      let body: any;
      let headers: any = {};

      if (prescriptionFile) {
        const formData = new FormData();
        formData.append("prescription", prescriptionFile);
        formData.append("orderData", JSON.stringify(orderPayload));
        body = formData;
      } else {
        body = JSON.stringify(orderPayload);
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(`${getApiBaseUrl()}/api/medicine-orders`, {
        method: "POST",
        headers,
        body
      });

      if (response.ok) {
        alert(`Order placed successfully!\nName: ${patientDetails.name}\nTotal Paid: ₹${finalTotal.toFixed(2)}`);
        setCart([]);
        setIsCartOpen(false);
        setPatientDetails({ name: "", phone: "", address: "", streetNo: "", buildingNo: "", landmark: "", pincode: "", lat: null, lon: null });
        setPrescriptionFile(null);
        setCouponCode("");
        setDiscount(0);
        setCouponMsg({ type: "", text: "" });
        localStorage.removeItem("medicine_cart");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order.");
    }
  };



  const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Navbar />
      <AnnouncementBar />
      <div className="min-h-screen bg-[#f8f9f9] flex flex-col">
        <div className="bg-[#0a3f41] py-16 px-4 md:px-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Ray's Pharmacy</h1>
        <p className="text-[#a4bcbc] text-lg max-w-2xl mx-auto">
          Order your prescribed medicines and health products directly from our trusted pharmacy.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-[#0a3f41]">Available Medicines</h2>
          <div className="relative w-full md:w-auto min-w-[300px]">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#6b8c8c]">search</span>
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 pl-12 pr-4 bg-white text-[#0a3f41] font-medium border border-[#e8ecec] rounded-full focus:outline-none focus:ring-2 focus:ring-[#5adace]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5adace]"></div>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#e8ecec]">
            <span className="material-symbols-outlined text-6xl text-[#d4dede] mb-4">medical_services</span>
            <p className="text-[#6b8c8c] text-xl font-bold">No medicines found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedicines.map(med => (
              <div key={med.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#e8ecec] flex flex-col relative ${med.inStock === false ? 'opacity-85 bg-gray-50/50' : ''}`}>
                <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-4">
                  {med.inStock === false && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                      Sold Out
                    </span>
                  )}
                  {med.isPrescriptionRequired && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
                      Rx Required
                    </span>
                  )}
                  {med.imageurl ? (
                    <img 
                      src={`${getApiBaseUrl()}${med.imageurl}`} 
                      alt={med.name} 
                      className={`w-full h-full object-contain ${med.inStock === false ? 'grayscale-[40%]' : ''}`}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-gray-300">medication</span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  {med.category && <span className="text-xs font-bold text-[#5adace] uppercase tracking-wider mb-1">{med.category}</span>}
                  <h3 className="text-lg font-bold text-[#0a3f41] mb-1">{med.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-semibold text-[#0a3f41]">₹{med.price}</span>
                    {med.originalPrice && Number(med.originalPrice) > Number(med.price) && (
                      <span className="text-sm text-gray-400 line-through font-medium">₹{med.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    {med.inStock === false ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
                      >
                        <span className="material-symbols-outlined text-sm">do_not_disturb_on</span>
                        Sold Out
                      </button>
                    ) : cart.find(item => item.id === med.id) ? (
                      <div className="w-full py-2 rounded-xl bg-[#e8ecec] border border-[#0a3f41]/10 flex items-center justify-between px-4 shadow-sm">
                        <button onClick={() => updateQuantity(med.id, -1)} className="w-8 h-8 flex items-center justify-center text-[#0a3f41] bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="text-base font-bold text-[#0a3f41]">
                          {cart.find(item => item.id === med.id)?.quantity}
                        </span>
                        <button onClick={() => updateQuantity(med.id, 1)} className="w-8 h-8 flex items-center justify-center text-[#0a3f41] bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`add-btn-${med.id}`}
                        onClick={() => addToCart(med)}
                        className="w-full py-3 rounded-xl bg-[#0a3f41] text-white font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed top-24 right-8 w-16 h-16 bg-[#5adace] text-[#0a3f41] rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-3xl">shopping_bag</span>
        {cartTotalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {cartTotalItems}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-6 border-b border-[#e8ecec] flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#0a3f41] flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_cart</span>
                Your Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[#6b8c8c] hover:text-red-500 transition-colors p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-6xl text-[#d4dede] mb-4">production_quantity_limits</span>
                  <p className="text-[#6b8c8c] font-bold">Your cart is empty</p>
                  <button onClick={() => setIsCartOpen(false)} className="mt-4 text-[#5adace] hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 border border-[#e8ecec] rounded-xl">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.imageurl ? (
                        <img src={`${getApiBaseUrl()}${item.imageurl}`} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-gray-300">medication</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#0a3f41]">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <div className="text-[#0a3f41] font-medium mt-1">₹{item.price}</div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-[#f8f9f9] rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#0a3f41] bg-white rounded-md shadow-sm">-</button>
                          <span className="text-sm font-bold text-[#0a3f41] w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#0a3f41] bg-white rounded-md shadow-sm">+</button>
                        </div>
                        <div className="font-black text-[#0a3f41]">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {cart.length > 0 && (
                <div className="pt-4 mt-6 border-t border-[#e8ecec] flex flex-col gap-4">
                  {/* Patient Details Form */}
                <div className="bg-white p-4 rounded-xl border border-[#e8ecec] shadow-sm flex flex-col gap-3">
                  <h3 className="font-bold text-[#0a3f41] text-sm">Delivery Details</h3>
                  <input type="text" placeholder="Full Name" value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                  <input type="tel" maxLength={10} pattern="[0-9]{10}" placeholder="Phone Number (10 digits)" value={patientDetails.phone} onChange={e => setPatientDetails({...patientDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Street No." value={patientDetails.streetNo} onChange={e => setPatientDetails({...patientDetails, streetNo: e.target.value})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                    <input type="text" placeholder="Building No." value={patientDetails.buildingNo} onChange={e => setPatientDetails({...patientDetails, buildingNo: e.target.value})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Landmark" value={patientDetails.landmark} onChange={e => setPatientDetails({...patientDetails, landmark: e.target.value})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                    <input type="text" placeholder="Pincode" value={patientDetails.pincode} onChange={e => setPatientDetails({...patientDetails, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                  </div>

                  <textarea placeholder="Delivery Address" value={patientDetails.address} onChange={e => setPatientDetails({...patientDetails, address: e.target.value})} className="w-full p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5adace] resize-none h-16"></textarea>
                  
                  <button
                    onClick={handleUpdateLocation}
                    disabled={isFetchingLocation}
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#e8ecec] hover:bg-[#d4dede] text-[#0a3f41] rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isFetchingLocation ? 'hourglass_empty' : 'my_location'}
                    </span>
                    {isFetchingLocation ? 'Detecting Location...' : 'Update Current Location'}
                  </button>

                  {patientDetails.lat && patientDetails.lon && (
                    <div className="w-full h-40 rounded-lg overflow-hidden border border-[#e8ecec] mt-1">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${patientDetails.lat},${patientDetails.lon}&z=16&output=embed`}
                      ></iframe>
                    </div>
                  )}
                </div>

                {/* Optional Prescription Upload */}
                <div className="bg-white p-4 rounded-xl border border-[#e8ecec] shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#0a3f41] text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#5adace]">upload_file</span>
                      Upload Prescription (Optional)
                    </label>
                    <span className="text-[10px] text-gray-400 font-normal">JPG, PNG, PDF</span>
                  </div>
                  <input
                    type="file"
                    id="cart-prescription-upload"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPrescriptionFile(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="cart-prescription-upload"
                    className="flex items-center justify-between p-3 bg-[#f8f9f9] border border-dashed border-[#5adace]/50 hover:border-[#5adace] rounded-lg cursor-pointer transition-colors"
                  >
                    {prescriptionFile ? (
                      <div className="flex items-center gap-2 overflow-hidden text-xs font-bold text-[#0a3f41] min-w-0">
                        <span className="material-symbols-outlined text-emerald-600 text-base shrink-0">check_circle</span>
                        <span className="truncate">{prescriptionFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-medium text-[#6b8c8c]">
                        <span className="material-symbols-outlined text-base text-[#5adace]">add_photo_alternate</span>
                        <span>Attach Rx image or PDF...</span>
                      </div>
                    )}
                    {prescriptionFile ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPrescriptionFile(null);
                        }}
                        className="text-xs font-bold text-red-500 hover:underline ml-2 shrink-0"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#0a3f41] bg-white px-3 py-1 rounded border border-[#e8ecec] shadow-2xs">Browse</span>
                    )}
                  </label>
                </div>

                {/* Coupon Section */}
                <div className="bg-white p-4 rounded-xl border border-[#e8ecec] shadow-sm">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Coupon Code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="flex-1 p-2 bg-[#f8f9f9] text-[#0a3f41] border border-[#e8ecec] rounded-lg text-sm uppercase focus:outline-none focus:ring-1 focus:ring-[#5adace]" />
                    <button onClick={handleApplyCoupon} className="px-4 bg-[#0a3f41] text-white rounded-lg text-sm font-bold hover:bg-[#0a3f41]/90">Apply</button>
                  </div>
                  {couponMsg.text && (
                    <p className={`mt-2 text-xs font-bold ${couponMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{couponMsg.text}</p>
                  )}
                </div>

              </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#e8ecec] bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 z-10">
              <div className="flex justify-between items-center mb-2 text-sm text-[#6b8c8c]">
                <span>Subtotal</span>
                <span>₹{cartTotalPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4 pt-2 border-t border-[#e8ecec]">
                <span className="text-lg font-bold text-[#6b8c8c]">Total</span>
                <span className="text-2xl font-black text-[#0a3f41]">₹{finalTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-[#5adace] text-[#0a3f41] rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Place Order
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </div>
          )}
        </div>
        )}
        <Footer />
      </div>
    </>
  );
}
