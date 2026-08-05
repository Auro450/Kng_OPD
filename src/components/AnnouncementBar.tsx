"use client";

import React, { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/utils/apiConfig";

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/announcement`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements.map((a: any) => a.text));
        } else {
          setAnnouncements([]);
        }
      })
      .catch(err => console.error("Failed to load announcements:", err));
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-primary text-on-primary py-2.5 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-40">
      <div className="flex animate-marquee">
        <div className="flex shrink-0 items-center gap-12 px-6">
          {announcements.map((text, i) => (
            <span key={`first-${i}`} className="font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {text}
            </span>
          ))}
          {/* Repeat if list is short to ensure smooth continuous marquee */}
          {announcements.length < 3 && announcements.map((text, i) => (
            <span key={`first-repeat-${i}`} className="font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {text}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-12 px-6" aria-hidden="true">
          {announcements.map((text, i) => (
            <span key={`second-${i}`} className="font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {text}
            </span>
          ))}
          {announcements.length < 3 && announcements.map((text, i) => (
            <span key={`second-repeat-${i}`} className="font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
