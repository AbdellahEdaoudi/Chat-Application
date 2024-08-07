"use client"
import {SignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    },0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center py-20 ">
      {loading ? (
        <p className="flex justify-center items-center py-20 text-8xl">
          <i className="fa fa-spinner fa-spin"></i>
        </p>
      ) : (
        <SignUp />
      )}
    </div>
  );
}
