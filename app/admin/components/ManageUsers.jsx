"use client";

import { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { MyContext } from "../../Context/MyContext";
import { LuTrash2, LuShield, LuShieldCheck, LuSearch } from "react-icons/lu";

export default function ManageUsers() {
  const { SERVER_URL_V, userDetails: currentUser } = useContext(MyContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, userId: null, title: "", message: "" });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${SERVER_URL_V}/api/admin/users`, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [SERVER_URL_V]);

  const toggleAdminRole = async (userId) => {
    if (userId === currentUser?._id) return;
    const userToToggle = users.find(u => u._id === userId);
    setModalConfig({
      isOpen: true,
      type: 'toggle',
      userId,
      title: userToToggle.isAdmin ? "Remove Admin Role" : "Make Admin",
      message: `Are you sure you want to ${userToToggle.isAdmin ? 'remove the admin role from' : 'give the admin role to'} ${userToToggle.fullname}?`
    });
  };

  const deleteUser = async (userId) => {
    if (userId === currentUser?._id) return;
    const userToDelete = users.find(u => u._id === userId);
    setModalConfig({
      isOpen: true,
      type: 'delete',
      userId,
      title: "Delete User",
      message: `Are you sure you want to permanently delete ${userToDelete.fullname}? This action cannot be undone.`
    });
  };

  const ConfirmAction = async () => {
    const { type, userId } = modalConfig;
    if (!userId) return;

    setIsActionLoading(true);
    if (type === 'toggle') {
      try {
        const response = await axios.put(`${SERVER_URL_V}/api/admin/users/${userId}/role`, {}, { withCredentials: true });
        if (response.status === 200) {
           setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
        }
      } catch (error) {
        console.error("Error updating user role:", error);
      }
    } else if (type === 'delete') {
      try {
        const response = await axios.delete(`${SERVER_URL_V}/api/admin/users/${userId}`, { withCredentials: true });
        if (response.status === 200) {
           setUsers(users.filter(u => u._id !== userId));
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
    setIsActionLoading(false);
    setModalConfig({ isOpen: false, type: null, userId: null, title: "", message: "" });
  };

  const filteredUsers = users.filter(user => 
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Users</h2>
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">User</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 animate-pulse">
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="py-3 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                    <td className="py-3 px-6"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div></td>
                    <td className="py-3 px-6"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div></td>
                    <td className="py-3 px-6 text-right flex justify-end space-x-2">
                       <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                       <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center space-x-3">
                        <img src={user.profileImage || "https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png"} alt={user.fullname} className="w-10 h-10 rounded-full border border-gray-200" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{user.fullname}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {user.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right space-x-2 flex justify-end">
                      <button 
                        onClick={() => toggleAdminRole(user._id)}
                        disabled={user._id === currentUser?._id}
                        className={`p-2 rounded-lg transition-colors ${(user._id === currentUser?._id) ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30'}`}
                        title={user.isAdmin ? "Remove Admin Role" : "Make Admin"}
                      >
                        {user.isAdmin ? <LuShieldCheck className="w-5 h-5" /> : <LuShield className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => deleteUser(user._id)}
                        disabled={user._id === currentUser?._id}
                        className={`p-2 rounded-lg transition-colors ${(user._id === currentUser?._id) ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30'}`}
                        title="Delete User"
                      >
                        <LuTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal via Portal */}
      {modalConfig.isOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`p-6 border-b ${modalConfig.type === 'delete' ? 'border-red-100 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-700'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${modalConfig.type === 'delete' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                  {modalConfig.type === 'delete' ? <LuTrash2 className="w-6 h-6" /> : <LuShield className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{modalConfig.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300">{modalConfig.message}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setModalConfig({ isOpen: false, type: null, userId: null, title: "", message: "" })}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={ConfirmAction}
                disabled={isActionLoading}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-sm flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed ${modalConfig.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {isActionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{modalConfig.type === 'delete' ? 'Deleting...' : 'Updating...'}</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
