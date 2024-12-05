import { FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { auth } from "../../../_lib/firebase";
import { signOut } from "firebase/auth"; 
import { usePathname } from "next/navigation";
import Link from "next/link";

const InstructorNavbar = ({ setSelectedPage, selectedPage }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState("h-24");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null); // State for user role
  const pathname = usePathname();
  
  const user = auth.currentUser;
  const isNotLoggedIn = user === null;

  // Get the role from localStorage or set to "Unknown" if not available
  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role || "Unknown"); // Fallback to "Unknown" if no role is found
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };

    const handleScroll = () => {
      if (isMobile) {
        setNavbarHeight("h-16");
      } else {
        const scrollThreshold = 440;
        if (window.scrollY > scrollThreshold) {
          setNavbarHeight("h-16");
        } else {
          setNavbarHeight("h-24");
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    console.log("Attempting to sign out...");
    try {
      await signOut(auth);
      console.log("Successfully signed out!");
      localStorage.removeItem("role"); // Clear role on sign out
    } catch (error) {
      console.error("Sign out error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className={`sticky top-0 w-full overflow-hidden h-[10vh] ${navbarHeight} bg-blue-300 border-b-[1px] border-black z-50 transition-all duration-300`}>
      <div className="w-full h-full flex justify-between items-center px-4 sm:px-6 md:px-6">
        <div className="justify-between flex space-x-8 items-center">
          {!isMobile && (
            <>
              <div className={`font-bold text-lg text-black cursor-pointer ${pathname === "/instructorDashboard" ?  "underline decoration-white" : ""}`}>
                Dashboard
              </div>
              {/* User Role */}
              {userRole && (
                <div className="font-medium text-lg text-black">
                  Role: {userRole}
                </div>
              )}
              {/* Navigation Links */}
              <Link href="/taManagement" passHref>
                <div
                  className={`font-bold text-lg text-black cursor-pointer ${pathname === "/taManagement" ? "underline decoration-white" : ""}`}
                  onClick={() => setSelectedPage("taManagement")}
                >
                  TA Management
                </div>
              </Link>
              <Link href="/taFeedback" passHref>
                <div
                  className={`font-bold text-lg text-black cursor-pointer ${pathname === "/taFeedback" ? "underline decoration-white" : ""}`}
                  onClick={() => setSelectedPage("taFeedback")}
                >
                  TA Feedback
                </div>
              </Link>
              <Link href="/courseOverview" passHref>
                <div
                  className={`font-bold text-lg text-black cursor-pointer ${pathname === "/courseOverview" ? "underline decoration-white" : ""}`}
                  onClick={() => setSelectedPage("courseOverview")}
                >
                  Course Overview
                </div>
              </Link>
              <Link href="/historicalRecords" passHref>
                <div
                  className={`font-bold text-lg text-black cursor-pointer ${pathname === "/historicalRecords" ? "underline decoration-white" : ""}`}
                  onClick={() => setSelectedPage("historicalRecords")}
                >
                  Historical Records
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className={`font-bold text-lg text-black cursor-pointer absolute right-2 bg-red-300 hover:bg-red-200 h-[45px] rounded-lg w-[80px] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing Out..." : "Sign Out"}
              </button>
            </>
          )}
        </div>
        {isMobile && (
          <div className="cursor-pointer">
            <FaBars onClick={toggleMenu} size={24} />
          </div>
        )}
        {isMobile && (
          <>
            {isOpen && (
              <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 transition-opacity duration-300" onClick={toggleMenu}></div>
            )}
            <div className={`fixed top-0 right-0 w-3/4 h-full bg-[#f17418] shadow-xl z-50 flex flex-col p-4 transform transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
              <div className="flex justify-end">
                <FaTimes onClick={toggleMenu} size={24} className="cursor-pointer" />
              </div>
              <Link href="/taManagement" passHref>
                <div className={`font-bold text-lg text-black py-2 ${pathname === "/instructorDashboard" ? "underline decoration-white" : ""}`} onClick={() => { closeMenu(); setSelectedPage("instructorDashboard"); }}>
                  Dashboard
                </div>
              </Link>
              <Link href="/taManagement" passHref>
                <div className={`font-bold text-lg text-black py-2 ${pathname === "/taManagement" ? "underline decoration-white" : ""}`} onClick={() => { closeMenu(); setSelectedPage("taManagement"); }}>
                  TA Management
                </div>
              </Link>
              <Link href="/taFeedback" passHref>
                <div className={`font-bold text-lg text-black py-2 ${pathname === "/taFeedback" ? "underline decoration-white" : ""}`} onClick={() => { closeMenu(); setSelectedPage("taFeedback"); }}>
                  TA Feedback
                </div>
              </Link>
              <Link href="/courseOverview" passHref>
                <div className={`font-bold text-lg text-black py-2 ${pathname === "/courseOverview" ? "underline decoration-white" : ""}`} onClick={() => { closeMenu(); setSelectedPage("courseOverview"); }}>
                  Course Overview
                </div>
              </Link>
              <Link href="/historicalRecords" passHref>
                <div className={`font-bold text-lg text-black py-2 ${pathname === "/historicalRecords" ? "underline decoration-white" : ""}`} onClick={() => { closeMenu(); setSelectedPage("historicalRecords"); }}>
                  Historical Records
                </div>
              </Link>
              <button
                onClick={() => { handleSignOut(); closeMenu(); }}
                className={`font-bold text-lg text-black w-3/5 mt-[3vh] text-center py-2 rounded-lg bg-red-300 hover:bg-red-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default InstructorNavbar;
