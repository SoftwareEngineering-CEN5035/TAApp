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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoading(false);
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center px-4">
      <ToastContainer />
      <div className="bg-white shadow-2xl rounded-lg max-w-md w-full p-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Welcome!
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Role
            </label>
            <Select
              id="accountType"
              instanceId="accountTypeSelect"
              options={roleOptions}
              value={roleOptions.find((option) => option.value === role)}
              onChange={handleSelectChange}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewUserWelcome;