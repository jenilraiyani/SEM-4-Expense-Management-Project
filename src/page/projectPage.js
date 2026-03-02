import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import '../style/projectPage.css';
import { useAppId } from '../context/AppIdContext'; // 1. 👇 Added context import

const ProjectManagement = () => {

  // 1. State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // 2. Initialize Navigation

  // 2. 👇 Extract jwtToken from Context
  const { jwtToken } = useAppId();

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper: Get Initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper: Get Random Color
  const getAvatarColor = (index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  };

  // 2. Fetch Projects with Dynamic Token
  const fetchProjects = async () => {
    try {
      // 3. 👇 Get Token from Context instead of localStorage
      const token = jwtToken;

      // 4. Check Token existence
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` } // 5. Use Dynamic Token
      });

      if (response.data.success) {
        const formattedData = response.data.data.map(item => {

          let timelineText = "Timeline TBD";
          if (item.ProjectStartDate && item.ProjectEndDate) {
            timelineText = `${formatDate(item.ProjectStartDate)} - ${formatDate(item.ProjectEndDate)}`;
          }

          return {
            id: item.ProjectID,
            name: item.ProjectName,
            desc: item.Description || "No description available",
            timeline: timelineText,
            status: item.IsActive ? "Active" : "Inactive",
            team: item.TeamMembers || []
          };
        });

        setProjects(formattedData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // 6. Handle Session Expiry (401)
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, jwtToken]); // 👇 Added jwtToken to dependencies

  // 3. Delete Logic with Dynamic Token
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        // 👇 Get fresh token from Context
        const token = jwtToken;

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setProjects(projects.filter(p => p.id !== id));
        }
      } catch (error) {
        // Handle 401 in Delete as well
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        alert("Failed to delete. Check server connection.");
        console.error(error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'var(--active-green)';
      case 'Planning': return 'var(--planning-blue)';
      default: return 'var(--inactive-gray)';
    }
  };

  return (
    <>
      <style>
        {`
          .project-card-enhanced {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .project-card-enhanced:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px -10px rgba(0,0,0,0.5);
            border-color: var(--text-dim);
          }
          .project-card-enhanced:hover .action-btn {
            opacity: 1;
          }
          .action-btn {
            opacity: 0.5;
            transition: opacity 0.2s;
          }
          .avatar-stack {
            display: flex;
            margin-top: 12px;
            padding-left: 10px; 
          }
          .avatar-stack span {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid var(--bg-card);
            margin-left: -10px;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            position: relative;
            z-index: 1;
            cursor: default;
          }
          .avatar-stack span:hover {
            z-index: 10;
            transform: translateY(-2px);
          }
        `}
      </style>

      <main className="main-viewport">
        <header className="page-top-nav">
          <p className="breadcrumb">Home › <span>Projects</span></p>
          <div className="stat-summary-row">
            <div className="stat-summary-box">
              <span className="label">TOTAL</span>
              <p className="value">{projects.length}</p>
            </div>
            <div className="stat-summary-box">
              <span className="label">ACTIVE</span>
              <p className="value green">{projects.filter(p => p.status === 'Active').length}</p>
            </div>
          </div>
        </header>

        <section className="headline-section">
          <h1>Project Management</h1>
          <p>Manage ongoing initiatives, track timelines, and monitor status.</p>
        </section>

        <div style={{ maxWidth: '100%' }}>

          <div className="table-controls" style={{ marginBottom: '32px' }}>
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search projects..." />
            </div>
            {/* Optional Logout Button for easy testing */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="filter-button bg-black">≡ Filter</button>
            </div>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '50px' }}>Loading Projects...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="project-card-enhanced"
                  onClick={() => navigate(`/admin/peoplemanagement/${p.id}`)} // 👈 Navigate to /people/901
                  style={{ cursor: 'pointer' }}
                >

                  {/* Status Color Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: getStatusColor(p.status)
                  }}></div>

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span className={`status-pill ${p.status.toLowerCase()}`} style={{ fontSize: '10px' }}>
                      {p.status.toUpperCase()}
                    </span>
                    <div className="action-icons">
                      <span className="action-btn" onClick={(e) => {
                        e.stopPropagation(); // Prevents navigating when clicking delete
                        handleDelete(p.id);
                      }} style={{ color: '#f85149', cursor: 'pointer' }}>
                        🗑
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px' }}>{p.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.5' }}>{p.desc}</p>

                    {/* DYNAMIC AVATARS */}
                    <div className="avatar-stack">
                      {p.team.slice(0, 3).map((member, index) => (
                        <span
                          key={member.PeopleID || index}
                          title={member.PeopleName}
                          style={{ background: getAvatarColor(index) }}
                        >
                          {getInitials(member.PeopleName)}
                        </span>
                      ))}

                      {p.team.length > 3 && (
                        <span style={{ background: '#333' }}>
                          +{p.team.length - 3}
                        </span>
                      )}

                      {p.team.length === 0 && (
                        <span style={{ background: '#2a2a2a', color: '#666', borderStyle: 'dashed' }}>
                          +
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Footer */}
                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="timeline-cell" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      <span style={{ marginRight: '6px' }}>📅</span> {p.timeline}
                    </div>
                    <span style={{ fontSize: '18px', color: 'var(--text-dim)', cursor: 'pointer' }}>→</span>
                  </div>

                </div>
              ))}
            </div>
          )}

          <footer className="pagination-footer">
            <span>Showing {projects.length} projects</span>
          </footer>
        </div>
      </main>
    </>
  );
};

export default ProjectManagement;