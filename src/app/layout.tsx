import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ray's Medical - Exceptional Care, Every Time",
  description: "Experience precision-driven medicine and empathetic care at Ray's Medical Clinic. We combine cutting-edge technology with a human-centric approach.",
};

import { AuthProvider } from "@/context/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import { ProfileModal } from "@/components/ProfileModal";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="font-body-md overflow-x-hidden min-h-full flex flex-col">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1029557109231-8v6s63k9bittgpp0qjhdqrp42raa45br.apps.googleusercontent.com"}>
          <AuthProvider>
            {children}
            <LoginModal />
            <ProfileModal />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
