// isCorrectRole.js
import { useRouter } from "next/navigation";

export default async function isCorrectRole(expectedRole) {
  const router = useRouter();

  // Fetch the token from localStorage (or use another method if necessary)
  const token = localStorage.getItem("Token");

  if (!token) {
    router.push("/login"); // Redirect to login if no token
    return;
  }

  try {
    // Make a request to check the user's document and role
    const response = await fetch("http://localhost:9000/checkUserDocument", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const { exists, role: userRole } = await response.json();

    if (!exists) {
      // If the user doesn't exist in the database, redirect to the "new user welcome" page
      router.push("/newuserwelcome");
      return;
    }

    // Check if the user's role matches the expected role
    if (userRole !== expectedRole) {
    
      // If the roles don't match, redirect to the correct dashboard based on their role
      switch (userRole) {
        case "TA":
          router.push("/TADashboard");
          break;
        case "Instructor":
          router.push("/InstructorDashboard");
          break;
        case "Committee":
          router.push("/committeeDashboard/applications");
          break;
        case "Department":
          router.push("/departmentDashboard/courses");
          break;
        default:
          router.push("/defaultDashboard"); // Fallback dashboard if role is unexpected
          break;
      }
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    router.push("/errorPage"); // Redirect to an error page if something goes wrong
  }
}
