import React, { useEffect, useState } from 'react';
import '../style/expenseForm.css'
import { useAppId } from '../context/AppIdContext'; // 1. 👇 Import the context

const NewTransaction = () => {
  const [activeTab, setActiveTab] = useState('expense');
  
  // 2. 👇 Extract jwtToken from Context
  const { jwtToken } = useAppId();

  const [history, setHistory] = useState([
    { id: 1, title: "Adobe Creative Cloud", sub: "Software • Monthly", amount: 54.99, type: "neg" },
    { id: 2, title: "Q3 Client Payment", sub: "Income • Project Alpha", amount: 2450.00, type: "pos" },
    { id: 3, title: "Team Lunch", sub: "Meals • Office", amount: 128.50, type: "neg" },
  ]);

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    // 3. 👇 Pass the token in the headers for expenses
    if (!jwtToken) return;

    fetch('http://localhost:3000/expenses', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((result) => setExpenses(result.data))
      .catch((err => console.error(err)));
  }, [jwtToken]) // Add jwtToken to dependencies

  useEffect(() => {
    // 4. 👇 Pass the token in the headers for incomes
    if (!jwtToken) return;

    fetch('http://localhost:3000/incomes', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((result) => setIncomes(result.data))
      .catch((err => console.error(err)));
  }, [jwtToken]) // Add jwtToken to dependencies
  
  const [formData, setFormData] = useState({
    date: '2023-10-27',
    amount: '',
    category: 'Software',
    payee: '',
    project: 'General'
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.payee) return alert("Please enter amount and payee");

    const newRecord = {
      id: Date.now(),
      title: formData.payee,
      sub: `${formData.category} • ${formData.project}`,
      amount: parseFloat(formData.amount),
      type: activeTab === 'expense' ? 'neg' : 'pos'
    };

    setHistory([newRecord, ...history]);
    
    setFormData({ ...formData, amount: '', payee: '' });
  };

  const handleDelete = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };


  const totalExpense = history
    .filter(item => item.type === 'neg')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = history
    .filter(item => item.type === 'pos')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <main className="main-viewport">
        <header className="page-header">
          <div className="header-info">
            <h1>New Transaction</h1>
            <p>Record detailed income or expenses for accurate reporting.</p>
          </div>
        </header>

        <div className="content-grid">
        
          <div className="form-card">
            <div className="type-toggle">
              <button 
                className={activeTab === 'expense' ? 'active' : ''} 
                onClick={() => setActiveTab('expense')}
              >
                <span>↘</span> Expense
              </button>
              <button 
                className={activeTab === 'income' ? 'active' : ''} 
                onClick={() => setActiveTab('income')}
              >
                <span>↗</span> Income
              </button>
            </div>

            <form className="transaction-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="input-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Amount</label>
                  <input 
                    type="number" 
                    placeholder=" ₹0.00" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Software">Software</option>
                    <option value="Meals">Meals</option>
                    <option value="Salary">Salary</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Project</label>
                  <select 
                    value={formData.project}
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Project Alpha">Project Alpha</option>
                    <option value="Project Beta">Project Beta</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>People / Payee</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Adobe, Client Name..." 
                    value={formData.payee}
                    onChange={(e) => setFormData({...formData, payee: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-btns">
                <button 
                  type="button" 
                  className="btn-clear"
                  onClick={() => setFormData({...formData, amount: '', payee: ''})}
                >
                  Clear Form
                </button>
                <button type="submit" className="btn-save">Save Transaction</button>
              </div>
            </form>
          </div>

          <div className="side-panel">
            <div className="history-section">
              <div className="history-header">
                <h3>Session History</h3>
                <span className="count-tag">{history.length} Records</span>
              </div>
              <div className="history-list">
                {incomes.map((item) => (
                  <div key={item.IncomeID} className="history-item">
                    <div className="item-details">
                      <p className="item-title">{item.IncomeDetail}</p>
                      <p className="item-sub">{item.Description}</p>
                    </div>
                    <div className="item-action">
                      <p className={`item-amt pos`}>
                        +₹{item.Amount}
                      </p>
                      <span 
                        className="edit-icon" 
                        style={{cursor: 'pointer'}}
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑
                      </span>
                    </div>
                  </div>
                ))}
                {expenses.map((item) => (
                  <div key={item.ExpenseID} className="history-item">
                    <div className="item-details">
                      <p className="item-title">{item.ExpenseDetail}</p>
                      <p className="item-sub">{item.Description}</p>
                    </div>
                    <div className="item-action">
                      <p className={`item-amt neg`}>
                        -₹{item.Amount}
                      </p>
                      <span 
                        className="edit-icon" 
                        style={{cursor: 'pointer'}}
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-cards">
              <div className="summary-box">
                <p className="box-label">Total Expense (Session)</p>
                <p className="box-amt neg">₹{totalExpense.toLocaleString()}</p>
              </div>
              <div className="summary-box">
                <p className="box-label">Total Income (Session)</p>
                <p className="box-amt pos">₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NewTransaction;