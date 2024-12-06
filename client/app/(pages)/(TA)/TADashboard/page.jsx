"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import TANavbar from "./TANavbar"; // Adjust the path if needed

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("Token"); // Assumes token is stored in localStorage
        const response = await axios.get(
          "http://localhost:9000/ta_applications/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setForms(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-200">
      <TANavbar selectedPage="dashboard" setSelectedPage={() => {}} />

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">
          Your Applications
        </h1>

        {/* Forms Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {forms.map((form) => (
            <div
              key={form.ID}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <h2 className="text-xl font-semibold text-blue-800">
                {form.CourseName}
              </h2>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Uploader:</span>{" "}
                {form.UploaderName}
              </p>
              <p className="text-gray-600 mt-1">
                <span className="font-medium">Status:</span> {form.Status}
              </p>
              <a
                href={form.FileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-blue-500 hover:underline font-medium"
              >
                View File
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
