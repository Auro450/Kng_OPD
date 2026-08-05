"use client";

import React, { useState, useEffect, useRef } from "react";
import { getApiBaseUrl } from "@/utils/apiConfig";
import { useAuth } from "@/context/AuthContext";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const url = `${getApiBaseUrl()}/api/user/notifications${user?.phone ? `?phone=${user.phone}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => {
    if (n.phone === 'all') {
      return !(n.readBy && n.readBy.includes(user?.phone || 'guest'));
    }
    return !n.isRead;
  }).length;

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${getApiBaseUrl()}/api/user/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, phone: user?.phone || 'guest' })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Basic implementation: mark all unread ones sequentially
    const unreadNotifs = notifications.filter(n => {
      if (n.phone === 'all') {
        return !(n.readBy && n.readBy.includes(user?.phone || 'guest'));
      }
      return !n.isRead;
    });
    
    for (const n of unreadNotifs) {
      try {
        await fetch(`${getApiBaseUrl()}/api/user/notifications/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id, phone: user?.phone || 'guest' })
        });
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    fetchNotifications();
  };

  const clearNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${getApiBaseUrl()}/api/user/notifications/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, phone: user?.phone || 'guest' })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to clear notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/api/user/notifications/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true, phone: user?.phone || 'guest' })
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-[#5adace] transition-colors rounded-full hover:bg-white/5 active:scale-95 flex items-center justify-center"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#181c1e]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-[#e8ecec] overflow-hidden z-50 animate-fade-in origin-top-right">
          <div className="p-4 bg-[#f5f7f7] border-b border-[#e8ecec] flex justify-between items-center">
            <h3 className="font-bold text-[#0a3f41] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#5adace]">notifications_active</span>
              Notifications
            </h3>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-[#5adace] hover:text-[#0a3f41] font-bold transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center text-[#6b8c8c]">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_paused</span>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e8ecec]">
                {notifications.map((n) => {
                  const isUnread = n.phone === 'all' 
                    ? !(n.readBy && n.readBy.includes(user?.phone || 'guest'))
                    : !n.isRead;
                    
                  let icon = "info";
                  let iconColor = "text-[#6b8c8c]";
                  let bgColor = "bg-[#f5f7f7]";
                  
                  if (n.type === "announcement") { icon = "campaign"; iconColor = "text-purple-600"; bgColor = "bg-purple-100"; }
                  if (n.type === "coupon") { icon = "sell"; iconColor = "text-orange-600"; bgColor = "bg-orange-100"; }
                  if (n.type === "event") { icon = "event"; iconColor = "text-blue-600"; bgColor = "bg-blue-100"; }
                  if (n.type === "order_placed") { icon = "shopping_bag"; iconColor = "text-emerald-600"; bgColor = "bg-emerald-100"; }
                  if (n.type === "order_completed") { icon = "check_circle"; iconColor = "text-emerald-600"; bgColor = "bg-emerald-100"; }

                  return (
                    <div key={n.id} className={`p-4 transition-colors hover:bg-gray-50 flex gap-4 ${isUnread ? 'bg-blue-50/30' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor} ${iconColor}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className={`text-sm ${isUnread ? 'font-bold text-[#0a3f41]' : 'font-medium text-[#0a3f41]/80'}`}>
                            {n.title}
                          </h4>
                          {isUnread && (
                            <button 
                              onClick={(e) => markAsRead(n.id, e)}
                              className="w-2 h-2 rounded-full bg-[#5adace] shrink-0 mt-1.5 hover:scale-150 transition-transform"
                              title="Mark as read"
                            />
                          )}
                          <button
                            onClick={(e) => clearNotification(n.id, e)}
                            className="text-[#6b8c8c] hover:text-red-500 transition-colors shrink-0"
                            title="Clear notification"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                        <p className={`text-xs ${isUnread ? 'text-[#0a3f41]' : 'text-[#6b8c8c]'} leading-relaxed`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-[#6b8c8c] mt-2 font-medium">
                          {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
