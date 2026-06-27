"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onOpenModal: () => void;
}

export function Navbar({ onOpenModal }: NavbarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("");
  const { user, openProfileModal, openLoginModal } = useAuth();
  
  const handleBookAppointment = () => {
    if (!user) {
      openLoginModal();
    } else if (onOpenModal) {
      onOpenModal();
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (pathname === "/doctors") setActiveTab("Doctors");
      else if (pathname === "/blog") setActiveTab("Blog");
      else if (pathname === "/diagnostic-centre") setActiveTab("Diagnostic Centre");
      else if (pathname === "/gallery") setActiveTab("Gallery");
      else if (hash === "#services") setActiveTab("Services");
      else if (hash === "#footer") setActiveTab("Contact");
      else if (hash === "#hero" || (pathname === "/" && !hash)) setActiveTab("About Us");
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
  };

  const getLinkClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return isActive 
      ? "text-[#5adace] font-bold border-b-2 border-[#5adace] pb-1 font-label-sm text-label-sm transition-all"
      : "text-white hover:text-[#5adace] transition-colors font-label-sm text-label-sm";
  };

  return (
    <nav className="bg-[#181c1e] backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <Link href="/" className="text-xl md:text-headline-md font-headline-md font-bold text-white hover:opacity-80 transition-opacity">
          Ray's Medical
        </Link>
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          <Link 
            href="/#services" 
            onClick={() => handleTabClick("Services")}
            className={getLinkClass("Services")}
          >
            Services
          </Link>
          <Link 
            href="/diagnostic-centre" 
            onClick={() => handleTabClick("Diagnostic Centre")}
            className={getLinkClass("Diagnostic Centre")}
          >
            Diagnostic Centre
          </Link>
          <Link 
            href="/doctors" 
            onClick={() => handleTabClick("Doctors")}
            className={getLinkClass("Doctors")}
          >
            Doctors
          </Link>
          <Link 
            href="/blog" 
            onClick={() => handleTabClick("Blog")}
            className={getLinkClass("Blog")}
          >
            Blog
          </Link>
          <Link 
            href="/gallery" 
            onClick={() => handleTabClick("Gallery")}
            className={getLinkClass("Gallery")}
          >
            Gallery
          </Link>
          <Link 
            href="/#footer" 
            onClick={() => handleTabClick("Contact")}
            className={getLinkClass("Contact")}
          >
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={openProfileModal}
              className="hidden sm:inline-flex items-center gap-2 border border-[#5adace] text-[#5adace] px-6 py-2 rounded-full font-label-sm text-label-sm hover:bg-[#5adace]/10 transition-all active:scale-95 duration-150 ease-in-out font-bold"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              {user.name.split(' ')[0]}
            </button>
          )}
          <button
            onClick={handleBookAppointment}
            className="hidden sm:inline-block bg-[#5adace] text-[#00201d] px-6 py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 transition-all active:scale-95 duration-150 ease-in-out font-bold"
          >
            Book Appointment
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[#5adace] transition-colors p-1"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#181c1e] border-t border-white/10 px-margin-mobile py-4 flex flex-col gap-2">
          <Link 
            href="/#services" 
            onClick={() => handleTabClick("Services")}
            className={`py-2 px-3 rounded-lg transition-colors font-body-md ${activeTab === "Services" ? "bg-white/10 text-[#5adace] font-bold" : "text-white hover:bg-white/5"}`}
          >
            Services
          </Link>
          <Link 
            href="/diagnostic-centre" 
            onClick={() => handleTabClick("Diagnostic Centre")}
            className={`py-2 px-3 rounded-lg transition-colors font-body-md ${activeTab === "Diagnostic Centre" ? "bg-white/10 text-[#5adace] font-bold" : "text-white hover:bg-white/5"}`}
          >
            Diagnostic Centre
          </Link>
          <Link 
            href="/doctors" 
            onClick={() => handleTabClick("Doctors")}
            className={`py-2 px-3 rounded-lg transition-colors font-body-md ${activeTab === "Doctors" ? "bg-white/10 text-[#5adace] font-bold" : "text-white hover:bg-white/5"}`}
          >
            Doctors
          </Link>
          <Link 
            href="/blog" 
            onClick={() => handleTabClick("Blog")}
            className={`py-2 px-3 rounded-lg transition-colors font-body-md ${activeTab === "Blog" ? "bg-white/10 text-[#5adace] font-bold" : "text-white hover:bg-white/5"}`}
          >
            Blog
          </Link>
          <Link 
            href="/gallery" 
            onClick={() => handleTabClick("Gallery")}
            className={`py-2 px-3 rounded-lg transition-colors font-body-md ${activeTab === "Gallery" ? "bg-white/10 text-[#5adace] font-bold" : "text-white hover:bg-white/5"}`}
          >
            Gallery
          </Link>
          <Link 
            href="/#footer" 
            onClick={() => handleTabClick("Contact")}
            className={`py-2 px-3 rounded-lg transition-colors font-body-md ${activeTab === "Contact" ? "bg-white/10 text-[#5adace] font-bold" : "text-white hover:bg-white/5"}`}
          >
            Contact
          </Link>
          
          {user && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openProfileModal();
              }}
              className="w-full mt-2 border border-[#5adace] text-[#5adace] py-3 rounded-lg transition-colors font-body-md font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">person</span>
              My Profile
            </button>
          )}

          <button
            onClick={() => {
              handleBookAppointment();
              setIsMobileMenuOpen(false);
            }}
            className="w-full bg-[#5adace] text-[#00201d] px-6 py-3 rounded-full font-label-lg text-label-lg hover:opacity-90 transition-all text-center font-bold"
          >
            Book Appointment
          </button>
        </div>
      )}
    </nav>
  );
}
