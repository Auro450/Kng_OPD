"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/context/AuthContext";
import { formatAvailability } from "@/utils/formatAvailability";
import { getApiBaseUrl } from "@/utils/apiConfig";

interface Doctor {
  name: string;
  specialty: string;
  imageurl: string;
  availabilitynotes?: string;
  description?: string;
  experience?: string;
  bio?: string;
  dummyRating?: string;
  useDummyRating?: boolean;
}

const CompactReviewSlider = ({ reviews }: { reviews: any[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl p-4 bg-primary/5 border border-primary/10 relative overflow-hidden h-[120px]">
      <div className="flex h-full w-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {reviews.map((review, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 flex flex-col justify-center px-2">
            <div className="flex justify-center mb-1">
              {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[10px] text-orange-400">{s <= review.rating ? "star" : ""}</span>)}
            </div>
            <p className="text-xs text-on-surface-variant italic text-center line-clamp-3 leading-relaxed">"{review.text}"</p>
            <p className="text-[10px] font-bold text-primary text-center mt-2 uppercase tracking-wider">- {review.patientName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DoctorsPage() {
  const { user, openLoginModal } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("Select a Doctor");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/doctors`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      } catch (err) {}
    }
    async function fetchReviews() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/reviews`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (err) {}
    }
    fetchDoctors();
    fetchReviews();
  }, []);

  const getDoctorAverageRating = (doctorName: string, doctorObj?: Doctor) => {
    if (doctorObj?.useDummyRating && doctorObj?.dummyRating) {
      return Number(doctorObj.dummyRating).toFixed(1);
    }
    const docReviews = reviews.filter(r => r.doctorName === doctorName && r.rating > 0);
    if (docReviews.length === 0) return null;
    const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length;
    return avg.toFixed(1);
  };

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDoctor("Select a Doctor");
        }}
        defaultDoctor={selectedDoctor || undefined}
      />

      <main className="bg-background text-on-surface">
        {/* ── Section 1: Hero ── */}
        <section className="bg-surface-container-low py-24 px-margin-mobile md:px-margin-desktop text-center">
          <div className="max-w-4xl mx-auto">
            <span className="font-label-sm text-label-sm tracking-[0.2em] uppercase mb-4 block text-primary font-bold">The Best Specialists in Krishnanagar</span>
            <h1 className="font-headline-xl text-headline-xl md:text-7xl mb-8 font-bold">Our Medical Staff</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              At Ray's Medical, we bring together a diverse team of experienced doctors dedicated to providing world-class medical advice and empathetic care.
            </p>
          </div>
        </section>

        {/* ── Section 2: Specialized Areas ── */}
        <section className="py-20 bg-surface border-y border-outline-variant/10 overflow-hidden">
          <div className="relative flex overflow-hidden group w-full">
            <div className="flex animate-marquee shrink-0 gap-16 py-4">
              {[
                { icon: "psychology", name: "Psychiatry" },
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
                { icon: "psychology", name: "Psychiatry" },
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

        {/* ── Section 3: Doctor Directory ── */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col max-w-5xl mx-auto gap-8">
            {doctors.map((doc, idx) => (
              <div key={idx} className="bg-white dark:bg-surface-container-low rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 border border-outline-variant/30 shadow-md hover:shadow-lg transition-all duration-500 group relative overflow-hidden">
                {/* Accent Line */}
                <div className="absolute left-0 top-0 w-2 h-full bg-[#5adace] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Left Side: Image & Reviews */}
                <div className="flex flex-col flex-shrink-0 w-full md:w-[280px]">
                  <div className="h-[320px] rounded-[1.5rem] overflow-hidden relative shadow-inner">
                    <img
                      src={doc.imageurl ? (doc.imageurl.startsWith("http") ? doc.imageurl : `${getApiBaseUrl()}${doc.imageurl}`) : ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      alt={doc.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <CompactReviewSlider reviews={reviews.filter(r => r.doctorName && r.doctorName.trim().toLowerCase() === doc.name.trim().toLowerCase() && r.featured && r.text)} />
                </div>

                {/* Right Side: Doctor Details */}
                <div className="flex flex-col flex-1 py-2">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <h3 className="font-headline-lg text-3xl font-black text-[#0a3f41]">{doc.name}</h3>
                        {getDoctorAverageRating(doc.name, doc) && (
                          <span className="flex items-center text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200 shadow-sm">
                            {getDoctorAverageRating(doc.name, doc)} <span className="material-symbols-outlined text-[16px] ml-1">star</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[#0a3f41]/80 font-extrabold tracking-wide uppercase text-sm">{doc.specialty}</p>
                    </div>
                    {doc.experience && (
                      <span className="bg-[#0a3f41]/5 text-[#0a3f41] px-4 py-2 rounded-xl text-sm font-bold border border-[#0a3f41]/10 flex items-center gap-2 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                        {doc.experience} EXP
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-outline-variant/50 to-transparent my-4"></div>

                  <div className="text-on-surface-variant font-body-lg mb-8 flex-grow leading-relaxed flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#5adace] mt-1 shrink-0">event_available</span>
                      <p>{formatAvailability(doc)}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-outline-variant/20 flex items-center justify-end">
                    <button 
                      onClick={() => {
                        if (!user) {
                          openLoginModal();
                        } else {
                          setSelectedDoctor(doc.name);
                          setIsModalOpen(true);
                        }
                      }}
                      className="bg-[#06474e] text-white hover:bg-[#5adace] hover:text-[#06474e] py-4 px-10 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-xl hover:-translate-y-1 w-full md:w-auto"
                    >
                      Book Appointment <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
