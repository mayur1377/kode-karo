"use client";
import { useEffect, useState } from "react";
import Layout from "@/app/components/Layout";
import { useRouter } from "next/navigation";

const CustomSignUp = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/sign-in");
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <Layout>
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
          <p className="text-gray-700 mb-4">
            Email and Password login coming soon...
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to Sign In in {countdown} seconds...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CustomSignUp;
// to do : add the custom sign-up things
