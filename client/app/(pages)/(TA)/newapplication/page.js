'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TAApplicationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    hasPriorExperience: false,
    preferredCourse: '', // Single string instead of an array
    fileURL: '',  
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch available courses on mount
  useEffect(() => {
    const token = localStorage.getItem('Token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:9000/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        console.log(data)
        setAvailableCourses(data);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const token = localStorage.getItem('Token');
  
      if (!formData.preferredCourse) {
        setError('Please select a course to apply for.');
        return;
      }
  
      const response = await fetch('http://localhost:9000/ta/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hasPriorExperience: formData.hasPriorExperience,
          CourseAppliedID: formData.preferredCourse, // Correct field name for backend
          fileURL: formData.fileURL,
        }),
      });
  
      if (!response.ok) throw new Error('Failed to submit application');
  
      router.push('/ta/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">TA Application Form</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={formData.hasPriorExperience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasPriorExperience: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Have you previously served as a TA?
          </label>
        </div>

        <div>
          <h2 className="text-xl mb-4">Preferred Course</h2>
          <div className="grid grid-cols-2 gap-4">
            {availableCourses.map((course) => (
              <label key={course.ID} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="preferredCourse" // Ensures all options are part of the same group
                  checked={formData.preferredCourse === course.ID}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredCourse: course.ID, // Store as a string
                    }))
                  }
                />
                <span>{course.Name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2">
            CV Upload URL:
            <input
              type="url"
              value={formData.fileURL}  // Changed from cvUrl to fileURL
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fileURL: e.target.value,  // Changed from cvUrl to fileURL
                }))
              }
              className="border p-2 rounded w-full"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default TAApplicationPage;
