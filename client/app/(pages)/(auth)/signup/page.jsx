"use client";
import React, { useState } from "react";
import { Mail, Lock, UserPlus } from "lucide-react";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { auth } from "../../../_lib/firebase";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      setEmail("");
      setPassword("");
      return toast.error("Please do not leave inputs blank!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      toast.success("Account created successfully!");

      // Redirect to the login page after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white shadow-2xl rounded-lg max-w-md w-full p-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Create Your Account
        </h1>
        <form className="space-y-6" onSubmit={handleSignUp}>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              <Mail className="inline-block w-5 h-5 mr-2 text-gray-500" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              <Lock className="inline-block w-5 h-5 mr-2 text-gray-500" />
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out duration-150"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-md"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-semibold"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
