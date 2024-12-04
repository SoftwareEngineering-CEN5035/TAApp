// pages/check-login.js
'use client'
import { useEffect, useState } from "react";
import { auth } from "../_lib/firebase"; // Import your Firebase config

const CheckLogin = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getTokenAndSend = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Get the Firebase ID Token
          const idToken = await user.getIdToken();

          // Send the token to your backend
          console.log(idToken)
        } else {
          setError("No user is logged in");
        }
      } catch (err) {
        setError("Error fetching the token or making the request");
        console.error(err);
      }
    };

    // Call the function to get token and send the request
    getTokenAndSend();
  }, []); // Empty dependency array means this runs only once when the page loads

  return (
    <div>
      <h1>Check User Login Status</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {userData ? (
        <div>
          <p>User is logged in with UID: {userData.uid}</p>
          {/* Render any other user data if necessary */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CheckLogin;
