import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer id="footer" className="bg-on-background dark:bg-surface-container-lowest text-surface dark:text-on-surface">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-section-padding max-w-container-max mx-auto">
        <div className="space-y-4">
          <div className="text-headline-md font-headline-md font-bold text-surface dark:text-on-surface">
            Ray's Medical
          </div>
          <p className="font-body-md text-body-md text-surface-variant/80 dark:text-on-surface-variant">
            Ray’s Medical brings specialist doctors, diagnostics, pharmacy, allopathy, and Ayurvedic care together under one roof.
            We provide trusted, accessible, and compassionate healthcare for every patient and family.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-surface/10 flex items-center justify-center hover:bg-surface/20 transition-colors">
              <span className="material-symbols-outlined text-surface">public</span>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-surface/10 flex items-center justify-center hover:bg-surface/20 transition-colors">
              <span className="material-symbols-outlined text-surface">mail</span>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-surface/10 flex items-center justify-center hover:bg-surface/20 transition-colors">
              <span className="material-symbols-outlined text-surface">call</span>
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-label-sm text-label-sm text-surface dark:text-primary mb-6 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-3">
            <li><Link href="/privacy-policy" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Terms of Service</Link></li>
            <li><Link href="#" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Emergency Care</Link></li>
            <li><Link href="#" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Career</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-sm text-label-sm text-surface dark:text-primary mb-6 uppercase tracking-wider">Our Services</h4>
          <ul className="space-y-3">
            <li><Link href="/doctors" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Clinic</Link></li>
            <li><Link href="/diagnostic-centre" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Diagnostic Centre</Link></li>
            <li><Link href="#" className="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface transition-opacity font-body-md">Medicine Shop</Link></li>
          </ul>
        </div>
        <div id="contact">
          <h4 className="font-label-sm text-label-sm text-surface dark:text-primary mb-6 uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary-fixed dark:text-primary">location_on</span>
              <span className="font-body-md text-surface-variant/90 dark:text-on-surface-variant">Anantahari Mitra Lane, College, opposite D L Roy, Nediarpara, Krishnanagar, West Bengal 741101</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary-fixed dark:text-primary">phone_in_talk</span>
              <span className="font-body-md text-surface-variant/90 dark:text-on-surface-variant">070030 96439</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary-fixed dark:text-primary">schedule</span>
              <span className="font-body-md text-surface-variant/90 dark:text-on-surface-variant">Mon - Sunday 8 AM - 9 PM</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface/10 py-6 text-center">
        <p className="font-caption text-caption text-surface-variant/80 dark:text-on-surface-variant">© 2024 Ray's Medical Clinic. All rights reserved.</p>
      </div>
    </footer>
  );
}
