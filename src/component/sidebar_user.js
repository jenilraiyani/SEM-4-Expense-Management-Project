import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../style/sidebar.css'

function SidebarUser() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
                ☰
            </button>
            <aside className={`sidebar sticky-top ${open ? 'open' : ''}`}>
                <div className="logo-section">
                    <div className="logo-box"></div>
                    <span className="logo-text">Expensify</span>
                </div>
                <nav className="nav-menu navbar">
                    <Link to="/user" className="nav-item "><i className="fas fa-user"></i> User Dashboard</Link>
                    <Link to="/user/expenseform" className="nav-item "><i className="fas fa-money-bill-wave"></i> Expense/Income</Link>
                    <Link to='/' className="nav-item logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</Link>
                </nav>

            </aside>
        </>
    )
}
export default SidebarUser;