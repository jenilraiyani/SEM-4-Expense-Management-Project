import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/categoryPage.css'
import { useAppId } from '../context/AppIdContext';

const CategoryManagement = () => {
    const [activeCategory, setActiveCategory] = useState('');
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Add Category Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategory, setNewCategory] = useState({
        CategoryName: '',
        Description: '',
        IsExpense: false,
        IsIncome: false,
        IsActive: true,
        Sequence: null
    });
    
    // Add Sub-Category Modal State
    const [showAddSubModal, setShowAddSubModal] = useState(false);
    const [newSubCategory, setNewSubCategory] = useState({
        CategoryID: '',
        SubCategoryName: '',
        Description: '',
        IsExpense: false,
        IsIncome: false,
        IsActive: true,
        Sequence: null
    });
    
    // Edit Category Modal State
    const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
    const [editCategory, setEditCategory] = useState({
        CategoryID: '',
        CategoryName: '',
        Description: '',
        IsExpense: false,
        IsIncome: false,
        IsActive: true,
        Sequence: null
    });
    
    // Edit Sub-Category Modal State
    const [showEditSubModal, setShowEditSubModal] = useState(false);
    const [editSubCategory, setEditSubCategory] = useState({
        SubCategoryID: '',
        CategoryID: '',
        SubCategoryName: '',
        Description: '',
        IsExpense: false,
        IsIncome: false,
        IsActive: true,
        Sequence: null
    });

    const navigate = useNavigate();
    const { jwtToken, userId } = useAppId();

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Fetch all data (categories and sub-categories)
    const fetchAllData = async (token) => {
        setLoading(true);
        try {
            // Fetch categories directly first
            const catResponse = await fetch('http://localhost:5000/api/categories', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            });
            
            const catResult = await catResponse.json();
            
            // Then fetch sub-categories
            const subResponse = await fetch('http://localhost:5000/api/sub-categories', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            });
            
            if (subResponse.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            
            const subResult = await subResponse.json();
            
            if (catResult.success) {
                const categoriesData = catResult.data;
                const subCategoriesData = subResult.success ? subResult.data : [];
                
                setAllSubCategories(subCategoriesData);
                
                // Process categories with their sub-category counts
                const processedCategories = categoriesData.map(cat => ({
                    ...cat,
                    count: subCategoriesData.filter(sub => sub.CategoryID === cat.CategoryID).length
                }));
                
                setCategories(processedCategories);

                // Set active category to first category if none selected
                if (processedCategories.length > 0 && !activeCategory) {
                    setActiveCategory(processedCategories[0].CategoryName);
                } else if (processedCategories.length === 0) {
                    setActiveCategory('');
                }
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            alert('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = jwtToken;

        if (!token) {
            navigate('/login'); 
            return;
        }

        fetchAllData(token);
    }, [navigate, jwtToken]);

    // Handle Add Category Form Input Changes
    const handleCategoryInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewCategory(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Add Sub-Category Form Input Changes
    const handleSubCategoryInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewSubCategory(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Edit Category Form Input Changes
    const handleEditCategoryInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditCategory(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Edit Sub-Category Form Input Changes
    const handleEditSubCategoryInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditSubCategory(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Add Category Form Submit
    const handleAddCategory = async (e) => {
        e.preventDefault();
        
        // Validation: At least one of IsExpense or IsIncome must be true
        if (!newCategory.IsExpense && !newCategory.IsIncome) {
            alert('Please select at least one type (Expense or Income)');
            return;
        }

        // Validation: Category Name is required
        if (!newCategory.CategoryName.trim()) {
            alert('Category Name is required');
            return;
        }

        try {
            const token = jwtToken;
            
            // Prepare data with UserID from context
            const categoryData = {
                CategoryName: newCategory.CategoryName,
                Description: newCategory.Description || null,
                IsExpense: newCategory.IsExpense,
                IsIncome: newCategory.IsIncome,
                IsActive: newCategory.IsActive,
                Sequence: newCategory.Sequence || null,
                UserID: userId
            };

            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Category added successfully!');
                setShowAddModal(false);
                
                // Reset form
                setNewCategory({
                    CategoryName: '',
                    Description: '',
                    IsExpense: false,
                    IsIncome: false,
                    IsActive: true,
                    Sequence: null
                });
                
                // Refresh all data to show the new category
                await fetchAllData(token);
            } else {
                alert(result.message || 'Failed to add category');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Network error. Please try again.');
        }
    };

    // Handle Add Sub-Category Form Submit
    const handleAddSubCategory = async (e) => {
        e.preventDefault();
        
        // Validation: Category must be selected
        if (!newSubCategory.CategoryID) {
            alert('Please select a category');
            return;
        }

        // Validation: At least one of IsExpense or IsIncome must be true
        if (!newSubCategory.IsExpense && !newSubCategory.IsIncome) {
            alert('Please select at least one type (Expense or Income)');
            return;
        }

        // Validation: Sub-Category Name is required
        if (!newSubCategory.SubCategoryName.trim()) {
            alert('Sub-Category Name is required');
            return;
        }

        try {
            const token = jwtToken;
            
            // Prepare data with UserID from context
            const subCategoryData = {
                CategoryID: parseInt(newSubCategory.CategoryID),
                SubCategoryName: newSubCategory.SubCategoryName,
                Description: newSubCategory.Description || null,
                IsExpense: newSubCategory.IsExpense,
                IsIncome: newSubCategory.IsIncome,
                IsActive: newSubCategory.IsActive,
                Sequence: newSubCategory.Sequence || null,
                UserID: userId
            };

            const response = await fetch('http://localhost:5000/api/sub-categories', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subCategoryData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Sub-category added successfully!');
                setShowAddSubModal(false);
                
                // Reset form
                setNewSubCategory({
                    CategoryID: '',
                    SubCategoryName: '',
                    Description: '',
                    IsExpense: false,
                    IsIncome: false,
                    IsActive: true,
                    Sequence: null
                });
                
                // Refresh all data to show the new sub-category
                await fetchAllData(token);
            } else {
                alert(result.message || 'Failed to add sub-category');
            }
        } catch (error) {
            console.error('Error adding sub-category:', error);
            alert('Network error. Please try again.');
        }
    };

    // Handle Update Category
    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        
        try {
            const token = jwtToken;
            
            const categoryData = {
                CategoryName: editCategory.CategoryName,
                Description: editCategory.Description || null,
                IsExpense: editCategory.IsExpense,
                IsIncome: editCategory.IsIncome,
                IsActive: editCategory.IsActive,
                Sequence: editCategory.Sequence || null,
                UserID: userId
            };

            const response = await fetch(`http://localhost:5000/api/categories/${editCategory.CategoryID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Category updated successfully!');
                setShowEditCategoryModal(false);
                await fetchAllData(token);
            } else {
                alert(result.message || 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Network error. Please try again.');
        }
    };

    // Handle Update Sub-Category
    const handleUpdateSubCategory = async (e) => {
        e.preventDefault();
        
        try {
            const token = jwtToken;
            
            const subCategoryData = {
                CategoryID: parseInt(editSubCategory.CategoryID),
                SubCategoryName: editSubCategory.SubCategoryName,
                Description: editSubCategory.Description || null,
                IsExpense: editSubCategory.IsExpense,
                IsIncome: editSubCategory.IsIncome,
                IsActive: editSubCategory.IsActive,
                Sequence: editSubCategory.Sequence || null,
                UserID: userId
            };

            const response = await fetch(`http://localhost:5000/api/sub-categories/${editSubCategory.SubCategoryID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subCategoryData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Sub-category updated successfully!');
                setShowEditSubModal(false);
                await fetchAllData(token);
            } else {
                alert(result.message || 'Failed to update sub-category');
            }
        } catch (error) {
            console.error('Error updating sub-category:', error);
            alert('Network error. Please try again.');
        }
    };

    // Handle Delete
    const handleDelete = async (type, id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            try {
                const token = jwtToken;
                let url = '';
                
                if (type === 'category') {
                    url = `http://localhost:5000/api/categories/${id}`;
                } else {
                    url = `http://localhost:5000/api/sub-categories/${id}`;
                }

                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    alert(`${type === 'category' ? 'Category' : 'Sub-category'} deleted successfully!`);
                    await fetchAllData(token);
                } else {
                    alert(result.message || `Failed to delete ${type}`);
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Network error. Please try again.');
            }
        }
    };

    // Open Edit Category Modal
    const openEditCategoryModal = (category) => {
        setEditCategory({
            CategoryID: category.CategoryID,
            CategoryName: category.CategoryName,
            Description: category.Description || '',
            IsExpense: category.IsExpense,
            IsIncome: category.IsIncome,
            IsActive: category.IsActive,
            Sequence: category.Sequence
        });
        setShowEditCategoryModal(true);
    };

    // Open Edit Sub-Category Modal
    const openEditSubCategoryModal = (subCategory) => {
        setEditSubCategory({
            SubCategoryID: subCategory.SubCategoryID,
            CategoryID: subCategory.CategoryID,
            SubCategoryName: subCategory.SubCategoryName,
            Description: subCategory.Description || '',
            IsExpense: subCategory.IsExpense,
            IsIncome: subCategory.IsIncome,
            IsActive: subCategory.IsActive,
            Sequence: subCategory.Sequence
        });
        setShowEditSubModal(true);
    };

    const currentSubCategories = allSubCategories.filter(sub => {
        const matchesCategory = sub.CategoryData?.CategoryName === activeCategory;
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
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add New Category</button>
                    </div>
                </section>

                {/* Add Category Modal */}
                {showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Category</h3>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleAddCategory}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Category Name *</label>
                                        <input
                                            type="text"
                                            name="CategoryName"
                                            value={newCategory.CategoryName}
                                            onChange={handleCategoryInputChange}
                                            required
                                            placeholder="Enter category name"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="Description"
                                            value={newCategory.Description}
                                            onChange={handleCategoryInputChange}
                                            placeholder="Enter category description"
                                            rows="3"
                                        />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Type *</label>
                                            <div className="checkbox-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsExpense"
                                                        checked={newCategory.IsExpense}
                                                        onChange={handleCategoryInputChange}
                                                    />
                                                    <span>Expense</span>
                                                </label>
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsIncome"
                                                        checked={newCategory.IsIncome}
                                                        onChange={handleCategoryInputChange}
                                                    />
                                                    <span>Income</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="form-group half">
                                            <label>Sequence</label>
                                            <input
                                                type="number"
                                                name="Sequence"
                                                value={newCategory.Sequence || ''}
                                                onChange={handleCategoryInputChange}
                                                placeholder="Order"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="checkbox-label status">
                                            <input
                                                type="checkbox"
                                                name="IsActive"
                                                checked={newCategory.IsActive}
                                                onChange={handleCategoryInputChange}
                                            />
                                            <span>Active Status</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Sub-Category Modal */}
                {showAddSubModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Sub-Category</h3>
                                <button className="modal-close" onClick={() => setShowAddSubModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleAddSubCategory}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Parent Category *</label>
                                        <select
                                            name="CategoryID"
                                            value={newSubCategory.CategoryID}
                                            onChange={handleSubCategoryInputChange}
                                            required
                                            className="category-select"
                                        >
                                            <option value="">-- Select Category --</option>
                                            {categories.map(cat => (
                                                <option key={cat.CategoryID} value={cat.CategoryID}>
                                                    {cat.CategoryName} ({cat.IsIncome ? 'Income' : 'Expense'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Sub-Category Name *</label>
                                        <input
                                            type="text"
                                            name="SubCategoryName"
                                            value={newSubCategory.SubCategoryName}
                                            onChange={handleSubCategoryInputChange}
                                            required
                                            placeholder="Enter sub-category name"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="Description"
                                            value={newSubCategory.Description}
                                            onChange={handleSubCategoryInputChange}
                                            placeholder="Enter sub-category description"
                                            rows="3"
                                        />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Type *</label>
                                            <div className="checkbox-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsExpense"
                                                        checked={newSubCategory.IsExpense}
                                                        onChange={handleSubCategoryInputChange}
                                                    />
                                                    <span>Expense</span>
                                                </label>
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsIncome"
                                                        checked={newSubCategory.IsIncome}
                                                        onChange={handleSubCategoryInputChange}
                                                    />
                                                    <span>Income</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="form-group half">
                                            <label>Sequence</label>
                                            <input
                                                type="number"
                                                name="Sequence"
                                                value={newSubCategory.Sequence || ''}
                                                onChange={handleSubCategoryInputChange}
                                                placeholder="Order"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="checkbox-label status">
                                            <input
                                                type="checkbox"
                                                name="IsActive"
                                                checked={newSubCategory.IsActive}
                                                onChange={handleSubCategoryInputChange}
                                            />
                                            <span>Active Status</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddSubModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create Sub-Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Category Modal */}
                {showEditCategoryModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Category</h3>
                                <button className="modal-close" onClick={() => setShowEditCategoryModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleUpdateCategory}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Category Name *</label>
                                        <input
                                            type="text"
                                            name="CategoryName"
                                            value={editCategory.CategoryName}
                                            onChange={handleEditCategoryInputChange}
                                            required
                                            placeholder="Enter category name"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="Description"
                                            value={editCategory.Description}
                                            onChange={handleEditCategoryInputChange}
                                            placeholder="Enter category description"
                                            rows="3"
                                        />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Type *</label>
                                            <div className="checkbox-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsExpense"
                                                        checked={editCategory.IsExpense}
                                                        onChange={handleEditCategoryInputChange}
                                                    />
                                                    <span>Expense</span>
                                                </label>
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsIncome"
                                                        checked={editCategory.IsIncome}
                                                        onChange={handleEditCategoryInputChange}
                                                    />
                                                    <span>Income</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="form-group half">
                                            <label>Sequence</label>
                                            <input
                                                type="number"
                                                name="Sequence"
                                                value={editCategory.Sequence || ''}
                                                onChange={handleEditCategoryInputChange}
                                                placeholder="Order"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="checkbox-label status">
                                            <input
                                                type="checkbox"
                                                name="IsActive"
                                                checked={editCategory.IsActive}
                                                onChange={handleEditCategoryInputChange}
                                            />
                                            <span>Active Status</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowEditCategoryModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Update Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Sub-Category Modal */}
                {showEditSubModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Edit Sub-Category</h3>
                                <button className="modal-close" onClick={() => setShowEditSubModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleUpdateSubCategory}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Parent Category *</label>
                                        <select
                                            name="CategoryID"
                                            value={editSubCategory.CategoryID}
                                            onChange={handleEditSubCategoryInputChange}
                                            required
                                            className="category-select"
                                        >
                                            <option value="">-- Select Category --</option>
                                            {categories.map(cat => (
                                                <option key={cat.CategoryID} value={cat.CategoryID}>
                                                    {cat.CategoryName} ({cat.IsIncome ? 'Income' : 'Expense'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Sub-Category Name *</label>
                                        <input
                                            type="text"
                                            name="SubCategoryName"
                                            value={editSubCategory.SubCategoryName}
                                            onChange={handleEditSubCategoryInputChange}
                                            required
                                            placeholder="Enter sub-category name"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="Description"
                                            value={editSubCategory.Description}
                                            onChange={handleEditSubCategoryInputChange}
                                            placeholder="Enter sub-category description"
                                            rows="3"
                                        />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Type *</label>
                                            <div className="checkbox-group">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsExpense"
                                                        checked={editSubCategory.IsExpense}
                                                        onChange={handleEditSubCategoryInputChange}
                                                    />
                                                    <span>Expense</span>
                                                </label>
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        name="IsIncome"
                                                        checked={editSubCategory.IsIncome}
                                                        onChange={handleEditSubCategoryInputChange}
                                                    />
                                                    <span>Income</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="form-group half">
                                            <label>Sequence</label>
                                            <input
                                                type="number"
                                                name="Sequence"
                                                value={editSubCategory.Sequence || ''}
                                                onChange={handleEditSubCategoryInputChange}
                                                placeholder="Order"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="checkbox-label status">
                                            <input
                                                type="checkbox"
                                                name="IsActive"
                                                checked={editSubCategory.IsActive}
                                                onChange={handleEditSubCategoryInputChange}
                                            />
                                            <span>Active Status</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowEditSubModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Update Sub-Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="category-grid">
                
                    {/* SIDEBAR: LIST OF PARENT CATEGORIES */}
                    <div className="category-card">
                        <div className="card-top">
                            <h3>Main Categories</h3>
                            <div className="card-icons"><span>≡</span> <span>⇵</span></div>
                        </div>
                        <div className="category-list">
                            {loading ? <p style={{padding:'20px'}}>Loading...</p> : 
                                categories.length > 0 ? categories.map((cat) => (
                                    <div
                                        key={cat.CategoryID}
                                        className={`cat-item ${activeCategory === cat.CategoryName ? 'selected' : ''}`}
                                        onClick={() => {
                                            setActiveCategory(cat.CategoryName);
                                            setSearchQuery('');
                                        }}
                                        style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                                    >
                                        <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                                            <div className="cat-icon-box">📁</div>
                                            <div className="cat-info">
                                                <p className="cat-name">{cat.CategoryName}</p>
                                                <p className="cat-sub">{cat.count || 0} Sub-categories</p>
                                            </div>
                                            <span className={`cat-badge ${cat.IsIncome ? 'income' : 'expense'}`}>
                                                {cat.IsIncome ? 'INCOME' : 'EXPENSE'}
                                            </span>
                                        </div>
                                        <div style={{display: 'flex', gap: '5px'}}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditCategoryModal(cat);
                                                }}
                                                style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}
                                            >
                                                ✎
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete('category', cat.CategoryID, cat.CategoryName);
                                                }}
                                                style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'}}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{padding:'20px', textAlign:'center', color:'#999'}}>No categories found</p>
                                )
                            }
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
                                <p>Manage sub-categories for {activeCategory || 'selected'} category.</p>
                            </div>
                            <div className="detail-actions">
                                {activeCategoryObj && (
                                    <button 
                                        className="btn-icon"
                                        onClick={() => openEditCategoryModal(activeCategoryObj)}
                                    >
                                        ✎ Edit Parent
                                    </button>
                                )}
                                <button 
                                    className="btn-accent" 
                                    onClick={() => {
                                        if (activeCategory && activeCategoryObj) {
                                            setNewSubCategory(prev => ({
                                                ...prev,
                                                CategoryID: activeCategoryObj.CategoryID
                                            }));
                                        }
                                        setShowAddSubModal(true);
                                    }}
                                >
                                    + Add Sub-Category
                                </button>
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
                                            <td>
                                                <div style={{display: 'flex', gap: '8px'}}>
                                                    <button 
                                                        onClick={() => openEditSubCategoryModal(sub)}
                                                        style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px'}}
                                                    >
                                                        ✎
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete('subcategory', sub.SubCategoryID, sub.SubCategoryName)}
                                                        style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px'}}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#999'}}>
                                            {loading ? "Loading..." : (searchQuery ? "No matching sub-categories found." : "No sub-categories found for this category.")}
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

            {/* Professional Black and Gold Theme Modal Styles */}
            <style jsx>{`
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
                    width: 550px;
                    max-width: 95%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(255, 215, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.5);
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
                    padding: 22px 25px;
                    border-bottom: 2px solid #ffd700;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #000000;
                    color: #ffd700;
                    border-radius: 16px 16px 0 0;
                    position: relative;
                }
                .modal-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffd700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    background: linear-gradient(135deg, #ffd700 0%, #f0c000 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-weight: 300;
                }
                .modal-close:hover {
                    background: #ffd700;
                    color: #000000;
                    transform: rotate(90deg) scale(1.1);
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                }
                .modal-body {
                    padding: 25px;
                    background: #0a0a0a;
                }
                .form-group {
                    margin-bottom: 22px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #ffd700;
                    font-size: 14px;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                    opacity: 0.9;
                }
                .form-group input[type="text"],
                .form-group input[type="number"],
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #2a2a2a;
                    border-radius: 10px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background: #1a1a1a;
                    color: #ffffff;
                    font-family: inherit;
                }
                .form-group input[type="text"]:hover,
                .form-group input[type="number"]:hover,
                .form-group textarea:hover,
                .form-group select:hover {
                    border-color: #4a4a4a;
                }
                .form-group input[type="text"]:focus,
                .form-group input[type="number"]:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    border-color: #ffd700;
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.15);
                    background: #202020;
                }
                .form-group textarea {
                    resize: vertical;
                    min-height: 90px;
                }
                .form-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 22px;
                }
                .form-group.half {
                    flex: 1;
                    margin-bottom: 0;
                }
                .checkbox-group {
                    display: flex;
                    gap: 25px;
                    background: #1a1a1a;
                    padding: 12px 15px;
                    border-radius: 10px;
                    border: 2px solid #2a2a2a;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: normal;
                    cursor: pointer;
                    color: #ffffff;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .checkbox-label:hover {
                    color: #ffd700;
                }
                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #ffd700;
                }
                .checkbox-label.status {
                    background: #1a1a1a;
                    padding: 12px 15px;
                    border-radius: 10px;
                    border: 2px solid #2a2a2a;
                    margin: 0;
                }
                .form-text {
                    font-size: 12px;
                    color: #888;
                    margin-top: 6px;
                    display: block;
                    font-style: italic;
                }
                .modal-footer {
                    padding: 22px 25px;
                    border-top: 2px solid #ffd700;
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                    background: #000000;
                    border-radius: 0 0 16px 16px;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #ffd700 0%, #edc000 100%);
                    color: #000000;
                    border: none;
                    padding: 12px 28px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid #ffd700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .btn-primary:hover {
                    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                    color: #ffd700;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
                }
                .btn-secondary {
                    background: transparent;
                    color: #ffd700;
                    border: 1px solid #ffd700;
                    padding: 12px 28px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    letter-spacing: 0.3px;
                }
                .btn-secondary:hover {
                    background: rgba(255, 215, 0, 0.1);
                    border-color: #ffd700;
                    color: #ffd700;
                    transform: translateY(-2px);
                }
                .category-select {
                    background-color: #1a1a1a;
                    cursor: pointer;
                    color: #ffffff;
                }
                .category-select option {
                    background: #1a1a1a;
                    color: #ffffff;
                    padding: 10px;
                }
                .category-select optgroup {
                    background: #0a0a0a;
                    color: #ffd700;
                }
                /* Scrollbar Styling */
                .modal-content::-webkit-scrollbar {
                    width: 8px;
                }
                .modal-content::-webkit-scrollbar-track {
                    background: #1a1a1a;
                    border-radius: 4px;
                }
                .modal-content::-webkit-scrollbar-thumb {
                    background: #ffd700;
                    border-radius: 4px;
                }
                .modal-content::-webkit-scrollbar-thumb:hover {
                    background: #f0c000;
                }
                /* Placeholder Styling */
                ::placeholder {
                    color: #555;
                    opacity: 1;
                }
                :-ms-input-placeholder {
                    color: #555;
                }
                ::-ms-input-placeholder {
                    color: #555;
                }
            `}</style>
        </>
    );
};

export default CategoryManagement;