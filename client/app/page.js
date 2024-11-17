// client/app/page.js
'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  const [role, setRole] = useState(''); 
  const [profilePicture, setProfilePicture] = useState(''); 
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
      ProfilePicture: 'https://example.com/default-profile-pic.jpg', //Placeholder
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

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {success ? (
          <p className="success-message">Login successful! Redirecting...</p>
        ) : (
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
                  <input
                    id="role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profilePicture">Profile Picture URL:</label>
                  <input
                    id="profilePicture"
                    type="url"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="https://example.com/profile-pic.jpg"
                  />
                </div>
              </>
            )}
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="auth-button">
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>
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