"use client";

import React, { useState, useEffect } from "react";
import { getApiBaseUrl } from "@/utils/apiConfig";
import { formatAvailability } from "@/utils/formatAvailability";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"doctors" | "pathology" | "bin" | "customers" | "doctors-manage" | "tests-manage" | "gallery-manage" | "announcements" | "reviews-manage" | "medicines-manage" | "medicine-orders" | "events-manage" | "coupons-manage">("doctors");
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

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  // Store Medicines & Orders State
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [allMedicineOrders, setAllMedicineOrders] = useState<any[]>([]);
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null);
  const [newMedicineForm, setNewMedicineForm] = useState<{ name: string, category: string, price: string, originalPrice: string, description: string, inStock: boolean, isPrescriptionRequired: boolean, image: File | null }>({ name: "", category: "General", price: "", originalPrice: "", description: "", inStock: true, isPrescriptionRequired: false, image: null });
  const [editMedicineForm, setEditMedicineForm] = useState<{ name: string, category: string, price: string, originalPrice: string, description: string, inStock: boolean, isPrescriptionRequired: boolean, image: File | null }>({ name: "", category: "General", price: "", originalPrice: "", description: "", inStock: true, isPrescriptionRequired: false, image: null });

  // Events State
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEventForm, setNewEventForm] = useState<{ title: string, date: string, details: string, images: File[] }>({ title: "", date: "", details: "", images: [] });
  const [editEventForm, setEditEventForm] = useState<{ title: string, date: string, details: string, images: File[], keepImages: string[] }>({ title: "", date: "", details: "", images: [], keepImages: [] });

  // Coupons State
  const [medicineCoupons, setMedicineCoupons] = useState<any[]>([]);
  const [pathologyCoupons, setPathologyCoupons] = useState<any[]>([]);
  const [couponSubTab, setCouponSubTab] = useState<"medicine" | "pathology">("medicine");
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [newCouponForm, setNewCouponForm] = useState<{ code: string, discount: string, discountType: string, minOrder: string, maxDiscount: string, validFrom: string, validTo: string, description: string }>({ code: "", discount: "", discountType: "percentage", minOrder: "", maxDiscount: "", validFrom: "", validTo: "", description: "" });
  const [editCouponForm, setEditCouponForm] = useState<{ code: string, discount: string, discountType: string, minOrder: string, maxDiscount: string, validFrom: string, validTo: string, description: string }>({ code: "", discount: "", discountType: "percentage", minOrder: "", maxDiscount: "", validFrom: "", validTo: "", description: "" });

  // Announcements Edit State
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [editingAnnouncementText, setEditingAnnouncementText] = useState<string>("");

  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  
  // Edit Pathology Tests State
  const [editingTestsBookingId, setEditingTestsBookingId] = useState<string | null>(null);
  const [editingTestsList, setEditingTestsList] = useState<string[]>([]);
  const [editingTestsDropdownSearch, setEditingTestsDropdownSearch] = useState("");
  const [isEditingTestsDropdownOpen, setIsEditingTestsDropdownOpen] = useState(false);

  const [filters, setFilters] = useState({
    doctors: { date: "", doctor: "", search: "", status: "" },
    pathology: { date: "", search: "", status: "" },
    bin: { date: "", search: "" },
    customers: { search: "" },
    "doctors-manage": { search: "" },
    "tests-manage": { search: "" },
    "gallery-manage": { search: "" },
    "announcements": { search: "" },
    "reviews-manage": { search: "" },
    "medicines-manage": { search: "" },
    "medicine-orders": { date: "", search: "", status: "" },
    "events-manage": { search: "" },
    "coupons-manage": { search: "" }
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
        : activeTab === "medicine-orders"
        ? { date: "", search: "", status: "" }
        : { date: "", search: "" }
    }));
  };

  const handleTabChange = (tab: "doctors" | "pathology" | "bin" | "customers" | "doctors-manage" | "tests-manage" | "gallery-manage" | "announcements" | "reviews-manage" | "medicines-manage" | "medicine-orders" | "events-manage" | "coupons-manage") => {
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchDoctors();
    fetchTests();
    fetchGallery();
    fetchAnnouncements();
    fetchNotifications();
    fetchMedicines();
    fetchMedicineOrders();
    fetchEvents();
    fetchMedicineCoupons();
    fetchPathologyCoupons();
    fetchReviews();
    const notifInterval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(notifInterval);
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/reviews`);
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
      const res = await fetch(`${getApiBaseUrl()}/api/announcement?all=true`);
      const data = await res.json();
      if (data.success && data.announcements) setAnnouncements(data.announcements);
    } catch (e) {
      console.error("Error fetching announcements", e);
    }
  };

  
  // Helper to generate coupon description automatically
  const generateCouponDescription = (
    code: string,
    discount: string | number,
    discountType: string,
    minOrder?: string | number,
    maxDiscount?: string | number,
    validTo?: string,
    serviceName: string = "Medicines"
  ) => {
    if (!code && !discount) return "";
    const codeUpper = code ? code.trim().toUpperCase() : "";
    const discNum = Number(discount) || 0;
    const discStr = (discountType === "percentage" || discountType === "%") ? `${discNum}% OFF` : `₹${discNum} OFF`;
    
    let desc = `${codeUpper}: Get ${discStr} on ${serviceName}!`;
    
    const details: string[] = [];
    if (minOrder && Number(minOrder) > 0) {
      details.push(`Min Order ₹${minOrder}`);
    }
    if ((discountType === "percentage" || discountType === "%") && maxDiscount && Number(maxDiscount) > 0) {
      details.push(`Max Discount ₹${maxDiscount}`);
    }
    if (validTo) {
      details.push(`Valid till ${validTo}`);
    }

    if (details.length > 0) {
      desc += ` (${details.join(", ")})`;
    }

    return desc;
  };

  // Notifications API functions
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/notifications`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) { console.error(e); }
  };

  const handleMarkRead = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/api/notifications/read`, { method: "PATCH" });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const handleDeleteNotification = async (id?: string) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/notifications${id ? `?id=${id}` : ""}`, { method: "DELETE" });
      if (id) {
        setNotifications(notifications.filter(n => n.id !== id));
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) { console.error(e); }
  };

  // Medicines Store API functions
  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicines`);
      const data = await res.json();
      setAllMedicines(data);
    } catch (e) { console.error(e); }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("name", newMedicineForm.name);
    formData.append("category", newMedicineForm.category);
    formData.append("price", newMedicineForm.price);
    formData.append("originalPrice", newMedicineForm.originalPrice);
    formData.append("description", newMedicineForm.description);
    formData.append("inStock", String(newMedicineForm.inStock));
    formData.append("isPrescriptionRequired", String(newMedicineForm.isPrescriptionRequired));
    if (newMedicineForm.image) formData.append("image", newMedicineForm.image);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicines`, { method: "POST", body: formData });
      if (res.ok) {
        fetchMedicines();
        setNewMedicineForm({ name: "", category: "General", price: "", originalPrice: "", description: "", inStock: true, isPrescriptionRequired: false, image: null });
      }
    } catch (e) { console.error(e); }
    setIsUpdating(false);
  };

  const submitEditMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicineId) return;
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("id", editingMedicineId);
    formData.append("name", editMedicineForm.name);
    formData.append("category", editMedicineForm.category);
    formData.append("price", editMedicineForm.price);
    formData.append("originalPrice", editMedicineForm.originalPrice);
    formData.append("description", editMedicineForm.description);
    formData.append("inStock", String(editMedicineForm.inStock));
    formData.append("isPrescriptionRequired", String(editMedicineForm.isPrescriptionRequired));
    if (editMedicineForm.image) formData.append("image", editMedicineForm.image);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicines`, { method: "PATCH", body: formData });
      if (res.ok) {
        fetchMedicines();
        setEditingMedicineId(null);
      }
    } catch (e) { console.error(e); }
    setIsUpdating(false);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicines?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchMedicines();
    } catch (e) { console.error(e); }
  };

  const handleToggleMedicineStock = async (id: string, currentInStock: boolean) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("inStock", String(!currentInStock));
      const res = await fetch(`${getApiBaseUrl()}/api/medicines`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAllMedicines(allMedicines.map((m: any) => m.id === id ? { ...m, inStock: !currentInStock } : m));
      } else {
        fetchMedicines();
      }
    } catch (err) {
      console.error("Error toggling stock:", err);
    }
  };

  // Medicine Orders API functions
  const fetchMedicineOrders = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicine-orders`);
      const data = await res.json();
      if (Array.isArray(data)) setAllMedicineOrders(data);
    } catch (e) { console.error(e); }
  };

  const updateMedicineOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicine-orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) fetchMedicineOrders();
    } catch (e) { console.error(e); }
  };

  const deleteMedicineOrder = async (id: string, permanent: boolean = false) => {
    const confirmMsg = permanent
      ? "Permanently delete this medicine order? This cannot be undone."
      : "Move this medicine order to the Recycle Bin?";
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicine-orders?id=${id}${permanent ? '&permanent=true' : ''}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchMedicineOrders();
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch (e) { console.error(e); }
  };

  const handleRestoreMedicineOrder = async (id: string) => {
    if (!confirm("Restore this deleted medicine order?")) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicine-orders/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        alert("Medicine order restored successfully!");
        fetchMedicineOrders();
      } else {
        alert(data.message || "Failed to restore order");
      }
    } catch (e) { console.error(e); }
  };

  const uploadMedicineOrderBill = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("bill", file);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/medicine-orders/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        alert("Medicine Bill uploaded successfully!");
        fetchMedicineOrders();
      } else {
        alert(data.message || "Failed to upload bill.");
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading bill.");
    }
  };

  // Events API functions
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/events`);
      const data = await res.json();
      setAllEvents(data);
    } catch (e) { console.error(e); }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("title", newEventForm.title);
    formData.append("date", newEventForm.date);
    formData.append("details", newEventForm.details);
    if (newEventForm.images) {
      for (let i = 0; i < newEventForm.images.length; i++) {
        formData.append("images", newEventForm.images[i]);
      }
    }
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/events`, { method: "POST", body: formData });
      if (res.ok) {
        fetchEvents();
        setNewEventForm({ title: "", date: "", details: "", images: [] });
      }
    } catch (e) { console.error(e); }
    setIsUpdating(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchEvents();
    } catch (e) { console.error(e); }
  };

  const submitEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId) return;
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("id", editingEventId);
    formData.append("title", editEventForm.title);
    formData.append("date", editEventForm.date);
    formData.append("details", editEventForm.details);
    formData.append("keepImages", JSON.stringify(editEventForm.keepImages));
    if (editEventForm.images) {
      for (let i = 0; i < editEventForm.images.length; i++) {
        formData.append("images", editEventForm.images[i]);
      }
    }
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/events`, { method: "PATCH", body: formData });
      if (res.ok) {
        fetchEvents();
        setEditingEventId(null);
      }
    } catch (e) { console.error(e); }
    setIsUpdating(false);
  };

  // Coupons API functions
  const fetchMedicineCoupons = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coupons/medicine`);
      const data = await res.json();
      setMedicineCoupons(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchPathologyCoupons = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/coupons/pathology`);
      const data = await res.json();
      setPathologyCoupons(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleAddCoupon = async (type: "medicine" | "pathology") => {
    setIsUpdating(true);
    try {
      const serviceName = type === "medicine" ? "Medicines" : "Pathology Tests";
      const autoDesc = newCouponForm.description || generateCouponDescription(
        newCouponForm.code,
        newCouponForm.discount,
        newCouponForm.discountType,
        newCouponForm.minOrder,
        newCouponForm.maxDiscount,
        newCouponForm.validTo,
        serviceName
      );
      
      const payload = {
        ...newCouponForm,
        description: autoDesc
      };

      const res = await fetch(`${getApiBaseUrl()}/api/coupons/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewCouponForm({ code: "", discount: "", discountType: "percentage", minOrder: "", maxDiscount: "", validFrom: "", validTo: "", description: "" });
        type === "medicine" ? fetchMedicineCoupons() : fetchPathologyCoupons();
        fetchAnnouncements();
      }
    } catch (err) { console.error(err); }
    setIsUpdating(false);
  };

  const handleEditCoupon = async (type: "medicine" | "pathology") => {
    setIsUpdating(true);
    try {
      const serviceName = type === "medicine" ? "Medicines" : "Pathology Tests";
      const autoDesc = editCouponForm.description || generateCouponDescription(
        editCouponForm.code,
        editCouponForm.discount,
        editCouponForm.discountType,
        editCouponForm.minOrder,
        editCouponForm.maxDiscount,
        editCouponForm.validTo,
        serviceName
      );

      const payload = {
        id: editingCouponId,
        ...editCouponForm,
        description: autoDesc
      };

      const res = await fetch(`${getApiBaseUrl()}/api/coupons/${type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingCouponId(null);
        type === "medicine" ? fetchMedicineCoupons() : fetchPathologyCoupons();
        fetchAnnouncements();
      }
    } catch (err) { console.error(err); }
    setIsUpdating(false);
  };

  const handleDeleteCoupon = async (type: "medicine" | "pathology", id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`${getApiBaseUrl()}/api/coupons/${type}/${id}`, { method: "DELETE" });
      type === "medicine" ? fetchMedicineCoupons() : fetchPathologyCoupons();
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleToggleCoupon = async (type: "medicine" | "pathology", id: string, currentStatus: boolean) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/coupons/${type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      type === "medicine" ? fetchMedicineCoupons() : fetchPathologyCoupons();
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  // Announcement Bar Management
  const handleToggleAnnouncement = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/announcement`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentActive })
      });
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleSaveEditAnnouncement = async (id: string) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/announcement`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text: editingAnnouncementText })
      });
      setEditingAnnouncementId(null);
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await fetch(`${getApiBaseUrl()}/api/announcement?id=${id}`, { method: "DELETE" });
      fetchAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleSetAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newAnnouncementText })
      });
      if (res.ok) {
        setNewAnnouncementText("");
        fetchAnnouncements();
    fetchNotifications();
    fetchMedicines();
    fetchMedicineOrders();
    fetchEvents();
    fetchMedicineCoupons();
    fetchPathologyCoupons();
      }
    } catch (error) {
      console.error("Error setting announcement:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/gallery`);
      const data = await res.json();
      if (Array.isArray(data)) setAllGallery(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/tests`);
      const data = await res.json();
      if (Array.isArray(data)) setAllTests(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/doctors`);
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
      const res = await fetch(`${getApiBaseUrl()}/api/doctors`, {
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

      const res = await fetch(`${getApiBaseUrl()}/api/doctors`, {
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

  const handleUpdateDoctorExceptions = async (docId: string, exceptions: any[]) => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("id", docId);
      formData.append("exceptions", JSON.stringify(exceptions));

      const res = await fetch(`${getApiBaseUrl()}/api/doctors`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAllDoctors(allDoctors.map((d: any) => d.id === docId ? data.doctor : d));
      } else {
        alert("Failed to update exceptions.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating exceptions");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddDummyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingDoctorReviews) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/reviews`, {
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
      const res = await fetch(`${getApiBaseUrl()}/api/reviews?id=${id}`, { method: "DELETE" });
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
      const res = await fetch(`${getApiBaseUrl()}/api/reviews`, {
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
      const res = await fetch(`${getApiBaseUrl()}/api/reviews`, {
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
      const url = `${getApiBaseUrl()}/api/tests`;
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
      const res = await fetch(`${getApiBaseUrl()}/api/tests?id=${id}`, { method: "DELETE" });
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

      const res = await fetch(`${getApiBaseUrl()}/api/gallery`, {
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
      const res = await fetch(`${getApiBaseUrl()}/api/gallery?id=${id}`, { method: "DELETE" });
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
      const res = await fetch(`${getApiBaseUrl()}/api/doctors?id=${id}`, { method: "DELETE" });
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
      const res = await fetch(`${getApiBaseUrl()}/api/users`);
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
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings`);
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
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings`, {
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

  const handleUpdateTests = async (id: string) => {
    setIsUpdating(true);
    const selectedTestsStr = editingTestsList.map(code => {
      const test = allTests.find(t => t.code === code);
      return `${test?.code || code}: ${test?.name || code}`;
    }).join(", ");

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, selectedTests: selectedTestsStr }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, selectedTests: selectedTestsStr } : b));
        setEditingTestsBookingId(null);
      } else {
        alert(data.message || "Failed to update tests");
      }
    } catch (error) {
      console.error("Error updating tests:", error);
      alert("Error updating tests");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings?id=${id}`, { method: "DELETE" });
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
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings`, {
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
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings`, {
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
      const res = await fetch(`${getApiBaseUrl()}/api/admin/bookings/upload`, {
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
    if (filters.doctors.status) {
      if (filters.doctors.status === "Completed" && b.status !== "Completed") return false;
      if (filters.doctors.status === "Pending" && b.status === "Completed") return false;
    }
    if (filters.doctors.search) {
      const s = filters.doctors.search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchPhone = b.phone?.toLowerCase().includes(s);
      const matchId = b.id?.toLowerCase().includes(s);
      const matchBookingNum = b.bookingNumber?.toLowerCase().includes(s);
      if (!matchName && !matchPhone && !matchId && !matchBookingNum) return false;
    }
    return true;
  });

  const homeCollections = bookings.filter(b => (b.address || b.tests) && b.status !== "Deleted").filter(b => {
    if (filters.pathology.date && b.date !== filters.pathology.date) return false;
    if (filters.pathology.status) {
      if (filters.pathology.status === "Completed" && b.status !== "Completed") return false;
      if (filters.pathology.status === "Pending" && b.status === "Completed") return false;
    }
    if (filters.pathology.search) {
      const s = filters.pathology.search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchPhone = b.phone?.toLowerCase().includes(s);
      const matchId = b.id?.toLowerCase().includes(s);
      const matchBookingNum = b.bookingNumber?.toLowerCase().includes(s);
      if (!matchName && !matchPhone && !matchId && !matchBookingNum) return false;
    }
    return true;
  });

  const binBookings = bookings.filter(b => b.status === "Deleted").filter(b => {
    if (filters.bin.date && b.date !== filters.bin.date) return false;
    if (filters.bin.search) {
      const s = filters.bin.search.toLowerCase();
      const matchName = b.name?.toLowerCase().includes(s);
      const matchPhone = b.phone?.toLowerCase().includes(s);
      const matchId = b.id?.toLowerCase().includes(s);
      if (!matchName && !matchPhone && !matchId) return false;
    }
    return true;
  });

  const binMedicineOrders = allMedicineOrders.filter(o => o.status === "Deleted").filter(o => {
    if (filters.bin.date) {
      const orderDateStr = o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "";
      if (orderDateStr !== filters.bin.date) return false;
    }
    if (filters.bin.search) {
      const s = filters.bin.search.toLowerCase();
      const matchName = o.patientDetails?.name?.toLowerCase().includes(s);
      const matchPhone = (o.patientDetails?.phone || o.userPhone)?.toLowerCase().includes(s);
      const matchId = o.id?.toLowerCase().includes(s);
      const matchAddress = o.patientDetails?.address?.toLowerCase().includes(s);
      if (!matchName && !matchPhone && !matchId && !matchAddress) return false;
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
        <div className="flex gap-3 items-center relative">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationsDropdown(!showNotificationsDropdown);
                if (unreadCount > 0) {
                  fetch(`${getApiBaseUrl()}/api/notifications/read`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markAll: true }),
                  }).then(() => {
                    setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                  });
                }
              }}
              className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center justify-center"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-[#0a3f41]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-3 w-[340px] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-[#e8ecec] z-[200] text-[#0a3f41] overflow-hidden">
                {/* Popover Header */}
                <div className="p-4 bg-[#f5f7f7] border-b border-[#e8ecec] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5adace] text-lg">notifications</span>
                    <h3 className="font-bold text-sm">Notifications ({notifications.length})</h3>
                  </div>
                  <div className="flex gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          fetch(`${getApiBaseUrl()}/api/notifications/read`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ markAll: true }),
                          }).then(() => {
                            setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })));
                            setUnreadCount(0);
                          });
                        }}
                        className="text-xs text-[#0a3f41] font-bold hover:underline"
                      >Mark all read</button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          fetch(`${getApiBaseUrl()}/api/notifications?deleteAll=true`, { method: "DELETE" })
                            .then(() => { setNotifications([]); setUnreadCount(0); });
                        }}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >Clear all</button>
                    )}
                    <button
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-[#6b8c8c] hover:text-red-500"
                    ><span className="material-symbols-outlined text-base">close</span></button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-[#e8ecec]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#8ca8a8] flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-40">notifications_off</span>
                      <p className="text-sm font-medium">No new reminders</p>
                    </div>
                  ) : (
                    notifications.map((notif: any) => {
                      const icon = notif.type === "doctor_appointment"
                        ? "stethoscope"
                        : notif.type === "pathology_test"
                        ? "science"
                        : "local_pharmacy";
                      const colorClass = notif.type === "doctor_appointment"
                        ? "bg-blue-100 text-blue-600"
                        : notif.type === "pathology_test"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-emerald-100 text-emerald-600";

                      return (
                        <div
                          key={notif.id}
                          className={`p-4 hover:bg-[#f5f7f7] transition-colors cursor-pointer flex gap-3 items-start ${!notif.isRead ? "bg-blue-50/50" : ""}`}
                          onClick={() => {
                            setShowNotificationsDropdown(false);
                            if (notif.type === "doctor_appointment") handleTabChange("doctors");
                            else if (notif.type === "pathology_test") handleTabChange("pathology");
                            else if (notif.type === "medicine_order") handleTabChange("medicine-orders");
                          }}
                        >
                          <div className={`p-2 rounded-xl flex-shrink-0 ${colorClass}`}>
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className="text-xs font-bold text-[#0a3f41] truncate pr-2">{notif.title}</p>
                              <span className="text-[10px] text-[#6b8c8c] whitespace-nowrap">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-[#6b8c8c] line-clamp-2 leading-relaxed">{notif.message}</p>
                            {!notif.isRead && (
                              <span className="inline-block mt-1 text-[9px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetch(`${getApiBaseUrl()}/api/notifications?id=${notif.id}`, { method: "DELETE" })
                                .then(() => {
                                  const updated = notifications.filter((n: any) => n.id !== notif.id);
                                  setNotifications(updated);
                                  setUnreadCount(updated.filter((n: any) => !n.isRead).length);
                                });
                            }}
                            className="text-[#aaa] hover:text-red-500 transition-colors p-1 flex-shrink-0"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>

          {/* Logout */}
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
                {reviews.filter(r => r.doctorName && r.doctorName.trim().toLowerCase() === viewingDoctorReviews.trim().toLowerCase()).length === 0 ? (
                  <p className="text-center text-[#6b8c8c] italic py-8">No reviews submitted for this doctor yet.</p>
                ) : (
                  reviews
                    .filter(r => r.doctorName && r.doctorName.trim().toLowerCase() === viewingDoctorReviews.trim().toLowerCase())
                    .map(review => (
                      <div key={review.id} className="p-4 bg-[#f5f7f7] rounded-xl border border-[#e8ecec]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div>
                            <span className="font-bold text-[#0a3f41] text-sm">{review.patientName || "Anonymous Patient"}</span>
                            {review.patientPhone && <span className="text-xs text-[#6b8c8c] ml-2">({review.patientPhone})</span>}
                            {review.patientEmail && !review.patientPhone && <span className="text-xs text-[#6b8c8c] ml-2">({review.patientEmail})</span>}
                          </div>
                          <div className="flex gap-2 items-center flex-wrap">
                            {review.rating > 0 && (
                              <div className="flex text-orange-400">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <span key={s} className="material-symbols-outlined text-[16px]">
                                    {s <= review.rating ? "star" : "star_outline"}
                                  </span>
                                ))}
                              </div>
                            )}
                            <button
                              disabled={isUpdating}
                              onClick={() => handleToggleFeatureReview(review.id, !review.featured)}
                              className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                                review.featured
                                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-2xs"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                              title={review.featured ? "Currently visible on user website under this doctor" : "Click to show on user website under this doctor"}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {review.featured ? "visibility" : "visibility_off"}
                              </span>
                              {review.featured ? "Shown on User Site" : "Show on User Site"}
                            </button>
                            <button disabled={isUpdating} onClick={() => { setEditingReviewId(review.id); setEditingReviewText(review.text); }} className="text-[#6b8c8c] hover:text-[#5adace] transition-colors p-1" title="Edit review text">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button disabled={isUpdating} onClick={() => handleDeleteReview(review.id)} className="text-[#6b8c8c] hover:text-red-500 transition-colors p-1" title="Delete review">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        {editingReviewId === review.id ? (
                          <div className="mt-2 flex gap-2">
                            <input value={editingReviewText} onChange={e => setEditingReviewText(e.target.value)} className="flex-1 p-2 border border-[#e8ecec] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                            <button disabled={isUpdating} onClick={() => handleUpdateReviewText(review.id, editingReviewText)} className="bg-[#5adace] text-[#0a3f41] px-3 py-1 rounded-lg text-sm font-bold">Save</button>
                            <button disabled={isUpdating} onClick={() => setEditingReviewId(null)} className="text-[#6b8c8c] text-sm hover:underline">Cancel</button>
                          </div>
                        ) : (
                          review.text && <p className="text-sm text-[#0a3f41] mt-2 font-medium bg-white p-3 rounded-lg border border-[#e8ecec]">{review.text}</p>
                        )}
                        <div className="text-[10px] text-[#6b8c8c] mt-2 uppercase tracking-widest flex items-center justify-between">
                          <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span>
                          {review.bookingId && <span>Booking #{review.bookingId}</span>}
                        </div>
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
            onClick={() => handleTabChange("medicines-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "medicines-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">local_pharmacy</span>
            Store
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "medicines-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{allMedicines.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("medicine-orders")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "medicine-orders" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            Medicine Orders
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "medicine-orders" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{allMedicineOrders.length}</span>
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
            onClick={() => handleTabChange("events-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "events-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">event</span>
            Manage Events
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "events-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{allEvents.length}</span>
          </button>
          <button
            onClick={() => handleTabChange("coupons-manage")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "coupons-manage" ? "bg-[#0a3f41] text-white shadow-md" : "text-[#6b8c8c] hover:bg-[#e8ecec]"}`}
          >
            <span className="material-symbols-outlined text-xl">confirmation_number</span>
            Coupons
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "coupons-manage" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{medicineCoupons.length + pathologyCoupons.length}</span>
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
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "bin" ? "bg-white/20" : "bg-red-100 text-red-500"}`}>{binBookings.length + binMedicineOrders.length}</span>
          </button>
        </div>

        {/* Filters Section */}
        {activeTab !== "doctors-manage" && activeTab !== "tests-manage" && activeTab !== "announcements" && activeTab !== "gallery-manage" && activeTab !== "reviews-manage" && activeTab !== "events-manage" && activeTab !== "coupons-manage" && activeTab !== "medicines-manage" && (
          <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-[#0a3f41]/5 items-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#6b8c8c]">filter_list</span>
              <span className="font-bold text-[#0a3f41] text-sm tracking-widest uppercase">Filters:</span>
            </div>

            <div className="flex items-center gap-2 bg-[#f5f7f7] px-4 py-2 rounded-xl border-none focus-within:ring-2 focus-within:ring-[#5adace]/50 transition-all">
              <span className="material-symbols-outlined text-[#6b8c8c] text-sm">search</span>
              <input
                type="text"
                placeholder={
                  activeTab === "doctors" || activeTab === "pathology" || activeTab === "bin"
                    ? "Search Name, Phone or Order ID"
                    : "Search Name or Phone"
                }
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

            {(activeTab === "medicine-orders" || activeTab === "pathology" || activeTab === "doctors") && (
              <div className="flex items-center gap-2 bg-[#f5f7f7] px-4 py-2 rounded-xl">
                <label className="text-xs font-bold text-[#6b8c8c] uppercase tracking-widest">Status:</label>
                <select
                  value={(activeFilters as any).status || ""}
                  onChange={(e) => setFilter("status", e.target.value)}
                  className="bg-transparent border-none text-[#0a3f41] font-bold text-sm outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {activeTab === "pathology" || activeTab === "doctors" ? (
                    <>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </>
                  ) : (
                    <>
                      <option value="Placed">Placed</option>
                      <option value="Delivered">Delivered</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {((activeFilters as any).date || (activeFilters as any).doctor || (activeFilters as any).status || activeFilters.search) && (
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
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Patient Reviews</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDoctors.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-[#6b8c8c] italic">No doctors registered yet.</td></tr>
                    ) : (
                      allDoctors.map((doc: any) => (
                        <tr key={doc.id} className="border-b border-[#e8ecec] hover:bg-[#f5f7f7]/50 transition-colors">
                          <td className="p-5 font-bold text-[#0a3f41]">
                            <div className="flex items-center gap-3">
                              {doc.imageurl && (
                                <img
                                  src={doc.imageurl.startsWith("http") ? doc.imageurl : `${getApiBaseUrl()}${doc.imageurl}`}
                                  alt={doc.name}
                                  className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-[#e8ecec] shrink-0"
                                />
                              )}
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
                            </div>
                          </td>
                          <td className="p-5 text-[#6b8c8c] text-sm">{doc.specialty}</td>
                          <td className="p-5 text-[#6b8c8c] text-sm align-top">
                            <div className="mb-2">{formatAvailability(doc)}</div>
                            <div className="bg-[#f5f7f7] p-3 rounded-xl mt-2 border border-[#e8ecec]">
                              <p className="text-[10px] font-bold text-[#0a3f41] uppercase tracking-widest mb-2">Exceptions</p>
                              {doc.exceptions && doc.exceptions.length > 0 ? (
                                <div className="flex flex-col gap-1.5 mb-3">
                                  {doc.exceptions.map((ex: any, idx: number) => (
                                    <div key={idx} className={`flex items-center justify-between px-2 py-1 rounded-md border text-xs font-medium ${ex.isAvailable ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                      <span>{ex.date}: {ex.isAvailable ? "Available" : "Not Available"}</span>
                                      <button 
                                        onClick={() => {
                                          if (window.confirm('Remove this exception?')) {
                                            handleUpdateDoctorExceptions(doc.id, doc.exceptions.filter((e: any) => e.date !== ex.date));
                                          }
                                        }} 
                                        disabled={isUpdating}
                                        className="material-symbols-outlined text-[14px] hover:opacity-70 ml-2"
                                      >
                                        close
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-[#6b8c8c] italic mb-3">No exceptions</p>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <input type="date" id={`exceptionDate-${doc.id}`} className="text-[11px] p-1.5 rounded border border-[#e8ecec] text-[#0a3f41] outline-none max-w-[110px]" min={new Date().toISOString().split("T")[0]} />
                                <select id={`exceptionStatus-${doc.id}`} className="text-[11px] p-1.5 rounded border border-[#e8ecec] text-[#0a3f41] outline-none">
                                  <option value="false">Off</option>
                                  <option value="true">On</option>
                                </select>
                                <button 
                                  onClick={() => {
                                    const dateInput = document.getElementById(`exceptionDate-${doc.id}`) as HTMLInputElement;
                                    const statusInput = document.getElementById(`exceptionStatus-${doc.id}`) as HTMLSelectElement;
                                    if (!dateInput.value) return;
                                    const newEx = { date: dateInput.value, isAvailable: statusInput.value === "true" };
                                    const currentExceptions = doc.exceptions || [];
                                    const filtered = currentExceptions.filter((e: any) => e.date !== newEx.date);
                                    handleUpdateDoctorExceptions(doc.id, [...filtered, newEx]);
                                    dateInput.value = "";
                                  }} 
                                  disabled={isUpdating}
                                  className="bg-[#5adace] text-[#0a3f41] px-2 py-1.5 rounded font-bold text-[11px] hover:bg-[#0a3f41] hover:text-white transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            {(() => {
                              const docReviews = reviews.filter(r => r.doctorName && r.doctorName.trim().toLowerCase() === doc.name.trim().toLowerCase());
                              const featuredCount = docReviews.filter(r => r.featured).length;
                              return (
                                <button
                                  onClick={() => setViewingDoctorReviews(doc.name)}
                                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  title="Click to view and manage patient reviews for this doctor"
                                >
                                  <span className="material-symbols-outlined text-sm text-amber-600">rate_review</span>
                                  <span>Reviews ({docReviews.length})</span>
                                  {featuredCount > 0 && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                                      {featuredCount} Active
                                    </span>
                                  )}
                                </button>
                              );
                            })()}
                          </td>
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#0a3f41]/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#0a3f41] text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#5adace] text-2xl">
                    {editingTestId ? "edit_note" : "add_circle"}
                  </span>
                  {editingTestId ? "Edit Pathology Test" : "Add New Pathology Test"}
                </h3>
                {editingTestId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTestId(null);
                      setNewTestForm({ name: "", code: "" });
                    }}
                    className="text-xs font-bold text-[#6b8c8c] hover:text-red-500 transition-colors underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span> Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleAddTest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Test Name (e.g. Complete Blood Count)" value={newTestForm.name} onChange={e => setNewTestForm({ ...newTestForm, name: e.target.value })} className="p-3.5 rounded-xl bg-[#f5f7f7] border border-[#e8ecec] text-[#0a3f41] font-medium outline-none focus:ring-2 focus:ring-[#5adace]/50" />
                <input required placeholder="Test Code (e.g. T0123)" value={newTestForm.code} onChange={e => setNewTestForm({ ...newTestForm, code: e.target.value })} className="p-3.5 rounded-xl bg-[#f5f7f7] border border-[#e8ecec] text-[#0a3f41] font-bold outline-none focus:ring-2 focus:ring-[#5adace]/50 uppercase" />
                <button disabled={isUpdating} type="submit" className="md:col-span-2 p-3.5 bg-[#0a3f41] text-white rounded-xl font-bold hover:bg-[#0a3f41]/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <span className="material-symbols-outlined text-xl">{editingTestId ? "save" : "biotech"}</span>
                  {editingTestId ? "Update Test" : "Add Test"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
              <div className="p-6 border-b border-[#e8ecec] bg-[#f5f7f7]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#0a3f41] text-lg">
                    Registered Pathology Tests (
                    {allTests.filter(t => {
                      const s = (filters["tests-manage"].search || "").toLowerCase().trim();
                      return !s || t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
                    }).length}
                    )
                  </h3>
                  <p className="text-xs text-[#6b8c8c]">Search, edit, or remove pathology tests available for OPD patient bookings.</p>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[#e8ecec] focus-within:ring-2 focus-within:ring-[#5adace]/50 transition-all w-full md:w-80 shadow-2xs">
                  <span className="material-symbols-outlined text-[#6b8c8c] text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Search test name or code..."
                    value={activeFilters.search || ""}
                    onChange={(e) => setFilter("search", e.target.value)}
                    className="bg-transparent border-none text-[#0a3f41] font-medium outline-none placeholder:text-[#6b8c8c] text-sm w-full"
                  />
                  {activeFilters.search && (
                    <button onClick={() => setFilter("search", "")} className="text-[#6b8c8c] hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                      <th className="p-5 font-bold text-xs uppercase tracking-widest w-1/4">Code</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest">Test Name</th>
                      <th className="p-5 font-bold text-xs uppercase tracking-widest w-[100px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8ecec]">
                    {allTests.filter(t => {
                      const s = (filters["tests-manage"].search || "").toLowerCase().trim();
                      return !s || t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
                    }).length === 0 ? (
                      <tr><td colSpan={3} className="p-8 text-center text-[#6b8c8c] italic">{filters["tests-manage"].search ? `No pathology tests found matching "${filters["tests-manage"].search}"` : "No tests registered yet."}</td></tr>
                    ) : (
                      allTests
                        .filter(t => {
                          const s = (filters["tests-manage"].search || "").toLowerCase().trim();
                          return !s || t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
                        })
                        .map((test: any) => (
                          <tr key={test.id} className="hover:bg-[#f5f7f7]/50 transition-colors">
                            <td className="p-5 font-bold text-[#0a3f41] font-mono text-sm">{test.code}</td>
                            <td className="p-5 text-[#6b8c8c] font-medium">{test.name}</td>
                            <td className="p-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditTestClick(test)} disabled={isUpdating} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer" title="Edit Test">
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button onClick={() => handleDeleteTest(test.id)} disabled={isUpdating} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Delete Test">
                                  <span className="material-symbols-outlined text-lg">delete</span>
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
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 p-8">
              <div className="flex justify-between items-center mb-6 border-b border-[#e8ecec] pb-4">
                <h3 className="text-xl font-bold text-[#0a3f41] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#5adace] text-2xl">
                    {editingGalleryId ? "edit_square" : "add_a_photo"}
                  </span>
                  {editingGalleryId ? "Edit Facility Photo" : "Add New Facility Photo"}
                </h3>
                {editingGalleryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGalleryId(null);
                      setNewGalleryForm({ title: "", description: "", image: null });
                      const fileInput = document.getElementById('gallery-photo-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-xs font-bold text-[#6b8c8c] hover:text-red-500 transition-colors underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span> Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleAddGallery} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Photo Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinic Interior / Waiting Area"
                    value={newGalleryForm.title}
                    onChange={(e) => setNewGalleryForm({ ...newGalleryForm, title: e.target.value })}
                    className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe this facility photo..."
                    value={newGalleryForm.description}
                    onChange={(e) => setNewGalleryForm({ ...newGalleryForm, description: e.target.value })}
                    className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5adace]">add_photo_alternate</span>
                    Upload Photo {editingGalleryId ? "(Optional if keeping current)" : "*"}
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="gallery-photo-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewGalleryForm({ ...newGalleryForm, image: file });
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="gallery-photo-upload"
                      className="flex flex-col items-center justify-center p-6 bg-[#f5f7f7] border-2 border-dashed border-[#5adace]/40 hover:border-[#5adace] rounded-2xl cursor-pointer transition-all hover:bg-[#5adace]/5 group-hover:scale-[1.005]"
                    >
                      {newGalleryForm.image || (editingGalleryId && allGallery.find(g => g.id === editingGalleryId)?.imageurl) || (editingGalleryId && allGallery.find(g => g.id === editingGalleryId)?.src) ? (
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-20 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-[#e8ecec]">
                            <img
                              src={
                                newGalleryForm.image
                                  ? URL.createObjectURL(newGalleryForm.image)
                                  : `${getApiBaseUrl()}${allGallery.find(g => g.id === editingGalleryId)?.imageurl || allGallery.find(g => g.id === editingGalleryId)?.src}`
                              }
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#0a3f41] truncate">
                              {newGalleryForm.image?.name || "Current Photo Selected"}
                            </p>
                            <p className="text-xs text-[#5adace] font-semibold mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">published_with_changes</span>
                              Click to choose a different photo
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-[#5adace] shadow-sm border border-[#5adace]/20 group-hover:bg-[#5adace] group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                          </div>
                          <p className="text-sm font-bold text-[#0a3f41]">Click to Upload Facility Image</p>
                          <p className="text-xs text-[#6b8c8c] mt-0.5">Supports PNG, JPG, JPEG, or WebP</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-8 py-4 bg-[#0a3f41] text-white font-bold rounded-xl shadow-md hover:bg-[#0a3f41]/90 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined">{editingGalleryId ? "save" : "publish"}</span>
                    {editingGalleryId ? "Update Gallery Photo" : "Save & Publish Photo"}
                  </button>
                  {editingGalleryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGalleryId(null);
                        setNewGalleryForm({ title: "", description: "", image: null });
                      }}
                      className="px-8 py-4 bg-[#e8ecec] text-[#0a3f41] font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden p-8">
              <div className="mb-6 flex justify-between items-center border-b border-[#e8ecec] pb-4">
                <div>
                  <h3 className="font-bold text-[#0a3f41] text-lg">Facility Photo Gallery ({allGallery.length})</h3>
                  <p className="text-xs text-[#6b8c8c]">All published photos appear directly on the website's Our Facility gallery page.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allGallery.map((item: any) => {
                  const imgSrc = item.imageurl || item.src;
                  const fullImgUrl = imgSrc?.startsWith('http') ? imgSrc : `${getApiBaseUrl()}${imgSrc}`;
                  return (
                    <div key={item.id} className="bg-[#f5f7f7] border border-[#e8ecec] rounded-2xl overflow-hidden group shadow-2xs hover:shadow-md transition-all">
                      <div className="aspect-[16/10] bg-gray-200 overflow-hidden relative">
                        <img
                          src={fullImgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-[#0a3f41] text-base mb-1">{item.title}</h4>
                          {item.description && <p className="text-xs text-[#6b8c8c] line-clamp-2">{item.description}</p>}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#e8ecec]">
                          <button
                            onClick={() => handleEditGalleryClick(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                            title="Edit Photo"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                            title="Delete Photo"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allGallery.length === 0 && (
                  <div className="col-span-full py-12 text-center text-[#6b8c8c] italic">
                    No facility photos uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        
        ) : activeTab === "medicines-manage" ? (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 p-8">
              <div className="flex justify-between items-center mb-6 border-b border-[#e8ecec] pb-4">
                <h3 className="text-xl font-bold text-[#0a3f41] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#5adace] text-2xl">
                    {editingMedicineId ? "edit_note" : "add_circle"}
                  </span>
                  {editingMedicineId ? "Edit Medicine Product" : "Add New Medicine Product"}
                </h3>
                {editingMedicineId && (
                  <button
                    type="button"
                    onClick={() => setEditingMedicineId(null)}
                    className="text-xs font-bold text-[#6b8c8c] hover:text-red-500 transition-colors underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span> Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={editingMedicineId ? submitEditMedicine : handleAddMedicine} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Medicine Name *</label>
                  <input type="text" value={editingMedicineId ? editMedicineForm.name : newMedicineForm.name} onChange={e => editingMedicineId ? setEditMedicineForm({...editMedicineForm, name: e.target.value}) : setNewMedicineForm({...newMedicineForm, name: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace]" placeholder="e.g. Paracetamol 500mg" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Category *</label>
                  <select value={editingMedicineId ? editMedicineForm.category : newMedicineForm.category} onChange={e => editingMedicineId ? setEditMedicineForm({...editMedicineForm, category: e.target.value}) : setNewMedicineForm({...newMedicineForm, category: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-bold focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace]">
                    <option value="General Care">General Care</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Ayurvedic">Ayurvedic</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="OTC Medicines">OTC Medicines</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Selling Price (₹) *</label>
                  <input type="number" value={editingMedicineId ? editMedicineForm.price : newMedicineForm.price} onChange={e => editingMedicineId ? setEditMedicineForm({...editMedicineForm, price: e.target.value}) : setNewMedicineForm({...newMedicineForm, price: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace]" placeholder="e.g. 120" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Original MRP (₹)</label>
                  <input type="number" value={editingMedicineId ? editMedicineForm.originalPrice : newMedicineForm.originalPrice} onChange={e => editingMedicineId ? setEditMedicineForm({...editMedicineForm, originalPrice: e.target.value}) : setNewMedicineForm({...newMedicineForm, originalPrice: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace]" placeholder="e.g. 150" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Product Description & Usage</label>
                  <textarea rows={3} value={editingMedicineId ? editMedicineForm.description : newMedicineForm.description} onChange={e => editingMedicineId ? setEditMedicineForm({...editMedicineForm, description: e.target.value}) : setNewMedicineForm({...newMedicineForm, description: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace]" placeholder="Product details, dosage, ingredients, usage..." />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-bold text-[#0a3f41]">Inventory Availability *</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => editingMedicineId ? setEditMedicineForm({...editMedicineForm, inStock: true}) : setNewMedicineForm({...newMedicineForm, inStock: true})}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                        (editingMedicineId ? editMedicineForm.inStock : newMedicineForm.inStock) !== false
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-[#f5f7f7] text-[#6b8c8c] border-[#e8ecec] hover:bg-gray-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => editingMedicineId ? setEditMedicineForm({...editMedicineForm, inStock: false}) : setNewMedicineForm({...newMedicineForm, inStock: false})}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                        (editingMedicineId ? editMedicineForm.inStock : newMedicineForm.inStock) === false
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : "bg-[#f5f7f7] text-[#6b8c8c] border-[#e8ecec] hover:bg-gray-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">do_not_disturb_on</span>
                      Sold Out
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl font-bold text-[#0a3f41] cursor-pointer hover:bg-[#e8ecec]/50 transition-colors">
                    <input type="checkbox" checked={editingMedicineId ? editMedicineForm.isPrescriptionRequired : newMedicineForm.isPrescriptionRequired} onChange={e => editingMedicineId ? setEditMedicineForm({...editMedicineForm, isPrescriptionRequired: e.target.checked}) : setNewMedicineForm({...newMedicineForm, isPrescriptionRequired: e.target.checked})} className="w-5 h-5 text-[#5adace] rounded focus:ring-[#5adace]" />
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-lg">prescriptions</span>
                      Prescription Required (Rx)
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5adace]">add_photo_alternate</span>
                    Product Image
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      id="admin-medicine-image-upload"
                      accept="image/*"
                      onChange={e => {
                        const f = e.target.files?.[0] || null;
                        editingMedicineId ? setEditMedicineForm({...editMedicineForm, image: f}) : setNewMedicineForm({...newMedicineForm, image: f});
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="admin-medicine-image-upload"
                      className="flex flex-col items-center justify-center p-6 bg-[#f5f7f7] border-2 border-dashed border-[#5adace]/40 hover:border-[#5adace] rounded-2xl cursor-pointer transition-all hover:bg-[#5adace]/5 group-hover:scale-[1.005]"
                    >
                      {((editingMedicineId ? editMedicineForm.image : newMedicineForm.image) || (editingMedicineId && allMedicines.find(m => m.id === editingMedicineId)?.imageurl)) ? (
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-[#e8ecec]">
                            <img
                              src={
                                (editingMedicineId ? editMedicineForm.image : newMedicineForm.image)
                                  ? URL.createObjectURL((editingMedicineId ? editMedicineForm.image : newMedicineForm.image)!)
                                  : `${getApiBaseUrl()}${allMedicines.find(m => m.id === editingMedicineId)?.imageurl}`
                              }
                              alt="Medicine Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#0a3f41] truncate">
                              {(editingMedicineId ? editMedicineForm.image : newMedicineForm.image)?.name || "Current Product Image"}
                            </p>
                            <p className="text-xs text-[#5adace] font-semibold mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">published_with_changes</span>
                              Click to choose a different photo
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-[#5adace] shadow-sm border border-[#5adace]/20 group-hover:bg-[#5adace] group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                          </div>
                          <p className="text-sm font-bold text-[#0a3f41]">Click to Upload Product Image</p>
                          <p className="text-xs text-[#6b8c8c] mt-0.5">Supports PNG, JPG, or WebP formats</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-2">
                  <button type="submit" disabled={isUpdating} className="px-8 py-4 bg-[#0a3f41] text-white font-bold rounded-xl shadow-md hover:bg-[#0a3f41]/90 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined">{editingMedicineId ? "save" : "add_shopping_cart"}</span>
                    {editingMedicineId ? "Update Medicine Product" : "Save & Publish Medicine"}
                  </button>
                  {editingMedicineId && (
                    <button type="button" onClick={() => setEditingMedicineId(null)} className="px-8 py-4 bg-[#e8ecec] text-[#0a3f41] font-bold rounded-xl hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
              <div className="p-6 border-b border-[#e8ecec] bg-[#f5f7f7]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#0a3f41] text-lg">
                    Medicine Inventory Catalog (
                    {allMedicines.filter((med) => {
                      if (activeFilters.search) {
                        const q = activeFilters.search.toLowerCase().trim();
                        const matchName = med.name?.toLowerCase().includes(q);
                        const matchCat = med.category?.toLowerCase().includes(q);
                        if (!matchName && !matchCat) return false;
                      }
                      return true;
                    }).length}
                    )
                  </h3>
                  <p className="text-xs text-[#6b8c8c]">Click on Stock Status pill to instantly toggle between In Stock and Sold Out.</p>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-[#e8ecec] focus-within:ring-2 focus-within:ring-[#5adace]/50 transition-all w-full md:w-80 shadow-2xs">
                  <span className="material-symbols-outlined text-[#6b8c8c] text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Search medicine name..."
                    value={activeFilters.search || ""}
                    onChange={(e) => setFilter("search", e.target.value)}
                    className="bg-transparent border-none text-[#0a3f41] font-medium outline-none placeholder:text-[#6b8c8c] text-sm w-full"
                  />
                  {activeFilters.search && (
                    <button onClick={() => setFilter("search", "")} className="text-[#6b8c8c] hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f7f7] text-[#0a3f41] font-bold text-xs uppercase border-b border-[#e8ecec]">
                  <tr>
                    <th className="p-5">Product</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Price</th>
                    <th className="p-5">Stock Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ecec]">
                  {allMedicines
                    .filter((med) => {
                      if (activeFilters.search) {
                        const q = activeFilters.search.toLowerCase().trim();
                        const matchName = med.name?.toLowerCase().includes(q);
                        const matchCat = med.category?.toLowerCase().includes(q);
                        if (!matchName && !matchCat) return false;
                      }
                      return true;
                    })
                    .map(med => (
                    <tr key={med.id} className={`hover:bg-[#f5f7f7]/50 transition-colors ${med.inStock === false ? 'bg-red-50/20' : ''}`}>
                      <td className="p-5 flex items-center gap-3">
                        <img src={`${getApiBaseUrl()}${med.imageurl}`} alt={med.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-[#e8ecec]" />
                        <div>
                          <p className="font-bold text-[#0a3f41]">{med.name}</p>
                          {med.isPrescriptionRequired && <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5">Rx Required</span>}
                        </div>
                      </td>
                      <td className="p-5 text-sm text-[#6b8c8c] font-medium">{med.category || "General Care"}</td>
                      <td className="p-5 text-sm font-bold text-[#0a3f41]">
                        ₹{med.price} {med.originalPrice && <span className="text-xs text-gray-400 line-through ml-1 font-normal">₹{med.originalPrice}</span>}
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => handleToggleMedicineStock(med.id, med.inStock !== false)}
                          className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer ${
                            med.inStock !== false
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200"
                          }`}
                          title="Click to toggle Stock Status"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {med.inStock !== false ? "check_circle" : "do_not_disturb_on"}
                          </span>
                          {med.inStock !== false ? "In Stock" : "Sold Out"}
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMedicineId(med.id);
                              setEditMedicineForm({
                                name: med.name,
                                category: med.category || "General Care",
                                price: String(med.price),
                                originalPrice: String(med.originalPrice || ""),
                                description: med.description || "",
                                inStock: med.inStock !== false,
                                isPrescriptionRequired: med.isPrescriptionRequired === true,
                                image: null
                              });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Product"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allMedicines.filter((med) => {
                    if (activeFilters.search) {
                      const q = activeFilters.search.toLowerCase().trim();
                      const matchName = med.name?.toLowerCase().includes(q);
                      const matchCat = med.category?.toLowerCase().includes(q);
                      if (!matchName && !matchCat) return false;
                    }
                    return true;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#6b8c8c]">
                        {activeFilters.search ? `No medicines found matching "${activeFilters.search}"` : "No medicines added to the store catalog yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "medicine-orders" ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
            <div className="p-8 border-b border-[#0a3f41]/5 flex justify-between items-center">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-[#0a3f41] font-bold">Medicine Orders</h2>
                <p className="text-[#6b8c8c] mt-1">Manage and track medicine deliveries, status, and bills.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8fafa] text-[#6b8c8c] text-sm text-left border-b border-[#e8ecec]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order ID & Date</th>
                    <th className="px-6 py-4 font-semibold">Patient Details</th>
                    <th className="px-6 py-4 font-semibold">Delivery Address</th>
                    <th className="px-6 py-4 font-semibold">Medicines Ordered</th>
                    <th className="px-6 py-4 font-semibold">Total Paid</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Medicine Bill</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a3f41]/5">
                  {(() => {
                    const filtered = allMedicineOrders.filter(order => {
                      if (order.status === "Deleted") return false;

                      const search = (filters["medicine-orders"]?.search || "").toLowerCase().trim();
                      const date = (filters["medicine-orders"] as any)?.date || "";
                      const status = (filters["medicine-orders"] as any)?.status || "";

                      if (search) {
                        const orderId = (order.id || "").toLowerCase();
                        const patientName = (order.patientDetails?.name || "").toLowerCase();
                        const patientPhone = (order.patientDetails?.phone || order.userPhone || "").toLowerCase();
                        const address = (order.patientDetails?.address || "").toLowerCase();
                        const matches = orderId.includes(search) || patientName.includes(search) || patientPhone.includes(search) || address.includes(search);
                        if (!matches) return false;
                      }

                      if (date) {
                        const orderDateStr = order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "";
                        if (orderDateStr !== date) return false;
                      }

                      if (status) {
                        if ((order.status || "Placed") !== status) return false;
                      }

                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="px-8 py-12 text-center text-[#6b8c8c]">No medicine orders found.</td>
                        </tr>
                      );
                    }

                    return filtered.map(order => {
                      const isDelivered = order.status === "Delivered";
                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors ${
                            isDelivered ? "bg-emerald-50/70 hover:bg-emerald-100/70" : "hover:bg-[#f8fafa]/50"
                          }`}
                        >
                          <td className="px-6 py-4 align-top">
                            <p className="font-bold text-[#0a3f41]">{order.id}</p>
                            <p className="text-sm text-[#6b8c8c]">{new Date(order.createdAt).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4 align-top text-sm text-[#0a3f41]">
                            <p className="font-medium">{order.patientDetails?.name}</p>
                            <p className="text-[#6b8c8c]">{order.patientDetails?.phone}</p>
                          </td>
                          <td className="px-6 py-4 align-top text-sm text-[#0a3f41]">
                            <div className="flex flex-col gap-0.5">
                              {order.patientDetails?.address && <p className="text-[#6b8c8c] text-xs max-w-[150px] truncate" title={order.patientDetails.address}>{order.patientDetails.address}</p>}
                              {order.patientDetails?.streetNo && <p className="text-[#6b8c8c] text-xs">St: {order.patientDetails.streetNo}</p>}
                              {order.patientDetails?.buildingNo && <p className="text-[#6b8c8c] text-xs">Bldg: {order.patientDetails.buildingNo}</p>}
                              {order.patientDetails?.landmark && <p className="text-[#6b8c8c] text-xs">Landmark: {order.patientDetails.landmark}</p>}
                              {order.patientDetails?.pincode && <p className="text-[#6b8c8c] text-xs">PIN: {order.patientDetails.pincode}</p>}
                              {!order.patientDetails?.address && !order.patientDetails?.streetNo && <p className="text-[#6b8c8c] text-xs italic">N/A</p>}
                              {order.patientDetails?.lat && order.patientDetails?.lon && (
                                <a href={`https://maps.google.com/?q=${order.patientDetails.lat},${order.patientDetails.lon}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-0.5 mt-1">
                                  <span className="material-symbols-outlined text-[14px]">location_on</span> View Map
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <ul className="text-sm text-[#6b8c8c]">
                              {order.items?.map((item: any, idx: number) => (
                                <li key={idx}>{item.quantity}x {item.name}</li>
                              ))}
                            </ul>
                            {order.prescriptionUrl ? (
                              <div className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
                                <span className="material-symbols-outlined text-sm text-amber-600">description</span>
                                <span>Prescription</span>
                                <a
                                  href={`${getApiBaseUrl()}${order.prescriptionUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-1 text-[#0a3f41] hover:text-[#5adace] underline flex items-center gap-0.5"
                                >
                                  View <span className="material-symbols-outlined text-xs">open_in_new</span>
                                </a>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-medium italic mt-2 block">No Prescription</span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top font-bold text-[#0a3f41]">₹{order.finalAmount || order.finalTotal}</td>
                          <td className="px-6 py-4 align-top">
                            <select
                              value={order.status || "Placed"}
                              onChange={(e) => updateMedicineOrderStatus(order.id, e.target.value)}
                              className={`border rounded-lg px-3 py-1.5 text-xs font-extrabold focus:outline-none transition-all cursor-pointer shadow-2xs ${
                                isDelivered
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-amber-100 text-amber-900 border-amber-300"
                              }`}
                            >
                              <option value="Placed" className="bg-white text-[#0a3f41] font-medium">Placed</option>
                              <option value="Delivered" className="bg-white text-[#0a3f41] font-medium">Delivered</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 align-top">
                            {order.billUrl ? (
                              <div className="flex flex-col gap-1">
                                <a
                                  href={`${getApiBaseUrl()}${order.billUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors shadow-2xs"
                                >
                                  <span className="material-symbols-outlined text-sm text-emerald-700">receipt_long</span>
                                  View Bill
                                </a>
                                <label className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5 mt-0.5">
                                  <span className="material-symbols-outlined text-[12px]">upload</span>
                                  Replace Bill
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) uploadMedicineOrderBill(order.id, f);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="inline-flex items-center gap-1 bg-white border border-[#5adace]/50 hover:border-[#5adace] hover:bg-[#5adace]/10 text-[#0a3f41] px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-2xs">
                                <span className="material-symbols-outlined text-sm text-[#5adace]">upload_file</span>
                                Upload Bill
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) uploadMedicineOrderBill(order.id, f);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top text-right">
                            <button onClick={() => deleteMedicineOrder(order.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors p-2" title="Delete Order">
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "events-manage" ? (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 p-8">
              <h3 className="text-xl font-bold text-[#0a3f41] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5adace]">event</span>
                {editingEventId ? "Edit Event" : "Create New Community Event"}
              </h3>
              <form onSubmit={editingEventId ? submitEditEvent : handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Event Title *</label>
                  <input type="text" value={editingEventId ? editEventForm.title : newEventForm.title} onChange={e => editingEventId ? setEditEventForm({...editEventForm, title: e.target.value}) : setNewEventForm({...newEventForm, title: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50" placeholder="e.g. Free Health Checkup Camp" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Event Date *</label>
                  <input type="date" value={editingEventId ? editEventForm.date : newEventForm.date} onChange={e => editingEventId ? setEditEventForm({...editEventForm, date: e.target.value}) : setNewEventForm({...newEventForm, date: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Event Details *</label>
                  <textarea rows={3} value={editingEventId ? editEventForm.details : newEventForm.details} onChange={e => editingEventId ? setEditEventForm({...editEventForm, details: e.target.value}) : setNewEventForm({...newEventForm, details: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50" placeholder="Provide event schedule, location, highlights..." required />
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#0a3f41] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#5adace]">add_photo_alternate</span>
                      Event Photos (Upload up to 10 photos)
                    </label>
                    <span className="text-xs font-bold text-[#6b8c8c]">
                      {(editingEventId ? editEventForm.keepImages.length + editEventForm.images.length : newEventForm.images.length)} / 10 photos
                    </span>
                  </div>

                  {/* Dropzone Box */}
                  <div className="relative group">
                    <input
                      type="file"
                      id="event-photos-upload"
                      multiple
                      accept="image/*"
                      disabled={(editingEventId ? editEventForm.keepImages.length + editEventForm.images.length : newEventForm.images.length) >= 10}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;

                        const currentCount = editingEventId
                          ? editEventForm.keepImages.length + editEventForm.images.length
                          : newEventForm.images.length;
                        
                        if (currentCount + files.length > 10) {
                          alert("You can upload a maximum of 10 photos per event.");
                        }

                        const allowedNewFiles = files.slice(0, 10 - currentCount);

                        if (editingEventId) {
                          setEditEventForm({
                            ...editEventForm,
                            images: [...editEventForm.images, ...allowedNewFiles]
                          });
                        } else {
                          setNewEventForm({
                            ...newEventForm,
                            images: [...newEventForm.images, ...allowedNewFiles]
                          });
                        }
                        
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="event-photos-upload"
                      className={`flex flex-col items-center justify-center p-6 bg-[#f5f7f7] border-2 border-dashed border-[#5adace]/40 rounded-2xl transition-all ${
                        (editingEventId ? editEventForm.keepImages.length + editEventForm.images.length : newEventForm.images.length) >= 10
                          ? "opacity-60 cursor-not-allowed border-gray-300"
                          : "hover:border-[#5adace] cursor-pointer hover:bg-[#5adace]/5 group-hover:scale-[1.005]"
                      }`}
                    >
                      <div className="text-center py-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-[#5adace] shadow-sm border border-[#5adace]/20 group-hover:bg-[#5adace] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        </div>
                        <p className="text-sm font-bold text-[#0a3f41]">
                          {(editingEventId ? editEventForm.keepImages.length + editEventForm.images.length : newEventForm.images.length) >= 10
                            ? "Maximum 10 Photos Reached"
                            : "Click or Drag Photos to Add (Max 10)"}
                        </p>
                        <p className="text-xs text-[#6b8c8c] mt-0.5">Supports PNG, JPG, JPEG, or WebP</p>
                      </div>
                    </label>
                  </div>

                  {/* Thumbnail Preview Grid */}
                  {((editingEventId ? editEventForm.keepImages.length + editEventForm.images.length : newEventForm.images.length) > 0) && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {/* Existing Kept Images */}
                      {editingEventId && editEventForm.keepImages.map((imgUrl, idx) => (
                        <div key={`keep-${idx}`} className="relative group/thumb aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-[#e8ecec] shadow-2xs">
                          <img
                            src={`${getApiBaseUrl()}${imgUrl}`}
                            alt="Event thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditEventForm({
                                ...editEventForm,
                                keepImages: editEventForm.keepImages.filter((_, i) => i !== idx)
                              });
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-90 group-hover/thumb:opacity-100 cursor-pointer"
                            title="Remove photo"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                            Saved #{idx + 1}
                          </span>
                        </div>
                      ))}

                      {/* Newly Selected Files */}
                      {(editingEventId ? editEventForm.images : newEventForm.images).map((file, idx) => (
                        <div key={`new-${idx}`} className="relative group/thumb aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-[#e8ecec] shadow-2xs">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="New upload preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editingEventId) {
                                setEditEventForm({
                                  ...editEventForm,
                                  images: editEventForm.images.filter((_, i) => i !== idx)
                                });
                              } else {
                                setNewEventForm({
                                  ...newEventForm,
                                  images: newEventForm.images.filter((_, i) => i !== idx)
                                });
                              }
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-90 group-hover/thumb:opacity-100 cursor-pointer"
                            title="Remove photo"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                          <span className="absolute bottom-1 left-1 bg-[#5adace] text-[#0a3f41] text-[10px] px-1.5 py-0.5 rounded font-mono font-extrabold">
                            New #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex gap-4 pt-2">
                  <button type="submit" disabled={isUpdating} className="px-8 py-4 bg-[#0a3f41] text-white font-bold rounded-xl shadow-md hover:bg-[#0a3f41]/90 transition-all flex items-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined">{editingEventId ? "save" : "event"}</span>
                    {editingEventId ? "Update Event" : "Create & Publish Event"}
                  </button>
                  {editingEventId && (
                    <button type="button" onClick={() => setEditingEventId(null)} className="px-8 py-4 bg-gray-200 text-[#0a3f41] font-bold rounded-xl hover:bg-gray-300 transition-colors cursor-pointer">Cancel</button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
              <div className="p-6 border-b border-[#e8ecec] bg-[#f5f7f7]/50">
                <h3 className="font-bold text-[#0a3f41] text-lg">Community Events ({allEvents.length})</h3>
                <p className="text-xs text-[#6b8c8c]">All published events appear on the website's Our Events page with slidable image carousels.</p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f7f7] text-[#0a3f41] font-bold text-xs uppercase border-b border-[#e8ecec]">
                  <tr>
                    <th className="p-5">Photos</th>
                    <th className="p-5">Event Title</th>
                    <th className="p-5">Date</th>
                    <th className="p-5">Details</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ecec]">
                  {allEvents.map(ev => (
                    <tr key={ev.id} className="hover:bg-[#f5f7f7]/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-1.5">
                          {ev.images && ev.images.length > 0 ? (
                            <>
                              {ev.images.slice(0, 3).map((img: string, i: number) => (
                                <img
                                  key={i}
                                  src={`${getApiBaseUrl()}${img}`}
                                  alt="Event thumbnail"
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-[#e8ecec]"
                                />
                              ))}
                              {ev.images.length > 3 && (
                                <span className="w-8 h-8 rounded-lg bg-[#e8ecec] text-[#0a3f41] text-xs font-bold flex items-center justify-center">
                                  +{ev.images.length - 3}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-[#6b8c8c] italic">No photos</span>
                          )}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-[#0a3f41]">{ev.title}</td>
                      <td className="p-5 text-sm text-[#6b8c8c] font-medium">{ev.date}</td>
                      <td className="p-5 text-sm text-[#6b8c8c] truncate max-w-[200px]">{ev.details}</td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingEventId(ev.id); setEditEventForm({ title: ev.title, date: ev.date, details: ev.details, images: [], keepImages: ev.images || [] }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer" title="Edit Event"><span className="material-symbols-outlined text-lg">edit</span></button>
                          <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Delete Event"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#6b8c8c] italic">
                        No community events created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "coupons-manage" ? (
          <div className="space-y-8 animate-fade-in max-w-5xl">
            {/* Sub-tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCouponSubTab("medicine")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${couponSubTab === "medicine" ? "bg-[#0a3f41] text-white shadow-md" : "bg-white text-[#6b8c8c] hover:bg-[#e8ecec] border border-[#e8ecec]"}`}
              >
                <span className="material-symbols-outlined text-xl">medication</span>
                Medicine Coupons
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${couponSubTab === "medicine" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{medicineCoupons.length}</span>
              </button>
              <button
                onClick={() => setCouponSubTab("pathology")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${couponSubTab === "pathology" ? "bg-[#0a3f41] text-white shadow-md" : "bg-white text-[#6b8c8c] hover:bg-[#e8ecec] border border-[#e8ecec]"}`}
              >
                <span className="material-symbols-outlined text-xl">biotech</span>
                Pathology Coupons
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${couponSubTab === "pathology" ? "bg-white/20" : "bg-[#e8ecec]"}`}>{pathologyCoupons.length}</span>
              </button>
            </div>

            {/* Add Coupon Form */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#e8ecec] p-8">
              <h3 className="text-xl font-bold text-[#0a3f41] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5adace]">add_circle</span>
                Add New {couponSubTab === "medicine" ? "Medicine" : "Pathology"} Coupon
              </h3>
              <form onSubmit={e => { e.preventDefault(); handleAddCoupon(couponSubTab); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Coupon Code *</label>
                  <input type="text" value={newCouponForm.code} onChange={e => setNewCouponForm({...newCouponForm, code: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border-none rounded-xl font-mono uppercase tracking-wider text-[#0a3f41] font-bold" placeholder="e.g. SAVE20" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Discount *</label>
                  <div className="flex gap-3">
                    <input type="number" value={newCouponForm.discount} onChange={e => setNewCouponForm({...newCouponForm, discount: e.target.value})} className="flex-1 p-4 bg-[#f5f7f7] border-none rounded-xl text-[#0a3f41] font-medium" placeholder="e.g. 20" required />
                    <select value={newCouponForm.discountType} onChange={e => setNewCouponForm({...newCouponForm, discountType: e.target.value})} className="p-4 bg-[#f5f7f7] border-none rounded-xl font-bold text-[#0a3f41]">
                      <option value="percentage">%</option>
                      <option value="flat">₹ Flat</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Min Order (₹)</label>
                  <input type="number" value={newCouponForm.minOrder} onChange={e => setNewCouponForm({...newCouponForm, minOrder: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border-none rounded-xl text-[#0a3f41] font-medium" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Max Discount (₹)</label>
                  <input type="number" value={newCouponForm.maxDiscount} onChange={e => setNewCouponForm({...newCouponForm, maxDiscount: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border-none rounded-xl text-[#0a3f41] font-medium" placeholder="e.g. 200" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Valid From</label>
                  <input type="date" value={newCouponForm.validFrom} onChange={e => setNewCouponForm({...newCouponForm, validFrom: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border-none rounded-xl text-[#0a3f41] font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2">Valid To</label>
                  <input type="date" value={newCouponForm.validTo} onChange={e => setNewCouponForm({...newCouponForm, validTo: e.target.value})} className="w-full p-4 bg-[#f5f7f7] border-none rounded-xl text-[#0a3f41] font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#0a3f41] mb-2 flex items-center justify-between">
                    <span>Coupon Description (Auto-generated with Code at Beginning)</span>
                    <span className="text-xs text-[#5adace] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">campaign</span>
                      Auto-syncs to Announcement Bar
                    </span>
                  </label>
                  <textarea
                    value={
                      newCouponForm.description ||
                      generateCouponDescription(
                        newCouponForm.code,
                        newCouponForm.discount,
                        newCouponForm.discountType,
                        newCouponForm.minOrder,
                        newCouponForm.maxDiscount,
                        newCouponForm.validTo,
                        couponSubTab === "medicine" ? "Medicines" : "Pathology Tests"
                      )
                    }
                    onChange={e => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                    className="w-full p-4 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl resize-none text-[#0a3f41] font-medium focus:outline-none focus:ring-2 focus:ring-[#5adace]/50"
                    rows={2}
                    placeholder="Description will be generated automatically as you fill coupon conditions..."
                  />
                  <p className="text-xs text-[#6b8c8c] mt-1">
                    This description starts with the coupon code and will automatically sync to the Announcement Bar on the user website when activated.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={isUpdating} className="w-full py-4 bg-[#0a3f41] text-white rounded-xl font-bold hover:bg-[#0a3f41]/90 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xl">add</span>
                    {isUpdating ? "Creating..." : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#0a3f41] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#5adace]">confirmation_number</span>
                Current {couponSubTab === "medicine" ? "Medicine" : "Pathology"} Coupons
              </h3>
              {(couponSubTab === "medicine" ? medicineCoupons : pathologyCoupons).length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-[#e8ecec] p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#ccd5d5] mb-4">confirmation_number</span>
                  <p className="text-[#6b8c8c] text-lg">No {couponSubTab} coupons created yet.</p>
                </div>
              ) : (
                (couponSubTab === "medicine" ? medicineCoupons : pathologyCoupons).map((coupon: any) => (
                  <div key={coupon.id} className={`bg-white rounded-3xl shadow-sm border ${coupon.isActive ? "border-[#5adace]" : "border-[#e8ecec] opacity-60"} p-6 transition-all`}>
                    {editingCouponId === coupon.id ? (
                      <form onSubmit={e => { e.preventDefault(); handleEditCoupon(couponSubTab); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" value={editCouponForm.code} onChange={e => setEditCouponForm({...editCouponForm, code: e.target.value})} className="p-3 bg-[#f5f7f7] border-none rounded-xl font-mono uppercase font-bold" required />
                        <div className="flex gap-2">
                          <input type="number" value={editCouponForm.discount} onChange={e => setEditCouponForm({...editCouponForm, discount: e.target.value})} className="flex-1 p-3 bg-[#f5f7f7] border-none rounded-xl font-medium" required />
                          <select value={editCouponForm.discountType} onChange={e => setEditCouponForm({...editCouponForm, discountType: e.target.value})} className="p-3 bg-[#f5f7f7] border-none rounded-xl font-bold">
                            <option value="percentage">%</option>
                            <option value="flat">₹ Flat</option>
                          </select>
                        </div>
                        <input type="number" value={editCouponForm.minOrder} onChange={e => setEditCouponForm({...editCouponForm, minOrder: e.target.value})} className="p-3 bg-[#f5f7f7] border-none rounded-xl" placeholder="Min Order" />
                        <input type="number" value={editCouponForm.maxDiscount} onChange={e => setEditCouponForm({...editCouponForm, maxDiscount: e.target.value})} className="p-3 bg-[#f5f7f7] border-none rounded-xl" placeholder="Max Discount" />
                        <input type="date" value={editCouponForm.validFrom} onChange={e => setEditCouponForm({...editCouponForm, validFrom: e.target.value})} className="p-3 bg-[#f5f7f7] border-none rounded-xl" />
                        <input type="date" value={editCouponForm.validTo} onChange={e => setEditCouponForm({...editCouponForm, validTo: e.target.value})} className="p-3 bg-[#f5f7f7] border-none rounded-xl" />
                        <textarea value={editCouponForm.description} onChange={e => setEditCouponForm({...editCouponForm, description: e.target.value})} className="md:col-span-2 p-3 bg-[#f5f7f7] border-none rounded-xl resize-none" rows={2} />
                        <div className="md:col-span-2 flex gap-3">
                          <button type="submit" disabled={isUpdating} className="flex-1 py-3 bg-[#0a3f41] text-white rounded-xl font-bold">Save</button>
                          <button type="button" onClick={() => setEditingCouponId(null)} className="px-6 py-3 bg-[#f5f7f7] rounded-xl font-bold text-[#6b8c8c]">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#0a3f41] to-[#5adace] rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-white">confirmation_number</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-lg text-[#0a3f41] tracking-wider">{coupon.code}</span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                                {coupon.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-[#6b8c8c] mt-1">
                              {coupon.discount}{coupon.discountType === "percentage" ? "%" : "₹"} off
                              {coupon.minOrder > 0 ? ` • Min ₹${coupon.minOrder}` : ""}
                              {coupon.maxDiscount > 0 ? ` • Max ₹${coupon.maxDiscount}` : ""}
                              {coupon.validFrom ? ` • ${coupon.validFrom}` : ""}
                              {coupon.validTo ? ` to ${coupon.validTo}` : ""}
                            </p>
                            {coupon.description && <p className="text-xs text-[#8ca8a8] mt-1">{coupon.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleCoupon(couponSubTab, coupon.id, coupon.isActive)} className={`p-2 rounded-xl transition-colors ${coupon.isActive ? "hover:bg-yellow-50 text-yellow-600" : "hover:bg-green-50 text-green-600"}`} title={coupon.isActive ? "Deactivate" : "Activate"}>
                            <span className="material-symbols-outlined">{coupon.isActive ? "toggle_on" : "toggle_off"}</span>
                          </button>
                          <button onClick={() => { setEditingCouponId(coupon.id); setEditCouponForm({ code: coupon.code, discount: String(coupon.discount), discountType: coupon.discountType, minOrder: String(coupon.minOrder || ""), maxDiscount: String(coupon.maxDiscount || ""), validFrom: coupon.validFrom || "", validTo: coupon.validTo || "", description: coupon.description || "" }); }} className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors" title="Edit">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button onClick={() => handleDeleteCoupon(couponSubTab, coupon.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
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
                    className="w-full px-4 py-3 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5adace]/50 focus:border-[#5adace] transition-all font-medium text-[#0a3f41]"
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

            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#0a3f41]/5 overflow-hidden">
              <div className="p-6 border-b border-[#e8ecec] bg-[#f5f7f7]/50">
                <h3 className="font-bold text-[#0a3f41] text-lg">Historical & Active Announcements</h3>
                <p className="text-xs text-[#6b8c8c]">Active announcement will automatically display in the top scrolling bar across the user site.</p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f7f7] text-[#0a3f41] border-b border-[#e8ecec]">
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Announcement Text</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Status</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs">Date Created</th>
                    <th className="p-5 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ecec]">
                  {announcements.map((item) => {
                    const isActive = item.isActive !== false;
                    const isEditing = editingAnnouncementId === item.id;
                    return (
                      <tr key={item.id} className={`hover:bg-[#f5f7f7]/50 transition-colors ${!isActive ? "opacity-60 bg-gray-50/50" : ""}`}>
                        <td className="p-5">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingAnnouncementText}
                                onChange={(e) => setEditingAnnouncementText(e.target.value)}
                                className="flex-1 p-2 bg-[#f5f7f7] border border-[#e8ecec] rounded-xl text-sm font-bold text-[#0a3f41]"
                              />
                              <button
                                onClick={() => handleSaveEditAnnouncement(item.id)}
                                className="px-3 py-1 bg-[#0a3f41] text-white rounded-xl text-xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAnnouncementId(null)}
                                className="px-3 py-1 bg-[#e8ecec] text-[#0a3f41] rounded-xl text-xs font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="font-bold text-[#0a3f41]">{item.text}</div>
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-5 text-sm text-[#6b8c8c]">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleAnnouncement(item.id, isActive)}
                              className={`p-2 rounded-xl transition-colors ${isActive ? "hover:bg-yellow-50 text-yellow-600" : "hover:bg-green-50 text-green-600"}`}
                              title={isActive ? "Deactivate" : "Activate"}
                            >
                              <span className="material-symbols-outlined">{isActive ? "toggle_on" : "toggle_off"}</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingAnnouncementId(item.id);
                                setEditingAnnouncementText(item.text);
                              }}
                              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="Edit Announcement"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(item.id)}
                              className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                              title="Delete Announcement"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {announcements.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#6b8c8c]">
                        No announcements created yet. Use the form on the left to set an announcement.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>) : activeTab === "customers" ? (
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
                      const userPhone = user.phone;
                      const userEmail = user.email;
                      // Match bookings by phone OR userPhone OR userEmail
                      const userBookings = bookings.filter(b =>
                        b.status !== "Deleted" && (
                          b.phone === userPhone ||
                          b.userPhone === userPhone ||
                          (userEmail && b.userEmail === userEmail)
                        )
                      );
                      // Match medicine orders by userPhone OR patientDetails.phone
                      const userMedicineOrders = allMedicineOrders.filter(o =>
                        o.status !== "Deleted" && (
                          o.userPhone === userPhone ||
                          (o.patientDetails && o.patientDetails.phone === userPhone) ||
                          (userEmail && o.userEmail === userEmail)
                        )
                      );
                      const totalCount = userBookings.length + userMedicineOrders.length;
                      const isExpanded = expandedUserId === user.id;

                      // Separate bookings by type
                      const doctorBookings = userBookings.filter(b => b.type === "Clinic Appointment" || b.doctor);
                      const pathologyBookings = userBookings.filter(b => b.type === "Home Collection Request" || b.selectedTests);

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
                              <div className="flex flex-col gap-1">
                                <span className="inline-block px-3 py-1 bg-[#5adace]/10 text-[#0a3f41] rounded-lg font-bold text-sm">
                                  {totalCount} Bookings
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {doctorBookings.length > 0 && (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                      {doctorBookings.length} Doctor
                                    </span>
                                  )}
                                  {pathologyBookings.length > 0 && (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                      {pathologyBookings.length} Pathology
                                    </span>
                                  )}
                                  {userMedicineOrders.length > 0 && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      {userMedicineOrders.length} Medicine
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-5 font-medium text-[#6b8c8c] text-sm">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A"}
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
                                  {totalCount === 0 ? (
                                    <p className="text-[#6b8c8c] text-sm italic">No bookings found for this customer.</p>
                                  ) : (
                                    <div className="space-y-6">
                                      {/* Doctor Appointments */}
                                      {doctorBookings.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                                            Doctor Appointments ({doctorBookings.length})
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {doctorBookings.map(b => (
                                              <div key={b.id} className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                  <span className="text-xs font-bold px-2 py-1 bg-blue-50 rounded text-blue-700">
                                                    {b.bookingNumber || b.id?.split('-')[0]}
                                                  </span>
                                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {b.status || 'Scheduled'}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-[#6b8c8c] mb-1 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                  {b.date ? new Date(b.date).toLocaleDateString() : 'Not Set'}
                                                </p>
                                                <p className="text-xs text-[#6b8c8c] flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">person</span>
                                                  {b.name} • {b.phone}
                                                </p>
                                                {b.doctor && (
                                                  <div className="text-xs text-[#0a3f41] bg-blue-50 p-2 rounded mt-2">
                                                    <span className="text-[#6b8c8c]">Doctor:</span> {b.doctor}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Pathology Bookings */}
                                      {pathologyBookings.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-bold text-purple-700 flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-[16px]">biotech</span>
                                            Pathology Services ({pathologyBookings.length})
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {pathologyBookings.map(b => (
                                              <div key={b.id} className="bg-white border border-purple-100 p-4 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                  <span className="text-xs font-bold px-2 py-1 bg-purple-50 rounded text-purple-700">
                                                    {b.bookingNumber || b.id?.split('-')[0]}
                                                  </span>
                                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {b.status || 'Scheduled'}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-[#6b8c8c] mb-1 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                  {b.date ? new Date(b.date).toLocaleDateString() : 'Not Set'}
                                                </p>
                                                <p className="text-xs text-[#6b8c8c] flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">person</span>
                                                  {b.name} • {b.phone}
                                                </p>
                                                {(b.selectedTests || (b.tests && b.tests.length > 0)) && (
                                                  <div className="text-xs text-[#0a3f41] bg-purple-50 p-2 rounded mt-2">
                                                    <span className="text-[#6b8c8c] block mb-1">Selected Tests:</span>
                                                    <div className="flex flex-wrap gap-1">
                                                      {b.selectedTests
                                                        ? b.selectedTests.split(',').map((test: string, i: number) => (
                                                          <span key={i} className="bg-white border border-purple-200 px-2 py-1 rounded text-[10px] whitespace-nowrap">{test.trim()}</span>
                                                        ))
                                                        : b.tests.map((t: any, i: number) => (
                                                          <span key={i} className="bg-white border border-purple-200 px-2 py-1 rounded text-[10px] whitespace-nowrap">{t.name}</span>
                                                        ))
                                                      }
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Medicine Orders */}
                                      {userMedicineOrders.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-3">
                                            <span className="material-symbols-outlined text-[16px]">medication</span>
                                            Medicine Orders ({userMedicineOrders.length})
                                          </h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {userMedicineOrders.map(order => (
                                              <div key={order.id} className="bg-white border border-emerald-100 p-4 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 rounded text-emerald-700">
                                                    {order.id}
                                                  </span>
                                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {order.status || 'Placed'}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-[#6b8c8c] mb-1 flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <p className="text-xs text-[#6b8c8c] flex items-center gap-1">
                                                  <span className="material-symbols-outlined text-[14px]">person</span>
                                                  {order.patientDetails?.name || "N/A"} • {order.patientDetails?.phone || order.userPhone || "N/A"}
                                                </p>
                                                {order.cart && order.cart.length > 0 && (
                                                  <div className="text-xs text-[#0a3f41] bg-emerald-50 p-2 rounded mt-2">
                                                    <span className="text-[#6b8c8c] block mb-1">Items ({order.cart.length}):</span>
                                                    <div className="flex flex-wrap gap-1">
                                                      {order.cart.map((item: any, i: number) => (
                                                        <span key={i} className="bg-white border border-emerald-200 px-2 py-1 rounded text-[10px] whitespace-nowrap">
                                                          {item.name} × {item.quantity}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                                {order.finalTotal && (
                                                  <p className="text-sm font-bold text-emerald-700 mt-2">Total: ₹{order.finalTotal}</p>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
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
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#0a3f41]/5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#0a3f41] text-lg">Manage Patient Reviews</h3>
                <p className="text-xs text-[#6b8c8c]">Review feedback for Doctors and Pathology Tests. Feature top reviews on the main website.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#0a3f41]/5">
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-[#6b8c8c]">No reviews found.</div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-[#0a3f41]">{review.patientName}</span>
                             {review.patientEmail && <span className="text-xs text-gray-500">({review.patientEmail})</span>}
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
                        <th className="p-5 font-bold uppercase tracking-widest text-xs">Transaction ID</th>
                      </>
                    ) : (
                      <>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs min-w-[200px]">Full Address</th>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs min-w-[250px]">Selected Tests</th>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs">Referral Doctor</th>
                        <th className="p-5 font-bold uppercase tracking-widest text-xs">Prescription</th>
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
                            <td className="p-5">
                              {booking.razorpayPaymentId ? (
                                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300 w-max">
                                  <span className="material-symbols-outlined text-[14px]">verified</span>
                                  <span className="text-xs font-bold">PAID (Auto-Verified)</span>
                                </div>
                              ) : (
                                <span className="text-xs text-[#6b8c8c] italic">Unpaid</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-5 text-[#6b8c8c] max-w-[200px] align-top">
                              <div className="flex flex-col gap-0.5">
                                {booking.address && <p className="line-clamp-2 text-xs" title={booking.address}>{booking.address}</p>}
                                {booking.streetNo && <p className="text-xs">St: {booking.streetNo}</p>}
                                {booking.buildingNo && <p className="text-xs">Bldg: {booking.buildingNo}</p>}
                                {booking.landmark && <p className="text-xs">Landmark: {booking.landmark}</p>}
                                {booking.pincode && <p className="text-xs">PIN: {booking.pincode}</p>}
                                {!booking.address && !booking.streetNo && <p className="text-xs italic">N/A</p>}
                                {booking.lat && booking.lon && (
                                  <a href={`https://maps.google.com/?q=${booking.lat},${booking.lon}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-0.5 mt-1 w-max">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span> View Map
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-5">
                              {editingTestsBookingId === booking.id ? (
                                <div className="space-y-3 relative bg-white p-4 rounded-xl border border-[#e8ecec] shadow-sm max-w-[300px]">
                                  <div className="flex justify-between items-center mb-2 border-b border-[#e8ecec] pb-2">
                                    <span className="text-xs font-bold text-[#0a3f41] uppercase tracking-widest">Edit Tests</span>
                                    <div className="flex gap-2">
                                      <button onClick={() => handleUpdateTests(booking.id)} disabled={isUpdating} className="text-[#5adace] hover:text-[#0a3f41] transition-colors"><span className="material-symbols-outlined text-lg">check_circle</span></button>
                                      <button onClick={() => setEditingTestsBookingId(null)} disabled={isUpdating} className="text-red-400 hover:text-red-600 transition-colors"><span className="material-symbols-outlined text-lg">cancel</span></button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {editingTestsList.map(code => {
                                      const test = allTests.find(t => t.code === code);
                                      return (
                                        <span key={code} className="text-xs bg-[#0a3f41] text-white px-2 py-1 rounded-md flex items-center gap-1">
                                          <span className="max-w-[150px] truncate" title={test?.name || code}>{test?.name || code}</span>
                                          <button type="button" onClick={() => setEditingTestsList(prev => prev.filter(c => c !== code))} className="hover:text-red-300 ml-1 flex-shrink-0"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                        </span>
                                      )
                                    })}
                                  </div>

                                  <div className="relative mt-2">
                                    <div className="w-full px-3 py-2 rounded-lg bg-[#f5f7f7] flex items-center justify-between focus-within:ring-1 focus-within:ring-[#5adace] transition-all cursor-text text-sm border border-[#e8ecec]">
                                      <input 
                                        type="text" 
                                        placeholder="+ Add test..." 
                                        className="bg-transparent outline-none text-[#0a3f41] w-full placeholder:text-[#9baea9]"
                                        value={editingTestsDropdownSearch}
                                        onChange={(e) => {
                                          setEditingTestsDropdownSearch(e.target.value);
                                          setIsEditingTestsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsEditingTestsDropdownOpen(true)}
                                      />
                                      {isEditingTestsDropdownOpen && (
                                        <button onClick={() => setIsEditingTestsDropdownOpen(false)} className="material-symbols-outlined text-[#6b8c8c] text-[16px]">close</button>
                                      )}
                                    </div>
                                    {isEditingTestsDropdownOpen && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-[#e8ecec] max-h-40 overflow-y-auto z-[60]">
                                        {allTests.filter(t => t.name.toLowerCase().includes(editingTestsDropdownSearch.toLowerCase()) || t.code.toLowerCase().includes(editingTestsDropdownSearch.toLowerCase())).map(t => {
                                          const isSelected = editingTestsList.includes(t.code);
                                          return (
                                            <button
                                              key={t.code}
                                              type="button"
                                              disabled={isSelected}
                                              onClick={() => {
                                                if (!isSelected) {
                                                  setEditingTestsList(prev => [...prev, t.code]);
                                                  setEditingTestsDropdownSearch("");
                                                  setIsEditingTestsDropdownOpen(false);
                                                }
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f5f7f7] transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed text-[#6b8c8c]' : 'text-[#0a3f41]'}`}
                                            >
                                              <div className="truncate">{t.name}</div>
                                              <div className="text-[10px] text-[#6b8c8c]">{t.code}</div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="group/tests relative">
                                  <div className="flex flex-wrap gap-1 max-w-[250px] pr-6">
                                    {booking.selectedTests ? (
                                      booking.selectedTests.split(',').map((testStr: string, i: number) => {
                                        const parts = testStr.split(':');
                                        const code = parts[0]?.trim();
                                        const name = parts[1]?.trim() || code;
                                        return (
                                          <span key={i} className="text-xs bg-[#e8ecec] text-[#0a3f41] px-2 py-1 rounded-md whitespace-nowrap" title={name}>
                                            {name.length > 25 ? name.substring(0, 25) + '...' : name}
                                          </span>
                                        );
                                      })
                                    ) : booking.tests && booking.tests.length > 0 ? (
                                      <>
                                        {booking.tests.slice(0, 2).map((t: any, i: number) => (
                                          <span key={i} className="text-xs bg-[#e8ecec] text-[#0a3f41] px-2 py-1 rounded-md whitespace-nowrap">
                                            {t.name.length > 25 ? t.name.substring(0, 25) + '...' : t.name}
                                          </span>
                                        ))}
                                        {booking.tests.length > 2 && (
                                          <span className="text-xs bg-[#e8ecec] text-[#0a3f41] px-2 py-1 rounded-md" title={booking.tests.slice(2).map((t: any) => t.name).join(', ')}>
                                            +{booking.tests.length - 2} more
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-[#6b8c8c] italic text-sm">None specified</span>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => {
                                      setEditingTestsBookingId(booking.id);
                                      const currentList = booking.selectedTests 
                                        ? booking.selectedTests.split(',').map((s: string) => s.split(':')[0].trim()).filter(Boolean)
                                        : booking.tests 
                                          ? booking.tests.map((t: any) => t.code).filter(Boolean) 
                                          : [];
                                      setEditingTestsList(currentList);
                                      setEditingTestsDropdownSearch("");
                                      setIsEditingTestsDropdownOpen(false);
                                    }}
                                    className="absolute top-0 right-0 opacity-0 group-hover/tests:opacity-100 transition-opacity text-[#6b8c8c] hover:text-[#5adace] p-1 bg-white rounded-full shadow-sm border border-[#e8ecec]"
                                    title="Edit Tests"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-5 text-[#6b8c8c]">
                              {booking.referralDoctor || <span className="italic">N/A</span>}
                            </td>
                            <td className="p-5">
                              {booking.prescriptionUrl ? (
                                <a href={`${getApiBaseUrl()}${booking.prescriptionUrl}`} target="_blank" rel="noopener noreferrer" className="text-[#5adace] hover:underline font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[18px]">description</span> View
                                </a>
                              ) : (
                                <span className="italic text-[#6b8c8c] text-sm">None</span>
                              )}
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

        {activeTab === "bin" && (
          <div className="mt-8 bg-white rounded-3xl shadow-md border border-red-100 overflow-hidden">
            <div className="p-6 bg-red-50/50 border-b border-red-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-red-900 text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">medication</span>
                  Deleted Medicine Orders ({binMedicineOrders.length})
                </h3>
                <p className="text-xs text-red-600">Restoring an order will return it to active Medicine Orders and display it on the user's account.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f5f7f7] text-[#0a3f41] font-bold text-xs uppercase border-b border-[#e8ecec]">
                  <tr>
                    <th className="p-4">Order ID & Date</th>
                    <th className="p-4">Patient Details</th>
                    <th className="p-4">Delivery Address</th>
                    <th className="p-4">Medicines</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ecec]">
                  {binMedicineOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#6b8c8c] italic text-sm">
                        No deleted medicine orders in recycle bin.
                      </td>
                    </tr>
                  ) : (
                    binMedicineOrders.map(order => (
                      <tr key={order.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="p-4 align-top">
                          <p className="font-bold text-[#0a3f41]">{order.id}</p>
                          <p className="text-xs text-[#6b8c8c]">{new Date(order.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="p-4 align-top text-sm text-[#0a3f41]">
                          <p className="font-bold">{order.patientDetails?.name}</p>
                          <p className="text-[#6b8c8c] text-xs">{order.patientDetails?.phone}</p>
                        </td>
                        <td className="p-4 align-top text-sm text-[#0a3f41]">
                          <div className="flex flex-col gap-0.5">
                            {order.patientDetails?.address && <p className="text-[#6b8c8c] text-xs max-w-[160px] truncate" title={order.patientDetails.address}>{order.patientDetails.address}</p>}
                            {order.patientDetails?.streetNo && <p className="text-[#6b8c8c] text-xs">St: {order.patientDetails.streetNo}</p>}
                            {order.patientDetails?.buildingNo && <p className="text-[#6b8c8c] text-xs">Bldg: {order.patientDetails.buildingNo}</p>}
                            {order.patientDetails?.landmark && <p className="text-[#6b8c8c] text-xs">Landmark: {order.patientDetails.landmark}</p>}
                            {order.patientDetails?.pincode && <p className="text-[#6b8c8c] text-xs">PIN: {order.patientDetails.pincode}</p>}
                            {!order.patientDetails?.address && !order.patientDetails?.streetNo && <p className="text-[#6b8c8c] text-xs italic">N/A</p>}
                            {order.patientDetails?.lat && order.patientDetails?.lon && (
                              <a href={`https://maps.google.com/?q=${order.patientDetails.lat},${order.patientDetails.lon}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-0.5 mt-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span> View Map
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top text-xs text-[#6b8c8c]">
                          <ul className="space-y-0.5">
                            {order.items?.map((item: any, idx: number) => (
                              <li key={idx} className="font-medium text-[#0a3f41]">{item.quantity}x {item.name}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-4 align-top font-bold text-[#0a3f41] text-sm">₹{order.finalAmount || order.finalTotal}</td>
                        <td className="p-4 align-top text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleRestoreMedicineOrder(order.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">restore</span>
                              Restore Order
                            </button>
                            <button
                              onClick={() => deleteMedicineOrder(order.id, true)}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">delete_forever</span>
                              Delete Permanently
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
        )}
      </div>
    </div>
  );
}
