import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/categoryPage.css'
import { useAppId } from '../context/AppIdContext'; // 1. Added import

const CategoryManagement = () => {
    const [activeCategory, setActiveCategory] = useState('');
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 1. Add Search State
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    
    // 2. Extract jwtToken from Context
    const { jwtToken } = useAppId();

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    useEffect(() => {
        // 3. Replaced localStorage with Context token
        const token = jwtToken;

        if (!token) {
            navigate('/login'); 
            return;
        }

        fetch('http://localhost:5000/api/sub-categories', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        })
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token'); // Can be updated to context clearer if needed
                    navigate('/login');
                    throw new Error("Session expired");
                }
                return res.json();
            })
            .then((result) => {
                if (result.success) {
                    const data = result.data;
                    setAllSubCategories(data);

                    const uniqueCats = [];
                    const seenIDs = new Set();

                    data.forEach(item => {
                        if (item.CategoryData && !seenIDs.has(item.CategoryData.CategoryID)) {
                            seenIDs.add(item.CategoryData.CategoryID);
                            
                            uniqueCats.push({
                                ...item.CategoryData, 
                                count: data.filter(sub => sub.CategoryID === item.CategoryData.CategoryID).length
                            });
                        }
                    });

                    setCategories(uniqueCats);

                    if (uniqueCats.length > 0) {
                        setActiveCategory(uniqueCats[0].CategoryName);
                    }
                }
            })
            .catch(err => console.error("Error fetching categories:", err))
            .finally(() => setLoading(false));
    }, [navigate, jwtToken]); // 4. Added jwtToken to dependencies

    // 2. Update Filter Logic to include Search
    const currentSubCategories = allSubCategories.filter(sub => {
        // Must match the selected Sidebar Category
        const matchesCategory = sub.CategoryData?.CategoryName === activeCategory;
        // Must match the Search Input (case-insensitive)
        const matchesSearch = sub.SubCategoryName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });

    const activeCategoryObj = categories.find(c => c.CategoryName === activeCategory);

    return (
        <>
            <main className="main-viewport">
                <header className="view-header">
                    <div className="breadcrumb">Dashboard / Settings / <span>Category Management</span></div>
                    <div className="header-controls">
                        <div className="search-box">
                            <span>🔍</span>
                            {/* 3. Connect Input to State */}
                            <input 
                                type="text" 
                                placeholder="Search sub-categories..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <span className="notif-bell">🔔</span>
                        <div className="profile-icon" onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }} style={{cursor:'pointer', marginLeft:'10px'}}>🚪</div>
                    </div>
                </header>

                <section className="view-title-row">
                    <div>
                        <h1>Category Management</h1>
                        <p>Manage your financial structure and hierarchy</p>
                    </div>
                    <div className="action-btns">
                        <button className="btn-secondary bg-black">📥 Export</button>
                        <button className="btn-primary">+ Add New Category</button>
                    </div>
                </section>

                <div className="category-grid">
                
                    {/* SIDEBAR: LIST OF PARENT CATEGORIES */}
                    <div className="category-card">
                        <div className="card-top">
                            <h3>Main Categories</h3>
                            <div className="card-icons"><span>≡</span> <span>⇵</span></div>
                        </div>
                        <div className="category-list">
                            {loading ? <p style={{padding:'20px'}}>Loading...</p> : categories.map((cat) => (
                                <div
                                    key={cat.CategoryID}
                                    className={`cat-item ${activeCategory === cat.CategoryName ? 'selected' : ''}`}
                                    onClick={() => {
                                        setActiveCategory(cat.CategoryName);
                                        setSearchQuery(''); // Optional: Clear search when switching categories
                                    }}
                                >
                                    <div className="cat-icon-box">📁</div>
                                    <div className="cat-info">
                                        <p className="cat-name">{cat.CategoryName}</p>
                                        <p className="cat-sub">{cat.count} Sub-categories</p>
                                    </div>
                                    <span className={`cat-badge ${cat.IsIncome ? 'income' : 'expense'}`}>
                                        {cat.IsIncome ? 'INCOME' : 'EXPENSE'}
                                    </span>
                                    <span className="chevron">›</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CONTENT: LIST OF SUB-CATEGORIES */}
                    <div className="detail-card">
                        <div className="detail-header">
                            <div className="detail-meta">
                                <div className="detail-title">
                                    <h2>{activeCategory || "Select a Category"}</h2>
                                    {activeCategoryObj && (
                                        <span className={`cat-badge ${activeCategoryObj.IsIncome ? 'income' : 'expense'}`}>
                                            {activeCategoryObj.IsIncome ? 'INCOME' : 'EXPENSE'}
                                        </span>
                                    )}
                                </div>
                                <p>Manage sub-categories for {activeCategory} expenses.</p>
                            </div>
                            <div className="detail-actions">
                                <button className="btn-icon">✎ Edit Parent</button>
                                <button className="btn-accent">+ Add Sub-Category</button>
                            </div>
                        </div>

                        <table className="sub-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>SUB-CATEGORY NAME</th>
                                    <th>CREATED DATE</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSubCategories.length > 0 ? (
                                    currentSubCategories.map((sub) => (
                                        <tr key={sub.SubCategoryID}>
                                            <td>#{sub.SubCategoryID}</td>
                                            <td>{sub.SubCategoryName}</td>
                                            <td>{formatDate(sub.Created)}</td>
                                            <td><span className="action-dots">•••</span></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#999'}}>
                                            {loading ? "" : (searchQuery ? "No matching sub-categories found." : "No sub-categories found.")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <footer className="detail-footer">
                            <p>Showing {currentSubCategories.length} items</p>
                            <span className="status-pill">Active</span>
                        </footer>
                    </div>
                </div>
            </main>
        </>
    );
};

export default CategoryManagement;