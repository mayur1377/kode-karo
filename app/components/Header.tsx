"use client";

import { ModeToggle } from "./ModeToggle";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/clerk-react";
import Logo from "./Logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function Header() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="sticky top-0 z-50 bg-background/50 backdrop-blur-md border-b border-muted/50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo */}
        <div className="text-lg sm:text-xl font-bold text-foreground">
          <Link
            href="/"
            className="hover:text-muted-foreground transition-colors"
          >
            <Logo />
          </Link>
        </div>

        {/* Right-aligned items */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <ModeToggle />

          {isSignedIn && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 focus:outline-none">
                  {user.imageUrl && (
                    <img
                      src={user.imageUrl}
                      alt="User Avatar"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm sm:text-base text-foreground">
                    {user.firstName || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
