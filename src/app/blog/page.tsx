"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { BlogPost, ORIGINAL_BLOGS } from "@/data/blogs";



export default function BlogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogs, setBlogs] = useState<BlogPost[]>(ORIGINAL_BLOGS);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("http://localhost:5000/api/blog");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setBlogs([...ORIGINAL_BLOGS, ...data]);
      } catch (err) {}
    }
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="bg-background text-on-surface py-20 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <header className="mb-16">
            <h1 className="font-headline-xl text-headline-xl md:text-7xl font-bold mb-4">Health Insights</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Stay updated with the latest medical news, wellness tips, and diagnostic breakthroughs from our expert medical team.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogs.map((post, idx) => (
              <Link href={`/blog/${post.slug || '10-superfoods-to-boost-your-heart-health-today'}`} key={idx} className="group cursor-pointer block">
                <div className="aspect-video rounded-[2.5rem] overflow-hidden mb-6 relative border border-outline-variant/30">
                  <Image fill src={post.imageurl} alt={post.title} className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-primary tracking-wider uppercase">
                    {post.category}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-xs font-bold text-on-surface-variant/70 tracking-widest uppercase">
                  <span>{post.readtime}</span>
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  <span>Insights</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-on-surface-variant font-body-md line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
                <div className="mt-4 text-primary font-bold hover:underline">Read Article</div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
