"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";

export default function PrivacyPolicyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="bg-background text-on-surface pb-24 pt-32">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12">
            <h1 className="font-headline-xl text-5xl md:text-6xl font-bold mb-6 text-[#0a3f41]">Privacy Policy</h1>
            <p className="text-on-surface-variant font-body-lg text-lg">Last updated: August 2026</p>
          </div>

          <div className="prose prose-lg prose-headings:text-[#0a3f41] prose-a:text-primary max-w-none text-[#2d4d4b]">
            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                At Ray's Medical, we prioritize your privacy and are committed to protecting your personal and medical information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our website, book appointments, or request home collections for pathology services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect information to provide you with the best possible healthcare services. This includes:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Personal Identification:</strong> Name, age, gender, address, and phone number.</li>
                <li><strong>Medical Information:</strong> Appointment history, pathology test requests, and referral doctor details.</li>
                <li><strong>Account Information:</strong> Login credentials when you create an account with us.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">The information we collect is used strictly for healthcare and administrative purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>To schedule and manage your doctor appointments and diagnostic tests.</li>
                <li>To communicate with you regarding your bookings, test results, and important updates.</li>
                <li>To coordinate with our pathology partner, Metropolis Healthcare, for sample processing.</li>
                <li>To improve our clinic services and website functionality.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">4. Data Security & Sharing</h2>
              <p className="mb-4">
                Your medical data is highly sensitive. We implement robust security measures to prevent unauthorized access. We do not sell your personal data to third parties. We only share necessary information with our trusted partners, such as Metropolis Healthcare, solely for the purpose of processing your requested diagnostic tests.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">5. Your Rights</h2>
              <p className="mb-4">
                You have the right to access, update, or request the deletion of your personal data stored with us. You can manage your information through your account portal or by contacting our administration desk.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">6. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at our clinic in Krishnanagar or contact us via phone or email provided in the footer.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
