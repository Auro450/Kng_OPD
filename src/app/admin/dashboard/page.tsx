"use client";

import React, { useState, useEffect } from "react";
import { formatAvailability } from "@/utils/formatAvailability";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"doctors" | "pathology" | "bin" | "customers" | "doctors-manage" | "tests-manage" | "gallery-manage" | "announcements" | "reviews-manage">("doctors");
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [viewingDoctorReviews, setViewingDoctorReviews] = useState<string | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string>("");
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [newDoctorForm, setNewDoctorForm] = useState<{ name: string, specialty: string, description: string, experience: string, image: File | null, availableDays: number[], availableWeeks: number[], dummyRating: string, useDummyRating: boolean }>({ name: "", specialty: "", description: "", experience: "", image: null, availableDays: [], availableWeeks: [], dummyRating: "", useDummyRating: false });
  const [allTests, setAllTests] = useState<any[]>([]);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [newTestForm, setNewTestForm] = useState<{ name: string, code: string }>({ name: "", code: "" });
  const [allGallery, setAllGallery] = useState<any[]>([]);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [newGalleryForm, setNewGalleryForm] = useState<{ title: string, description: string, image: File | null }>({ title: "", description: "", image: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [newDummyReview, setNewDummyReview] = useState({ patientName: "", patientEmail: "", text: "" });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewText, setEditingReviewText] = useState("");

  const getDummyRatingError = (val: string | undefined) => {
    if (!val) return "";
    const num = Number(val);
    if (isNaN(num)) return "Invalid number";
    if (num < 0 || num > 5) return "Value should be between 0 and 5";
    if (val.includes(".")) {
      if (val.split(".")[1].length > 1) return "Value should be upto 1 decimal place";
    }
    return "";
  };

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [filters, setFilters] = useState({
    doctors: { date: "", doctor: "", search: "" },
    pathology: { date: "", search: "" },
    bin: { date: "", search: "" },
    customers: { search: "" },
    "doctors-manage": { search: "" },
    "tests-manage": { search: "" },
    "gallery-manage": { search: "" },
    "announcements": { search: "" },
    "reviews-manage": { search: "" }
  });

  const activeFilters = filters[activeTab];

  const setFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: activeTab === "doctors"
        ? { date: "", doctor: "", search: "" }
        : { date: "", search: "" }
    }));
  };

  const handleTabChange = (tab: "doctors" | "pathology" | "bin" | "customers" | "doctors-manage" | "tests-manage" | "gallery-manage" | "announcements" | "reviews-manage") => {
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchDoctors();
    fetchTests();
    fetchGallery();
    fetchAnnouncements();
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error("Error fetching reviews", e);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcement");
      const data = await res.json();
      if (data.success && data.announcements) setAnnouncements(data.announcements);
    } catch (e) {
      console.error("Error fetching announcements", e);
    }
  };

  const handleSetAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newAnnouncementText })
      });
      if (res.ok) {
        setNewAnnouncementText("");
        fetchAnnouncements();
      }
    } catch (error) {
      console.error("Error setting announcement:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/gallery");
      const data = await res.json();
      if (Array.isArray(data)) setAllGallery(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tests");
      const data = await res.json();
      if (Array.isArray(data)) setAllTests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctors");
      const data = await res.json();
      setAllDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (editingDoctorId) {
        formData.append("id", editingDoctorId);
      }
      formData.append("name", newDoctorForm.name);
      formData.append("specialty", newDoctorForm.specialty);
      formData.append("description", newDoctorForm.description);
      formData.append("experience", newDoctorForm.experience);
      formData.append("availableDays", JSON.stringify(newDoctorForm.availableDays));
      formData.append("availableWeeks", JSON.stringify(newDoctorForm.availableWeeks));
      if (newDoctorForm.image) {
        formData.append("image", newDoctorForm.image);
      }
      formData.append("dummyRating", newDoctorForm.dummyRating);
      formData.append("useDummyRating", newDoctorForm.useDummyRating ? "true" : "false");

      const method = editingDoctorId ? "PATCH" : "POST";
      const res = await fetch("http://localhost:5000/api/doctors", {
        method: method,
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (editingDoctorId) {
          setAllDoctors(allDoctors.map((d: any) => d.id === editingDoctorId ? data.doctor : d));
          alert("Doctor updated successfully!");
        } else {
          setAllDoctors([data.doctor, ...allDoctors]);
          alert("Doctor added successfully!");
        }
        setNewDoctorForm({ name: "", specialty: "", description: "", experience: "", image: null, availableDays: [], availableWeeks: [], dummyRating: "", useDummyRating: false });
        setEditingDoctorId(null);
      } else {
        alert(data.message || `Failed to ${editingDoctorId ? 'update' : 'add'} doctor`);
      }
    } catch (error) {
      alert(`Failed to ${editingDoctorId ? 'update' : 'add'} doctor`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditDoctorClick = (doc: any) => {
    setEditingDoctorId(doc.id);
    setNewDoctorForm({
      name: doc.name,
      specialty: doc.specialty,
      description: doc.description || "",
      experience: doc.experience || "",
      image: null,
      availableDays: doc.availableDays || [],
      availableWeeks: doc.availableWeeks || [],
      dummyRating: doc.dummyRating || "",
      useDummyRating: doc.useDummyRating || false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateDummyRating = async (docId: string, dummyRating: string, useDummyRating: boolean) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("id", docId);
      formData.append("dummyRating", dummyRating);
      formData.append("useDummyRating", useDummyRating ? "true" : "false");

      const res = await fetch("http://localhost:5000/api/doctors", {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAllDoctors(allDoctors.map((d: any) => d.id === docId ? data.doctor : d));
        alert("Dummy rating saved successfully .");
      } else {
        alert("Failed to update dummy rating.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating dummy rating");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddDummyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingDoctorReviews) return;
    setIsUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: "DUMMY-" + Date.now() + Math.floor(Math.random() * 1000),
          doctorName: viewingDoctorReviews,
          patientName: newDummyReview.patientName,
          patientEmail: newDummyReview.patientEmail || "dummy@example.com",
          rating: 0,
          text: newDummyReview.text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setNewDummyReview({ patientName: "", patientEmail: "", text: "" });
        alert("Dummy review added successfully!");
      } else {
        alert(data.message || "Failed to add dummy review");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding dummy review");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) setReviews(reviews.filter(r => r.id !== id));
      else alert("Failed to delete review");
    } catch (e) {
      alert("Error deleting review");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFeatureReview = async (id: string, featured: boolean) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r.id === id ? data.review : r));
      } else {
        alert("Failed to feature review");
      }
    } catch (e) {
      alert("Error featuring review");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateReviewText = async (id: string, newText: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text: newText })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r.id === id ? data.review : r));
        setEditingReviewId(null);
      } else {
        alert("Failed to update review text");
      }
    } catch (e) {
      alert("Error updating review text");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const url = "http://localhost:5000/api/tests";
      const method = editingTestId ? "PATCH" : "POST";
      const bodyData = editingTestId ? { id: editingTestId, ...newTestForm } : newTestForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      if (data.success) {
        alert(editingTestId ? "Test updated!" : "Test added!");
        setNewTestForm({ name: "", code: "" });
        setEditingTestId(null);
        fetchTests();
      } else {
        alert(data.message || "Failed to save test");
      }
    } catch (e) {
      alert("Error saving test");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tests?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchTests();
      } else {
        alert(data.message || "Failed to delete test");
      }
    } catch (e) {
      alert("Error deleting test");
    }
  };

  const handleEditTestClick = (test: any) => {
    setEditingTestId(test.id);
    setNewTestForm({ name: test.name || "", code: test.code || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", newGalleryForm.title);
      formData.append("description", newGalleryForm.description);
      if (newGalleryForm.image) {
        formData.append("image", newGalleryForm.image);
      }

      if (editingGalleryId) {
        formData.append("id", editingGalleryId);
      }

      const res = await fetch("http://localhost:5000/api/gallery", {
        method: editingGalleryId ? "PATCH" : "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        alert(editingGalleryId ? "Gallery item updated!" : "Gallery item added!");
        setNewGalleryForm({ title: "", description: "", image: null });
        setEditingGalleryId(null);
        // Reset file input
        const fileInput = document.getElementById('gallery-photo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchGallery();
      } else {
        alert(data.message || "Failed to save gallery item");
      }
    } catch (e) {
      alert("Error saving gallery item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/gallery?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
      } else {
        alert(data.message || "Failed to delete gallery item");
      }
    } catch (e) {
      alert("Error deleting gallery item");
    }
  };

  const handleEditGalleryClick = (item: any) => {
    setEditingGalleryId(item.id);
    setNewGalleryForm({
      title: item.title || "",
      description: item.description || "",
      image: null
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/doctors?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAllDoctors(allDoctors.filter((d: any) => d.id !== id));
      }
    } catch (error) {
      alert("Failed to delete doctor");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDate = async (id: string) => {
    if (!editingDate) return;
    setIsUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newDate: editingDate }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, date: editingDate } : b));
        setEditingBookingId(null);
      } else {
        alert(data.message || "Failed to update date");
      }
    } catch (error) {
      console.error("Error updating date:", error);
      alert("Error updating date");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.filter(b => b.id !== id));
      } else {
        alert(data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteBooking = async (id: string) => {
    if (!window.confirm("Mark this booking as Completed? The user will no longer be able to cancel it.")) return;

    setIsUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Completed" }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: "Completed" } : b));
      } else {
        alert(data.message || "Failed to complete booking");
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("Error completing booking");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRestoreBooking = async (id: string) => {
    if (!window.confirm("Restore this deleted booking?")) return;

    setIsUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Scheduled" }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: "Scheduled" } : b));
      } else {
        alert(data.message || "Failed to restore booking");
      }
    } catch (error) {
      console.error("Error restoring booking:", error);
      alert("Error restoring booking");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpload = async (id: string, type: 'bill' | 'report', file: File | null) => {
    if (!file) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.append("id", id);
    formData.append("type", type);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/admin/bookings/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, [type === 'bill' ? 'billUrl' : 'reportUrl']: data.fileUrl } : b));
        alert(`${type === 'bill' ? 'Bill' : 'Report'} uploaded successfully!`);
      } else {
        alert(data.message || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    } finally {
      setIsUpdating(false);
    }
  };

  // Split bookings by type and apply filters
  // Split bookings by type and apply independent filters
  const doctorAppointments = bookings.filter(b => b.doctor && b.reason && b.status !== "Deleted").filter(b => {
    if (filters.doctors.date && b.date !== filters.doctors.date) return false;
    if (filters.doctors.doctor && b.doctor !== filters.doctors.doctor) return false;
    if (filters.doctors.search) {
      const s = filters.doctors.search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchPhone = b.phone?.toLowerCase().includes(s);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const homeCollections = bookings.filter(b => (b.address || b.tests) && b.status !== "Deleted").filter(b => {
    if (filters.pathology.date && b.date !== filters.pathology.date) return false;
    if (filters.pathology.search) {
      const s = filters.pathology.search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchPhone = b.phone?.toLowerCase().includes(s);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const binBookings = bookings.filter(b => b.status === "Deleted").filter(b => {
    if (filters.bin.date && b.date !== filters.bin.date) return false;
    if (filters.bin.search) {
      const s = filters.bin.search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchPhone = b.phone?.toLowerCase().includes(s);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const getDoctorAverageRating = (doctorName: string) => {
    const docReviews = reviews.filter(r => r.doctorName === doctorName && r.rating > 0);
    if (docReviews.length === 0) return null;
    const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length;
    return avg.toFixed(1);
  };


  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      <div className="bg-[#0a3f41] text-white p-6 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#5adace] text-3xl">admin_panel_settings</span>
          <h1 className="text-2xl font-bold font-headline-sm">Ray's Medical Admin</h1>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
          <button
            onClick={() => window.location.href = "/admin"}
            className="px-4 py-2 bg-[#5adace] text-[#0a3f41] hover:bg-white rounded-lg text-sm font-bold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {viewingDoctorReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[80vh] flex flex-col">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold text-[#0a3f41] flex items-center">
                 Reviews for {viewingDoctorReviews}
                 {getDoctorAverageRating(viewingDoctorReviews) && (
                   <span className="ml-3 flex items-center text-orange-500 text-lg font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                     {getDoctorAverageRating(viewingDoctorReviews)} <span className="material-symbols-outlined text-[18px] ml-1">star</span>
                   </span>
                 )}
               </h2>
               <button onClick={() => setViewingDoctorReviews(null)} className="text-[#6b8c8c] hover:text-[#0a3f41]">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             
             {(() => {
               const doc = viewingDoctorReviews ? allDoctors.find(d => d.name === viewingDoctorReviews) : null;
               if (!doc) return null;
               const errorMsg = getDummyRatingError(doc.dummyRating);
               return (
                 <div className="bg-[#f5f7f7] p-4 rounded-xl mb-6 flex flex-col border border-[#e8ecec]">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <label className="text-sm font-bold text-[#0a3f41]">Dummy Rating:</label>
                       <input 
                         type="number" step="0.1" 
                         value={doc.dummyRating || ""}
                         onChange={(e) => {
                           const val = e.target.value;
                           setAllDoctors(allDoctors.map(d => d.id === doc.id ? {...d, dummyRating: val} : d));
                         }}
                         className="w-24 p-2 bg-white rounded-lg border border-[#e8ecec] outline-none focus:ring-2 focus:ring-[#5adace]/50 text-sm font-bold text-[#0a3f41]"
                       />
                       <label className="flex items-center gap-2 text-sm font-bold text-[#0a3f41] cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={doc.useDummyRating || false}
                           onChange={(e) => {
                             const checked = e.target.checked;
                             setAllDoctors(allDoctors.map(d => d.id === doc.id ? {...d, useDummyRating: checked} : d));
                           }}
                           className="text-[#5adace] rounded w-4 h-4 cursor-pointer" 
                         />
                         Use Dummy
                       </label>
                     </div>
                     <button 
                       disabled={isUpdating || !!errorMsg}
                       onClick={() => handleUpdateDummyRating(doc.id, doc.dummyRating || "", doc.useDummyRating || false)}
                       className="bg-[#0a3f41] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#5adace] hover:text-[#0a3f41] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Save
                     </button>
                   </div>
                   {errorMsg && <p className="text-red-500 text-xs font-bold mt-2 md:ml-28">{errorMsg}</p>}
                 </div>
               );
             })()}

             <form onSubmit={handleAddDummyReview} className="bg-white p-4 rounded-xl mb-6 border border-[#e8ecec] shadow-sm space-y-3">
               <h4 className="font-bold text-[#0a3f41] text-sm">Add Dummy Review</h4>
               <div className="flex gap-2">
                 <input required placeholder="Patient Name (e.g. John Doe)" value={newDummyReview.patientName} onChange={e => setNewDummyReview({...newDummyReview, patientName: e.target.value})} className="flex-1 p-2 bg-[#f5f7f7] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#5adace]/50 text-sm font-medium text-[#0a3f41]" />
                 <input placeholder="Email (optional)" value={newDummyReview.patientEmail} onChange={e => setNewDummyReview({...newDummyReview, patientEmail: e.target.value})} className="flex-1 p-2 bg-[#f5f7f7] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#5adace]/50 text-sm font-medium text-[#0a3f41]" />
               </div>
               <div className="flex gap-2">
                 <input required placeholder="Review text" value={newDummyReview.text} onChange={e => setNewDummyReview({...newDummyReview, text: e.target.value})} className="flex-[3] p-2 bg-[#f5f7f7] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#5adace]/50 text-sm font-medium text-[#0a3f41]" />
                 <button disabled={isUpdating} type="submit" className="flex-1 bg-[#5adace] text-[#0a3f41] px-4 py-2 rounded-lg font-bold hover:bg-[#0a3f41] hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">Add Review</button>
               </div>
             </form>

             <div className="flex-1 overflow-y-auto space-y-4 pr-2">
               {reviews.filter(r => r.doctorName === viewingDoctorReviews).length === 0 ? (
                 <p className="text-center text-[#6b8c8c] italic py-8">No reviews found for this doctor.</p>
               ) : (
                 reviews.filter(r => r.doctorName === viewingDoctorReviews).map(review => (
                   <div key={review.id} className="p-4 bg-[#f5f7f7] rounded-xl border border-[#e8ecec]">
                     <div className="flex justify-between items-start mb-2">
                       <div className="font-bold text-[#0a3f41] text-sm">{review.patientName} <span className="text-xs font-normal text-[#6b8c8c]">({review.patientEmail})</span></div>
                       <div className="flex gap-3 items-center">
                         {review.rating > 0 && (
                           <div className="flex text-orange-400">
                             {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[16px]">{s <= review.rating ? "star" : ""}</span>)}
                           </div>
                         )}
                         <button disabled={isUpdating} onClick={() => handleToggleFeatureReview(review.id, !review.featured)} className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-colors ${review.featured ? 'bg-[#5adace] text-[#0a3f41]' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
                           {review.featured ? 'Featured' : 'Feature'}
                         </button>
                         <button disabled={isUpdating} onClick={() => { setEditingReviewId(review.id); setEditingReviewText(review.text); }} className="text-[#6b8c8c] hover:text-[#5adace] transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                         <button disabled={isUpdating} onClick={() => handleDeleteReview(review.id)} className="text-[#6b8c8c] hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                       </div>
                     </div>
                     {editingReviewId === review.id ? (
                       <div className="mt-2 flex gap-2">
                         <input value={editingReviewText} onChange={e => setEditingReviewText(e.target.value)} className="flex-1 p-2 border border-[#e8ecec] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                         <button disabled={isUpdating} onClick={() => handleUpdateReviewText(review.id, editingReviewText)} className="bg-[#5adace] text-[#0a3f41] px-3 py-1 rounded-lg text-sm font-bold">Save</button>
                         <button disabled={isUpdating} onClick={() => setEditingReviewId(null)} className="text-[#6b8c8c] text-sm hover:underline">Cancel</button>
                       </div>
                     ) : (
                       review.text && <p className="text-sm text-[#0a3f41]/80 mt-2">{review.text}</p>
                     )}
                     <div className="text-[10px] text-[#6b8c8c] mt-3 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0a3f41] mb-2 font-headline-md">Dashboard</h2>
          <p className="text-[#6b8c8c]">Manage incoming patient requests and bookings.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-[#0a3f41]/5 w-fit">
          <button
            onClick={() => handleTabChange("doctors")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "doctors" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">stethoscope</span>
            Doctor Appointments
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "doctors" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{doctorAppointments.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("pathology")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "pathology" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">home_health</span>
            Home Collection
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "pathology" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{homeCollections.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("customers")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "customers" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">group</span>
            Customer Details
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "customers" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{users.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("doctors-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "doctors-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">medical_services</span>
            Doctors
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "doctors-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{allDoctors.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("tests-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "tests-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">science</span>
            Pathology Tests
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "tests-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{allTests.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("gallery-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "gallery-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">collections_bookmark</span>
            Gallery
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "gallery-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{allGallery.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("reviews-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "reviews-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">reviews</span>
            Reviews
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "reviews-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{reviews.filter(r => r.type === "Pathology").length}</span>
          </button>
          <button
            onClick={() => handleTabChange("announcements")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "announcements" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">campaign</span>
            Announcements
          </button>
          <button
            onClick={() => handleTabChange("bin")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "bin" ? "bg-red-500 text-white shadow-md" : "text-[#6b8c8c] hover:bg-red-50"}`}
          >
            <span className="material-symbols-outlined text-xl">delete</span>
            Recycle Bin
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "bin" ? "bg-white/20" : "bg-red-100 text-red-500"}`}>{binBookings.length}</span>
          </button>
        </div>

        {/* Filters Section */}
        {activeTab !== "doctors-manage" && activeTab !== "tests-manage" && activeTab !== "announcements" && (
          <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-[#0a3f41]/5 items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#6b8c8c]">filter_list</span>
              <span className="font-bold text-[#0a3f41] text-sm tracking-widest uppercase">Filters:</span>
            </div>

            <div className="flex items-center gap-2 bg-[#f5f7f7] px-4 py-2 rounded-xl border-none focus-within:ring-2 focus-within:ring-[#5adace]/50 transition-all">
              <span className="material-symbols-outlined text-[#6b8c8c] text-sm">search</span>
              <input
                type="text"
                placeholder="Search Name or Phone"
                value={activeFilters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                className="bg-transparent border-none text-[#0a3f41] font-medium outline-none placeholder:text-[#6b8c8c] text-sm w-44"
              />
              {activeFilters.search && (
                <button onClick={() => setFilter("search", "")} className="text-[#6b8c8c] hover:text-red-500 transition-colors ml-1"><span className="material-symbols-outlined text-sm">close</span></button>
              )}
            </div>

            {activeTab !== "customers" && (
              <div className="flex items-center gap-2 bg-[#f5f7f7] px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-[#5adace]/50 transition-all">
                <label className="text-xs font-bold text-[#6b8c8c] uppercase tracking-widest">Date:</label>
                <input
                  type={(activeFilters as any).date ? "date" : "text"}
                  placeholder="Select Date"
                  onFocus={(e) => e.target.type = "date"}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                  value={(activeFilters as any).date || ""}
                  onChange={(e) => setFilter("date", e.target.value)}
                  className="bg-transparent border-none text-[#0a3f41] font-medium outline-none cursor-pointer placeholder:text-[#6b8c8c] text-sm"
                />
                {(activeFilters as any).date && (
                  <button onClick={() => setFilter("date", "")} className="text-[#6b8c8c] hover:text-red-500 transition-colors ml-2"><span className="material-symbols-outlined text-sm">close</span></button>
                )}
              </div>
            )}

            {activeTab === "doctors" && (
              <div className="flex items-center gap-2 bg-[#f5f7f7] px-4 py-2 rounded-xl">
                <label className="text-xs font-bold text-[#6b8c8c] uppercase tracking-widest">Doctor:</label>
                <select
                  value={(activeFilters as any).doctor || ""}
                  onChange={(e) => setFilter("doctor", e.target.value)}
                  className="bg-transparent border-none text-[#0a3f41] font-medium outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="">All Doctors</option>
                  {allDoctors.map((doc: any, i: number) => (
                    <option key={i} value={doc.name}>{doc.name}</option>
                  ))}
                </select>
              </div>
            )}

            {((activeFilters as any).date || (activeFilters as any).doctor || activeFilters.search) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#5adace] hover:text-[#0a3f41] transition-colors ml-auto underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-md border border-[#0a3f41]/5">
            <span className="material-symbols-outlined text-[#5adace] text-5xl animate-spin mb-4">progress_activity</span>
            <p className="text-[#6b8c8c] font-medium text-lg">Loading data...</p>
          </div>
        ) : activeTab === "doctors-manage" ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#0a3f41]/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#0a3f41] text-lg">{editingDoctorId ? "Edit Doctor" : "Add New Doctor"}</h3>
                {editingDoctorId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDoctorId(null);
                      setNewDoctorForm({ name: "", specialty: "", description: "", experience: "", image: null, availableDays: [], availableWeeks: [], dummyRating: "", useDummyRating: false });
                    }}
                    className="text-xs font-bold text-[#6b8c8c] hover:text-[#0a3f41] transition-colors underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Doctor Name (e.g. Dr. John Doe)" value={newDoctorForm.name} onChange={e => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })} className="p-3 rounded-xl bg-[#f5f7f7] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                <input required placeholder="Specialty / Degree" value={newDoctorForm.specialty} onChange={e => setNewDoctorForm({ ...newDoctorForm, specialty: e.target.value })} className="p-3 rounded-xl bg-[#f5f7f7] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                <input placeholder="Experience (e.g. 10+ Years)" value={newDoctorForm.experience} onChange={e => setNewDoctorForm({ ...newDoctorForm, experience: e.target.value })} className="p-3 rounded-xl bg-[#f5f7f7] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                <div className="flex flex-col">
                  <div className="flex gap-4 p-3 rounded-xl bg-[#f5f7f7] items-center">
                    <input type="number" step="0.1" placeholder="Dummy Rating (e.g. 4.5)" value={newDoctorForm.dummyRating} onChange={e => {
                      setNewDoctorForm({ ...newDoctorForm, dummyRating: e.target.value });
                    }} className="bg-transparent border-none text-[#0a3f41] outline-none flex-1" />
                    <label className="flex items-center gap-2 text-sm font-bold text-[#0a3f41] cursor-pointer">
                      <input type="checkbox" checked={newDoctorForm.useDummyRating} onChange={e => setNewDoctorForm({ ...newDoctorForm, useDummyRating: e.target.checked })} className="text-[#5adace] rounded w-4 h-4 cursor-pointer" />
                      Use Dummy
                    </label>
                  </div>
                  {getDummyRatingError(newDoctorForm.dummyRating) && <p className="text-red-500 text-xs font-bold mt-1 ml-3">{getDummyRatingError(newDoctorForm.dummyRating)}</p>}
                </div>
                <div className="md:col-span-2 bg-[#f5f7f7] p-4 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0a3f41] mb-2 flex justify-between">
                      <span>Available Days</span>
                      <button type="button" onClick={() => setNewDoctorForm(prev => ({ ...prev, availableDays: (prev.availableDays || []).length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6] }))} className="text-[#5adace] hover:underline">Select All</button>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, idx) => (
                        <label key={day} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#e8ecec] cursor-pointer hover:border-[#5adace] transition-colors">
                          <input type="checkbox" checked={(newDoctorForm.availableDays || []).includes(idx)} onChange={(e) => {
                            const currentDays = newDoctorForm.availableDays || [];
                            const nextDays = e.target.checked ? [...currentDays, idx] : currentDays.filter(d => d !== idx);
                            setNewDoctorForm({ ...newDoctorForm, availableDays: nextDays });
                          }} className="text-[#5adace] rounded w-4 h-4 cursor-pointer" />
                          <span className="text-sm font-medium text-[#0a3f41]">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0a3f41] mb-2 flex justify-between">
                      <span>Available Weeks of Month</span>
                      <button type="button" onClick={() => setNewDoctorForm(prev => ({ ...prev, availableWeeks: (prev.availableWeeks || []).length === 5 ? [] : [1, 2, 3, 4, 5] }))} className="text-[#5adace] hover:underline">Select All</button>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(week => (
                        <label key={week} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#e8ecec] cursor-pointer hover:border-[#5adace] transition-colors">
                          <input type="checkbox" checked={(newDoctorForm.availableWeeks || []).includes(week)} onChange={(e) => {
                            const currentWeeks = newDoctorForm.availableWeeks || [];
                            const nextWeeks = e.target.checked ? [...currentWeeks, week] : currentWeeks.filter(w => w !== week);
                            setNewDoctorForm({ ...newDoctorForm, availableWeeks: nextWeeks });
                          }} className="text-[#5adace] rounded w-4 h-4 cursor-pointer" />
                          <span className="text-sm font-medium text-[#0a3f41]">Week {week}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-[#6b8c8c] mt-2 font-medium">Leave options unselected if the doctor is available any day or week.</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#6b8c8c] uppercase tracking-widest ml-1 mb-2 block">Upload Doctor Photo</label>
                  <div className="flex items-center gap-4">
                    <input
                      id="doctor-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={e => setNewDoctorForm({ ...newDoctorForm, image: e.target.files ? e.target.files[0] : null })}
                      className="w-full p-2 rounded-xl bg-[#f5f7f7] text-[#0a3f41] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0a3f41]/10 file:text-[#0a3f41] hover:file:bg-[#0a3f41]/20 cursor-pointer"
                    />
                    {newDoctorForm.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewDoctorForm({ ...newDoctorForm, image: null });
                          const fileInput = document.getElementById('doctor-photo-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex-shrink-0"
                        title="Remove selected image"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <button disabled={isUpdating || !!getDummyRatingError(newDoctorForm.dummyRating)} type="submit" className="md:col-span-2 p-3 bg-[#0a3f41] text-white rounded-xl font-bold hover:bg-[#5adace] hover:text-[#0a3f41] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingDoctorId ? "Update Doctor" : "Add Doctor"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Doctor</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Specialty</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Availability</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDoctors.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-[#6b8c8c] italic">No doctors registered yet.</td></tr>
                    ) : (
                      allDoctors.map((doc: any) => (
                        <tr key={doc.id} className="border-b border-[#e8ecec] hover:bg-[#f5f7f7]/50 transition-colors">
                          <td className="p-5 font-bold text-[#0a3f41]">
                            <button 
                              onClick={() => setViewingDoctorReviews(doc.name)} 
                              className="hover:text-[#5adace] hover:underline transition-colors text-left flex items-center gap-2"
                              title="View Reviews"
                            >
                              {doc.name}
                              {getDoctorAverageRating(doc.name) && (
                                <span className="flex items-center text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 no-underline">
                                  {getDoctorAverageRating(doc.name)} <span className="material-symbols-outlined text-[12px] ml-0.5">star</span>
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="p-5 text-[#6b8c8c] text-sm">{doc.specialty}</td>
                          <td className="p-5 text-[#6b8c8c] text-sm">{formatAvailability(doc)}</td>
                          <td className="p-5">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditDoctorClick(doc)} disabled={isUpdating} className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors inline-flex">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(doc.id)} disabled={isUpdating} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors inline-flex">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "tests-manage" ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 bg-[#f5f7f7] px-4 py-2 rounded-xl mb-4 max-w-sm">
              <span className="material-symbols-outlined text-[#6b8c8c] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search tests by name or code..."
                value={(activeFilters as any).search || ""}
                onChange={(e) => setFilter("search", e.target.value)}
                className="bg-transparent border-none text-[#0a3f41] text-sm w-full outline-none placeholder:text-[#6b8c8c]"
              />
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#0a3f41]/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#0a3f41] text-lg">{editingTestId ? "Edit Pathology Test" : "Add New Pathology Test"}</h3>
                {editingTestId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTestId(null);
                      setNewTestForm({ name: "", code: "" });
                    }}
                    className="text-xs font-bold text-[#6b8c8c] hover:text-[#0a3f41] transition-colors underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleAddTest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Test Name (e.g. Complete Blood Count)" value={newTestForm.name} onChange={e => setNewTestForm({ ...newTestForm, name: e.target.value })} className="p-3 rounded-xl bg-[#f5f7f7] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                <input required placeholder="Test Code (e.g. T0123)" value={newTestForm.code} onChange={e => setNewTestForm({ ...newTestForm, code: e.target.value })} className="p-3 rounded-xl bg-[#f5f7f7] border-none text-[#0a3f41] outline-none focus:ring-2 focus:ring-[#5adace]/50 uppercase" />
                <button disabled={isUpdating} type="submit" className="md:col-span-2 p-3 bg-[#0a3f41] text-white rounded-xl font-bold hover:bg-[#5adace] hover:text-[#0a3f41] transition-colors">
                  {editingTestId ? "Update Test" : "Add Test"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                      <th className="p-5 font-bold text-xs uppercase tracking-widest w-1/4">Code</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Test Name</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTests.length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-[#6b8c8c] italic">No tests registered yet.</td></tr>
                    ) : (
                      allTests
                        .filter(t => {
                          const s = filters["tests-manage"].search.toLowerCase();
                          return !s || t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
                        })
                        .map((test: any) => (
                          <tr key={test.id} className="border-b border-[#e8ecec] hover:bg-[#f5f7f7]/50 transition-colors">
                            <td className="p-5 font-bold text-[#0a3f41] font-mono text-sm">{test.code}</td>
                            <td className="p-5 text-[#6b8c8c] font-medium">{test.name}</td>
                            <td className="p-5">
                              <div className="flex gap-2">
                                <button onClick={() => handleEditTestClick(test)} disabled={isUpdating} className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors inline-flex">
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button onClick={() => handleDeleteTest(test.id)} disabled={isUpdating} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors inline-flex">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "gallery-manage" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 p-8 self-start">
              <h2 className="font-headline-sm text-headline-sm text-[#0a3f41] font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5adace]">
                  {editingGalleryId ? "edit" : "add_photo_alternate"}
                </span>
                {editingGalleryId ? "Edit Gallery Item" : "Add New Gallery Item"}
              </h2>
              <form onSubmit={handleAddGallery} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={newGalleryForm.title}
                    onChange={(e) => setNewGalleryForm({ ...newGalleryForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace] transition-all"
                    placeholder="e.g. Clinic Interior"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={newGalleryForm.description}
                    onChange={(e) => setNewGalleryForm({ ...newGalleryForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace] transition-all"
                    placeholder="A brief description of this image"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Image {editingGalleryId && "(Leave empty to keep existing)"}</label>
                  <input
                    type="file"
                    id="gallery-photo-upload"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewGalleryForm({ ...newGalleryForm, image: e.target.files[0] });
                      }
                    }}
                    required={!editingGalleryId}
                    className="w-full px-4 py-3 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#0a3f41]/10 file:text-[#0a3f41] hover:file:bg-[#0a3f41]/20"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-[#0a3f41] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0a3f41]/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : (editingGalleryId ? "Save Changes" : "Add Image")}
                  </button>
                  {editingGalleryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGalleryId(null);
                        setNewGalleryForm({ title: "", description: "", image: null });
                        const fileInput = document.getElementById('gallery-photo-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                      <th className="p-5 font-bold uppercase tracking-widest text-xs">Image</th>
                      <th className="p-5 font-bold uppercase tracking-widest text-xs">Title & Description</th>
                      <th className="p-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8ecec]">
                    {allGallery
                      .filter(item =>
                        item.title.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(activeFilters.search.toLowerCase()))
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-[#f5f7f7]/50 transition-colors group">
                          <td className="p-5">
                            <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm border border-black/5">
                              {/* Using standard img to avoid next/image domain config issues dynamically */}
                              <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-[#0a3f41]">{item.title}</div>
                            {item.description && <div className="text-sm text-[#6b8c8c] mt-1 max-w-sm">{item.description}</div>}
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditGalleryClick(item)} disabled={isUpdating} className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors inline-flex">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button onClick={() => handleDeleteGallery(item.id)} disabled={isUpdating} className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors inline-flex">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {allGallery.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-[#6b8c8c]">
                          No gallery items found. Add your first image to the gallery.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "announcements" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 p-8 self-start">
              <h2 className="font-headline-sm text-headline-sm text-[#0a3f41] font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5adace]">
                  add_alert
                </span>
                Set New Announcement
              </h2>
              <form onSubmit={handleSetAnnouncement} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Announcement Text</label>
                  <textarea
                    rows={4}
                    required
                    value={newAnnouncementText}
                    onChange={(e) => setNewAnnouncementText(e.target.value)}
                    className="w-full px-4 py-3 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace] transition-all"
                    placeholder="Enter the announcement here..."
                  ></textarea>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-[#0a3f41] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0a3f41]/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? "Setting..." : "Set Announcement"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                      <th className="p-5 font-bold uppercase tracking-widest text-xs w-2/3">Announcement Text</th>
                      <th className="p-5 font-bold uppercase tracking-widest text-xs">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8ecec]">
                    {announcements.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f5f7f7]/50 transition-colors group cursor-pointer" onClick={() => setNewAnnouncementText(item.text)}>
                        <td className="p-5">
                          <div className="font-bold text-[#0a3f41]">{item.text}</div>
                        </td>
                        <td className="p-5 text-sm text-[#6b8c8c]">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {announcements.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-8 text-center text-[#6b8c8c]">
                          No historical announcements found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "customers" ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Customer Name</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Joined Date</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Total Bookings</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Last Login</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ecec]">
                  {users
                    .filter(u => {
                      if (filters.customers.search) {
                        const s = filters.customers.search.toLowerCase();
                        return u.name?.toLowerCase().includes(s) || u.phone?.toLowerCase().includes(s);
                      }
                      return true;
                    })
                    .map(user => {
                      const userBookings = bookings.filter(b => b.phone === user.phone && b.status !== "Deleted");
                      const isExpanded = expandedUserId === user.id;
                      return (
                        <React.Fragment key={user.id}>
                          <tr className="hover:bg-[#f5f7f7]/50 transition-colors">
                            <td className="p-5">
                              <p className="font-bold text-[#0a3f41] text-base mb-1">{user.name}</p>
                              <div className="flex items-center gap-3 text-sm text-[#6b8c8c]">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {user.phone}</span>
                              </div>
                            </td>
                            <td className="p-5 font-medium text-[#0a3f41]">
                              {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-5">
                              <span className="inline-block px-3 py-1 bg-[#5adace]/10 text-[#0a3f41] rounded-lg font-bold text-sm">
                                {userBookings.length} Bookings
                              </span>
                            </td>
                            <td className="p-5 font-medium text-[#6b8c8c] text-sm">
                              {new Date(user.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-5 text-right">
                              <button
                                onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                                className="px-4 py-2 bg-white border border-[#e8ecec] text-[#0a3f41] hover:bg-[#f5f7f7] rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-2"
                              >
                                {isExpanded ? "Hide History" : "View History"}
                                <span className="material-symbols-outlined text-[18px]">
                                  {isExpanded ? "expand_less" : "expand_more"}
                                </span>
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="p-0 bg-[#f9fafa]">
                                <div className="p-6">
                                  <h4 className="font-bold text-[#0a3f41] mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#5adace]">history</span>
                                    Booking History for {user.name}
                                  </h4>
                                  {userBookings.length === 0 ? (
                                    <p className="text-[#6b8c8c] text-sm italic">No bookings found for this customer.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {userBookings.map(b => (
                                        <div key={b.id} className="bg-white border border-[#e8ecec] p-4 rounded-xl shadow-sm">
                                          <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-[#0a3f41]">
                                              {b.bookingNumber || b.id?.split('-')[0]}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                              {b.status || 'Scheduled'}
                                            </span>
                                          </div>
                                          <p className="font-bold text-[#0a3f41] text-sm mb-1">{b.type || "Appointment"}</p>
                                          <p className="text-xs text-[#6b8c8c] mb-2 flex flex-col gap-1">
                                            <span className="flex items-center gap-1">
                                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                              {b.date ? new Date(b.date).toLocaleDateString() : 'Not Set'}
                                            </span>
                                            <span className="flex items-center gap-1 mt-1">
                                              <span className="material-symbols-outlined text-[14px]">person</span>
                                              {b.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <span className="material-symbols-outlined text-[14px]">call</span>
                                              {b.phone}
                                            </span>
                                          </p>
                                          {(b.doctor || b.reason) && (
                                            <div className="text-xs text-[#0a3f41] bg-gray-50 p-2 rounded mt-2">
                                              {b.doctor && <p><span className="text-[#6b8c8c]">Doctor:</span> {b.doctor}</p>}
                                              {b.reason && <p className="truncate"><span className="text-[#6b8c8c]">Reason:</span> {b.reason}</p>}
                                            </div>
                                          )}
                                          {(b.selectedTests || (b.tests && b.tests.length > 0)) && (
                                            <div className="text-xs text-[#0a3f41] bg-gray-50 p-2 rounded mt-2">
                                              <span className="text-[#6b8c8c] block mb-1">Selected Tests:</span>
                                              <div className="flex flex-wrap gap-1">
                                                {b.selectedTests
                                                  ? b.selectedTests.split(',').map((test: string, i: number) => (
                                                    <span key={i} className="bg-white border border-[#e8ecec] px-2 py-1 rounded text-[10px] whitespace-nowrap">{test.trim()}</span>
                                                  ))
                                                  : b.tests.map((t: any, i: number) => (
                                                    <span key={i} className="bg-white border border-[#e8ecec] px-2 py-1 rounded text-[10px] whitespace-nowrap">{t.name}</span>
                                                  ))
                                                }
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "reviews-manage" ? (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#0a3f41]/5">
             <h3 className="font-bold text-[#0a3f41] text-lg mb-4">Manage Pathology Reviews</h3>
             <div className="space-y-4">
                {reviews.filter(r => r.type === "Pathology").length === 0 ? (
                  <div className="text-center py-10 text-[#6b8c8c]">No pathology reviews found.</div>
                ) : (
                  reviews.filter(r => r.type === "Pathology").map((review) => (
                    <div key={review.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-[#0a3f41]">{review.patientName}</span>
                             <span className="text-xs text-gray-500">({review.patientEmail})</span>
                           </div>
                           <div className="flex items-center gap-2 mt-1">
                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${review.type === "Pathology" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                               {review.type || "Doctor"} Review
                             </span>
                             {review.doctorName && <span className="text-xs font-bold text-gray-700">for Dr. {review.doctorName}</span>}
                             {review.rating > 0 ? (
                               <div className="flex text-orange-400 text-sm">
                                 {[...Array(review.rating)].map((_, i) => <span key={i} className="material-symbols-outlined text-[16px]">star</span>)}
                               </div>
                             ) : (
                               <span className="text-xs text-gray-400 font-bold ml-1 border border-gray-200 px-1 rounded bg-white">DUMMY</span>
                             )}
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleToggleFeatureReview(review.id, !review.featured)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${review.featured ? 'bg-[#5adace] text-[#0a3f41]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                title={review.featured ? "Unfeature" : "Feature on App"}
                            >
                                {review.featured ? "FEATURED" : "FEATURE"}
                            </button>
                            <button onClick={() => setEditingReviewId(review.id)} className="p-1 text-gray-500 hover:text-[#0a3f41]"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                            <button onClick={() => handleDeleteReview(review.id)} className="p-1 text-gray-500 hover:text-red-500"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                         </div>
                       </div>
                       
                       {editingReviewId === review.id ? (
                          <div className="mt-2 flex gap-2">
                             <input 
                                type="text" 
                                defaultValue={review.text} 
                                className="flex-1 px-3 py-1 text-sm border rounded-lg outline-none focus:border-[#5adace]" 
                                id={`edit-review-input-${review.id}`}
                             />
                             <button onClick={() => {
                                const input = document.getElementById(`edit-review-input-${review.id}`) as HTMLInputElement;
                                if(input) handleUpdateReviewText(review.id, input.value);
                             }} className="px-3 py-1 bg-[#0a3f41] text-white rounded-lg text-sm font-bold">Save</button>
                             <button onClick={() => setEditingReviewId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">Cancel</button>
                          </div>
                       ) : (
                          <p className="text-sm text-gray-700 mt-1">{review.text}</p>
                       )}
                       
                       <div className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-md border border-[#0a3f41]/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                    <th className="p-5 font-bold uppercase tracking-widest text-xs whitespace-nowrap">Booking #</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Patient Details</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Preferred Date</th>
                    {activeTab === "doctors" ? (
                      <>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs">Doctor to Visit</th>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs">Reason for Visit</th>
                      </>
                    ) : (
                      <>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs min-w-[200px]">Full Address</th>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs min-w-[250px]">Selected Tests</th>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs">Referral Doctor</th>
                      </>
                    )}
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Received At</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ecec]">
                  {(activeTab === "doctors" ? doctorAppointments : activeTab === "pathology" ? homeCollections : binBookings).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-[#6b8c8c]">
                        <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">
                          {activeTab === "bin" ? "delete_outline" : "event_busy"}
                        </span>
                        <p className="font-medium text-lg">No {activeTab === "bin" ? "deleted bookings" : "bookings found"}</p>
                        <p className="text-sm mt-1">
                          {activeTab === "bin" ? "The recycle bin is empty." : "Try adjusting your filters or wait for new requests."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (activeTab === "doctors" ? doctorAppointments : activeTab === "pathology" ? homeCollections : binBookings).map((booking, index) => (
                      <tr key={booking.id} className="border-b border-[#e8ecec] hover:bg-[#f5f7f7]/50 transition-colors group">
                        <td className="p-5">
                          <span className="inline-block px-3 py-1 bg-[#5adace]/10 text-[#0a3f41] rounded-lg font-mono font-bold text-sm border border-[#5adace]/30">
                            {booking.bookingNumber || booking.id?.split('-')[0] || `RM-OL-${String(index).padStart(4, '0')}`}
                          </span>
                        </td>
                        <td className="p-5">
                          <p className="font-bold text-[#0a3f41] text-base mb-1 flex items-center gap-2">
                            {booking.name}
                            {booking.status === "Completed" && (
                              <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Completed</span>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-[#6b8c8c]">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span> {booking.phone}</span>
                            <span className="w-1 h-1 bg-[#6b8c8c] rounded-full"></span>
                            <span>{booking.gender}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          {editingBookingId === booking.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={editingDate}
                                onChange={(e) => setEditingDate(e.target.value)}
                                className="px-2 py-1 rounded-md border border-[#e8ecec] text-sm text-[#0a3f41] outline-none w-32 bg-[#f5f7f7] focus:ring-1 focus:ring-[#5adace]"
                              />
                              <button onClick={() => handleUpdateDate(booking.id)} disabled={isUpdating} className="text-[#5adace] hover:text-[#0a3f41] transition-colors"><span className="material-symbols-outlined text-lg">check_circle</span></button>
                              <button onClick={() => setEditingBookingId(null)} disabled={isUpdating} className="text-red-400 hover:text-red-600 transition-colors"><span className="material-symbols-outlined text-lg">cancel</span></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-medium text-[#0a3f41] group/date cursor-pointer" onClick={() => { setEditingBookingId(booking.id); setEditingDate(booking.date || ""); }} title="Click to edit date">
                              <span className="material-symbols-outlined text-[#5adace]">calendar_month</span>
                              <span>{booking.date ? new Date(booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="italic text-[#6b8c8c]">Not Set</span>}</span>
                              <span className="material-symbols-outlined text-sm text-[#6b8c8c] opacity-0 group-hover/date:opacity-100 transition-opacity">edit</span>
                            </div>
                          )}
                        </td>
                        {activeTab === "doctors" ? (
                          <>
                            <td className="p-5">
                              <span className="font-medium text-[#0a3f41]">{booking.doctor}</span>
                            </td>
                            <td className="p-5 text-[#6b8c8c] max-w-xs truncate" title={booking.reason}>
                              {booking.reason}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-5 text-[#6b8c8c] max-w-[200px]">
                              <p className="line-clamp-2" title={booking.address}>{booking.address}</p>
                            </td>
                            <td className="p-5">
                              {booking.selectedTests ? (
                                <div className="flex flex-wrap gap-1 max-w-[250px]">
                                  {booking.selectedTests.split(',').map((testName: string, i: number) => (
                                    <span key={i} className="text-xs bg-[#e8ecec] text-[#0a3f41] px-2 py-1 rounded-md whitespace-nowrap" title={testName.trim()}>
                                      {testName.trim().length > 30 ? testName.trim().substring(0, 30) + '...' : testName.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : booking.tests && booking.tests.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[250px]">
                                  {booking.tests.slice(0, 2).map((t: any, i: number) => (
                                    <span key={i} className="text-xs bg-[#e8ecec] text-[#0a3f41] px-2 py-1 rounded-md whitespace-nowrap">
                                      {t.name}
                                    </span>
                                  ))}
                                  {booking.tests.length > 2 && (
                                    <span className="text-xs bg-[#e8ecec] text-[#0a3f41] px-2 py-1 rounded-md" title={booking.tests.slice(2).map((t: any) => t.name).join(', ')}>
                                      +{booking.tests.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#6b8c8c] italic text-sm">None specified</span>
                              )}
                            </td>
                            <td className="p-5 text-[#6b8c8c]">
                              {booking.referralDoctor || <span className="italic">N/A</span>}
                            </td>
                          </>
                        )}
                        <td className="p-5 text-sm text-[#6b8c8c]">
                          {booking.createdAt ? (
                            <>
                              <div>{new Date(booking.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </>
                          ) : (
                            <span className="italic">Unknown</span>
                          )}
                        </td>
                        <td className="p-5 text-right whitespace-nowrap">
                          {activeTab === "bin" ? (
                            <button
                              onClick={() => handleRestoreBooking(booking.id)}
                              disabled={isUpdating}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[18px]">restore</span> Restore
                            </button>
                          ) : (
                            <>
                              {activeTab === "pathology" && (
                                <div className="inline-flex gap-2 mr-3 border-r border-[#e8ecec] pr-3">
                                  <label className="cursor-pointer group relative">
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      onChange={(e) => handleUpload(booking.id, 'bill', e.target.files?.[0] || null)}
                                      disabled={isUpdating}
                                    />
                                    <div title="Upload Bill" className={`flex items-center justify-center p-2 rounded-lg transition-all ${booking.billUrl ? 'text-[#5adace] bg-[#5adace]/10' : 'text-[#6b8c8c] hover:bg-[#e8ecec]'}`}>
                                      <span className="material-symbols-outlined text-lg">{booking.billUrl ? 'receipt_long' : 'upload_file'}</span>
                                      {booking.billUrl && <span className="material-symbols-outlined text-[10px] absolute bottom-1 right-1 bg-white rounded-full">check_circle</span>}
                                    </div>
                                  </label>
                                  <label className="cursor-pointer group relative">
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      onChange={(e) => handleUpload(booking.id, 'report', e.target.files?.[0] || null)}
                                      disabled={isUpdating}
                                    />
                                    <div title="Upload Report" className={`flex items-center justify-center p-2 rounded-lg transition-all ${booking.reportUrl ? 'text-[#5adace] bg-[#5adace]/10' : 'text-[#6b8c8c] hover:bg-[#e8ecec]'}`}>
                                      <span className="material-symbols-outlined text-lg">{booking.reportUrl ? 'description' : 'file_upload'}</span>
                                      {booking.reportUrl && <span className="material-symbols-outlined text-[10px] absolute bottom-1 right-1 bg-white rounded-full">check_circle</span>}
                                    </div>
                                  </label>
                                </div>
                              )}
                              {booking.status !== "Completed" && (
                                <button
                                  onClick={() => handleCompleteBooking(booking.id)}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-[#5adace] text-[#0a3f41] hover:bg-[#4bc2b6] rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50 mr-2"
                                  title="Mark as Completed"
                                >
                                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                title="Delete Booking"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
