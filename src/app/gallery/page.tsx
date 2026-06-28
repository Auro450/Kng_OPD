"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";

interface GalleryItem {
  id?: string;
  title: string;
  description?: string;
  src: string;
}

export default function GalleryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/gallery");
        const data = await res.json();
        if (Array.isArray(data)) {
          setGalleryItems(data);
        }
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="bg-background text-on-surface py-20 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <header className="mb-16">
            <h1 className="font-headline-xl text-headline-xl md:text-7xl font-bold mb-4">Our Facility</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Explore the environment of Ray's Medical, where state-of-the-art medical technology meets compassionate patient care.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {galleryItems.map((item, idx) => (
              <div key={idx} className="group">
                <div className="aspect-[16/10] rounded-[3rem] overflow-hidden mb-8 border border-outline-variant/30 shadow-sm group-hover:shadow-elevation-2 transition-all">
                  <Image width={800} height={500} src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
                <h3 className="font-headline-md text-headline-md mt-8 ml-4 group-hover:text-primary transition-colors">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* ── Call to Action ── */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-[#0a3f41] text-white text-center relative overflow-hidden mt-12 rounded-[3rem]">
          <div className="absolute inset-0 bg-white/5 opacity-50"></div>
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="font-headline-lg text-headline-lg mb-8">Ready to Experience World-Class Care?</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5adace] text-[#00201d] px-12 py-5 rounded-full font-bold text-xl shadow-elevation-3 hover:scale-105 active:scale-95 transition-all"
            >
              Book Your Visit Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
