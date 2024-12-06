"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Your Submitted Forms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.ID}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold">{form.CourseName}</h2>
              <p className="text-gray-600">Uploader: {form.UploaderName}</p>
              <p className="text-gray-600">Status: {form.Status}</p>
              <a
                href={form.FileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 block"
              >
                View File
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
