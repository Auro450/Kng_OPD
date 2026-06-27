"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { ORIGINAL_BLOGS } from "@/data/blogs";
import { notFound } from "next/navigation";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { slug } = React.use(params);
  const post = ORIGINAL_BLOGS.find(b => b.slug === slug);
  
  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <AnnouncementBar />
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="bg-background text-on-surface pb-20">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] md:h-[70vh]">
          <Image fill src={post.imageurl} alt={post.title} className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-margin-mobile md:p-margin-desktop">
            <div className="max-w-container-max mx-auto">
              <div className="flex items-center gap-4 mb-4 text-white/90 text-sm font-bold tracking-widest uppercase">
                <span className="bg-primary/90 text-on-primary px-3 py-1 rounded-full">{post.category}</span>
                <span>{post.readtime}</span>
              </div>
              <h1 className="font-headline-xl text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl leading-tight">
                {post.title}
              </h1>
              <p className="text-white/80 font-body-lg max-w-2xl text-lg md:text-xl">
                {post.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop pt-16">
          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-outline-variant/30">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-on-surface">{post.author}</p>
              <p className="text-sm text-on-surface-variant">{post.date}</p>
            </div>
          </div>

          <article 
            className="max-w-none text-on-surface-variant 
              [&>h2]:font-headline-md [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-primary [&>h2]:mt-12 [&>h2]:mb-6 
              [&>h3]:font-headline-sm [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-primary [&>h3]:mt-8 [&>h3]:mb-4 
              [&>p]:font-body-lg [&>p]:text-lg [&>p]:mb-6 [&>p]:leading-relaxed
              [&>ul]:list-disc [&>ul]:pl-8 [&>ul]:mb-8 [&>ul>li]:mb-3 [&>ul>li]:text-lg [&>ul>li>strong]:text-on-surface
              [&_a]:text-primary hover:[&_a]:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-16 pt-8 border-t border-outline-variant/30 flex justify-between items-center">
            <Link href="/blog" className="flex items-center gap-2 text-primary font-bold hover:underline">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Health Insights
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
