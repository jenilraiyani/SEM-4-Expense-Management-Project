import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 1. Import Params
import '../style/peoplePage.css'
import { useAppId } from '../context/AppIdContext'; // 1. 👇 Added context import

const PeopleManagement = () => {
  const { projectId } = useParams(); // 2. Get ProjectID from URL (e.g., /people/901)
  const navigate = useNavigate();

  // 2. 👇 Extract jwtToken and userId from Context
  const { jwtToken, userId } = useAppId();

  const [peoples, setPeoples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("All Employees");

  // 3. Form State
  const [formData, setFormData] = useState({
    code: '', name: '', email: '', phone: '', desc: '', isActive: true
  });

  // 4. Fetch Data Logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 3. 👇 Use token from context instead of localStorage
        const token = jwtToken;
        if (!token) { navigate('/login'); return; }

        const headers = { Authorization: `Bearer ${token}` };

        if (projectId) {
          // A. SCENARIO 1: SHOW PROJECT TEAM
          // Fetch specific project to get its TeamMembers
          const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, { headers });
          const result = await response.json();
          
          if (result.success) {
            setPeoples(result.data.TeamMembers || []); // Use the populated array
            setProjectName(result.data.ProjectName);   // Update title
          }
        } else {
          // B. SCENARIO 2: SHOW ALL PEOPLE
          const response = await fetch('http://localhost:5000/api/people', { headers });
          const result = await response.json();
          if (result.success) {
            setPeoples(result.data);
            setProjectName("All Employees");
          }
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, navigate, jwtToken]); // Added jwtToken to dependencies

  // 5. Handle Save (Create New Person)
  const handleSave = async (e) => {
    e.preventDefault();
    // 4. 👇 Use token from context
    const token = jwtToken;

    try {
      const payload = {
        PeopleCode: formData.code,
        PeopleName: formData.name,
        Email: formData.email,
        MobileNo: formData.phone,
        Description: formData.desc,
        IsActive: formData.isActive,
        ProjectID: projectId || 0, // Associate with current project if exists
        UserID: userId || 0 // 5. 👇 Use userId from context instead of parsing localStorage
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
        setPeoples([...peoples, result.data]); // Add to local list
        resetForm();
      } else {
        alert(result.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  // 6. Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete?`)) {
      try {
        // 6. 👇 Use token from context
        const token = jwtToken;
        await fetch(`http://localhost:5000/api/people/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        setPeoples(peoples.filter(p => p.PeopleID !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', email: '', phone: '', desc: '', isActive: true });
  };

  return (
    <>
      <main className="content-area">
        <header className="top-nav">
          <div className="breadcrumb">Home / Settings / <span>{projectId ? 'Project Team' : 'People Management'}</span></div>
          <div className="top-actions">
            <span className="bell">🔔</span>
            <div className="user-circle"></div>
          </div>
        </header>

        <section className="page-header">
          <div className="title-block">
            {/* Dynamic Title based on context */}
            <h1>{projectId ? `Team: ${projectName}` : 'People Management'}</h1>
            <p>{projectId ? `Manage members assigned to ${projectName}` : 'Manage employee records, roles, and access permissions.'}</p>
          </div>
          <button className="export-btn bg-black" onClick={() => alert("Exporting records...")}>📤 Export</button>
        </section>

        <div className="layout-grid">
          <div className="table-section">
            <div className="toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search people..." />
              </div>
              <div className="filter-buttons">
                {projectId && (
                    <button className="btn-tool bg-white" onClick={() => navigate('/people')}>
                        ← Back to All
                    </button>
                )}
                <button className="btn-tool bg-black">Filter</button>
              </div>
            </div>

            {loading ? <p style={{padding:'20px'}}>Loading...</p> : (
            <table className="people-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>NAME</th>
                  <th>CONTACT INFO</th>
                  <th>DESCRIPTION</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {peoples.length > 0 ? peoples.map((p, i) => (
                  <tr key={i}>
                    <td>{p.PeopleCode || "N/A"}</td>
                    <td>
                      <div className="user-cell">
                        <div className="initials-circle" style={{background:'#2f81f7', color:'#fff', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', marginRight:'10px'}}>
                            {p.PeopleName?.charAt(0)}
                        </div>
                        <div>
                          <p className="u-name">{p.PeopleName}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <p>📧 {p.Email}</p>
                        <p>📞 {p.MobileNo}</p>
                      </div>
                    </td>
                    <td className="desc-text">{p.Description}</td>
                    <td>
                      <span className={`status-dot ${p.IsActive ? 'active' : 'inactive'}`}>
                        {p.IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(p.PeopleID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149' }}>🗑️</button>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>No team members found for this project.</td></tr>
                )}
              </tbody>
            </table>
            )}

            <footer className="table-footer">
              <span>Showing {peoples.length} records</span>
            </footer>
          </div>

          <aside className="form-panel">
            <div className="form-header">
              <h3>{projectId ? 'Add to Project' : 'Add New Person'}</h3>
              <span className="close-x" onClick={resetForm} style={{ cursor: 'pointer' }}>✕</span>
            </div>
            <form className="person-form" onSubmit={handleSave}>
              {/* ... (Existing Form Inputs - Same as before) ... */}
              <div className="field">
                <label>PEOPLE CODE *</label>
                <input type="text" placeholder="e.g. EMP-045" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              </div>
              <div className="field">
                <label>FULL NAME *</label>
                <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>EMAIL ADDRESS *</label>
                <input type="email" placeholder="john@test.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>MOBILE NO</label>
                <input type="text" placeholder="+1 555..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="field">
                <label>DESCRIPTION</label>
                <textarea placeholder="Notes..." value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })}></textarea>
              </div>
              <div className="toggle-field">
                <span>Active Status</span>
                <label className="switch">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-footer">
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-save">✓ Save</button>
              </div>
            </form>
          </aside>
        </div>
      </main>
    </>
  );
};

export default PeopleManagement;