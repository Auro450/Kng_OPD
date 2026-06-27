"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";

export default function TermsOfServicePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="bg-background text-on-surface pb-24 pt-32">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-12">
            <h1 className="font-headline-xl text-5xl md:text-6xl font-bold mb-6 text-[#0a3f41]">Terms of Service</h1>
            <p className="text-on-surface-variant font-body-lg text-lg">Last updated: August 2026</p>
          </div>

          <div className="prose prose-lg prose-headings:text-[#0a3f41] prose-a:text-primary max-w-none text-[#2d4d4b]">
            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                By accessing and using the Ray's Medical website, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using our online services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">2. Appointments & Bookings</h2>
              <p className="mb-4">
                Our platform allows you to request doctor appointments and pathology home collections. Please note:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Booking requests are subject to the availability of the doctor or phlebotomist.</li>
                <li>While we strive to adhere strictly to requested time slots, medical emergencies or unforeseen circumstances may cause delays.</li>
                <li>You are responsible for providing accurate contact and medical information when booking.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">3. Pathology Services</h2>
              <p className="mb-4">
                Ray's Medical operates its diagnostic centre in partnership with Metropolis Healthcare. 
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Test results are strictly confidential and will only be shared with the registered patient or authorized representative.</li>
                <li>Turnaround times for reports depend on the nature of the test. While routine tests are processed within 24 hours, specialized tests may take longer.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">4. Cancellations</h2>
              <p className="mb-4">
                If you are unable to attend an appointment or need to cancel a home collection request, we ask that you use the cancellation feature in your account history or contact the clinic at least 4 hours in advance. Repeated no-shows may result in restricted access to online bookings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">5. Medical Disclaimer</h2>
              <p className="mb-4">
                The content provided on this website, including health insights and blog posts, is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider for any medical condition.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold mb-4">6. Changes to Terms</h2>
              <p className="mb-4">
                Ray's Medical reserves the right to modify these Terms of Service at any time. Any changes will be updated on this page, and your continued use of the website signifies your acceptance of the updated terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
