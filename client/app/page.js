// client/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, provider, signInWithPopup } from './_lib/firebase';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authCard = document.querySelector('.auth-card');
    authCard.classList.add('fade-in');
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();

    const user = {
      ID: email,
      Name: name,
      Email: email,
      Password: password,
      Role: 'user',
      ProfilePicture: 'https://example.com/default-profile-pic.jpg',
    };

    const url = isRegister ? 'http://localhost:9000/CreateAccount' : 'http://localhost:9000/Login';
    const method = isRegister ? 'POST' : 'PATCH';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      if (isRegister) {
        alert('Registration successful! Please log in.');
        setIsRegister(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.id);
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setError('');
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      // Send the token to your backend to create or authenticate the user
      const response = await fetch('http://localhost:9000/GoogleLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.id);
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {success ? (
          <p className="success-message">Login successful! Redirecting...</p>
        ) : (
          <>
            <form onSubmit={handleAuth}>
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {isRegister && (
                <>
                  <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    <option value="Department Staff">Department Staff</option>
                    <option value="Instructor">Instructor</option>
                    <option value="TA">Teaching Assistant (TA)</option>
                  </select>
                  </div>
                </>
              )}
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="auth-button">
                {isRegister ? 'Register' : 'Login'}
              </button>
            </form>
            <button onClick={handleGoogleSignIn} className="gsi-material-button">
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
                <span style={{ display: 'none' }}>Sign in with Google</span>
              </div>
            </button>
          </>
        )}
        <p className="toggle-auth">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button onClick={toggleAuthMode} className="toggle-button">
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button onClick={toggleAuthMode} className="toggle-button">
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;