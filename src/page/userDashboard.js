import React from 'react';
import '../style/userDashboard.css'
import { useState,useEffect } from 'react';
import { useAppId } from '../context/AppIdContext'; // 1. 👇 Added context import

const UserDashboard = () => {
  // const expenses = [ ... ];
  // const incomes = [ ... ];

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  
  // 2. 👇 Extract jwtToken, userName, AND userId from Context
  const { jwtToken, userName, userId } = useAppId();

  useEffect(() => {
    // 3. 👇 Check for both token and userId
    if (!jwtToken || !userId) return;

    // 👇 Update URL to fetch expenses by userId on port 5000
    fetch(`http://localhost:5000/api/expenses/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((result) => {
          if(result.success) setExpenses(result.data);
      })
      .catch((err => console.error(err)));
  }, [jwtToken, userId]) // 👇 Added userId to dependency array

  useEffect(() => {
    // 4. 👇 Check for both token and userId
    if (!jwtToken || !userId) return;

    // 👇 Update URL to fetch incomes by userId on port 5000
    fetch(`http://localhost:5000/api/incomes/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((result) => {
          if(result.success) setIncomes(result.data);
      })
      .catch((err => console.error(err)));
  }, [jwtToken, userId]) // 👇 Added userId to dependency array

  return (
    <>
      <main className="main-content">
        <header className="main-header">
          <div className="header-text">
            {/* 5. 👇 Use dynamic userName from Context */}
            <h1>Welcome back, {userName || "User"}</h1>
            <p>Here is your financial overview for this month.</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline bg-black">+ Add Income</button>
            <button className="btn-solid">+ New Expense</button>
          </div>
        </header>

       
        <section className="summary-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-meta">
                <span className="stat-label">TOTAL INCOME</span>
                <h2 className="stat-value">{}</h2>
                <div className="trend-pill positive">
                  <span className="trend-icon">📈</span> +15% <span className="trend-context">vs last month</span>
                </div>
              </div>
              <div className="stat-icon income-bg">💵</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-meta">
                <span className="stat-label">TOTAL EXPENSE</span>
                <h2 className="stat-value">₹4,230.00</h2>
                <div className="trend-pill negative">
                  <span className="trend-icon">📉</span> +2.5% <span className="trend-context">vs last month</span>
                </div>
              </div>
              <div className="stat-icon expense-bg">📉</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-meta">
                <span className="stat-label">CURRENT BALANCE</span>
                <h2 className="stat-value">₹8,220.00</h2>
                <div className="trend-pill neutral">
                  <span className="trend-icon">📈</span> +12% <span className="trend-context">vs last month</span>
                </div>
              </div>
              <div className="stat-icon balance-bg">👛</div>
            </div>
          </div>
        </section>

       
        <section className="table-container">
          <div className="table-title-row">
            <h3>Recent Expenses</h3>
            <a href="#all" className="view-all">View All</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>User Name</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((item, idx) => (
                <tr key={idx}>
                  <td className="">{item.ExpenseDate}</td>
                  <td><span className="pill-category">{item.CategoryName}</span></td>
                  <td>{item.Description}</td>
                  <td className='text-danger'>{item.Amount}</td>
                  <td><span className={`pill-status ₹{item.status}`}>{userName}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        
        <section className="table-container">
          <div className="table-title-row">
            <h3>Recent Incomes</h3>
            <a href="#all" className="view-all">View All</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Description</th>
                <th>Amount</th>
                <th>User Name</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((item, idx) => (
                <tr key={idx}>
                  <td className="">{item.IncomeDate}</td>
                  <td><span className="pill-category">{item.CategoryName}</span></td>
                  <td>{item.Description}</td>
                  <td className="text-positive">{item.Amount}</td>
                  <td><span className={`pill-status ₹{item.status}`}>{userName}</span></td>
                </tr>
              ))}
            </tbody>
          </table>uuuuu
        </section>
      </main>
    </>
  );
};

export default UserDashboard;