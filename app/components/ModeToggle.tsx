"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Animate the Sun and Moon icons */}
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Toggle Switch */}
      <button
        onClick={toggleTheme}
        className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700 focus:outline-none"
      >
        <motion.div
          className="absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow-md"
          initial={false}
          animate={{
            x: theme === "dark" ? "100%" : "0%",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#f0f0f0",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </button>
    </div>
  );
}
