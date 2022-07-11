import { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getDocs, orderBy, deleteDoc, collection, query, where } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Projects() {
  const { user, loggedIn, loading, setLoading, isAdmin } = useContext(FirebaseContext);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState('');

  const getProjects = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    if (loggedIn && user) {
      getProjects();
    }

    return () => {};
  }, [loggedIn, isAdmin, user]);

  useEffect(() => {
    if (search.length > 0) {
      const filtered = projects.filter(
        (project) =>
          project.id.toString().includes(search.toLowerCase()) ||
          project.title.toLowerCase().includes(search.toLowerCase()) ||
          project.companyName.toLowerCase().includes(search.toLowerCase()) ||
          new Date(project.timestamp.seconds * 1000).toLocaleDateString().includes(search.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [search]);

  const onSearch = (e) => {
    setSearch(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSearch(e.target.elements['search-bar'].value);
  };

  // TODO: Add modal to delete project
  const onDelete = async (id) => {
    setLoading(true);
    try {
      // Delete Project
      let q = query(collection(db, 'projects'), where('id', '==', id));
      const querySnapshot = await getDocs(q);
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);

      // Delete Project Files
      const storage = getStorage();
      q = query(collection(db, 'files'), where('projectRef', '==', id));
      const querySnapshot2 = await getDocs(q);
      querySnapshot2.docs.forEach(async (doc) => {
        const docRef = doc.ref;
        const docData = doc.data();
        await deleteDoc(docRef);
        const fileRef = ref(storage, docData.fileURL);
        await deleteObject(fileRef);
      });
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
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Search for your project"
          className="input input-bordered w-full"
          name="search-bar"
          value={search}
          onChange={onSearch}
        />
        <button type="submit" name="search-btn" className="btn btn-black">
          Search
        </button>
      </form>
      {projects.length === 0 || (filteredProjects.length === 0 && search.length > 0) ? (
        !loading && (
          <div className="not-found-container flex flex-col justify-center items-center w-full mt-10">
            <img src={require('../assets/icons/not-found.png')} alt="not found" />
            <p>No Projects Found!</p>
          </div>
        )
      ) : (
        <div className="projects-container">
          <div className="grid-headers contents text-md uppercase font-semibold text-center">
            <h1 className="rounded-tl-xl">Project ID</h1>
            <h1>Project Name</h1>
            <h1>Company</h1>
            <h1>Date</h1>
            <h1 className="rounded-tr-xl">Actions</h1>
          </div>
          {filteredProjects.length > 0 || search.length > 0
            ? filteredProjects.map((project) => (
                <div className="grid-content contents" key={project.id}>
                  <p>{project.id}</p>
                  <p>{project.title}</p>
                  <p>{project.companyName}</p>
                  <p>{new Date(project.timestamp.seconds * 1000).toLocaleDateString()}</p>
                  <div className="actions">
                    {isAdmin ? (
                      <>
                        <Link
                          to={`/project/${project.id}`}
                          state={project}
                          className="btn btn-outline btn-accent btn-xs w-28"
                        >
                          View
                        </Link>
                        <div
                          className="btn btn-outline btn-error btn-xs w-28"
                          onClick={() => {
                            onDelete(project.id);
                          }}
                        >
                          Delete
                        </div>
                      </>
                    ) : (
                      <Link
                        to={`/project/${project.id}`}
                        state={project}
                        className="btn btn-outline btn-accent btn-sm w-28"
                      >
                        View
                      </Link>
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
                    {isAdmin ? (
                      <>
                        <Link
                          to={`/project/${project.id}`}
                          state={project}
                          className="btn btn-outline btn-accent btn-xs w-28"
                        >
                          View
                        </Link>
                        <div
                          className="btn btn-outline btn-error btn-xs w-28"
                          onClick={() => {
                            onDelete(project.id);
                          }}
                        >
                          Delete
                        </div>
                      </>
                    ) : (
                      <Link
                        to={`/project/${project.id}`}
                        state={project}
                        className="btn btn-outline btn-accent btn-sm w-28"
                      >
                        View
                      </Link>
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
