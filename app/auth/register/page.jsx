"use client";
import React, { useState, useContext } from "react";
import { MyContext } from "../../Context/MyContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/app/Components/toast";
import Header from "@/app/Components/Header";

import Image from "next/image";
import { generateKeyPair, encryptPrivateKey } from "@/app/utils/encryption";
import { Spinner } from "@/app/Components/lucide-react/lucide-react";

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);

const RegisterPage = () => {
    const { SERVER_URL_V } = useContext(MyContext);
    const toast = useToast();
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Password Validation States
    const validations = {
        length: password.length >= 8,
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    const isPasswordValid = Object.values(validations).every(Boolean);

    const ImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const Register = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Password Strength Validation
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(password)) {
                toast.error("Password must be 8+ characters, including at least one number and one special character.");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('fullname', fullname);

            formData.append('email', `${email}@edchatflow.com`);
            formData.append('password', password);

            // Generate E2EE keys
            console.log("Generating E2EE keys for new account...");
            const { publicKey, privateKey } = await generateKeyPair();
            const protectedPrivateKey = encryptPrivateKey(privateKey, password);

            formData.append('publicKey', publicKey);
            formData.append('protectedPrivateKey', protectedPrivateKey);

            if (image) {
                formData.append('profileImage', image);
            }

            await axios.post(`${SERVER_URL_V}/register`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Account created successfully! Please login");
            router.push('/auth/login');
        } catch (error) {
            console.error("Register error:", error);
            const message = error.response?.data?.message || "Registration failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setImage(null);
        setPreview("https://res.cloudinary.com/dcnhvlyyu/image/upload/v1770564371/uploads/zukh98pudkftlox0alkf.png");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md shadow-lg bg-white rounded-2xl overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative group w-24 h-24 shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-blue-500 transition-colors duration-300">
                                    <Image
                                        src={preview}
                                        alt="Profile Preview"
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={ImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {image && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all z-20 hover:scale-110 active:scale-90 border-2 border-white flex items-center justify-center"
                                        title="Remove image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                                <p className="text-gray-500">Join Edchatflow today</p>
                            </div>
                        </div>
                        <form onSubmit={Register} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    name="edfullname"
                                    maxLength={30}
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={email}
                                        name="edusername"
                                        maxLength={35}
                                        onChange={(e) => setEmail(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
                                        required
                                        className="flex-1 w-full px-4 py-2.5 outline-none border-none focus:ring-0"
                                    />
                                    <span className="px-4 py-2.5 bg-gray-100 text-gray-500 border-l border-gray-300 select-none text-sm">
                                        @edchatflow.com
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        maxLength={50}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3 text-gray-500 hover:text-blue-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>

                                {/* Password Requirements List */}
                                <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2 text-xs">
                                    <div className={`flex items-center gap-1.5 transition-colors ${validations.length ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validations.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        At least 8 chars
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${validations.special ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validations.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        Special char(!@#$)
                                    </div>
                                    <div className={`flex items-center gap-1.5 transition-colors ${validations.number ? 'text-green-600' : 'text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${validations.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        number
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`w-full py-3 rounded-lg transition duration-300 font-bold shadow-md flex items-center justify-center gap-2 min-h-[48px] ${isPasswordValid && !loading
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                disabled={!isPasswordValid || loading}
                            >
                                {loading ? <Spinner className="w-5 h-5" /> : "Create Secure Account"}
                            </button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-blue-600 hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default RegisterPage;
