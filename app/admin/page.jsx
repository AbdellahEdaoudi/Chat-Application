"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuLayoutDashboard, LuUsers, LuArrowLeft } from "react-icons/lu";
import { MyContext } from "../Context/MyContext";

import DashboardStats from "./components/DashboardStats";
import ManageUsers from "./components/ManageUsers";

export default function AdminPage() {
  const router = useRouter();
  const { userDetails: user } = useContext(MyContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [authChecking, setAuthChecking] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  
  useEffect(() => {
    if (user) {
      if (!user.isAdmin) {
        setForbidden(true);
        setAuthChecking(false);
      } else {
        setAuthChecking(false);
      }
    } else {
      const timer = setTimeout(() => {
        if (!user) router.push("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  // Full-screen skeleton while checking auth
  if (authChecking) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 animate-pulse">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
          <div className="p-4 space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"></div>
          <div className="flex-1 p-6 space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forbidden modal for non-admins
  if (forbidden) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
            <p className="text-gray-500 dark:text-gray-400">You do not have permission to access the admin panel. Please contact your administrator.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-center">
            <button onClick={() => router.push("/")} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: LuLayoutDashboard },
    { id: "users", name: "Users", icon: LuUsers },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-20 h-full`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(false)}>
            &times;
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
           <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <LuArrowLeft className="w-5 h-5" />
            <span>Back to Chat</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 justify-between md:justify-end shadow-sm z-10">
           <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>
             <LuLayoutDashboard className="w-6 h-6" />
           </button>
           <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <img src={user?.profileImage || "https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png"} alt="Admin" className="w-8 h-8 rounded-full border border-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.fullname}</span>
             </div>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className={activeTab === "dashboard" ? "block" : "hidden"}>
            <DashboardStats />
          </div>
          <div className={activeTab === "users" ? "block" : "hidden"}>
            <ManageUsers />
          </div>
        </div>
      </main>
    </div>
  );
}
