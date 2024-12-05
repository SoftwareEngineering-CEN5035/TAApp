'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import InstructorNavbar from "../navbars/instructorNavbar"; // Adjust the path based on your file structure

const InstructorDashboardPage = () => {
  const router = useRouter();
  
  // Declare selectedPage state
  const [selectedPage, setSelectedPage] = useState("taManagement"); // Default page can be set here

  const handleWidgetClick = (path) => {
    router.push(path);
  };

  return (
    <div className="dashboard min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center">

      <InstructorNavbar 
        selectedPage={selectedPage} 
        setSelectedPage={setSelectedPage} 
      />

      {/* Instructor Dashboard Title */}
      <h1 className="text-4xl font-bold text-white mt-8">Instructor Dashboard</h1>

      {/* Container to center widgets in the middle */}
      <div className="dashboard-content flex-1 flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* TA Management Widget */}
          <div className="widget" onClick={() => handleWidgetClick('/taManagement')}>
            <h2>TA Management</h2>
            <p>View and manage Teaching Assistants assigned to your courses.</p>
          </div>

          {/* Performance Feedback Widget */}
          <div className="widget" onClick={() => handleWidgetClick('/performanceFeedback')}>
            <h2>TA Feedback</h2>
            <p>Provide and track performance evaluations for TAs.</p>
          </div>

          {/* Course Overview Widget */}
          <div className="widget" onClick={() => handleWidgetClick('/courseOverview')}>
            <h2>Course Overview</h2>
            <p>Check the courses you are teaching and the assigned TAs.</p>
          </div>

          {/* Historical Records Widget */}
          <div className="widget" onClick={() => handleWidgetClick('/historicalRecords')}>
            <h2>Historical Records</h2>
            <p>Review historical TA assignments and feedback for future consideration.</p>
          </div>
        </div>
      </div>

      {/* Toastify Container for custom notifications */}
      <ToastContainer />

      <style jsx>{`
        .dashboard {
          text-align: center;
          min-height: 100vh;
          color: #fff; /* White text for contrast */
        }

        h1 {
          font-family: 'Roboto', sans-serif; /* Custom font for the title */
          font-size: 2.5rem;
          color: #fff; /* White text for heading */
          margin-bottom: 30px;
        }

        .dashboard-content {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .dashboard-content .grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr); /* Default to 1 column for small screens */
          gap: 20px;
          justify-items: center;
        }

        @media (min-width: 640px) {
          .dashboard-content .grid {
            grid-template-columns: repeat(2, 1fr); /* 2 columns on medium screens */
          }
        }

        @media (min-width: 768px) {
          .dashboard-content .grid {
            grid-template-columns: repeat(3, 1fr); /* 3 columns on larger screens */
          }
        }

        @media (min-width: 1024px) {
          .dashboard-content .grid {
            grid-template-columns: repeat(4, 1fr); /* 4 columns on even larger screens */
          }
        }

        .widget {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          width: 250px; /* Fixed width */
          height: 250px; /* Fixed height */
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s ease;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Arial', sans-serif; /* Custom font for the widgets */
        }

        .widget:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .widget h2 {
          margin-bottom: 10px;
          font-size: 1.5rem;
          color: #333; /* Darker text color for widget titles */
        }

        .widget p {
          font-size: 1rem;
          color: #555; /* Slightly lighter text color for widget descriptions */
        }
      `}</style>
    </div>
  );
};

export default InstructorDashboardPage;
