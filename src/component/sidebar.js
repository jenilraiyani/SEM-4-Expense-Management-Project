import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAppId } from '../context/AppIdContext'; // 1. Import your context
import '../style/sidebar.css';

function Sidebar() {
  const [open, setOpen] = useState(false);
  
  // 2. Extract the user details from the context
  const { userName, userType } = useAppId(); 

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        ☰
      </button>

      <aside className={`sidebar sticky-top ${open ? 'open' : ''}`}>
        
        {/* Top Logo Section */}
        <div className="logo-section">
          <div className="logo-box"></div>
          <span className="logo-text">Expensify</span>
        </div>

        {/* Navigation Links */}
        <nav className="nav-menu navbar">
          <Link to="/admin" className="nav-item">Admin Dashboard</Link>
          <Link to="/admin/category" className="nav-item">Category</Link>
          {/* <Link to="/admin/peoplemanagement" className="nav-item">People Management</Link> */}
          <Link to="/admin/projectmanagement" className="nav-item">Project Management</Link>
          <Link to="/admin/report" className="nav-item">Report & Analysis</Link>
          <Link to="/admin/usermanagement" className="nav-item">User Management</Link>
          <Link to="/" className="nav-item logout-btn">Logout</Link>
        </nav>

        {/* 3. New User Footer Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {/* Show the first letter of the user's name, or 'U' if undefined */}
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{userName || 'Guest User'}</span>
              <span className="user-role" style={{ textTransform: 'capitalize' }}>
                {userType || 'No Role'}
              </span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

export default Sidebar;