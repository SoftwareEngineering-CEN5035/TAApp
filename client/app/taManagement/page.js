'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import InstructorNavbar from '../navbars/InstructorNavbar';  // Import the Navbar

const TAManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [taDetails, setTaDetails] = useState({});
  const [loading, setLoading] = useState(true);

  const baseUrl = "http://localhost:8080";

  // Fetching all TAs from the backend
  const fetchTAs = async () => {
    try {
      const response = await axios.get(`${baseUrl}/users/TA`);  // Assuming your API supports fetching all TAs
      const taMap = response.data.reduce((map, ta) => {
        map[ta.ID] = ta.Name;
        return map;
      }, {});
      setTaDetails(taMap);
    } catch (error) {
      console.error('Error fetching TAs:', error);
      toast.error('Failed to fetch TAs');
    }
  };

  // Fetching courses and TAs assigned to them
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${baseUrl}/courses`);
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTAs();
    fetchCourses();
  }, []);

  return (
    <div className="ta-management min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center">
      {/* Instructor Navbar */}
      <InstructorNavbar selectedPage="taManagement" setSelectedPage={() => {}} />

      {/* Title */}
      <h2 className="text-4xl font-bold text-white mt-8">TA Management</h2>

      {/* Description */}
      <p className="text-lg text-white mt-4">
        This page allows instructors to view and manage Teaching Assistants assigned to their courses.
      </p>

      {/* Loading or display data */}
      {loading ? (
        <p className="text-xl text-white mt-10">Loading courses...</p>
      ) : (
        <div className="mt-10 w-full max-w-4xl overflow-x-auto">
          <table className="table-auto w-full bg-white shadow-lg rounded-md">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="px-6 py-3 text-lg">Course Name</th>
                <th className="px-6 py-3 text-lg">TAs Assigned</th>
                <th className="px-6 py-3 text-lg">Professor</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.ID} className="border-t">
                  <td className="px-6 py-4 text-center">{course.Name}</td>
                  <td className="px-6 py-4 text-center">
                    {course.TaList && course.TaList.length > 0 ? (
                      course.TaList.map((taId) => {
                        return taDetails[taId] ? (
                          <div key={taId}>{taDetails[taId]}</div>
                        ) : (
                          <span key={taId}>TA information not available</span>
                        );
                      })
                    ) : (
                      <span>No TAs assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">{course.InstructorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toastify Container for custom notifications */}
      <ToastContainer />

      <style jsx>{`
        .ta-management {
          text-align: center;
          min-height: 100vh;
          color: #fff;
        }

        h2 {
          font-family: 'Roboto', sans-serif;
          font-size: 2.5rem;
          color: #fff;
          margin-bottom: 30px;
        }

        p {
          font-family: 'Roboto', sans-serif;
          font-size: 1.25rem;
          color: #fff;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }

        th {
          background-color: #3490dc;
          color: white;
        }

        td {
          background-color: #f8fafc;
        }

        td div {
          margin-bottom: 5px;
        }

        .mt-10 {
          margin-top: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default TAManagementPage;
