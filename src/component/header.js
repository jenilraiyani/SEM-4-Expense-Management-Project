import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppId } from '../context/AppIdContext';
import { FiBell, FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jwtToken, userId, user, logout } = useAppId();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [userData, setUserData] = useState(null);

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {  
      if (!userId || !jwtToken) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        if (result.success) {
          setUserData(result.data);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      }
    };

    fetchUserDetails();
  }, [userId, jwtToken]);

  // Determine page title based on current route
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) {
      setPageTitle('Dashboard');
    } else if (path.includes('/people')) {
      if (path.includes('/project/')) {
        setPageTitle('Project Team');
      } else {
        setPageTitle('People Management');
      }
    } else if (path.includes('/projects')) {
      setPageTitle('Project Management');
    } else if (path.includes('/categories')) {
      setPageTitle('Category Management');
    } else if (path.includes('/expenses')) {
      setPageTitle('Expense Management');
    } else if (path.includes('/incomes')) {
      setPageTitle('Income Management');
    } else if (path.includes('/users')) {
      setPageTitle('User Management');
    } else {
      setPageTitle('Expense Management System');
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <style>
        {`
          .header-gold {
            background: #000000;
            border-bottom: 2px solid #ffd700;
            padding: 12px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .page-title {
            color: #ffd700;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            letter-spacing: 0.5px;
            position: relative;
          }

          .page-title::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 40px;
            height: 2px;
            background: #ffd700;
            border-radius: 2px;
          }

          .header-right {
            display: flex;
            align-items: center;
            gap: 25px;
          }

          .notification-icon {
            position: relative;
            cursor: pointer;
            color: #ffd700;
            font-size: 20px;
            transition: all 0.3s;
          }

          .notification-icon:hover {
            transform: scale(1.1);
          }

          .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #f85149;
            color: white;
            font-size: 10px;
            padding: 2px 5px;
            border-radius: 10px;
            min-width: 16px;
            text-align: center;
          }

          .profile-section {
            position: relative;
          }

          .profile-button {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #1a1a1a;
            border: 1px solid #ffd700;
            border-radius: 8px;
            padding: 6px 12px;
            cursor: pointer;
            transition: all 0.3s;
          }

          .profile-button:hover {
            background: #2a2a2a;
            border-color: #ffd700;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
          }

          .profile-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #ffd700;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            border: 2px solid #ffd700;
          }

          .profile-info {
            display: flex;
            flex-direction: column;
          }

          .profile-name {
            color: #ffd700;
            font-size: 14px;
            font-weight: 500;
            margin: 0;
            line-height: 1.2;
          }

          .profile-email {
            color: #cccccc;
            font-size: 11px;
            margin: 0;
          }

          .chevron-icon {
            color: #ffd700;
            margin-left: 5px;
            transition: transform 0.3s;
          }

          .chevron-icon.open {
            transform: rotate(180deg);
          }

          .profile-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 10px;
            background: #1a1a1a;
            border: 1px solid #ffd700;
            border-radius: 8px;
            width: 200px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
            animation: dropdownSlide 0.3s ease;
            z-index: 1000;
          }

          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            color: #ffffff;
            cursor: pointer;
            transition: all 0.2s;
            border-bottom: 1px solid #2a2a2a;
          }

          .dropdown-item:last-child {
            border-bottom: none;
          }

          .dropdown-item:hover {
            background: #2a2a2a;
            color: #ffd700;
          }

          .dropdown-item.logout:hover {
            background: rgba(248, 81, 73, 0.1);
            color: #f85149;
          }

          .dropdown-icon {
            color: #ffd700;
            font-size: 16px;
          }

          .dropdown-item.logout .dropdown-icon {
            color: #f85149;
          }

          .breadcrumb-nav {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #cccccc;
            font-size: 13px;
            margin-top: 4px;
          }

          .breadcrumb-nav span {
            color: #ffd700;
            cursor: pointer;
          }

          .breadcrumb-nav span:hover {
            text-decoration: underline;
          }

          .breadcrumb-separator {
            color: #ffd700;
            margin: 0 4px;
          }

          @media (max-width: 768px) {
            .header-gold {
              padding: 12px 15px;
            }
            
            .page-title {
              font-size: 20px;
            }
            
            .profile-info {
              display: none;
            }
            
            .profile-button {
              padding: 6px;
            }
          }
        `}
      </style>

      <header className="header-gold">
        <div className="header-left">
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            <div className="breadcrumb-nav">
              <span onClick={() => navigate('/dashboard')}>Home</span>
              <span className="breadcrumb-separator">/</span>
              <span>{pageTitle}</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="notification-icon">
            <FiBell />
            <span className="notification-badge">3</span>
          </div>

          <div className="profile-section">
            <div 
              className="profile-button" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {userData?.UserName ? getInitials(userData.UserName) : 'U'}
              </div>
              <div className="profile-info">
                <p className="profile-name">{userData?.UserName || 'User'}</p>
                <p className="profile-email">{userData?.EmailAddress || 'user@example.com'}</p>
              </div>
              <FiChevronDown className={`chevron-icon ${showProfileMenu ? 'open' : ''}`} />
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => navigate('/profile')}>
                  <FiUser className="dropdown-icon" />
                  <span>My Profile</span>
                </div>
                <div className="dropdown-item" onClick={() => navigate('/settings')}>
                  <FiSettings className="dropdown-icon" />
                  <span>Settings</span>
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <FiLogOut className="dropdown-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;