"use client";
import React, { useState } from "react";
import { Mail, Lock, LogIn, User, ChevronDown } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "@firebase/auth";
import { auth, provider } from "../../../_lib/firebase";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("TA");
  const router = useRouter();
  const loginUser = async (token) => {
    try {
      const response = await fetch("http://localhost:9000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (data.isAccountMade) {
        // Store the role in localStorage
        localStorage.setItem("role", data.role);
        
        // Redirect based on user role
        switch (data.role) {
          case "TA":
            router.push("/TADashboard");
            break;
          case "Instructor":
            router.push("/instructorDashboard");
            break;
          case "Committee":
            router.push("/committeeDashboard");
            break;
          case "Department":
            router.push("/departmentDashboard");
            break;
          default:
            router.push("/dashboard"); // Fallback route
        }
      } else {
        router.push("/newuserwelcome");
      }
    } catch (error) {
      toast.error("Login validation failed. Please try again.");
    } finally {
      setLoading(false); // Reset loading state after login attempt
    }
  };

  const LoginWithEmail = async (event) => {
    event.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      setEmail("");
      setPassword("");
      return toast.error("Please do not leave inputs blank!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredentials.user.getIdToken();
      localStorage.setItem("Token", token);
      await loginUser(token);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const GoogleSignIn = async (event) => {
    event.preventDefault();
    try {
      const userCredentials = await signInWithPopup(auth, provider);
      const token = await userCredentials.user.getIdToken();
      localStorage.setItem("Token", token);
      await loginUser(token);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-blue-200 flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white shadow-2xl rounded-lg max-w-md w-full p-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Log In
        </h1>
        <form className="space-y-6" onSubmit={LoginWithEmail}>
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
            <LogIn className="w-5 h-5 mr-2" />
            Log In
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={GoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md"
          >
            Log In with Google
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
