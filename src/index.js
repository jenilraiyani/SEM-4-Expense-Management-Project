import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Dashboard from './page/adminDashboard';
import UserDashboard from './page/userDashboard';
import PeopleManagement from './page/peoplePage';
import ProjectManagement from './page/projectPage';
import NewTransaction from './page/expenseForm';
import ReportsAnalytics from './page/reportAnalysis';
import UserManagement from './page/userPage';
import LoginPage from './page/login';
import CategoryManagement from './page/categoryPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './component/layout';
import LayoutUser from './component/layout_user';
import { AppIdProvider } from './context/AppIdContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppIdProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/admin' element={<Layout />}>
          <Route path='/admin' element={<Dashboard />} />
          <Route path='/admin/category' element={<CategoryManagement />} />
          <Route path='/admin/peoplemanagement' element={<PeopleManagement />} />
          <Route path='/admin/projectmanagement' element={<ProjectManagement />} />
          <Route path='/admin/report' element={<ReportsAnalytics />} />
          <Route path='/admin/usermanagement' element={<UserManagement />} />
          <Route path="/admin/peoplemanagement/:projectId" element={<PeopleManagement />} />
        </Route>
         <Route path='/user' element={<LayoutUser />}>
          <Route path='/user' element={<UserDashboard />} />
          <Route path='/user/expenseform' element={<NewTransaction />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AppIdProvider>

  </React.StrictMode>
);
