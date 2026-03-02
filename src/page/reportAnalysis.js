import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/reportAnalysis.css';
import { useAppId } from '../context/AppIdContext'; // 1. 👇 Import the context

const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 2. 👇 Extract jwtToken from Context
  const { jwtToken } = useAppId();

  // State for Calculated Data
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [projectLeaders, setProjectLeaders] = useState([]);
  const [kpi, setKpi] = useState({ total: 0, pending: 0, avg: 0 });

  // Helper: Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 3. 👇 Use token from Context instead of localStorage
        const token = jwtToken;
        
        if (!token) { navigate('/login'); return; }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Fetch All Required Data in Parallel
        const [expRes, catRes, projRes] = await Promise.all([
          fetch('http://localhost:5000/api/expenses', { headers }),
          fetch('http://localhost:5000/api/categories', { headers }),
          fetch('http://localhost:5000/api/projects', { headers })
        ]);

        if (expRes.status === 401) { navigate('/login'); return; }

        const expensesData = await expRes.json();
        const categoriesData = await catRes.json();
        const projectsData = await projRes.json();

        if (expensesData.success && categoriesData.success && projectsData.success) {
          processAnalytics(expensesData.data, categoriesData.data, projectsData.data);
        }

      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, jwtToken]); // 4. 👇 Add jwtToken to dependency array

  // --- DATA PROCESSING LOGIC ---
  const processAnalytics = (expenses, categories, projects) => {
    
    // 1. KPI Calculations
    const totalSpend = expenses.reduce((sum, item) => sum + item.Amount, 0);
    // Assuming "Pending" logic isn't in API yet, we'll mock it or check a status field if added later
    const pendingCount = 0; 
    const avgMonthly = totalSpend / 12; // Simplified average

    setKpi({ total: totalSpend, pending: pendingCount, avg: avgMonthly });


    // 2. Monthly Breakdown
    const monthMap = {};
    expenses.forEach(exp => {
      const date = new Date(exp.ExpenseDate);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g., "February 2026"
      
      if (!monthMap[key]) monthMap[key] = 0;
      monthMap[key] += exp.Amount;
    });

    const processedMonths = Object.keys(monthMap).map(month => {
      const spend = monthMap[month];
      const limit = 50000; // Hardcoded Budget Limit for now
      const variance = limit - spend;
      return {
        month,
        spend: formatCurrency(spend),
        limit: formatCurrency(limit),
        variance: (variance < 0 ? "-" : "+") + formatCurrency(Math.abs(variance)),
        status: variance < 0 ? 'danger' : 'success' // Red if over budget
      };
    });
    setMonthlyData(processedMonths);


    // 3. Category Distribution
    const catMap = {};
    expenses.forEach(exp => {
      if (!catMap[exp.CategoryID]) catMap[exp.CategoryID] = 0;
      catMap[exp.CategoryID] += exp.Amount;
    });

    const colors = ["#2f81f7", "#a371f7", "#3fb950", "#d29922", "#f85149"];
    const processedCats = Object.keys(catMap).map((catId, index) => {
      const category = categories.find(c => c.CategoryID === parseInt(catId));
      return {
        name: category ? category.CategoryName : `Unknown (${catId})`,
        amount: catMap[catId],
        percent: Math.round((catMap[catId] / totalSpend) * 100),
        color: colors[index % colors.length]
      };
    }).sort((a, b) => b.percent - a.percent); // Sort highest % first
    setCategoryDist(processedCats);


    // 4. Project Spend Leaders
    const projMap = {};
    expenses.forEach(exp => {
      if (!projMap[exp.ProjectID]) projMap[exp.ProjectID] = 0;
      projMap[exp.ProjectID] += exp.Amount;
    });

    const projColors = ["blue", "purple", "green", "red", "orange"];
    const processedProjs = Object.keys(projMap).map((projId, index) => {
      const project = projects.find(p => p.ProjectID === parseInt(projId));
      const amount = projMap[projId];
      // Calculate max spend to determine bar width relative to the leader
      const maxSpend = Math.max(...Object.values(projMap)); 
      
      return {
        name: project ? project.ProjectName : `Project #${projId}`,
        amountFormatted: formatCurrency(amount >= 1000 ? amount/1000 : amount) + (amount >= 1000 ? 'k' : ''),
        rawAmount: amount,
        width: Math.round((amount / maxSpend) * 100), // Width relative to biggest spender
        colorClass: projColors[index % projColors.length]
      };
    }).sort((a, b) => b.rawAmount - a.rawAmount).slice(0, 5); // Top 5
    setProjectLeaders(processedProjs);

  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Loading Analytics...</div>;

  return (
    <>
      <main className="main-report-view">
        <header className="report-top-bar">
          <div className="search-bar">
            <span className="s-icon">🔍</span>
            <input type="text" placeholder="Search reports, transactions, or projects" />
          </div>
          <div className="top-right-tools">
            <span className="bell">🔔</span>
            <div className="user-circle" onClick={() => {localStorage.removeItem('token'); navigate('/login')}} style={{cursor:'pointer'}}></div>
          </div>
        </header>

        <section className="report-header">
          <div className="h-left">
            <h1>Reports & Analytics</h1>
            <p>Financial Overview</p>
          </div>
          <div className="h-right">
            <button className="btn-outline bg-black">📥 Export to Excel</button>
            <button className="btn-primary">📄 Export to PDF</button>
          </div>
        </section>

        <section className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">TOTAL SPEND</span>
              <span className="kpi-badge green">+12%</span>
            </div>
            <h2 className="kpi-val">{formatCurrency(kpi.total)}</h2>
            <p className="kpi-sub">Total expenses recorded</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">PENDING APPROVAL</span>
              <span className="kpi-badge yellow">{kpi.pending} Requests</span>
            </div>
            <h2 className="kpi-val">₹0.00</h2>
            <p className="kpi-sub">Requires immediate attention</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">AVG. MONTHLY SPEND</span>
              <span className="kpi-badge blue">Stable</span>
            </div>
            <h2 className="kpi-val">{formatCurrency(kpi.avg)}</h2>
            <p className="kpi-sub">Based on available data</p>
          </div>
        </section>

        <div className="analytics-grid">
          
          {/* Monthly Breakdown Table */}
          <div className="table-card">
            <div className="card-head">
              <h3>Monthly Breakdown</h3>
              <span className="filter-icon">≡</span>
            </div>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>MONTH</th>
                  <th>TOTAL SPEND</th>
                  <th>BUDGET LIMIT</th>
                  <th>VARIANCE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.length > 0 ? monthlyData.map((d, i) => (
                  <tr key={i}>
                    <td>{d.month}</td>
                    <td>{d.spend}</td>
                    <td>{d.limit}</td>
                    <td className={d.status === 'danger' ? 'text-red' : 'text-green'}>
                      {d.variance}
                    </td>
                    <td><span className={`dot ${d.status}`}></span></td>
                  </tr>
                )) : (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No Expense Data Available</td></tr>
                )}
              </tbody>
            </table>
            <div className="view-link">View All Months</div>
          </div>

          {/* Charts Section */}
          <div className="charts-side">
            
            {/* Category Distribution */}
            <div className="stat-box">
              <h3>Category Distribution</h3>
              <div className="dist-list">
                {categoryDist.map((c, i) => (
                  <div key={i} className="dist-item">
                    <div className="dist-text">
                      <span>{c.name}</span>
                      <span>{c.percent}%</span>
                    </div>
                    <div className="progress-bg">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${c.percent}%`, background: c.color }}
                      ></div>
                    </div>
                  </div>
                ))}
                {categoryDist.length === 0 && <p style={{color:'#666', fontSize:'13px'}}>No category data</p>}
              </div>
            </div>

            {/* Project Spend Leaders */}
            <div className="stat-box">
              <h3>Project Spend Leaders</h3>
              <div className="project-leaders">
                {projectLeaders.map((p, i) => (
                    <div key={i} className="leader-item">
                    <div className={`p-icon ${p.colorClass}`}>📊</div>
                    <div className="p-meta">
                        <div className="p-row"><span>{p.name}</span> <span>{p.amountFormatted}</span></div>
                        <div className="p-bar">
                            <div className={`p-fill ${p.colorClass}`} style={{width: `${p.width}%`}}></div>
                        </div>
                    </div>
                    </div>
                ))}
                {projectLeaders.length === 0 && <p style={{color:'#666', fontSize:'13px'}}>No project data</p>}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default ReportsAnalytics;