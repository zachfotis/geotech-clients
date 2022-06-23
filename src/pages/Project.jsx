import { useState, useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';

function Project() {
  const { state } = useLocation();
  const [project, setProject] = useState(state);
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="projects-section">
      <h1>{project.title}</h1>
    </section>
  );
}

export default Project;
