import { useState, useContext, useEffect } from 'react';
import { Link, NavLink, Navigate, Routes, Route } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';
import { toast } from 'react-toastify';
import CreateProject from '../components/dashboard/CreateProject';
import CreateUser from '../components/dashboard/CreateUser';
import CreateCompany from '../components/dashboard/CreateCompany';
import CreateFile from '../components/dashboard/CreateFile';

function Dashboard() {
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);

  // Apply style to active tab
  const activeLink = ({ isActive }) => (isActive ? 'tab tab-lifted tab-active' : 'tab tab-lifted');

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="dashboard-section">
      <h1>Administration Dashboard</h1>
      <div className="tabs ml-2">
        <NavLink to="/dashboard/project" className={activeLink}>
          Project
        </NavLink>
        <NavLink to="/dashboard/user" className={activeLink}>
          User
        </NavLink>
        <NavLink to="/dashboard/company" className={activeLink}>
          Company
        </NavLink>
        <NavLink to="/dashboard/file" className={activeLink}>
          Upload File
        </NavLink>
      </div>
      <div className="tab-content shadow-lg rounded-xl outline-1 outline outline-slate-200">
        <Routes>
          <Route path="/project" element={<CreateProject />} />
          <Route path="/user" element={<CreateUser />} />
          <Route path="/company" element={<CreateCompany />} />
          <Route path="/file" element={<CreateFile />} />
        </Routes>
      </div>
    </section>
  );
}
export default Dashboard;