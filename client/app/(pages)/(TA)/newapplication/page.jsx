"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TAApplicationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hasPriorExperience: false,
    preferredCourse: "", // Single string
  });
  const [file, setFile] = useState(null); // State to hold the uploaded file
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch available courses on mount
  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:9000/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setAvailableCourses(data);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload your CV.");
      return;
    }

    try {
      const token = localStorage.getItem("Token");
      const formDataToSend = new FormData();
      formDataToSend.append("hasPriorExperience", formData.hasPriorExperience);
      formDataToSend.append("preferredCourse", formData.preferredCourse);

      const course = availableCourses.find(
        (course) => course.ID === formData.preferredCourse
      );
      if (!course) {
        setError("Invalid course selected.");
        return;
      }

      formDataToSend.append("courseName", course.Name);
      formDataToSend.append("file", file, file.name);

      const response = await fetch("http://localhost:9000/ta/application", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Failed to submit application");

      router.push("/TADashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">
          TA Application Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="priorExperience"
              checked={formData.hasPriorExperience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasPriorExperience: e.target.checked,
                }))
              }
              className="h-5 w-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-300"
            />
            <label htmlFor="priorExperience" className="ml-3 text-gray-700">
              Have you previously served as a TA?
            </label>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Preferred Course
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {availableCourses.map((course) => (
                <label
                  key={course.ID}
                  className="flex items-center space-x-3 p-3 bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  <input
                    type="radio"
                    name="preferredCourse"
                    checked={formData.preferredCourse === course.ID}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredCourse: course.ID,
                      }))
                    }
                    className="h-5 w-5 text-green-500 border-gray-300 focus:ring-green-300"
                  />
                  <span className="text-gray-700">{course.Name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="cvUpload"
              className="block text-gray-700 font-medium mb-2"
            >
              Upload Your CV (PDF)
            </label>
            <input
              id="cvUpload"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default TAApplicationPage;
