"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, phone: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: (callback?: () => void) => void;
  closeLoginModal: () => void;
  onLoginSuccessCallback: (() => void) | null;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [onLoginSuccessCallback, setOnLoginSuccessCallback] = useState<(() => void) | null>(null);

  // Optional: load from localStorage if we want persistence across reloads
  useEffect(() => {
    const storedUser = localStorage.getItem("ray_medical_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }
  }, []);

  const login = (name: string, phone: string) => {
    const userData = { name, phone };
    setUser(userData);
    localStorage.setItem("ray_medical_user", JSON.stringify(userData));
    
    // Register or update user in backend database
    fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    }).catch(console.error);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ray_medical_user");
  };

  const openLoginModal = (callback?: () => void) => {
    if (callback) {
      setOnLoginSuccessCallback(() => callback);
    } else {
      setOnLoginSuccessCallback(null);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, 
      isLoginModalOpen, openLoginModal, closeLoginModal, onLoginSuccessCallback,
      isProfileModalOpen, openProfileModal, closeProfileModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
