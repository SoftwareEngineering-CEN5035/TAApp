"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ApplicationDecision = ({ params }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { formId } = params;

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("Token");
        const response = await axios.get(
          `http://localhost:9000/ta_applications/${formId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplication(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [formId]);

  const handleDecision = async (decision) => {
    if (application?.Status !== "Pending Applicant Approval") {
      alert(
        "You can only make decisions on applications with 'Pending Applicant Approval' status."
      );
      return;
    }

    try {
      const token = localStorage.getItem("Token");
      await axios.patch(
        `http://localhost:9000/ta_applications/${formId}`,
        { status: decision === "accept" ? "Accepted" : "TA Rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(
        `Application has been ${
          decision === "accept" ? "accepted" : "rejected"
        }.`
      );
      router.push("/TADashboard");
    } catch (err) {
      alert("Failed to update status. Please try again.");
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Application Details</h1>
      <p className="mt-4">
        <strong>Uploader:</strong> {application.UploaderName}
      </p>
      <p className="mt-2">
        <strong>Course:</strong> {application.CourseName}
      </p>
      <p className="mt-2">
        <strong>Previous Experience:</strong>{" "}
        {application.PreviousExperience ? "Yes" : "No"}
      </p>
      <p className="mt-2">
        <strong>Status:</strong> {application.Status}
      </p>
      <a
        href={application.FileURL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline mt-4 block"
      >
        View Application File
      </a>
      {application.Status === "Pending Applicant Approval" && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => handleDecision("accept")}
            className="bg-green-600 text-white font-semibold px-4 py-2 rounded"
          >
            Accept
          </button>
          <button
            onClick={() => handleDecision("deny")}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded"
          >
            Deny
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationDecision;
