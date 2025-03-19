"use client";
import React from "react";
// import "./Logo.css"

const Logo = () => {
  return (
    <div className="inline-flex items-center">
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
          className=" dark:stroke-white"
        />
        {/* Second path */}
        <path
          d="M60 30 L40 70"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:stroke-white"
        />
        {/* Third path */}
        <path
          d="M70 40 L80 50 L70 60"
          stroke="black"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className=" dark:stroke-white"
        />
      </svg>
      <span className="ml-2">kode karo</span>
    </div>
  );
};

export default Logo;
