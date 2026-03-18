import React, { useState, useContext } from 'react'; 
import '../style/login.css';
import { useNavigate } from 'react-router-dom';
import { useAppId } from '../context/AppIdContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Pulling the setters from your Context
  const { setUserId, setUserName, setJwtToken, setUserType } = useAppId();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ EmailAddress: email, Password: password }),
      });

      const data = await response.json();

      if (data.success) {
        // 1. Store the backend data into your Context
        setUserId(data.user.UserID);
        setUserName(data.user.UserName);
        setJwtToken(data.token);
        setUserType(data.user.UserType); // Assuming backend sends "admin" or "user"

        // 2. Use the backend response directly to navigate
        if (data.user.UserType === "admin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="brand-header">
          <div className="brand-logo">
            <div className="logo-triangle"></div>
          </div>
          <h1 className="brand-name">ExpenseManager</h1>
          <p className="welcome-text">Welcome Back</p>
        </div>

        {/* Role Toggle - Segmented Control Style */}
        {/* <div className="role-toggle-container">
          <div className="role-toggle">
            <button
              className={`toggle-btn ${userType === 'admin' ? 'active' : ''}`}
              onClick={() => setUserType('admin')}
              type="button"
            >
              Admin
            </button>
            <button
              className={`toggle-btn ${userType === 'normal' ? 'active' : ''}`}
              onClick={() => setUserType('normal')}
              type="button"
            >
              User
            </button>
          </div>
        </div> */}

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>

          {error && <div className="error-message">⚠️ {error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="finance@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-signin" disabled={loading}>
            {loading ? <span className="loader"></span> : "Sign In"}
          </button>

        </form>

        <div className="login-footer">
          <a href="#forgot" className="link-forgot">Forgot password?</a>
          <div className="footer-divider"></div>
          <a href="#support" className="link-support">
            Help <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;