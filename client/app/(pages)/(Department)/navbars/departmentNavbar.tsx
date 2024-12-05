import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../../../_lib/firebase";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";

const DepartmentNavbar = ({ setSelectedPage, selectedPage }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState("h-24");
  const [loading, setLoading] = useState(false); // Loading state for sign-out
  const pathname = usePathname();

  const user = auth.currentUser;
  const isNotLoggedIn = user === null;

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
  }, []);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setLoading(true); // Set loading to true when starting sign out
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error: ", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleNavbarClick = (page: string) => {
    setSelectedPage(page);
    localStorage.setItem("previousDashboardItem", page);
  };

  return (
    <nav
      className={`sticky top-0 w-full overflow-hidden h-[10vh] ${navbarHeight} bg-blue-300 border-b-[1px] border-black z-50 transition-all duration-300`}
    >
      <div className="w-full h-full flex justify-between items-center px-4 sm:px-6 md:px-6">
        <div className="justify-between flex space-x-8 items-center">
          {!isMobile && (
            <>
              <div className={`font-bold text-2xl text-black`}>
                TA Application
              </div>
              <div
                className={`font-bold text-lg text-black ${
                  selectedPage === "application"
                    ? "underline decoration-white"
                    : ""
                }`}
                onClick={() => handleNavbarClick("application")}
              >
                Applications
              </div>
              <div
                className={`font-bold text-lg text-black ${
                  selectedPage === "course" ? "underline decoration-white" : ""
                }`}
                onClick={() => handleNavbarClick("course")}
              >
                Courses
              </div>
              <button
                onClick={handleSignOut}
                className={`font-bold text-lg text-black cursor-pointer absolute right-2 bg-red-300 hover:bg-red-200 h-[45px] rounded-lg w-[80px]${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading} // Disable button when loading
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
              <div
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                onClick={toggleMenu}
              ></div>
            )}
            <div
              className={`fixed top-0 right-0 w-3/4 h-full bg-[#f17418] shadow-xl z-50 flex flex-col p-4 transform transition-all duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex justify-end">
                <FaTimes
                  onClick={toggleMenu}
                  size={24}
                  className="cursor-pointer"
                />
              </div>
              <div
                className={`font-bold text-lg text-black py-2 ${
                  selectedPage === "application"
                    ? "underline decoration-white"
                    : ""
                }`}
                onClick={() => {
                  closeMenu();
                  handleNavbarClick("application");
                }}
              >
                Application
              </div>
              <div
                className={`font-bold text-lg text-black py-2 ${
                  selectedPage === "course" ? "underline decoration-white" : ""
                }`}
                onClick={() => {
                  closeMenu();
                  handleNavbarClick("course");
                }}
              >
                Course
              </div>
              <button
                onClick={() => {
                  handleSignOut();
                  closeMenu();
                }}
                className={`font-bold text-lg text-black w-3/5 mt-[3vh] text-center py-2 rounded-xl hover:bg-gray-400 cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading} // Disable button when loading
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

export default DepartmentNavbar;
