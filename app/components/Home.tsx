"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import ContestData from "../components/ContestData";
import ShowHome from "./ShowHome"; // Import ShowHome component
import Loading from "../loading";
import YourProgress from "./YourProgress"; // Import YourProgress component

export default function HomeComponent() {
  const { isSignedIn, isLoaded } = useUser(); // Use isLoaded to check if authentication state is determined
  const [activeTab, setActiveTab] = useState("upcoming"); // State to manage active tab

  if (!isLoaded) {
    return <Loading />; // Show a loading state until authentication state is confirmed
  }

  return (
    <div className="flex flex-col min-h-screen items-center ">
      {!isSignedIn ? (
        <ShowHome /> // Show the ShowHome component if the user is not signed in
      ) : (
        <div>
          {/* Tab Navigation */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              className={`px-4 py-2 rounded transition-all duration-300 ${
                activeTab === "upcoming"
                  ? "text-2xl font-bold opacity-100"
                  : "text-lg font-normal opacity-50"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming Contests
            </button>

            <span className="px-2 text-2xl font-bold opacity-100">/</span>

            <button
              className={`px-4 py-2 rounded transition-all duration-300 ${
                activeTab === "progress"
                  ? "text-2xl font-bold opacity-100"
                  : "text-lg font-normal opacity-50"
              }`}
              onClick={() => setActiveTab("progress")}
            >
              Your Progress
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === "upcoming" ? (
              <ContestData />
            ) : (
              <YourProgress /> // Use YourProgress component
            )}
          </div>
        </div>
      )}
    </div>
  );
}
