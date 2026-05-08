"use client";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { MyContext } from "../../Context/MyContext";
import { LuUsers, LuMessageSquare, LuActivity, LuUserPlus } from "react-icons/lu";

export default function DashboardStats() {
  const { SERVER_URL_V } = useContext(MyContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    activeUsers: 0,
    newUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${SERVER_URL_V}/api/admin/stats`, { withCredentials: true });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [SERVER_URL_V]);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: LuUsers, color: "bg-blue-500" },
    { title: "Active Users", value: stats.activeUsers, icon: LuActivity, color: "bg-green-500" },
    { title: "New Users (7d)", value: stats.newUsers, icon: LuUserPlus, color: "bg-purple-500" },
    { title: "Total Messages", value: stats.totalMessages, icon: LuMessageSquare, color: "bg-orange-500" },
  ];

  if (loading) {
     return (
       <div className="space-y-6">
         <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 animate-pulse">
               <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
               <div className="space-y-2 flex-1">
                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                 <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
               </div>
             </div>
           ))}
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mt-8 animate-pulse">
           <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
           <div className="space-y-2">
             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
             <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
           </div>
         </div>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 transition-transform hover:scale-105">
            <div className={`${card.color} p-4 rounded-lg text-white`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mt-8">
         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Welcome to Admin Panel</h3>
         <p className="text-gray-600 dark:text-gray-300">
            Use the sidebar to navigate through different sections of the admin dashboard. You can manage users, view overall activity, and oversee the platform.
         </p>
      </div>
    </div>
  );
}
