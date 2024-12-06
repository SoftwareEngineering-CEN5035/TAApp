'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InstructorNavbar from '../(pages)/(Department)/navbars/instructorNavbar';

type Course = {
  ID: string;
  Name: string;
  Type: string;
  InstructorName: string;
  InstructorID: string;
  Performance: string;
  TaList: Array<string>; // Initially stores TA IDs
};

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = 'http://localhost:9000';

  // Fetch Instructor Courses
  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('Token')}`,
        },
      });
      console.log('Courses Response:', response.data);

      setCourses(response.data); // Set the courses in state
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses on Component Mount
  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  return (
    <div className="courses-page min-h-screen w-screen bg-gradient-to-br from-indigo-50 to-indigo-200 flex flex-col items-center">
      {/* Instructor Navbar */}
      <InstructorNavbar selectedPage="coursesPage" setSelectedPage={() => {}} />

      {/* Title */}
      <br></br>
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Courses</h2>

      {/* Description */}
      <p className="text-xl text-white text-center mb-6 max-w-xl">
        This page allows instructors to view all their courses along with the TAs assigned to them.
      </p>

      {/* Loading or displaying data */}
      {loading ? (
        <p className="text-xl text-white mt-10">Loading courses...</p>
      ) : (
        <div className="mt-10 w-full max-w-6xl overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-xl rounded-md">
            <thead>
              <tr className="bg-indigo-500 text-white">
                <th className="px-6 py-4 text-lg">Course Name</th>
                <th className="px-6 py-4 text-lg">TAs Assigned</th>
                <th className="px-6 py-4 text-lg">Professor</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.ID} className="border-t hover:bg-indigo-50 transition-all duration-200">
                  <td className="px-6 py-4 text-center text-sm text-gray-700">{course.Name}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {course.TaList && course.TaList.length > 0 ? (
                      course.TaList.map((taId, index) => (
                        <div key={index}>{taId}</div> // Render TA IDs (replace with names if needed)
                      ))
                    ) : (
                      <span>No TAs assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">{course.InstructorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toastify Container */}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default CoursesPage;
