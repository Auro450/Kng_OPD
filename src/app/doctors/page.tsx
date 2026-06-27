"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { useAuth } from "@/context/AuthContext";

interface Doctor {
  name: string;
  specialty: string;
  imageurl: string;
  availabilitynotes?: string;
  description?: string;
  experience?: string;
  bio?: string;
}

export default function DoctorsPage() {
  const { user, openLoginModal } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("Select a Doctor");
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      } catch (err) {}
    }
    fetchDoctors();
  }, []);

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
            <div className="flex animate-marquee hover:pause-marquee shrink-0 gap-16 py-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {doctors.map((doc, idx) => (
              <div key={idx} className="bg-white dark:bg-surface-container-low rounded-[3rem] p-10 flex flex-col md:flex-row gap-10 border border-outline-variant/30 shadow-sm hover:shadow-elevation-2 transition-all group">
                <div className="md:w-56 h-72 rounded-[2.5rem] overflow-hidden flex-shrink-0">
                  <img src={doc.imageurl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={doc.name} />
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline-md text-headline-md font-bold">{doc.name}</h3>
                      <p className="text-primary font-bold font-label-md">{doc.specialty}</p>
                    </div>
                    {doc.experience && (
                      <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                        {doc.experience} EXP
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant font-body-md mb-8 flex-grow leading-relaxed">
                    {doc.description || doc.bio || "Providing expert medical care with a focus on patient well-being and clinical excellence."}
                  </p>
                  <button 
                    onClick={() => {
                      if (!user) {
                        openLoginModal();
                      } else {
                        setSelectedDoctor(doc.name);
                        setIsModalOpen(true);
                      }
                    }}
                    className="mt-auto bg-[#06474e] text-white hover:bg-[#053b41] py-4 px-8 rounded-2xl font-bold font-label-lg transition-all flex items-center justify-center gap-2"
                  >
                    Book Appointment <span className="material-symbols-outlined text-xl">event_available</span>
                  </button>
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
