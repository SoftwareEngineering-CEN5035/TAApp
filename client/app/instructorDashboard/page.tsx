"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstructorNavbar from "../(pages)/(Department)/navbars/instructorNavbar"; // Adjust the path if needed
import axios from "axios";

type Course = {
  ID: string;
  Name: string;
  Type: string;
  InstructorName: string;
  ApplicationStatus: string;
  TaList: Array<string>;
};

const InstructorDashboardPage = () => {
  const [selectedPage, setSelectedPage] = useState("taManagement");
  const [sortBy, setSortBy] = useState("Name");
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // Store logged-in user's name

  const itemsPerPage = 6;

  // Fetch courses from the backend
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Token");
      const response = await axios.get("http://localhost:9000/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const normalizedCourses = response.data.map((course: any) => ({
        ID: course.ID || "",
        Name: course.Name || "",
        Type: course.Type || "",
        InstructorName: course.InstructorName || "Not Assigned",
        ApplicationStatus: course.ApplicationStatus || "",
        TaList: course.TaList || [],
      }));

      setCourses(normalizedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch logged-in user's name from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName); // Set the logged-in instructor's name
    fetchCourses();
  }, []);

  // Sort courses based on selected criteria
  const sortedCourses = [...courses].sort((a, b) => {
    if (sortBy === "Name") return a.Name.localeCompare(b.Name);
    if (sortBy === "ApplicationStatus")
      return a.ApplicationStatus.localeCompare(b.ApplicationStatus);
    return 0;
  });

  // Filter courses based on the logged-in instructor's name
  const filteredCourses = sortedCourses.filter((course) => {
    return (
      userName &&
      course.InstructorName.toLowerCase() === userName.toLowerCase()
    );
  });

  // Debugging: Log the courses and instructor name to ensure they are matching
  useEffect(() => {
    console.log("User Name:", userName);
    console.log("Filtered Courses:", filteredCourses);
  }, [userName, filteredCourses]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const displayedCourses = filteredCourses.slice(
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
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          My Courses & TA Assignments
        </h1>

        {/* Sort Options */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <label className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 text-lg">Sort By:</span>
            <select
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Name">Course Name</option>
              <option value="ApplicationStatus">Application Status</option>
            </select>
          </label>
        </div>

        {/* Loader */}
        {loading ? (
          <p className="text-blue-800 text-xl font-bold">Loading...</p>
        ) : (
          <>
            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl">
              {displayedCourses.map((course) => (
                <div
                  key={course.ID}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform transition-transform hover:scale-105"
                >
                  <h2 className="text-2xl font-bold text-blue-800 mb-4">
                    {course.Name}
                  </h2>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Type:</span> {course.Type}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Instructor:</span>{" "}
                    {course.InstructorName}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">Status:</span>{" "}
                    {course.ApplicationStatus}
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold">TA(s):</span>{" "}
                    {course.TaList.join(", ")}
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
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
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

            {/* TA Management Section */}
            {selectedPage === "taManagement" && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">
                  TA Management
                </h2>

                {/* List TA(s) for the current instructor */}
                <ul className="list-disc pl-6">
                  {filteredCourses
                    .flatMap((course) =>
                      course.TaList
                        .filter((ta) => course.InstructorName === userName)
                        .map((ta, index) => (
                          <li key={index} className="text-lg text-gray-700">
                            {ta}
                          </li>
                        ))
                    )}
                </ul>
              </div>
            )}
          </>
        )}
      </main>

      <ToastContainer />
    </div>
  );
};

export default InstructorDashboardPage;
