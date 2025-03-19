"use client";
import React, { useState, useEffect } from "react";
import "./components/Logo.css";

const Loading = () => {
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  useEffect(() => {
    // Set a timeout to hide the loading component after 0.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 500); // 500ms = 0.5 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  // If isVisible is false, return null to hide the component
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform transform hover:scale-110"
      >
        {/* First path */}
        <path
          d="M30 40 L20 50 L30 60"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drawing-path drawing-path-1 dark:stroke-white"
        />
        {/* Second path */}
        <path
          d="M60 30 L40 70"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drawing-path drawing-path-2 dark:stroke-white"
        />
        {/* Third path */}
        <path
          d="M70 40 L80 50 L70 60"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drawing-path drawing-path-3 dark:stroke-white"
        />
      </svg>
    </div>
  );
};

export default Loading;
