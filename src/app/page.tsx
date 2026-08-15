"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/utils/apiConfig";
import { BlogPost, ORIGINAL_BLOGS } from "@/data/blogs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BANNERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCFZTQKTIOgByfV6PvVNnJuA6PyvktyQ85s8F7BN0_3M-4ThFHFn0ZeXYuB-k8tv-mbb0sagFtqMqe2vi2HR8IOXitDKTZGCUR5_kA_FsUyuR38bOgyXrDZoNnyFMyXqkp-BN7LEsfSIsit3fs68gLgpan_e3meNFpmcb5fUCuPQeGAzVYDUuQvjpY_42RSgBMuqaxN0V0O0zmo4h4RztGIbExiZJ--2pQiUYMSYQAh4R9WFMI8vqilXXefGF_e9tVrth90RUITZB7U",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop"
];

interface Doctor {
  name: string;
  specialty: string;
  imageurl: string;
  availabilitynotes?: string;
  availableDays?: number[];
  availableWeeks?: number[];
  dummyRating?: string;
  useDummyRating?: boolean;
  exceptions?: { date: string; isAvailable: boolean }[];
}

interface Review {
  id: string;
  doctorName?: string;
  rating: number;
  text?: string;
  featured?: boolean;
}



const GlobalReviewSlider = ({ reviews }: { reviews: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-[#f5f7f7] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#5adace]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#0a3f41]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-container-max mx-auto relative z-10">
        <h2 className="font-headline-lg text-4xl md:text-5xl text-center text-[#0a3f41] font-bold mb-16">Patient Stories</h2>
        
        <div className="max-w-5xl mx-auto backdrop-blur-xl bg-white/60 border border-white/80 rounded-[3rem] p-10 md:p-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden relative">
          <div className="absolute top-6 left-6 md:top-10 md:left-10 opacity-10">
            <span className="material-symbols-outlined text-[120px] text-[#0a3f41]">format_quote</span>
          </div>
          
          <div className="flex w-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {reviews.map((review, idx) => (
              <div key={idx} className="flex-none w-full flex flex-col items-center justify-center px-4 md:px-12 relative z-10 min-h-[200px]" style={{ width: '100%' }}>
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[28px] text-orange-400 drop-shadow-sm">{s <= review.rating ? "star" : ""}</span>)}
                </div>
                <p className="text-xl md:text-3xl text-[#0a3f41] text-center leading-relaxed font-bold mb-10 italic">
                  "{review.text}"
                </p>
                <div className="flex flex-col items-center">
                  <p className="text-lg font-black text-[#5adace] uppercase tracking-widest">{review.patientName}</p>
                  <p className="text-sm font-bold text-[#0a3f41]/50 mt-1 uppercase tracking-widest">
                    {review.type === 'Pathology' ? 'PATHOLOGY SERVICE' 
                      : review.type === 'Medicine' ? 'MEDICINE ORDER'
                      : review.doctorName ? `FOR DR. ${review.doctorName}`
                      : 'GENERAL REVIEW'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-12 relative z-10">
            {reviews.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-500 ${currentIndex === idx ? 'w-10 bg-[#5adace]' : 'w-2.5 bg-[#0a3f41]/20 hover:bg-[#0a3f41]/40'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { user, openLoginModal } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    phone: "",
    date: "",
    doctor: "Select a Doctor",
    reason: "Select Reason",
    type: "Homepage Appointment"
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [randomDoctors, setRandomDoctors] = useState<Doctor[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>(ORIGINAL_BLOGS);
  const [reviews, setReviews] = useState<any[]>([]);

  const getDoctorAverageRating = (doctorName: string, doctorObj?: Doctor) => {
    if (doctorObj?.useDummyRating && doctorObj?.dummyRating) {
      return Number(doctorObj.dummyRating).toFixed(1);
    }
    const docReviews = reviews.filter(r => r.doctorName === doctorName && r.rating > 0);
    if (docReviews.length === 0) return null;
    const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length;
    return avg.toFixed(1);
  };

  const handleBookAppointment = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const drRes = await fetch(`${"https://13-207-203-76.nip.io"}/api/doctors`);
        const drData = await drRes.json();
        if (Array.isArray(drData) && drData.length > 0) setDoctors(drData);
        
        const blogRes = await fetch(`${"https://13-207-203-76.nip.io"}/api/blog`);
        const blogData = await blogRes.json();
        if (Array.isArray(blogData) && blogData.length > 0) setBlogs([...ORIGINAL_BLOGS, ...blogData]);

        const reviewRes = await fetch(`${"https://13-207-203-76.nip.io"}/api/reviews`);
        const reviewData = await reviewRes.json();
        if (reviewData.success) setReviews(reviewData.reviews);
      } catch (err) {}
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentBanner(p => (p + 1) % BANNERS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      const shuffled = [...doctors].sort(() => 0.5 - Math.random());
      setRandomDoctors(shuffled.slice(0, 3));
    }
  }, [doctors]);

  const submitBooking = async (dataToSubmit: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${"https://13-207-203-76.nip.io"}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dataToSubmit, userEmail: user?.email, userPhone: user?.phone }),
      });
      if ((await res.json()).success) {
        alert("Booking request sent successfully!");
        setFormData({ name: user?.name || "", gender: "Male", phone: user?.phone || "", date: "", doctor: "Select a Doctor", reason: "Select Reason", type: "Homepage Appointment" });
      }
    } catch (error) { alert("Error sending request."); }
    finally { setIsSubmitting(false); }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, phone: user.phone }));
    }
  }, [user]);

  const isDateAvailable = (date: Date) => {
    const selectedDoc = doctors.find(d => d.name === formData.doctor);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return false;
    
    if (!selectedDoc) return true;

    const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const dateStr = offsetDate.toISOString().split("T")[0];

    if (selectedDoc.exceptions && Array.isArray(selectedDoc.exceptions)) {
        const exception = selectedDoc.exceptions.find((e: any) => e.date === dateStr);
        if (exception) {
            return exception.isAvailable;
        }
    }

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal(() => submitBooking(formData));
      return;
    }
    submitBooking(formData);
  };

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      
      <main className="bg-background text-on-surface">
        {/* ── Section 1: Hero Carousel ── */}
        <section id="hero" className="relative h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {BANNERS.map((src, idx) => (
              <img 
                key={idx} 
                src={src} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`} 
                alt="Healthcare Banner" 
              />
            ))}
            <div className="absolute inset-0 bg-on-background/60"></div>
          </div>
          
          <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-white">
              <h1 className="font-headline-xl text-headline-xl md:text-7xl mb-8 leading-[1.1] font-bold">
                Exceptional Care,<br/><span className="text-[#56C5C5]">Every Single Time.</span>
              </h1>
              <p className="font-body-lg text-body-lg mb-10 opacity-90 leading-relaxed">
                Experience precision-driven medicine and empathetic care at Krishnanagar's leading medical clinic. Your health, our priority.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleBookAppointment}
                  className="bg-primary text-on-primary px-10 py-5 rounded-full font-label-lg text-label-lg shadow-elevation-3 hover:shadow-elevation-4 transition-all"
                >
                  Book Appointment Now
                </button>
                <Link 
                  href="/diagnostic-centre"
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-full font-label-lg text-label-lg hover:bg-white/20 transition-all"
                >
                  Explore Our Lab
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 2: Core Services ── */}
        <section id="services" className="py-24 bg-surface-container-lowest px-margin-mobile md:px-margin-desktop scroll-mt-20">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-4xl md:text-5xl font-bold text-on-surface mb-4">Core Healthcare Services</h2>
              <p className="text-on-surface-variant font-body-lg">Comprehensive medical solutions for your entire family.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: "medical_services", title: "Expert Clinic", desc: "Consult with senior specialists in every medical department.", link: "/doctors" },
                { icon: "biotech", title: "Diagnostic Centre", desc: "State-of-the-art pathology and imaging in association with Metropolis.", link: "/diagnostic-centre" },
                { icon: "medication", title: "Medicine Shop", desc: "Genuine medicines and healthcare products available 24/7.", link: "/medicine" },
                { icon: "emergency", title: "Emergency Care", desc: "Rapid medical response and support when you need it most.", link: "/#contact" }
              ].map((s, i) => (
                <Link 
                  key={i} 
                  href={s.link}
                  className="block p-10 rounded-[3rem] bg-white dark:bg-surface-container border border-outline-variant/30 shadow-sm hover:shadow-elevation-5 hover:-translate-y-4 hover:bg-[#004349] hover:border-[#004349] transition-all duration-500 group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-[#004349]/10 rounded-2xl flex items-center justify-center text-[#004349] mb-8 group-hover:bg-[#5adace] transition-all duration-500 shadow-sm overflow-hidden p-2">
                    {(s as any).img ? (
                      <img src={(s as any).img} className="w-full h-full object-contain" alt={s.title} />
                    ) : (
                      <span className="material-symbols-outlined text-4xl group-hover:text-[#004349] transition-colors duration-500">{s.icon}</span>
                    )}
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-4 text-[#181c1e] group-hover:text-white transition-colors duration-500">{s.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8 group-hover:text-white/90 transition-colors duration-500">{s.desc}</p>
                  <div className="text-[#004349] font-bold inline-flex items-center gap-2 group-hover:gap-4 transition-all group-hover:text-[#5adace]">
                    Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Why Choose Us (Redesigned) ── */}
        <section className="py-24 bg-[#f0f4f4] relative overflow-hidden px-margin-mobile md:px-margin-desktop">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5adace]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
            {/* Left: Dynamic Image Composition */}
            <div className="relative">
              <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white">
                <img src="/rays_medical_real.jpg" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" alt="Ray's Medical Storefront" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#004349]/70 via-[#004349]/20 to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-8 -right-8 md:bottom-12 md:-right-12 bg-[#004349] text-white p-8 rounded-[2rem] shadow-2xl flex items-center gap-6 border-[6px] border-[#f0f4f4] transition-transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#5adace]/20 text-[#5adace] rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-4xl">medical_information</span>
                </div>
                <div>
                  <p className="text-4xl font-black tracking-tight text-white">15+</p>
                  <p className="font-bold text-[11px] uppercase tracking-widest text-[#5adace] mt-1">Years of Trust</p>
                </div>
              </div>

              {/* Decorative Medical Dots */}
              <div className="absolute top-12 -left-8 md:-left-12 grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#5adace]/60"></div>
                ))}
              </div>
            </div>

            {/* Right: Content Cards */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#004349]/5 text-[#004349] font-bold text-[10px] uppercase tracking-widest mb-6 border border-[#004349]/10">
                <span className="w-2 h-2 rounded-full bg-[#5adace] animate-pulse"></span>
                Excellence in Healthcare
              </div>
              
              <h2 className="font-headline-lg text-4xl md:text-5xl text-[#0a3f41] mb-12 font-black leading-tight">
                Why Thousands Trust<br/>
                <span className="text-[#004349] relative">
                  Ray's Medical
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#5adace]/40" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
                </span>
              </h2>

              <div className="space-y-6">
                {[
                  { title: "Unmatched Precision", desc: "Our laboratory is partnered with Metropolis, ensuring global gold-standard accuracy in every test result.", icon: "biotech" },
                  { title: "Compassionate Care", desc: "We believe in treating the person, not just the symptom. Our staff is trained to provide a home-like environment.", icon: "volunteer_activism" },
                  { title: "Modern Technology", desc: "From advanced MRI to fully automated clinical pathology, we house the best tech in Krishnanagar.", icon: "monitor_heart" }
                ].map((item, i) => (
                  <div key={i} className="group flex gap-6 p-6 rounded-[2rem] bg-white border border-transparent hover:border-[#5adace]/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative">
                      {/* Hexagon/Circle hybrid background */}
                      <div className="w-14 h-14 bg-[#f0f4f4] group-hover:bg-[#004349] transition-colors duration-500 rounded-2xl rotate-3 group-hover:rotate-0 flex items-center justify-center shrink-0 shadow-inner">
                        <span className="material-symbols-outlined text-[28px] text-[#004349] group-hover:text-[#5adace] transition-colors duration-500">{item.icon}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5adace] text-[#004349] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                        <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-lg text-[#004349] mb-1.5 font-bold group-hover:text-[#5adace] transition-colors duration-300">{item.title}</h4>
                      <p className="text-[#6b8c8c] text-[15px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Specialized Care Icons ── */}
        {/* ── Section 4: Specialized Care Areas (Full-Width Marquee) ── */}
        <section className="py-24 bg-surface border-y border-outline-variant/10 overflow-hidden">
          <div className="text-center mb-16 px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-md text-3xl md:text-4xl text-on-surface-variant mb-4 uppercase tracking-[0.2em] font-bold">Specialized Care Areas</h2>
          </div>
          
          <div className="relative flex overflow-hidden group w-full">
            <div className="flex animate-marquee shrink-0 gap-16 py-4">
              {[
                { icon: "child_care", name: "Paediatrics" },
                { icon: "female", name: "Gynaecology" },
                { icon: "ecg", name: "Cardiology" },
                { icon: "orthopedics", name: "Orthopaedics" },
                { icon: "neurology", name: "Neurology" },
                { icon: "eye_tracking", name: "Ophthalmology" },
                { icon: "eco", name: "Ayurveda" },
                { icon: "pill", name: "Medicine" },
                { icon: "face_retouching_natural", name: "Dermatologist" },
                { icon: "medical_services", name: "Surgeon" }
              ].concat([
                { icon: "child_care", name: "Paediatrics" },
                { icon: "female", name: "Gynaecology" },
                { icon: "ecg", name: "Cardiology" },
                { icon: "orthopedics", name: "Orthopaedics" },
                { icon: "neurology", name: "Neurology" },
                { icon: "eye_tracking", name: "Ophthalmology" },
                { icon: "eco", name: "Ayurveda" },
                { icon: "pill", name: "Medicine" },
                { icon: "face_retouching_natural", name: "Dermatologist" },
                { icon: "medical_services", name: "Surgeon" }
              ]).map((area, i) => (
                <div key={i} className="flex flex-col items-center min-w-[140px] group/item cursor-pointer">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mb-4 group-hover/item:bg-primary group-hover/item:text-on-primary transition-all duration-500 shadow-sm hover:shadow-elevation-3 hover:-translate-y-2">
                    <span className="material-symbols-outlined text-4xl">{area.icon}</span>
                  </div>
                  <p className="font-label-md text-label-md font-bold group-hover/item:text-primary transition-colors text-center">{area.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 5: Doctors & Booking (Compact & Refined) ── */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-[#0a3f41] relative overflow-hidden">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            <div>
              <h2 className="font-headline-lg text-4xl mb-10 text-white font-bold">Doctors</h2>
              
              <div className="space-y-6 mb-12">
                {(randomDoctors.length > 0 ? randomDoctors : doctors.slice(0, 3)).map((doc, idx) => (
                  <div key={idx} className="bg-white/5 rounded-[2rem] border border-white/10 transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-6 p-6 pb-2">
                      <div className="w-[4.5rem] h-[4.5rem] rounded-full overflow-hidden border-2 border-[#5adace] shrink-0">
                        <img
                          src={doc.imageurl ? (doc.imageurl.startsWith("http") ? doc.imageurl : `${getApiBaseUrl()}${doc.imageurl}`) : ""}
                          className="w-full h-full object-cover"
                          alt={doc.name}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h4 className="font-headline-sm text-lg text-white">{doc.name}</h4>
                          {getDoctorAverageRating(doc.name, doc) && (
                            <span className="flex items-center text-[12px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-md border border-orange-400/20">
                              {getDoctorAverageRating(doc.name, doc)} <span className="material-symbols-outlined text-[12px] ml-0.5">star</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[#5adace] text-[15px] flex items-center gap-2">
                          {doc.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/doctors" className="inline-flex items-center justify-center gap-3 bg-[#5adace] text-[#0a3f41] font-bold px-8 py-4 rounded-full text-[15px] transition-all hover:bg-[#48b5ab]">
                Meet Full Staff <span className="material-symbols-outlined text-2xl">group</span>
              </Link>
            </div>

            <div className="bg-[#f5f7f7] rounded-[3rem] p-10 md:p-12 shadow-xl">
              <h3 className="font-headline-md text-3xl text-[#0a3f41] mb-10 font-bold text-center">Patient Registration</h3>
              
              <form className="space-y-6" onSubmit={handleBookingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#6b8c8c] ml-1">Full Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" placeholder="Enter patient name" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#6b8c8c] ml-1">Gender</label>
                    <div className="relative">
                      <select value={formData.gender || "Male"} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all appearance-none cursor-pointer">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6b8c8c] pointer-events-none text-xl">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#6b8c8c] ml-1">Phone</label>
                    <input required type="tel" maxLength={10} pattern="[0-9]{10}" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all placeholder:text-[#9baea9]" placeholder="Contact number (10 digits)" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#6b8c8c] ml-1">Doctor To Visit</label>
                    <div className="relative">
                      <select value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value, date: ""})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all appearance-none cursor-pointer">
                        <option disabled value="Select a Doctor">Choose Specialist...</option>
                        {doctors.map(doc => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6b8c8c] pointer-events-none text-xl">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#6b8c8c] ml-1">Preferred Date</label>
                    <div className="relative" title={formData.doctor === "Select a Doctor" ? "Please select a doctor first" : ""}>
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
                        className={`w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all ${formData.doctor === "Select a Doctor" ? "opacity-60 cursor-not-allowed" : ""}`}
                        wrapperClassName="w-full block"
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#6b8c8c] ml-1">Reason For Visit</label>
                    <div className="relative">
                      <select value={formData.reason || "Select Reason"} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-[#e8ecec] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 transition-all appearance-none cursor-pointer">
                        <option value="Select Reason">Choose Reason...</option>
                        <option value="Doctors Appointment">Doctors Appointment</option>
                        <option value="Post Check-up Consultation">Post Check-up Consultation</option>
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6b8c8c] pointer-events-none text-xl">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button disabled={isSubmitting} className="w-full bg-[#0a3f41] text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#073031] transition-all active:scale-[0.98]">
                    {isSubmitting ? "Processing..." : "Book Appointment Now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>


        <GlobalReviewSlider reviews={reviews.filter(r => r.featured && r.text)} />

        {/* ── Section 7: Health Insights (Blog) ── */}
        <section className="py-24 bg-surface px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Health Insights</h2>
                <p className="text-on-surface-variant font-body-lg">The latest from our medical experts.</p>
              </div>
              <Link href="/blog" className="text-primary font-bold hover:underline flex items-center gap-2">
                Visit Journal <span className="material-symbols-outlined">open_in_new</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {blogs.slice(0, 3).map((post, idx) => (
                <Link href={`/blog/${post.slug || '10-superfoods-to-boost-your-heart-health-today'}`} key={idx} className="bg-white dark:bg-surface-container rounded-[2.5rem] overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-elevation-2 transition-all group block">
                  <img src={post.imageurl} alt={post.title} className="w-full aspect-[16/10] object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="p-10">
                    <span className="text-primary font-bold text-xs uppercase">{post.category}</span>
                    <h3 className="font-headline-sm text-headline-sm mt-4 mb-6 group-hover:text-primary transition-colors">{post.title}</h3>
                    <span className="text-primary font-bold hover:underline">Read Article</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
