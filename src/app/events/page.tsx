"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { getApiBaseUrl } from "@/utils/apiConfig";

interface AppEvent {
  id: string;
  title: string;
  date: string;
  details: string;
  images: string[];
}

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden rounded-t-[2rem] group/slider">
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => {
          const fullImgUrl = img.startsWith('http') ? img : `${getApiBaseUrl()}${img}`;
          return (
            <div key={idx} className="w-full h-full flex-shrink-0 relative bg-gray-100">
              <img
                src={fullImgUrl}
                alt={`Event image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>

      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/70 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 z-20 backdrop-blur-xs cursor-pointer"
            aria-label="Previous image"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/70 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 z-20 backdrop-blur-xs cursor-pointer"
            aria-label="Next image"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 shadow-md cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-[#5adace]' : 'w-2.5 bg-white/70 hover:bg-white'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Image Counter Badge */}
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/events`);
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <>
      <Navbar />
      <AnnouncementBar />
      <main className="min-h-screen bg-[#f5f7f7] flex flex-col">
        <section className="bg-[#0a3f41] text-white pt-32 pb-20 px-margin-mobile md:px-margin-desktop relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5adace]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-container-max mx-auto relative z-10 text-center">

          <h1 className="font-headline-lg text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Our Events
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-body-lg leading-relaxed mb-10">
            Stay updated with our latest health check-ups, blood donation camps, and community outreach programs.
          </p>

        </div>
      </section>

      {/* Events Listing */}
      <section className="py-20 px-margin-mobile md:px-margin-desktop bg-[#f5f7f7]">
        <div className="max-w-container-max mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-[#5adace] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#e8ecec]">
              <span className="material-symbols-outlined text-6xl text-[#6b8c8c] mb-4 block">event_busy</span>
              <h2 className="text-2xl font-bold text-[#0a3f41] mb-2">No Upcoming Events</h2>
              <p className="text-[#6b8c8c]">Check back later for new events and community programs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e8ecec] overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col h-full">
                  <ImageSlider images={event.images || []} />
                  
                  <div className="p-8 md:p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[#5adace]">calendar_today</span>
                      <span className="text-sm font-bold text-[#0a3f41]/70 uppercase tracking-widest">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0a3f41] mb-6 leading-tight">
                      {event.title}
                    </h2>
                    
                    <div className="prose prose-lg text-[#6b8c8c] max-w-none flex-1">
                      <p className="whitespace-pre-wrap leading-relaxed">{event.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
    </>
  );
}
