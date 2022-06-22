import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getDocs, collection, query, where } from 'firebase/firestore';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Projects() {
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), where('userRef', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map((doc) => doc.data());
        setProjects(projects);
      } catch {
        toast.error('Error fetching projects');
      }
    };

    if (loggedIn && user) {
      console.log('fetching projects');
      setLoading(true);
      getProjects();
      setLoading(false);
    }

    return () => {};
  }, [loggedIn]); // eslint-disable-line

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="projects-section">
      <h1>{`Welcome ${user.firstname}`}</h1>
      <form>
        <input
          type="text"
          placeholder="Search for your project"
          className="input input-bordered w-full"
        />
        <button className="btn btn-black">Search</button>
      </form>
      <div className="projects-container">
        <div className="grid-headers contents text-md uppercase font-semibold text-center">
          <h1 className="rounded-tl-xl">Project ID</h1>
          <h1>Project Name</h1>
          <h1>Company</h1>
          <h1>Date</h1>
          <h1 className="rounded-tr-xl">Actions</h1>
        </div>
        {projects.length > 0 &&
          projects.map((project) => (
            <div className="grid-content contents" key={project.id}>
              <p>{project.id}</p>
              <p>{project.title}</p>
              <p>{project.company}</p>
              <p>{new Date(Number(project.timestamp)).toUTCString()}</p>
              <div className="actions">
                <button className="btn btn-outline btn-info btn-sm w-fit">Open</button>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

export default Projects;
