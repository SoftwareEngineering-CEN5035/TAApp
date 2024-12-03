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
  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("Token");
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
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
      console.log("boutta sign up or sumn");
      fetch("http://localhost:9000/signup", {
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
              options={roleOptions}
              placeholder="Select Role"
              value={roleOptions.find((opt) => opt.value === role)}
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
