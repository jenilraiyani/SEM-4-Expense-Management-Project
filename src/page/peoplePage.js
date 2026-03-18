import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../style/peoplePage.css'
import { useAppId } from '../context/AppIdContext';

const PeopleManagement = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { jwtToken, userId } = useAppId();

  const [peoples, setPeoples] = useState([]);
  const [filteredPeoples, setFilteredPeoples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("All Employees");
  const [projectData, setProjectData] = useState(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Add Person Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', desc: '', isActive: true
  });

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    PeopleID: '',
    PeopleName: '',
    Email: '',
    MobileNo: '',
    Description: '',
    IsActive: true
  });

  // View Details Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState({
    PeopleID: '',
    PeopleCode: '',
    PeopleName: '',
    Email: '',
    MobileNo: '',
    Description: '',
    IsActive: true
  });

  // Function to update project's PeopleID array
  const updateProjectPeople = async (peopleId, action) => {
    if (!projectId || !projectData) return;
    
    try {
      const token = jwtToken;
      let updatedPeopleIds = [...(projectData.PeopleID || [])];
      
      if (action === 'add') {
        if (!updatedPeopleIds.includes(peopleId)) {
          updatedPeopleIds.push(peopleId);
        }
      } else if (action === 'remove') {
        updatedPeopleIds = updatedPeopleIds.filter(id => id !== peopleId);
      }
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...projectData,
          PeopleID: updatedPeopleIds
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh project data
        const projectResponse = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const projectResult = await projectResponse.json();
        if (projectResult.success) {
          setProjectData(projectResult.data);
          setPeoples(projectResult.data.TeamMembers || []);
          setFilteredPeoples(projectResult.data.TeamMembers || []);
        }
      }
    } catch (err) {
      console.error('Error updating project people:', err);
    }
  };

  // Fetch Data Logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = jwtToken;
        if (!token) { 
          alert('Please login to continue');
          navigate('/login'); 
          return; 
        }

        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        if (projectId) {
          // SCENARIO 1: SHOW PROJECT TEAM
          const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, { headers });
          const result = await response.json();
          
          if (result.success) {
            setProjectData(result.data);
            setPeoples(result.data.TeamMembers || []);
            setFilteredPeoples(result.data.TeamMembers || []);
            setProjectName(result.data.ProjectName);
          } else {
            alert(result.message || 'Failed to fetch project team');
          }
        } else {
          // SCENARIO 2: SHOW ALL PEOPLE
          const response = await fetch('http://localhost:5000/api/people', { headers });
          const result = await response.json();
          if (result.success) {
            setPeoples(result.data);
            setFilteredPeoples(result.data);
            setProjectName("All Employees");
          } else {
            alert(result.message || 'Failed to fetch people');
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Network error. Please check your connection.');
        if (err.response && err.response.status === 401) {
          alert('Session expired. Please login again.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, navigate, jwtToken]);

  // Search and Filter Effect
  useEffect(() => {
    let filtered = [...peoples];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(person => 
        (person.PeopleName && person.PeopleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (person.Email && person.Email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (person.Description && person.Description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(person => 
        statusFilter === 'active' ? person.IsActive : !person.IsActive
      );
    }
    
    setFilteredPeoples(filtered);
  }, [searchQuery, statusFilter, peoples]);

  // Handle Save (Create New Person)
  const handleSave = async (e) => {
    e.preventDefault();
    const token = jwtToken;

    try {
      const payload = {
        PeopleName: formData.name,
        Email: formData.email,
        MobileNo: formData.phone,
        Description: formData.desc,
        IsActive: formData.isActive,
        ProjectID: projectId || 0,
        UserID: userId || 0
      };

      const response = await fetch('http://localhost:5000/api/people', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        alert('Person added successfully!');
        setShowAddModal(false);
        
        // If we're in a project context, add this person to the project
        if (projectId && result.data.PeopleID) {
          await updateProjectPeople(result.data.PeopleID, 'add');
        } else {
          setPeoples([...peoples, result.data]);
        }
        
        resetForm();
      } else {
        alert(result.message || "Failed to save");
      }
    } catch (err) {
      console.error('Save error:', err);
      alert("Network error. Please try again.");
    }
  };

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = jwtToken;

    try {
      const payload = {
        PeopleName: editData.PeopleName,
        Email: editData.Email,
        MobileNo: editData.MobileNo,
        Description: editData.Description,
        IsActive: editData.IsActive,
        UserID: userId || 0
      };

      const response = await fetch(`http://localhost:5000/api/people/${editData.PeopleID}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        alert('Person updated successfully!');
        setShowEditModal(false);
        
        // Update the person in the list
        setPeoples(prevPeoples => 
          prevPeoples.map(p => 
            p.PeopleID === editData.PeopleID 
              ? { ...p, ...payload, PeopleID: editData.PeopleID }
              : p
          )
        );
      } else {
        alert(result.message || "Failed to update");
      }
    } catch (err) {
      console.error('Update error:', err);
      alert("Network error. Please try again.");
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const token = jwtToken;
        
        // If we're in a project context, remove this person from the project first
        if (projectId) {
          await updateProjectPeople(id, 'remove');
        }
        
        const response = await fetch(`http://localhost:5000/api/people/${id}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        
        if (result.success) {
          alert('Person deleted successfully!');
          setPeoples(peoples.filter(p => p.PeopleID !== id));
          setShowViewModal(false);
        } else {
          alert(result.message || "Failed to delete");
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert("Network error. Please try again.");
      }
    }
  };

  // Handle Remove from Project (without deleting)
  const handleRemoveFromProject = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from this project?`)) {
      await updateProjectPeople(id, 'remove');
      setShowViewModal(false);
    }
  };

  // Handle View Details
  const handleViewDetails = (person) => {
    setViewData({
      PeopleID: person.PeopleID,
      PeopleCode: person.PeopleCode || 'N/A',
      PeopleName: person.PeopleName || '',
      Email: person.Email || '',
      MobileNo: person.MobileNo || '',
      Description: person.Description || 'No description',
      IsActive: person.IsActive
    });
    setShowViewModal(true);
  };

  // Open Edit Modal from View Modal
  const handleEditFromView = () => {
    setShowViewModal(false);
    setEditData({
      PeopleID: viewData.PeopleID,
      PeopleName: viewData.PeopleName,
      Email: viewData.Email,
      MobileNo: viewData.MobileNo,
      Description: viewData.Description === 'No description' ? '' : viewData.Description,
      IsActive: viewData.IsActive
    });
    setShowEditModal(true);
  };

  // Open Edit Modal
  const openEditModal = (person) => {
    setEditData({
      PeopleID: person.PeopleID,
      PeopleName: person.PeopleName || '',
      Email: person.Email || '',
      MobileNo: person.MobileNo || '',
      Description: person.Description || '',
      IsActive: person.IsActive
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', desc: '', isActive: true });
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <>
      <style>
        {`
          /* Modal Overlays & Animations */
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          .modal-content {
            background: #111111;
            border-radius: 12px;
            width: 500px;
            max-width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 215, 0, 0.2);
            animation: modalSlideIn 0.3s ease;
          }
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .modal-header {
            padding: 24px 24px 20px;
            border-bottom: 1px solid #222;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .modal-header h3 {
            margin: 0; font-size: 20px; font-weight: 600; color: #ffd700;
          }
          .modal-close {
            background: transparent; border: none; font-size: 24px;
            cursor: pointer; color: #888;
            transition: color 0.2s;
          }
          .modal-close:hover { color: #ffd700; }
          .modal-body { padding: 24px; }
          
          /* Form Elements */
          .form-group { margin-bottom: 20px; }
          .form-group label {
            display: block; margin-bottom: 8px; font-weight: 500;
            color: #aaa; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;
          }
          .form-group input[type="text"],
          .form-group input[type="email"],
          .form-group input[type="tel"],
          .form-group textarea,
          .form-group select {
            width: 100%; padding: 12px 16px; border: 1px solid #333;
            border-radius: 8px; font-size: 14px; transition: all 0.2s;
            background: #0a0a0a; color: #fff; box-sizing: border-box;
          }
          .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
            border-color: #ffd700; outline: none; background: #111;
          }
          .form-group textarea { resize: vertical; min-height: 80px; }
          
          /* Modals Custom Elements */
          .checkbox-label {
            display: flex; align-items: center; gap: 10px; color: #eee; cursor: pointer; font-size: 14px;
          }
          .checkbox-label input[type="checkbox"] {
            width: 18px; height: 18px; cursor: pointer; accent-color: #ffd700;
          }
          .modal-footer {
            padding: 20px 24px; border-top: 1px solid #222;
            display: flex; justify-content: flex-end; gap: 12px; background: #0a0a0a;
          }
          
          /* Buttons */
          .btn-primary {
            background: #ffd700; color: #000; border: none;
            padding: 10px 24px; border-radius: 8px; cursor: pointer;
            font-size: 14px; font-weight: 600; transition: background 0.2s;
          }
          .btn-primary:hover { background: #e6c200; }
          .btn-secondary {
            background: transparent; color: #eee; border: 1px solid #444;
            padding: 10px 24px; border-radius: 8px; cursor: pointer;
            font-size: 14px; font-weight: 500; transition: background 0.2s;
          }
          .btn-secondary:hover { background: #222; }
          .btn-danger {
            background: transparent; color: #f85149; border: 1px solid rgba(248, 81, 73, 0.5);
            padding: 10px 24px; border-radius: 8px; cursor: pointer;
            font-size: 14px; font-weight: 500; transition: background 0.2s;
          }
          .btn-danger:hover { background: rgba(248, 81, 73, 0.1); }
          .action-btn {
            background: none; border: none; cursor: pointer;
            font-size: 16px; margin: 0 6px; transition: transform 0.2s; padding: 4px;
          }
          .action-btn:hover { transform: scale(1.15); }
          .edit-btn { color: #ffd700; }
          .delete-btn { color: #f85149; }
          .remove-btn { color: #ffd700; font-size: 14px; }
          
          /* Professional Page Styling Enhancements */
          .pro-table-container {
            background: #111111;
            border-radius: 12px;
            border: 1px solid #222;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            padding: 24px;
            margin-top: 20px;
          }
          .pro-toolbar {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
          }
          .pro-search-box {
            display: flex; align-items: center; background: #0a0a0a;
            border: 1px solid #333; border-radius: 8px; padding: 10px 16px; width: 300px; transition: border-color 0.2s;
          }
          .pro-search-box:focus-within { border-color: #ffd700; }
          .pro-search-box input {
            background: transparent; border: none; color: #fff; outline: none; margin-left: 10px; width: 100%; font-size: 14px;
          }
          
          /* Modern Professional Table */
          .pro-people-table {
            width: 100%; border-collapse: separate; border-spacing: 0;
          }
          .pro-people-table th {
            text-align: left; padding: 16px; color: #888; font-weight: 600;
            font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
            border-bottom: 2px solid #222;
          }
          .pro-people-table td {
            padding: 16px; color: #ddd; vertical-align: middle; font-size: 14px;
            border-bottom: 1px solid #1a1a1a; transition: background 0.2s;
          }
          .clickable-row { cursor: pointer; }
          .clickable-row:hover td { background: #161616; }
          
          .user-cell { display: flex; align-items: center; }
          .initials-circle {
            background: #2f81f7; color: #fff; width: 36px; height: 36px; 
            border-radius: 50%; display: flex; align-items: center; justify-content: center; 
            font-size: 14px; font-weight: 600; margin-right: 12px; border: 2px solid #111;
          }
          .u-name { margin: 0; font-weight: 500; color: #fff; }
          
          .status-dot {
            display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          }
          .status-dot.active { background: rgba(63, 185, 80, 0.15); color: #3fb950; border: 1px solid rgba(63, 185, 80, 0.2); }
          .status-dot.inactive { background: rgba(248, 81, 73, 0.15); color: #f85149; border: 1px solid rgba(248, 81, 73, 0.2); }
          
          /* View Details Row */
          .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #222; }
          .detail-label { width: 130px; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .detail-value { flex: 1; color: #fff; font-size: 15px; }
          
          /* Filter Dropdown */
          .filter-dropdown {
            position: absolute; top: 100%; right: 0; background: #111; border: 1px solid #333;
            border-radius: 8px; padding: 16px; margin-top: 8px; box-shadow: 0 10px 24px rgba(0,0,0,0.5); z-index: 100; min-width: 220px;
          }
        `}
      </style>

      <main className="content-area">
        <header className="top-nav">
          <div className="breadcrumb">Home / Settings / <span>{projectId ? 'Project Team' : 'People Management'}</span></div>
          <div className="top-actions">
            <span className="bell">🔔</span>
            <div className="user-circle"></div>
          </div>
        </header>

        <section className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <div className="title-block">
            <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#fff' }}>{projectId ? `Team: ${projectName}` : 'People Management'}</h1>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{projectId ? `Manage members assigned to ${projectName}` : 'Manage employee records, roles, and access permissions.'}</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={() => alert("Exporting records...")}>📤 Export</button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>+</span> Add {projectId ? 'Team Member' : 'Person'}
            </button>
          </div>
        </section>

        <div className="layout-grid" style={{ gridTemplateColumns: '1fr' }}>
          {/* Professional Card Container for Table */}
          <div className="pro-table-container">
            <div className="pro-toolbar" style={{ position: 'relative' }}>
              <div className="pro-search-box">
                <span className="search-icon" style={{ color: '#888' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name, email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-buttons" style={{ display: 'flex', gap: '12px' }}>
                {projectId && (
                    <button className="btn-secondary" onClick={() => navigate('/people')}>
                        ← Back to All
                    </button>
                )}
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ borderColor: showFilters || statusFilter !== 'all' ? '#ffd700' : '#444', color: showFilters || statusFilter !== 'all' ? '#ffd700' : '#eee' }}
                >
                  Filter {statusFilter !== 'all' && '(1)'}
                </button>
              </div>
              
              {/* Filter Dropdown */}
              {showFilters && (
                <div className="filter-dropdown">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Status</label>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All People</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                  {searchQuery && (
                    <p style={{ color: '#ffd700', fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
                      Search Active: "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {loading ? <p style={{padding:'40px 20px', textAlign: 'center', color: '#888'}}>Loading data...</p> : (
            <table className="pro-people-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeoples.length > 0 ? filteredPeoples.map((p, i) => (
                  <tr 
                    key={p.PeopleID || i} 
                    className="clickable-row"
                    onClick={() => handleViewDetails(p)}
                  >
                    <td>
                      <div className="user-cell">
                        <div className="initials-circle">
                            {p.PeopleName?.charAt(0)}
                        </div>
                        <div>
                          <p className="u-name">{p.PeopleName}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#aaa' }}>{p.Email}</td>
                    <td style={{ color: '#aaa' }}>{p.MobileNo || 'N/A'}</td>
                    <td style={{ color: '#aaa', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.Description || '—'}</td>
                    <td>
                      <span className={`status-dot ${p.IsActive ? 'active' : 'inactive'}`}>
                        {p.IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )) : (
                    <tr>
                      <td colSpan="5" style={{textAlign:'center', padding:'40px 20px', color: '#888'}}>
                        {searchQuery || statusFilter !== 'all' 
                          ? 'No matching records found.' 
                          : projectId 
                            ? 'No team members found for this project.' 
                            : 'No people found.'}
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
            )}

            <footer style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: '13px' }}>
              <span>Showing {filteredPeoples.length} of {peoples.length} records</span>
              {(searchQuery || statusFilter !== 'all') && (
                <button 
                  onClick={clearFilters}
                  style={{ 
                    background: 'transparent', border: '1px solid #ffd700', color: '#ffd700',
                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </footer>
          </div>
        </div>
      </main>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{projectId ? 'Add Team Member' : 'Add New Person'}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="john@company.com" />
                </div>
                <div className="form-group">
                  <label>Mobile No</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 555 000 0000" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} placeholder="Role, notes, etc..." rows="3" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                    <span>Set as Active Employee</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Person</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Person</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={editData.PeopleName} onChange={(e) => setEditData({...editData, PeopleName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={editData.Email} onChange={(e) => setEditData({...editData, Email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Mobile No</label>
                  <input type="tel" value={editData.MobileNo} onChange={(e) => setEditData({...editData, MobileNo: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={editData.Description} onChange={(e) => setEditData({...editData, Description: e.target.value})} rows="3" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={editData.IsActive} onChange={(e) => setEditData({...editData, IsActive: e.target.checked})} />
                    <span>Active Employee</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Person Details Modal */}
      {showViewModal && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Person Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value" style={{ fontWeight: '500', color: '#fff' }}>{viewData.PeopleName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{viewData.Email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobile No</span>
                <span className="detail-value">{viewData.MobileNo || 'Not Provided'}</span>
              </div>
              <div className="detail-row" style={{ borderBottom: 'none' }}>
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className={`status-dot ${viewData.IsActive ? 'active' : 'inactive'}`}>
                    {viewData.IsActive ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>
              
              {viewData.Description && viewData.Description !== 'No description' && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                  <span className="detail-label" style={{ display: 'block', marginBottom: '8px' }}>Description</span>
                  <span style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>{viewData.Description}</span>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {projectId ? (
                  <button className="btn-danger" onClick={() => handleRemoveFromProject(viewData.PeopleID, viewData.PeopleName)}>
                    Remove from Project
                  </button>
                ) : (
                  <button className="btn-danger" onClick={() => { setShowViewModal(false); handleDelete(viewData.PeopleID, viewData.PeopleName); }}>
                    Delete Person
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                <button className="btn-primary" onClick={handleEditFromView}>Edit Details</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PeopleManagement;