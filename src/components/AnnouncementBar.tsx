"use client";

import React, { useState, useEffect } from "react";

export function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState("");
  
  useEffect(() => {
    fetch("http://localhost:5000/api/announcement")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.announcements && data.announcements.length > 0) {
          setAnnouncement(data.announcements[0].text);
        }
      })
      .catch(err => console.error("Failed to load announcement:", err));
  }, []);

  if (!announcement) return null;

  // Create an array of 4 items for each scrolling group
  const items = Array(4).fill(null);

  return (
    <div className="bg-primary text-on-primary py-2.5 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-40">
      <div className="flex animate-marquee">
        <div className="flex shrink-0 items-center gap-12 px-6">
          {items.map((_, i) => (
            <span key={`first-${i}`} className="font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {announcement}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-12 px-6" aria-hidden="true">
          {items.map((_, i) => (
            <span key={`second-${i}`} className="font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">campaign</span>
              {announcement}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
