import { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getDocs, orderBy, deleteDoc, collection, query, where } from 'firebase/firestore';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Projects() {
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);
  const [isAdmin, setIsAdmin] = useState(user?.accountType === 'admin' ? true : false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsAdmin(user?.accountType === 'admin' ? true : false);
  }, [user]);

  const getProjects = async () => {
    try {
      let q;
      if (isAdmin) {
        q = query(collection(db, 'projects'), orderBy('id', 'desc'));
      } else {
        q = query(collection(db, 'projects'), where('userRef', '==', user.uid), orderBy('id', 'desc'));
      }
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map((doc) => doc.data());
      setProjects(projects);
    } catch (error) {
      toast.error('Error fetching projects');
    }
  };

  useEffect(() => {
    if (loggedIn && user) {
      getProjects();
    }

    return () => {};
  }, [loggedIn, isAdmin, user]);

  const onSearch = (e) => {
    e && e.preventDefault();
    // TODO: fix the form search
    setSearch(e.target.value);
    if (e.target.value.length > 0) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
          project.companyName.toLowerCase().includes(e.target.value.toLowerCase()) ||
          project.id.toString().includes(e.target.value.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  };

  const onDelete = async (id) => {
    setLoading(true);
    try {
      // get doc ref
      const q = query(collection(db, 'projects'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
      toast.success('Project deleted');
      getProjects();
    } catch (error) {
      toast.error('Error deleting project');
    }
    setLoading(false);
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
        />
        <button type="submit" className="btn btn-black">
          Search
        </button>
      </form>
      {projects.length === 0 ? (
        <div className="not-found-container flex flex-col justify-center items-center w-full mt-10">
          <img src={require('../assets/icons/not-found.png')} alt="not found" />
          <p>No Projects Found!</p>
        </div>
      ) : (
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
                  <p>{project.companyName}</p>
                  <p>{new Date(project.timestamp.seconds * 1000).toLocaleDateString()}</p>
                  <div className="actions">
                    <Link
                      to={`/project/${project.id}`}
                      state={project}
                      className="btn btn-outline btn-accent btn-sm w-28"
                    >
                      View
                    </Link>
                    {isAdmin && (
                      <div
                        className="btn btn-outline btn-error btn-sm w-28"
                        onClick={() => {
                          onDelete(project.id);
                        }}
                      >
                        Delete
                      </div>
                    )}
                  </div>
                </div>
              ))
            : projects.length > 0 &&
              projects.map((project) => (
                <div className="grid-content contents" key={project.id}>
                  <p>{project.id}</p>
                  <p>{project.title}</p>
                  <p>{project.companyName}</p>
                  <p>{new Date(project.timestamp.seconds * 1000).toLocaleDateString()}</p>
                  <div className="actions">
                    <Link
                      to={`/project/${project.id}`}
                      state={project}
                      className="btn btn-outline btn-accent btn-sm w-28"
                    >
                      View
                    </Link>
                    {isAdmin && (
                      <div
                        className="btn btn-outline btn-error btn-sm w-28"
                        onClick={() => {
                          onDelete(project.id);
                        }}
                      >
                        Delete
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>
      )}
    </section>
  );
}

export default Projects;
