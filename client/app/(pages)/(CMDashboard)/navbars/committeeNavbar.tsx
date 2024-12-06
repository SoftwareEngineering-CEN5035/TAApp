"use client";

import { FaBars, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { auth } from "../../../_lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

const CommitteeNavbar = ({ setSelectedPage, selectedPage }) => {
  const [navbarHeight, setNavbarHeight] = useState("h-20");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Adjust navbar height on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobile) {
        setNavbarHeight("h-16");
      } else {
        const scrollThreshold = 440;
        setNavbarHeight(window.scrollY > scrollThreshold ? "h-16" : "h-20");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Handle resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    handleResize(); // Initialize
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
    router.push(`/committeeDashboard/${page}`);
    localStorage.setItem("previousDashboardItem", page);
    setIsOpen(false);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <nav
      className={`sticky top-0 w-full bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 shadow-md z-50 ${navbarHeight} transition-all duration-300`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-8 h-full">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-800">TA Application</div>

        {/* Navigation Links for Desktop */}
        <div className="hidden lg:flex lg:items-center lg:space-x-6">
          <div
            className={`cursor-pointer text-lg font-medium px-6 py-2 ${
              selectedPage === "applications"
                ? "text-blue-800 underline underline-offset-4"
                : "text-gray-700 hover:text-blue-800"
            }`}
            onClick={() => handleNavigation("applications")}
          >
            Applications
          </div>
          <div
            className={`cursor-pointer text-lg font-medium px-6 py-2 ${
              selectedPage === "pendingApplications"
                ? "text-blue-800 underline underline-offset-4"
                : "text-gray-700 hover:text-blue-800"
            }`}
            onClick={() => handleNavigation("pendingApplications")}
          >
            Pending Applications
          </div>
          <div
            className={`cursor-pointer text-lg font-medium px-6 py-2 ${
              selectedPage === "courses"
                ? "text-blue-800 underline underline-offset-4"
                : "text-gray-700 hover:text-blue-800"
            }`}
            onClick={() => handleNavigation("courses")}
          >
            Courses
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-700 hover:text-blue-800 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Sign-Out Button */}
        <button
          onClick={handleSignOut}
          className={`flex items-center justify-center text-gray-700 hover:text-red-500 transition-all duration-200 focus:outline-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <LogOut className="w-6 h-6" />
          {!isMobile && (
            <span className="ml-2">
              {loading ? "Signing Out..." : "Sign Out"}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobile && isOpen && (
        <div
          className="absolute left-0 right-0 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 shadow-md z-40 transition-all duration-300"
        >
          <div className="flex flex-col items-center space-y-4 py-4">
            <div
              className={`cursor-pointer text-lg font-medium ${
                selectedPage === "applications"
                  ? "text-blue-800 underline underline-offset-4"
                  : "text-gray-700 hover:text-blue-800"
              }`}
              onClick={() => handleNavigation("applications")}
            >
              Applications
            </div>
            <div
              className={`cursor-pointer text-lg font-medium ${
                selectedPage === "pendingApplications"
                  ? "text-blue-800 underline underline-offset-4"
                  : "text-gray-700 hover:text-blue-800"
              }`}
              onClick={() => handleNavigation("pendingApplications")}
            >
              Pending Applications
            </div>
            <div
              className={`cursor-pointer text-lg font-medium ${
                selectedPage === "courses"
                  ? "text-blue-800 underline underline-offset-4"
                  : "text-gray-700 hover:text-blue-800"
              }`}
              onClick={() => handleNavigation("courses")}
            >
              Courses
            </div>
            {/* Removed Sign-Out Button from Mobile Dropdown */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default CommitteeNavbar;
