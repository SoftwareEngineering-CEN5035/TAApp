"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../_lib/firebase";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewUserWelcome = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("Token");
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoading(false);

        // Check if user document exists
        try {
          const response = await fetch(
            "http://localhost:9000/checkUserDocument",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("Token")}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const { exists, role } = await response.json();
            if (exists) {
              console.log(`User role: ${role}`);

              // Implement switch-case routing based on role
              switch (role) {
                case "TA":
                  router.push("/TADashboard");
                  break;
                case "Teacher":
                  router.push("/teacherDashboard");
                  break;
                case "TA Committee Member":
                  router.push("/committeeDashboard");
                  break;
                case "Department Staff":
                  router.push("/staffDashboard");
                  break;
                default:
                  router.push("/dashboard"); // Fallback route
              }
            }
          }
        } catch (error) {
          console.error("Error checking user document:", error);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSelectChange = (selectedOption) => {
    setRole(selectedOption.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim() === "" || role.trim() === "") {
      toast.error("Please do not leave inputs blank!");
      return;
    }

    try {
      const response = await fetch("http://localhost:9000/newuserwelcome", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      toast.success("Signup successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred");
    }
  };

  const roleOptions = [
    { value: "TA", label: "TA" },
    { value: "TA Committee Member", label: "TA Committee Member" },
    { value: "Teacher", label: "Teacher" },
    { value: "Department Staff", label: "Department Staff" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome!</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2">Role</label>
            <Select
              id="accountType"
              instanceId="accountTypeSelect"
              options={roleOptions}
              value={roleOptions.find((option) => option.value === role)}
              onChange={handleSelectChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewUserWelcome;
