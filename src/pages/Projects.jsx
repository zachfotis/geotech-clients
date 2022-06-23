import { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getDocs, collection, query, where } from 'firebase/firestore';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Projects() {
  const { user, loggedIn } = useContext(FirebaseContext);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const getProjects = async () => {
      try {
        let q;
        if (user.accountType === 'admin') {
          q = query(collection(db, 'projects'));
        } else {
          q = query(collection(db, 'projects'), where('userRef', '==', user.uid));
        }
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map((doc) => doc.data());
        setProjects(projects);
      } catch {
        toast.error('Error fetching projects');
      }
    };

    if (loggedIn && user) {
      getProjects();
    }

    return () => {};
  }, [loggedIn]); // eslint-disable-line

  const onSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
    if (e.target.value.length > 0) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
          project.company.toLowerCase().includes(e.target.value.toLowerCase()) ||
          project.id.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  };

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="projects-section">
      <h1>{`Welcome ${user.firstname}`}</h1>
      <form onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Search for your project"
          className="input input-bordered w-full"
          value={search}
          onChange={onSearch}
          onSubmit={onSearch}
        />
        <button type="submit" className="btn btn-black">
          Search
        </button>
      </form>
      <div className="projects-container">
        <div className="grid-headers contents text-md uppercase font-semibold text-center">
          <h1 className="rounded-tl-xl">Project ID</h1>
          <h1>Project Name</h1>
          <h1>Company</h1>
          <h1>Date</h1>
          <h1 className="rounded-tr-xl">Actions</h1>
        </div>
        {filteredProjects.length > 0
          ? filteredProjects.map((project) => (
              <div className="grid-content contents" key={project.id}>
                <p>{project.id}</p>
                <p>{project.title}</p>
                <p>{project.company}</p>
                <p>{new Date(project.createdAt.seconds * 1000).toLocaleDateString()}</p>
                <div className="actions">
                  <Link
                    to={`/project/${project.id}`}
                    state={project}
                    className="btn btn-outline btn-accent btn-sm w-28"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          : projects.length > 0 &&
            projects.map((project) => (
              <div className="grid-content contents" key={project.id}>
                <p>{project.id}</p>
                <p>{project.title}</p>
                <p>{project.company}</p>
                <p>{new Date(project.createdAt.seconds * 1000).toLocaleDateString()}</p>
                <div className="actions">
                  <Link
                    to={`/project/${project.id}`}
                    state={project}
                    className="btn btn-outline btn-accent btn-sm w-28"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

export default Projects;
