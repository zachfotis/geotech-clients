import { useState, useContext, useEffect } from 'react';
import { NavLink, Navigate, Routes, Route } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';
import CreateProject from '../components/dashboard/CreateProject';
import CreateUser from '../components/dashboard/CreateUser';
import CreateCompany from '../components/dashboard/CreateCompany';
import UploadFile from '../components/dashboard/UploadFile';
import SpinnerSmall from '../components/layout/SpinnerSmall';

function Dashboard() {
  const { user, loggedIn } = useContext(FirebaseContext);
  const [isServerConnecting, setIsServerConnecting] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Wake up server
  useEffect(() => {
    const getGeotechServerStatus = async () => {
      setIsServerConnecting(true);
      try {
        const response = await fetch('https://geotech-server.herokuapp.com/api/v1/status');
        const data = await response.json();
        if (data.status) {
          setIsServerConnected(true);
        } else {
          setIsServerConnected(false);
        }
        setIsServerConnecting(false);
      } catch (error) {
        setIsServerConnecting(false);
        setIsServerConnected(false);
      }
    };

    getGeotechServerStatus();
  }, []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply style to active tab
  const activeLink = ({ isActive }) => (isActive ? 'tab tab-lifted tab-active' : 'tab tab-lifted');

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="dashboard-section">
      <nav className="shadow-md rounded-md bg-teal-500 text-stone-100">
        <p>Administration Dashboard</p>
        <div className="functions">
          <div className="server-status">
            <p>Server Status: </p>
            {isServerConnecting ? (
              <div className="circle bg-orange-500 outline outline-1 outline-white" />
            ) : isServerConnected ? (
              <div className="circle bg-green-500 outline outline-1 outline-white" />
            ) : (
              <div className="circle bg-red-500 outline outline-1 outline-white" />
            )}
          </div>
          <div className="current-time">
            <p>Current Time: </p>
            <p>{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </nav>
      <div className="tabs ml-2">
        <NavLink to="/dashboard/user" className={activeLink}>
          User
        </NavLink>
        <NavLink to="/dashboard/company" className={activeLink}>
          Company
        </NavLink>
        <NavLink to="/dashboard/project" className={activeLink}>
          Project
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
          <Route path="/file" element={<UploadFile />} />
        </Routes>
      </div>
    </section>
  );
}
export default Dashboard;
