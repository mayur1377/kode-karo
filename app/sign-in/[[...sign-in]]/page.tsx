"use client";
import { useSignIn } from "@clerk/nextjs";
import Layout from "@/app/components/Layout";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

const CustomSignIn = () => {
  const { isLoaded, signIn } = useSignIn();

  useEffect(() => {
    toast("Email and password things are yet to be added 🙂");
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: window.location.origin,
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("Sign In Error: ", err);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="w-full max-w-md p-8 border border-black dark:border-white rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Sign In
          </h2>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-black dark:border-white text-black dark:text-white rounded-lg transition duration-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5"
            />
            Sign In with Google
          </button>
        </div>
      </div>
      <Toaster />
    </Layout>
  );
};

export default CustomSignIn;
