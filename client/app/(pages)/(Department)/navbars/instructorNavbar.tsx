'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../../_lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

const InstructorNavbar = ({ setSelectedPage, selectedPage }) => {
  const [navbarHeight, setNavbarHeight] = useState('h-20');
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState<string | null>(''); // State for the username

  const router = useRouter();
  const pathname = usePathname();

  // Fetch the username from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    setUserName(storedUserName || ''); // Default to empty string if no username is found
  }, []);

  // Adjust navbar height on scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavbarHeight(window.scrollY > 50 ? 'h-16' : 'h-20');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset isCollapsed state when resizing above lg
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Update page on navigation
  const handleNavigation = (page: string) => {
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
        <div className="text-2xl font-bold text-blue-800">Instructor Portal</div>

        {/* Welcome Message */}
        {userName && (
          <div className="text-lg text-gray-700 font-medium hidden lg:block">
            Welcome, <span className="text-blue-800 font-bold">{userName}</span>
          </div>
        )}

        {/* Navigation Links */}
        <div
          className={`lg:flex flex-col lg:flex-row lg:items-center lg:space-x-6 ${
            isCollapsed ? 'flex' : 'hidden lg:flex'
          } absolute lg:static top-full left-0 w-full lg:w-auto ${
            isCollapsed
              ? 'bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200'
              : 'lg:bg-transparent'
          } shadow-md lg:shadow-none z-40 transition-all duration-300`}
        >
          <div
            className={`cursor-pointer text-lg font-medium px-6 lg:px-0 py-2 lg:py-0 ${
              pathname === '/instructorDashboard'
                ? 'text-blue-800 underline underline-offset-4'
                : 'text-gray-700 hover:text-blue-800'
            }`}
            onClick={() => handleNavigation('instructorDashboard')}
          >
            Dashboard
          </div>
          <div
            className={`cursor-pointer text-lg font-medium px-6 lg:px-0 py-2 lg:py-0 ${
              pathname === '/taManagement'
                ? 'text-blue-800 underline underline-offset-4'
                : 'text-gray-700 hover:text-blue-800'
            }`}
            onClick={() => handleNavigation('taManagement')}
          >
            TA Management
          </div>
          <div
            className={`cursor-pointer text-lg font-medium px-6 lg:px-0 py-2 lg:py-0 ${
              pathname === '/taFeedback'
                ? 'text-blue-800 underline underline-offset-4'
                : 'text-gray-700 hover:text-blue-800'
            }`}
            onClick={() => handleNavigation('taFeedback')}
          >
            TA Feedback
          </div>
          <div
            className={`cursor-pointer text-lg font-medium px-6 lg:px-0 py-2 lg:py-0 ${
              pathname === '/courseOverview'
                ? 'text-blue-800 underline underline-offset-4'
                : 'text-gray-700 hover:text-blue-800'
            }`}
            onClick={() => handleNavigation('courseOverview')}
          >
            Course Overview
          </div>
        </div>

        {/* Collapsible Menu Button */}
        <button
          className="lg:hidden text-gray-700 hover:text-blue-800 focus:outline-none"
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? 'Close' : 'Menu'}
        </button>

        {/* Sign-Out Button */}
        <button
          onClick={handleSignOut}
          className={`flex items-center justify-center text-gray-700 hover:text-red-500 transition-all duration-200 focus:outline-none ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default InstructorNavbar;
