"use client";
import React, { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { signInWithEmailAndPassword, signInWithPopup } from "@firebase/auth";
import { auth, provider } from "../../../_lib/firebase";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";
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
        // Redirect based on user role
        switch (
          data.role // Using role from backend response
        ) {
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
      } else {
        router.push("/newuserwelcome");
      }
    } catch (error) {
      toast.error("Failed to validate login. Please try again.");
    }
  };

  const LoginWithEmail = async (event) => {
    event.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      setEmail("");
      setPassword("");
      return toast.error("Please do not leave inputs blank!");
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
    <div className="min-h-screen bg-[#FFFAF1] flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center text-black mb-6">
          Sign In
        </h1>
        <form className="space-y-6">
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
              className="w-full p-3 border border-gray-300 rounded-md text-black"
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
              className="w-full p-3 border border-gray-300 text-black rounded-md"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={LoginWithEmail}
            className="w-full bg-lightblue text-white px-6 py-3 rounded-md"
          >
            <LogIn className="inline-block w-5 h-5 mr-2" />
            Login
          </button>
        </form>
        <div className="mt-6">
          <button
            onClick={GoogleSignIn}
            className="w-full bg-white border text-gray-700 px-6 py-3 rounded-md"
          >
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
