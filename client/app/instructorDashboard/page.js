"use client";

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstructorNavbar from "../(pages)/(Department)/navbars/instructorNavbar"; // Adjust the path as needed

const InstructorDashboardPage = () => {
  const [selectedPage, setSelectedPage] = useState("taManagement");
  const [sortBy, setSortBy] = useState("courseName");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data that will be replaced with live information from the backend
  const courses = [
    {
      courseName: "Advanced AI",
      taName: "John Doe",
      semester: "Fall 2024",
      applicationStatus: "Approved",
    },
    {
      courseName: "Data Mining",
      taName: "Jane Roe",
      semester: "Spring 2024",
      applicationStatus: "Pending",
    },
    {
      courseName: "Machine Learning",
      taName: "Alice",
      semester: "Winter 2024",
      applicationStatus: "Rejected",
    },
    {
      courseName: "Cybersecurity",
      taName: "Bob",
      semester: "Summer 2024",
      applicationStatus: "Approved",
    },
  ];

  // Sort courses based on selected criteria
  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === "courseName") return a.courseName.localeCompare(b.courseName);
    if (sortBy === "semester") return a.semester.localeCompare(b.semester);
    if (sortBy === "applicationStatus")
      return a.applicationStatus.localeCompare(b.applicationStatus);
    return 0;
  });

  // Pagination logic
  const itemsPerPage = 9;
  const totalPages = Math.ceil(sortedCourses.length / itemsPerPage);
  const displayedCourses = sortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      {/* Navbar */}
      <InstructorNavbar
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
      />

      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Upcoming Courses & TA's</h1>

        {/* Sort Options */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <label className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 text-lg">Sort By:</span>
            <select
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="courseName">Course Name</option>
              <option value="semester">Semester</option>
              <option value="applicationStatus">Application Status</option>
            </select>
          </label>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl">
          {displayedCourses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform transition-transform hover:scale-105"
            >
              <h2 className="text-2xl font-bold text-blue-800 mb-4">
                {course.courseName}
              </h2>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">TA Name:</span> {course.taName}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Semester:</span> {course.semester}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Status:</span>{" "}
                {course.applicationStatus}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-lg ${currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
                }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export default InstructorDashboardPage;