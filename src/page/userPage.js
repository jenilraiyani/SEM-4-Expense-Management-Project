import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/userPage.css'
import { useAppId } from '../context/AppIdContext';

const UserManagement = () => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // 👇 1. Added states for Edit functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', contact: '' });

  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const { jwtToken } = useAppId();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    userType: 'user',
    password: ''
  });

  // Helper: Get Initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper: Get Random Color
  const getRandomColor = () => {
    const colors = ["#d29922", "#2f81f7", "#a371f7", "#3fb950", "#f85149"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 1. Fetch Users on Load with Token
  const fetchUsers = async () => {
    try {
      const token = jwtToken;

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const result = await response.json();

      if (result.success) {
        const formattedUsers = result.data.map(user => ({
          id: user.UserID,
          _id: user._id,
          name: user.UserName,
          email: user.EmailAddress,
          role: user.UserType || "User",
          contact: user.MobileNo || "N/A",
          status: "Active",
          initials: getInitials(user.UserName),
          color: getRandomColor(),
          Photo: user.ProfileImage
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, jwtToken]);

  // 2. Add User (POST) using Register API
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return alert("Name, Email, and Password are required");

    try {
      const payload = {
        UserName: formData.name,
        EmailAddress: formData.email,
        MobileNo: formData.contact,
        UserType: formData.userType,
        Password: formData.password
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        const newUser = {
          id: result.data.UserID,
          _id: result.data._id,
          name: result.data.UserName,
          email: result.data.EmailAddress,
          role: result.data.UserType,
          contact: result.data.MobileNo,
          status: "Active",
          initials: getInitials(result.data.UserName),
          color: getRandomColor(),
          Photo: result.data.Photo
        };
        setUsers([newUser, ...users]);
        resetForm();
        setIsModalOpen(false);
      } else {
        alert(result.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // 3. Delete User (DELETE) with Token
  const handleDelete = async (id) => {
    if (window.confirm("Remove this user?")) {
      try {
        const token = jwtToken;
        if (!token) { navigate('/login'); return; }

        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        const result = await response.json();

        if (result.success) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          alert("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // 👇 4. Handle Edit User (PUT API)
  const handleUpdateUser = async () => {
    if (!editFormData.name || !editFormData.email) return alert("Name and Email cannot be empty");

    try {
      const token = jwtToken;
      if (!token) { navigate('/login'); return; }

      const payload = {
        UserName: editFormData.name,
        EmailAddress: editFormData.email,
        MobileNo: editFormData.contact
      };

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Update local table data instantly
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, name: editFormData.name, email: editFormData.email, contact: editFormData.contact }
            : u
        ));

        // Close modal and exit edit mode
        setIsEditing(false);
        setSelectedUser(null);
      } else {
        alert(result.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Check console.");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', contact: '', userType: 'user', password: '' });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <main className="main-content">
        <header className="top-header">
          <div className="breadcrumb">Home / Admin / <span>Users</span></div>
          <div className="header-right">

            <div className="inner-search">
              <input
                type="text"
                placeholder="🔍 Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="btn-save"
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              + Add User
            </button>

          </div>
        </header>

        <section className="page-intro">
          <h1>User Management</h1>
          <p>Manage system access, roles, and user profiles.</p>
        </section>

        <div className="management-grid">

          <div className="table-container" style={{ gridColumn: '1 / -1' }}>


            {loading ? <p style={{ padding: '20px' }}>Loading Users...</p> : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>ROLE</th>
                    <th>CONTACT</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer'}}>
                        <td>
                          <div className="user-info-cell">
                            {/* Conditional rendering for Avatar Image or Initials */}
                            {u.Photo ? (
                              <img
                                src={u.Photo}
                                alt={u.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="user-avatar" style={{ backgroundColor: u.color }}>{u.initials}</div>
                            )}
                            <div>
                              <p
                                className="u-full-name"
                                
                                
                                title="Click to view details"
                              >
                                {u.name}
                              </p>
                              <p className="u-email-addr">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="role-cell" style={{ textTransform: 'capitalize' }}>{u.role}</td>
                        <td className="contact-cell">{u.contact}</td>
                        <td>
                          <span className={`status-tag ${u.status.toLowerCase()}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(u.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users found matching "{searchQuery}"</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            <footer className="table-pagination">
              <p>Showing {filteredUsers.length} users</p>
            </footer>
          </div>
        </div>
      </main>

      {/* Add User Popup Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: 'var(--bg-card, #17171A)', width: '400px', maxWidth: '90%',
            padding: '24px', borderRadius: '12px', border: '1px solid var(--border, #27272A)'
          }}>
            <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Add New User</h3>
              <span className="close-btn" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>✕</span>
            </div>

            <form className="user-form" onSubmit={handleAddUser}>

              {/* Custom User/Admin Toggle */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'admin' })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                    background: formData.userType === 'admin' ? 'var(--blue, #D4AF37)' : 'transparent',
                    color: formData.userType === 'admin' ? '#000' : 'var(--text-muted, #A1A1AA)',
                    border: '1px solid var(--border, #27272A)'
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'user' })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                    background: formData.userType === 'user' ? 'var(--blue, #D4AF37)' : 'transparent',
                    color: formData.userType === 'user' ? '#000' : 'var(--text-muted, #A1A1AA)',
                    border: '1px solid var(--border, #27272A)'
                  }}
                >
                  User
                </button>
              </div>

              <div className="form-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>FULL NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-input, #0F0F11)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>EMAIL ADDRESS *</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-input, #0F0F11)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-field" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>PASSWORD *</label>
                <input
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-input, #0F0F11)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-field" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>MOBILE NUMBER</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-input, #0F0F11)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-cancel" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-save" style={{ flex: 1, padding: '12px', background: 'var(--blue, #D4AF37)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced User Details & Edit Popup Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-surface, #1A1A1E)',
            width: '420px', maxWidth: '90%',
            padding: '32px 28px', borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            textAlign: 'center', position: 'relative'
          }}>
            {/* Close Button */}
            <span
              onClick={() => { setSelectedUser(null); setIsEditing(false); }}
              style={{
                position: 'absolute', top: '16px', right: '24px',
                cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = 'white'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              ✕
            </span>

            {/* Avatar with Glow Effect */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
              <div style={{
                position: 'absolute', top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                borderRadius: '50%', background: selectedUser.color, opacity: 0.3, filter: 'blur(10px)', zIndex: 0
              }}></div>

              {selectedUser.Photo ? (
                <img
                  src={selectedUser.Photo}
                  alt={selectedUser.name}
                  style={{
                    position: 'relative', zIndex: 1, width: '96px', height: '96px',
                    borderRadius: '50%', objectFit: 'cover', display: 'block',
                    border: `3px solid ${selectedUser.color}`
                  }}
                />
              ) : (
                <div style={{
                  position: 'relative', zIndex: 1, width: '96px', height: '96px',
                  borderRadius: '50%', backgroundColor: selectedUser.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: 'bold', border: '3px solid rgba(255,255,255,0.1)'
                }}>
                  {selectedUser.initials}
                </div>
              )}
            </div>

            {/* Name and Role */}
            <h2 style={{ margin: '0 0 6px', color: 'var(--text-primary, #FFFFFF)', fontSize: '26px', fontWeight: '700' }}>
              {selectedUser.name}
            </h2>
            <div style={{ marginBottom: '28px' }}>
              <span style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: '24px',
                background: 'rgba(212, 175, 55, 0.1)', color: 'var(--blue, #D4AF37)',
                fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}>
                {selectedUser.role}
              </span>
            </div>

            {/* 👇 5. Toggled Details Box vs Edit Form */}
            <div style={{
              textAlign: 'left', background: 'var(--bg-input, #0F0F11)',
              padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '28px'
            }}>
              {isEditing ? (
                // Edit Mode Form
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-surface, #1A1A1E)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-surface, #1A1A1E)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Mobile Number</label>
                    <input
                      type="text"
                      value={editFormData.contact}
                      onChange={e => setEditFormData({ ...editFormData, contact: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-surface, #1A1A1E)', border: '1px solid var(--border)', color: 'white', borderRadius: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              ) : (
                // View Mode Details
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ marginRight: '12px', fontSize: '18px' }}>📧</span>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Email Address</strong>
                      <span style={{ color: '#E4E4E7', fontSize: '15px', fontWeight: '500' }}>{selectedUser.email}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ marginRight: '12px', fontSize: '18px' }}>📱</span>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Mobile Number</strong>
                      <span style={{ color: '#E4E4E7', fontSize: '15px', fontWeight: '500' }}>{selectedUser.contact}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '12px', fontSize: '18px' }}>🛡️</span>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Account Status</strong>
                      <span style={{ color: selectedUser.status === 'Active' ? '#3fb950' : '#f85149', fontWeight: '600', fontSize: '15px' }}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setSelectedUser(null); setIsEditing(false); }}
                style={{
                  flex: 1, padding: '14px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)', color: '#E4E4E7',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                {isEditing ? 'Cancel Edit' : 'Close Details'}
              </button>

              {isEditing ? (
                <button
                  onClick={handleUpdateUser}
                  style={{
                    flex: 1, padding: '14px', background: '#3fb950', // Green for Save
                    border: 'none', color: '#FFFFFF',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    transition: 'filter 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                  onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditFormData({ name: selectedUser.name, email: selectedUser.email, contact: selectedUser.contact });
                    setIsEditing(true);
                  }}
                  style={{
                    flex: 1, padding: '14px', background: 'var(--blue, #D4AF37)',
                    border: 'none', color: '#000000',
                    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    transition: 'filter 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                  onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                >
                  Edit User
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;