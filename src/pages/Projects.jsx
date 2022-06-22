import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';

function Projects() {
  const { user, loggedIn } = useContext(FirebaseContext);

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="projects-section">
      <h1>{`Welcome to your projects ${user.firstName}`}</h1>
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

        <div className="grid-content contents">
          <p>Test ID</p>
          <p>Test Project</p>
          <p>Test Company</p>
          <p>Test Date</p>
          <div className="actions">
            <button className="btn btn-outline btn-info btn-sm w-fit">Open</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Projects;
