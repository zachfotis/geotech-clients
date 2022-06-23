import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './context/auth/FirebaseContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Project from './pages/Project';
import Projects from './pages/Projects';

function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <main>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
          <ToastContainer autoClose={2000} />
        </main>
      </BrowserRouter>
    </FirebaseProvider>
  );
}

export default App;
