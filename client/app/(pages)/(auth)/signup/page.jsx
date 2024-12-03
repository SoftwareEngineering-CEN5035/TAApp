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
    <div className="min-h-screen bg-[#FFFAF1] flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-6">
          Sign Up
        </h1>
        <form className="space-y-6" onSubmit={handleSignUp}>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-black"
            >
              <Mail className="inline-block w-5 h-5 mr-2" />
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full p-3 border border-gray-300 text-black rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-black"
            >
              <Lock className="inline-block w-5 h-5 mr-2" />
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full p-3 border border-gray-300 text-black rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-lightblue text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition duration-300"
          >
            <UserPlus className="inline-block w-5 h-5 mr-2" />
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            <Link href="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
