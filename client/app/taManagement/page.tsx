'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InstructorNavbar from "../(pages)/(Department)/navbars/instructorNavbar"; // Adjust the path if needed

type Course = {
  ID: string;
  Name: string;
  Type: string;
  InstructorName: string;
  InstructorID: string;
  Performance: string;
  TaList: Array<string>; // Initially stores TA IDs
};

type TA = {
  ID: string;
  Name: string;
  Email: string;
  Role: string;
  Rating?: string; // Optional field for rating
  Comment?: string; // Optional field for comment
};

const TAManagementPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [taDetails, setTaDetails] = useState<{ [key: string]: string }>({});
  const [allTAs, setAllTAs] = useState<TA[]>([]); // Store full list of TAs
  const [loading, setLoading] = useState(true);

  const baseUrl = 'http://localhost:9000';

  // Fetch TA Details and map TA IDs to Names
  const fetchTAs = async () => {
    try {
      const response = await axios.get(`${baseUrl}/users/TA`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` },
      });

      console.log('TA Response:', response.data);

      // Set full list of TAs with default ratings and comments
      setAllTAs(
        response.data.map((ta: TA) => ({
          ...ta,
          Rating: 'Not Rated',
          Comment: '',
        }))
      );

      // Map TA IDs to Names
      const taMap = response.data.reduce((map: { [key: string]: string }, ta: TA) => {
        map[ta.ID] = ta.Name;
        return map;
      }, {});
      setTaDetails(taMap);
    } catch (error) {
      console.error('Error fetching TAs:', error);
      toast.error('Failed to fetch TA details.');
    }
  };

  // Fetch Instructor Courses and map TA IDs to Names
  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/courses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('Token')}` },
      });

      console.log('Courses Response:', response.data);

      // Map TA IDs in each course's TaList to their Names using taDetails
      const populatedCourses = response.data.map((course: Course) => {
        const taNames = course.TaList.map(
          (taId) => taDetails[taId] || `${taId}` // Add TA ID for debugging if the name is missing
        );
        return { ...course, TaList: taNames };
      });

      setCourses(populatedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  // Handle rating selection
  const handleRatingChange = (taID: string, rating: string) => {
    setAllTAs((prevTAs) =>
      prevTAs.map((ta) => (ta.ID === taID ? { ...ta, Rating: rating } : ta))
    );
  };

  // Handle comment input
  const handleCommentChange = (taID: string, comment: string) => {
    setAllTAs((prevTAs) =>
      prevTAs.map((ta) => (ta.ID === taID ? { ...ta, Comment: comment } : ta))
    );
  };

  // Save feedback (rating + comment) to the database
  const saveFeedback = async (taID: string) => {
    const ta = allTAs.find((ta) => ta.ID === taID);
    if (!ta) return;

    try {
      const response = await axios.patch(
        `${baseUrl}/users/TA/${taID}/feedback`,
        { rating: ta.Rating, comment: ta.Comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('Token')}`,
          },
        }
      );

      console.log('Feedback saved:', response.data);
      toast.success('Feedback saved successfully!');
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback.');
    }
  };

  // Fetch TA Details first, then Courses
  useEffect(() => {
    const fetchData = async () => {
      await fetchTAs();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(taDetails).length > 0) {
      fetchInstructorCourses();
    }
  }, [taDetails]);

  return (
    <div className="ta-management min-h-screen w-screen bg-gradient-to-br from-indigo-50 to-indigo-200 flex flex-col items-center">
      {/* Navbar */}
      <InstructorNavbar selectedPage="taManagement" setSelectedPage={() => {}} />

      {/* Title */}
      <br></br>
      <h2 className="text-3xl font-bold text-blue-800 mb-6">TA Management</h2>

      {/* Description */}
      <p className="text-xl text-white text-center mb-6 max-w-xl">
        This page allows instructors to view and manage Teaching Assistants assigned to their courses. You can also view
        all available TAs below.
      </p>

      {/* Loader */}
      {loading ? (
        <p className="text-xl text-white mt-10">Loading data...</p>
      ) : (
    <div className="overflow-x-auto">
      <div className="max-h-[60rem] overflow-y-auto"> {/* Increased max height to 40rem (640px) */}
        <table className="table-auto w-full bg-white shadow-xl rounded-md">
          <thead>
            <tr className="bg-indigo-500 text-white">
              <th className="px-6 py-4 text-lg">TA Name</th>
              <th className="px-6 py-4 text-lg">Email</th>
              <th className="px-6 py-4 text-lg">Role</th>
              <th className="px-6 py-4 text-lg">Rating</th>
              <th className="px-6 py-4 text-lg">Comment</th>
              <th className="px-6 py-4 text-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allTAs.map((ta) => (
              <tr key={ta.ID} className="border-t hover:bg-indigo-50 transition-all duration-200">
                <td className="px-6 py-4 text-center text-sm text-gray-700">{ta.Name}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">{ta.Email}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">{ta.Role}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  <select
                    value={ta.Rating}
                    onChange={(e) => handleRatingChange(ta.ID, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Not Rated">Not Rated</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Below Average">Below Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  <textarea
                    value={ta.Comment || ''}
                    onChange={(e) => handleCommentChange(ta.ID, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                    placeholder="Leave a comment"
                  />
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  <button
                    onClick={() => saveFeedback(ta.ID)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Save Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>


      )}

      {/* Toastify */}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default TAManagementPage;
