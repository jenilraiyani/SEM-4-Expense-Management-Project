import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/projectPage.css';
import { useAppId } from '../context/AppIdContext';

const ProjectManagement = () => {
  // State
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Add Project Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    ProjectName: '',
    Description: '',
    ProjectStartDate: '',
    ProjectEndDate: '',
    IsActive: true
  });
  
  // Edit Project Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState({
    ProjectID: '',
    ProjectName: '',
    Description: '',
    ProjectStartDate: '',
    ProjectEndDate: '',
    IsActive: true
  });

  const navigate = useNavigate();
  const { jwtToken, userId } = useAppId();

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper: Format Date for Input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const token = jwtToken;

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
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
            team: item.TeamMembers || [],
            startDate: item.ProjectStartDate,
            endDate: item.ProjectEndDate
          };
        });

        setProjects(formattedData);
        setFilteredProjects(formattedData);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [navigate, jwtToken]);

  // Search and Filter Effect
  useEffect(() => {
    let filtered = [...projects];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, projects]);

  // Handle Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    
    if (!newProject.ProjectName.trim()) {
      alert('Project Name is required');
      return;
    }

    try {
      const token = jwtToken;
      
      const projectData = {
        ProjectName: newProject.ProjectName,
        Description: newProject.Description || null,
        ProjectStartDate: newProject.ProjectStartDate || null,
        ProjectEndDate: newProject.ProjectEndDate || null,
        IsActive: newProject.IsActive,
        UserID: userId
      };

      const response = await axios.post('http://localhost:5000/api/projects', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Project added successfully!');
        setShowAddModal(false);
        setNewProject({
          ProjectName: '',
          Description: '',
          ProjectStartDate: '',
          ProjectEndDate: '',
          IsActive: true
        });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error adding project:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to add project');
      }
    }
  };

  // Handle Update Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    
    try {
      const token = jwtToken;
      
      const projectData = {
        ProjectName: editProject.ProjectName,
        Description: editProject.Description || null,
        ProjectStartDate: editProject.ProjectStartDate || null,
        ProjectEndDate: editProject.ProjectEndDate || null,
        IsActive: editProject.IsActive,
        UserID: userId
      };

      const response = await axios.put(`http://localhost:5000/api/projects/${editProject.ProjectID}`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Project updated successfully!');
        setShowEditModal(false);
        fetchProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to update project');
      }
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        const token = jwtToken;

        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          alert('Project deleted successfully!');
          fetchProjects();
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
          return;
        }
        alert(error.response?.data?.message || "Failed to delete. Check server connection.");
        console.error(error);
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (project) => {
    setEditProject({
      ProjectID: project.id,
      ProjectName: project.name,
      Description: project.desc === "No description available" ? '' : project.desc,
      ProjectStartDate: formatDateForInput(project.startDate),
      ProjectEndDate: formatDateForInput(project.endDate),
      IsActive: project.status === "Active"
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Inactive': return '#6b7280';
      default: return '#6b7280';
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
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          .modal-content {
            background: #0a0a0a;
            border-radius: 16px;
            width: 500px;
            max-width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(255, 215, 0, 0.15);
            border: 1px solid rgba(255, 215, 0, 0.3);
            animation: modalSlideIn 0.3s ease;
          }
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .modal-header {
            padding: 20px;
            border-bottom: 2px solid #ffd700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #000000;
            color: #ffd700;
            border-radius: 16px 16px 0 0;
          }
          .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #ffd700;
          }
          .modal-close {
            background: #1a1a1a;
            border: 1px solid #ffd700;
            font-size: 24px;
            cursor: pointer;
            color: #ffd700;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s;
          }
          .modal-close:hover {
            background: #ffd700;
            color: #000000;
            transform: rotate(90deg);
          }
          .modal-body {
            padding: 25px;
            background: #0a0a0a;
          }
          .form-group {
            margin-bottom: 20px;
          }
          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #ffd700;
            font-size: 14px;
          }
          .form-group input[type="text"],
          .form-group input[type="date"],
          .form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #2a2a2a;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
            background: #1a1a1a;
            color: #ffffff;
          }
          .form-group input:focus,
          .form-group textarea:focus {
            border-color: #ffd700;
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
          }
          .form-group textarea {
            resize: vertical;
            min-height: 80px;
          }
          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            cursor: pointer;
          }
          .checkbox-label input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #ffd700;
          }
          .modal-footer {
            padding: 20px;
            border-top: 2px solid #ffd700;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background: #000000;
            border-radius: 0 0 16px 16px;
          }
          .btn-primary {
            background: #ffd700;
            color: #000000;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
          }
          .btn-primary:hover {
            background: #000000;
            color: #ffd700;
            border: 1px solid #ffd700;
            transform: translateY(-2px);
          }
          .btn-secondary {
            background: transparent;
            color: #ffd700;
            border: 1px solid #ffd700;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          }
          .btn-secondary:hover {
            background: rgba(255, 215, 0, 0.1);
            transform: translateY(-2px);
          }
          .filter-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: #1a1a1a;
            border: 1px solid #ffd700;
            border-radius: 8px;
            padding: 15px;
            margin-top: 5px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            z-index: 100;
            min-width: 200px;
          }
          .filter-option {
            margin-bottom: 10px;
          }
          .filter-option label {
            display: block;
            margin-bottom: 5px;
            color: #ffd700;
            font-size: 12px;
          }
          .filter-option select {
            width: 100%;
            padding: 8px;
            background: #0a0a0a;
            color: #ffffff;
            border: 1px solid #333;
            border-radius: 4px;
          }
        `}
      </style>

      <main className="main-viewport">
        <header className="page-top-nav">
          <p className="breadcrumb">Home › <span>Projects</span></p>
          <div className="stat-summary-row">
            <div className="stat-summary-box">
              <span className="label">TOTAL</span>
              <p className="value">{filteredProjects.length}</p>
            </div>
            <div className="stat-summary-box">
              <span className="label">ACTIVE</span>
              <p className="value green">{filteredProjects.filter(p => p.status === 'Active').length}</p>
            </div>
          </div>
        </header>

        <section className="headline-section">
          <h1>Project Management</h1>
          <p>Manage ongoing initiatives, track timelines, and monitor status.</p>
        </section>

        <div style={{ maxWidth: '100%' }}>
          <div className="table-controls" style={{ marginBottom: '32px', position: 'relative' }}>
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search projects by name or description..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="filter-button bg-black" 
                onClick={() => setShowFilters(!showFilters)}
                style={{ background: '#000', color: '#ffd700', border: '1px solid #ffd700' }}
              >
                ≡ Filter {statusFilter !== 'all' && '(1)'}
              </button>
              <button 
                className="btn-primary" 
                onClick={() => setShowAddModal(true)}
                style={{ padding: '8px 16px' }}
              >
                + Add Project
              </button>
            </div>
            
            {/* Filter Dropdown */}
            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-option">
                  <label>Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Projects</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
                {searchQuery && (
                  <p style={{ color: '#ffd700', fontSize: '12px', marginTop: '10px' }}>
                    Search: "{searchQuery}"
                  </p>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '50px' }}>Loading Projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div style={{ 
              color: 'var(--text-dim)', 
              textAlign: 'center', 
              marginTop: '50px',
              padding: '40px',
              background: '#1a1a1a',
              borderRadius: '8px'
            }}>
              <p>No projects found</p>
              {searchQuery && <p>Try adjusting your search or filter</p>}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="project-card-enhanced"
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
                    <div className="action-icons" style={{ display: 'flex', gap: '8px' }}>
                      <span 
                        className="action-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(p);
                        }} 
                        style={{ color: '#ffd700', cursor: 'pointer' }}
                      >
                        ✎
                      </span>
                      <span 
                        className="action-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id, p.name);
                        }} 
                        style={{ color: '#f85149', cursor: 'pointer' }}
                      >
                        🗑
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div 
                    style={{ marginBottom: '24px', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/peoplemanagement/${p.id}`)}
                  >
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
                  <div 
                    style={{ 
                      marginTop: 'auto', 
                      borderTop: '1px solid var(--border)', 
                      paddingTop: '16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/admin/peoplemanagement/${p.id}`)}
                  >
                    <div className="timeline-cell" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      <span style={{ marginRight: '6px' }}>📅</span> {p.timeline}
                    </div>
                    <span style={{ fontSize: '18px', color: 'var(--text-dim)' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="pagination-footer">
            <span>Showing {filteredProjects.length} of {projects.length} projects</span>
            {(searchQuery || statusFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                style={{ 
                  marginLeft: '10px', 
                  background: 'none', 
                  border: '1px solid #ffd700',
                  color: '#ffd700',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            )}
          </footer>
        </div>
      </main>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Project</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={newProject.ProjectName}
                    onChange={(e) => setNewProject({...newProject, ProjectName: e.target.value})}
                    required
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newProject.Description}
                    onChange={(e) => setNewProject({...newProject, Description: e.target.value})}
                    placeholder="Enter project description"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newProject.ProjectStartDate}
                    onChange={(e) => setNewProject({...newProject, ProjectStartDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newProject.ProjectEndDate}
                    onChange={(e) => setNewProject({...newProject, ProjectEndDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newProject.IsActive}
                      onChange={(e) => setNewProject({...newProject, IsActive: e.target.checked})}
                    />
                    Active Status
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Project</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={editProject.ProjectName}
                    onChange={(e) => setEditProject({...editProject, ProjectName: e.target.value})}
                    required
                    placeholder="Enter project name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editProject.Description}
                    onChange={(e) => setEditProject({...editProject, Description: e.target.value})}
                    placeholder="Enter project description"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={editProject.ProjectStartDate}
                    onChange={(e) => setEditProject({...editProject, ProjectStartDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={editProject.ProjectEndDate}
                    onChange={(e) => setEditProject({...editProject, ProjectEndDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editProject.IsActive}
                      onChange={(e) => setEditProject({...editProject, IsActive: e.target.checked})}
                    />
                    Active Status
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Update Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectManagement;