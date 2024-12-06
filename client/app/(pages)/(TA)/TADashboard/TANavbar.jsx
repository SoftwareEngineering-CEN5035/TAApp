"use client";
import { useEffect, useState } from "react";
import { auth } from "../../../_lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

const TANavbar = ({ setSelectedPage, selectedPage }) => {
  const [navbarHeight, setNavbarHeight] = useState("h-20");
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Adjust navbar height on scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavbarHeight(window.scrollY > 50 ? "h-16" : "h-20");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset isCollapsed state when resizing above lg
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Update page on navigation
  const handleNavigation = (page) => {
    setSelectedPage(page);
    router.push(`/${page}`);
    setIsCollapsed(false); // Close menu after navigation on mobile
  };

  return (
    <nav
      className={`sticky top-0 w-full bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 shadow-md z-50 ${navbarHeight} transition-all duration-300`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-8 h-full">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-800">TA Portal</div>

        {/* Sign-Out Button */}
        <button
          onClick={handleSignOut}
          className={`flex items-center justify-center text-gray-700 hover:text-red-500 transition-all duration-200 focus:outline-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default TANavbar;
