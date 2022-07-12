import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './context/auth/FirebaseContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Project from './pages/Project';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <main>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/dashboard/*" element={<Dashboard />}></Route>
          </Routes>
          <ToastContainer autoClose={2000} />
        </main>
      </BrowserRouter>
    </FirebaseProvider>
  );
}

export default App;
