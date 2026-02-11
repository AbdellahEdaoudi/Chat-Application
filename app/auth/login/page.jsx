"use client";
import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../Context/MyContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/app/Components/toast";
import Header from "@/app/Components/Header";
import { decryptPrivateKey } from "@/app/utils/encryption";
import { Spinner, EyeIcon, EyeOffIcon } from "@/app/Components/lucide-react/lucide-react";


const LoginPage = () => {
    const { SERVER_URL_V } = useContext(MyContext);
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const Login = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${SERVER_URL_V}/login`, {
                email: `${email}@edchatflow.com`,
                password
            }, { withCredentials: true });
            const { user } = response.data;

            if (user.protectedPrivateKey) {
                const decrypted = decryptPrivateKey(user.protectedPrivateKey, password);
                if (decrypted) {
                    localStorage.setItem(`privKey`, decrypted);
                    console.log("Private key restored successfully.");
                } else {
                    console.error("Failed to decrypt private key with input password.");
                }
            }

            localStorage.setItem("user", JSON.stringify(user));
            toast.success("Logged in successfully!");
            router.push('/');
        } catch (error) {
            console.error("Login error:", error);
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="sticky top-0">
                <Header />
            </div>
            <div className="flex items-center justify-center mt-12">
                <div className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
                        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>
                        <form onSubmit={Login} className="space-y-4">
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
                                        className="flex-1 w-full px-3 py-2 outline-none border-none focus:ring-0"
                                    />
                                    <span className="px-3 py-2 bg-gray-100 text-gray-500 border-l border-gray-300 select-none">
                                        @edchatflow.com
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    maxLength={50}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white py-2.5 rounded-md hover:bg-blue-600 transition disabled:opacity-70 flex items-center justify-center gap-2 font-bold min-h-[44px]"
                                disabled={loading}
                            >
                                {loading ? <Spinner className="w-5 h-5" /> : "Sign In"}
                            </button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <p className="text-gray-600">
                                Don't have an account?{" "}
                                <Link href="/auth/register" className="text-blue-600 hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default LoginPage;
