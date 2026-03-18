import React, { useEffect, useState } from 'react';
import '../style/adminDashboard.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAppId } from '../context/AppIdContext'; // 1. Added import

function Dashboard() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // 1. 👇 Changed state name to reflect it holds ALL data, not just recent
  const [allTransactions, setAllTransactions] = useState([]);

  // 2. 👇 Added Search State
  const [searchTerm, setSearchTerm] = useState('');

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  
  // 2. Extract jwtToken from Context
  const { jwtToken } = useAppId(); 

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 3. Replaced localStorage with Context token
        const token = jwtToken; 

        if (!token) {
          alert("Session expired. Please login again.");
          navigate('/');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [expRes, incRes] = await Promise.all([
          fetch('http://localhost:5000/api/expenses', { headers }),
          fetch('http://localhost:5000/api/incomes', { headers })
        ]);

        if (expRes.status === 401 || incRes.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        const expData = await expRes.json();
        const incData = await incRes.json();

        if (expData.success && incData.success) {
          const expenses = expData.data;
          const incomes = incData.data;

          const tExp = expenses.reduce((acc, curr) => acc + curr.Amount, 0);
          const tInc = incomes.reduce((acc, curr) => acc + curr.Amount, 0);

          setTotalExpense(tExp);
          setTotalIncome(tInc);

          const formattedExp = expenses.map(e => ({
            ...e,
            type: 'expense',
            dateObj: new Date(e.ExpenseDate),
            displayDate: formatDate(e.ExpenseDate),
            cat: 'Expense',
            status: 'Approved',
            displayAmount: `-${formatCurrency(e.Amount)}`
          }));

          const formattedInc = incomes.map(i => ({
            ...i,
            type: 'income',
            dateObj: new Date(i.IncomeDate),
            displayDate: formatDate(i.IncomeDate),
            cat: 'Income',
            status: 'Completed',
            displayAmount: `+${formatCurrency(i.Amount)}`
          }));

          // 3. 👇 Store FULL list sorted by date (Removed .slice(0, 10))
          const allTrans = [...formattedExp, ...formattedInc]
            .sort((a, b) => b.dateObj - a.dateObj);

          setAllTransactions(allTrans);

          const monthMap = {};
          const fillMap = (items, key) => {
            items.forEach(item => {
              const date = new Date(item.ExpenseDate || item.IncomeDate);
              const month = date.toLocaleString('default', { month: 'short' });
              if (!monthMap[month]) monthMap[month] = { name: month, income: 0, expense: 0 };
              monthMap[month][key] += item.Amount;
            });
          };

          fillMap(incomes, 'income');
          fillMap(expenses, 'expense');
          setChartData(Object.values(monthMap));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, jwtToken]); // Added jwtToken to dependency array so React stays in sync

  // 4. 👇 Logic to Filter Data based on Search Term
  const filteredTransactions = allTransactions.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.Description?.toLowerCase().includes(term) ||
      item.cat?.toLowerCase().includes(term) ||
      item.PeopleID?.toString().includes(term)
    );
  });

  // 5. 👇 Logic to display: Show Top 10 OR Search Results
  const displayList = searchTerm ? filteredTransactions : filteredTransactions.slice(0, 10);

  const spenders = [
    { name: "Sarah J.", amount: "-₹12,400" },
    { name: "Mike R.", amount: "-₹9,250" },
    { name: "Emily D.", amount: "-₹8,100" },
    { name: "John S.", amount: "-₹5,600" },
  ];

  return (
    <main className="main-content">
      <header className="top-header">
        <div className="header-icons">
          <span className="icon">🔔</span>
          <div className="profile-icon" onClick={() => {
            localStorage.clear(); // Note: if you want to clear Context on logout, you'll need to setJwtToken(null) here eventually
            navigate('/login');
          }} style={{ cursor: 'pointer' }}>🚪</div>
        </div>
      </header>

      <section className="overview-section">
        <div className="title-group">
          <h1>Dashboard Overview</h1>
          <p>Financial summary for authenticated user.</p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Income</span>
            <div className="trend-icon-up">↗</div>
          </div>
          <h2 className="stat-value">{formatCurrency(totalIncome)}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Expense</span>
            <div className="trend-icon-down">↘</div>
          </div>
          <h2 className="stat-value">{formatCurrency(totalExpense)}</h2>
        </div>

        <div className="stat-card highlight-card">
          <div className="stat-header">
            <span className="stat-label">Net Balance</span>
            <div className="bank-icon">🏦</div>
          </div>
          <h2 className="stat-value balance-text">
            {formatCurrency(totalIncome - totalExpense)}
          </h2>
        </div>
      </section>

      <section className="middle-grid">
        <div className="chart-card">
          <div className="card-title-row">
            <span className="card-label">Income vs Expense</span>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', income: 0, expense: 0 }]} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="spenders-card">
          <div className="card-title-row">
            <span className="card-label">Top Spenders</span>
          </div>
          <div className="spenders-list">
            {spenders.map((s, i) => (
              <div key={i} className="spender-row">
                <span className="spender-name">{s.name}</span>
                <span className="spender-amt">{s.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="table-container">
        <div className="search-wrapper boarder-white mb-4">
          {/* 6. 👇 Connected Input to State */}
          <input
            type="text"
            placeholder="Search transactions..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="table-header">
          <h3>{searchTerm ? 'Search Results' : 'Recent Transactions'}</h3>
        </div>
        {loading ? <p style={{ padding: '20px' }}>Loading...</p> : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* 7. 👇 Map over the computed displayList */}
              {displayList.length > 0 ? (
                displayList.map((t, i) => (
                  <tr key={i}>
                    <td>{t.displayDate}</td>
                    <td>ID: {t.PeopleID}</td>
                    <td>{t.Description}</td>
                    <td><span className="cat-pill">{t.cat}</span></td>
                    <td className={t.type === 'expense' ? 'amt-neg' : 'amt-pos'}>
                      {t.displayAmount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    {searchTerm ? "No results found" : "No transactions"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default Dashboard;