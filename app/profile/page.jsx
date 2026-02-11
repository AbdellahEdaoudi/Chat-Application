"use client";
import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../Context/MyContext";
import Image from "next/image";
import axios from "axios";
import { useToast } from "@/app/Components/toast";
import Header from "@/app/Components/Header";
import { Repeat, ImagePlus } from "@/app/Components/lucide-react/lucide-react";
import { encryptPrivateKey } from "@/app/utils/encryption";
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);

const ProfilePage = () => {
    const { userDetails, setUserDetails, SERVER_URL_V, logout, isLoading, getMessages, privateKey } = useContext(MyContext);
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState(""); // For "Current Password" input
    const [newPassword, setNewPassword] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isRemovingImage, setIsRemovingImage] = useState(false);

    // Password Validation States
    const validations = {
        length: newPassword.length >= 8,
        number: /[0-9]/.test(newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };
    // If newPassword is empty, it's valid (ignoring update). If not empty, must meet all criteria.
    const isNewPasswordValid = !newPassword || Object.values(validations).every(Boolean);

    useEffect(() => {
        getMessages();
    }, []);

    useEffect(() => {
        if (userDetails) {
            setFullname(userDetails.fullname);
            setEmail(userDetails.email);
            setPreview(userDetails.profileImage || "/default-avatar.png");
        }
    }, [userDetails]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setIsRemovingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview("https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png");
        setIsRemovingImage(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (newPassword && newPassword.trim() !== "") {
            setShowModal(true);
        } else {
            performUpdate();
        }
    };

    const performUpdate = async () => {
        setLoading(true);
        setShowModal(false);
        try {
            const formData = new FormData();
            formData.append("fullname", fullname);

            // If changing password, send current password for verification
            if (newPassword && newPassword.trim() !== "") {
                formData.append("password", currentPassword); // Send as 'password' for backend check
                formData.append("newPassword", newPassword);

                // Re-encrypt the private key with the new password
                if (privateKey) {
                    const newProtectedKey = encryptPrivateKey(privateKey, newPassword);
                    formData.append("protectedPrivateKey", newProtectedKey);
                }
            }

            if (image) formData.append("profileImage", image);
            if (isRemovingImage) formData.append("removeProfileImage", "true");

            const response = await axios.put(`${SERVER_URL_V}/update-profile`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });

            setUserDetails(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            let successMessage = "Profile updated successfully!";
            if (newPassword && newPassword.trim() !== "") {
                successMessage = "Password changed successfully!";
            }
            toast.success(successMessage);
            setCurrentPassword("");
            setNewPassword("");
        } catch (error) {
            console.error("Update error:", error);
            if (error.response) {
                const status = error.response.status;
                if (status === 401 || status === 403 || status === 404) {
                    console.log(`Auth error (${status}). Logging out...`);
                    let msg = "Session expired. Please login again.";
                    if (status === 404) msg = "User not found. Please login again.";
                    if (status === 401) msg = "Authentication required. Please login.";
                    if (toast) toast.error(msg);
                    logout();
                    return; // Stop further execution
                }
            }
            const message = error.response?.data?.message || "Update failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };


    if (isLoading || !userDetails) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[500px] animate-pulse">

                        {/* Left Side Skeleton */}
                        <div className="md:w-5/12 bg-gray-200 h-64 md:h-full relative overflow-hidden flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="w-40 h-40 rounded-full bg-gray-300"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                        </div>

                        {/* Right Side Skeleton */}
                        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center space-y-6 bg-white">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-100 rounded border border-gray-200"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="flex gap-4">
                                    <div className="flex-1 h-10 bg-gray-100 rounded border border-gray-200"></div>
                                </div>
                            </div>
                            <div className="h-12 bg-gray-800/20 rounded-xl mt-6 w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate dynamic height content container
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto">



                    {/* Left Side: Profile Overview */}
                    <div className="md:w-5/12 bg-gradient-to-br from-yellow-600 to-yellow-500 flex flex-col items-center justify-center p-8 text-white relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 pattern-dots"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative group mb-7">
                                <div className="relative w-40 h-40 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-gray-300 ring-6 ring-yellow-300/30">



                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <Image
                                        src={preview || "/default-avatar.png"}
                                        alt="Profile"
                                        width={160}
                                        height={160}
                                        className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />



                                </div>
                                <div className="absolute -bottom-2 right-0 flex gap-2 z-20">
                                    <label className="bg-white text-yellow-600 p-2.5 rounded-full cursor-pointer hover:bg-yellow-50 transition-all shadow-lg transform hover:scale-110 border border-yellow-100" title="Change Photo">
                                        {preview !== "https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png" ? (
                                            <Repeat className="h-5 w-5" />
                                        ) : (
                                            <ImagePlus className="h-5 w-5" />
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                    {preview !== "https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png" && (
                                        <button
                                            onClick={handleRemoveImage}
                                            className="bg-white text-red-500 p-2.5 rounded-full cursor-pointer hover:bg-red-50 transition-all shadow-lg transform hover:scale-110 border border-red-100"
                                            title="Remove Photo"
                                            type="button"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-3xl font-extrabold text-center tracking-tight text-white drop-shadow-md">{fullname}</h2>
                            <p className="text-yellow-50 text-sm mt-3 bg-black/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 font-medium">{email}</p>



                        </div>
                    </div>

                    {/* Right Side: Edit Form */}
                    <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center bg-white">
                        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                            </span>
                            Edit Profile
                        </h1>



                        <form onSubmit={handleUpdateSubmit} className="space-y-4">

                            <div className="space-y-3">
                                {/* Full Name */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullname}
                                        maxLength={30}
                                        onChange={(e) => setFullname(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                                        placeholder="Your full name"
                                    />
                                </div>



                                {/* Password Fields */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                                                placeholder="Enter current password to change it"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>



                                    <div className="">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                maxLength={50}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all outline-none bg-gray-50 focus:bg-white text-sm"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>


                                </div>

                                {/* Password Requirements */}
                                <div className="mt-2 space-y-1 text-xs">
                                    <div className={`flex items-center gap-1.5 transition-colors ${validations.length ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validations.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${validations.number ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validations.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        Contain at least one number (0-9)
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${validations.special ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validations.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        Special character (@#$%^*)
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 italic bg-gray-50 p-1.5 rounded border border-gray-100 mt-2">
                                    <span className="font-semibold text-gray-500">Note:</span> Leave blank to keep current password.
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !isNewPasswordValid}
                                    className={`w-full font-bold py-2.5 px-4 rounded-lg shadow-lg transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98] ${loading || !isNewPasswordValid
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:shadow-yellow-500/30 text-white'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Saving Changes...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Save Changes</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>


                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 border-t-4 border-yellow-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mb-4 ring-2 ring-yellow-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Change Password?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Are you sure you want to change your password? You will need to use the new password for future logins.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performUpdate}
                                    className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-yellow-200"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;

