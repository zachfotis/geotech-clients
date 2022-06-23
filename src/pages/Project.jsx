import { useState, useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

function Project() {
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);
  const { state } = useLocation();
  const [project, setProject] = useState(state);

  useEffect(() => {
    const getCompany = async () => {
      try {
        const date = new Date(project.createdAt.seconds * 1000).toLocaleString();
        const docRef = doc(db, 'companies', project.companyRef);
        const docSnap = await getDoc(docRef);
        const company = docSnap.data();
        setProject({ ...project, company, date });
      } catch (error) {
        toast.error('Error fetching company');
      }
    };

    if (loggedIn && user) {
      setLoading(true);
      getCompany();
      setLoading(false);
    }
  }, []);

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="project-section">
      <h1>{project.title}</h1>
      <div className="project-info-container ">
        <h1>Details</h1>
        <div className="project-info shadow-lg">
          <div className="left-container">
            <h2>Reference:</h2>
            <span>{project.id}</span>
            <h2>Contact Person: </h2>
            <span>
              {user.firstname} {user.lastname}
            </span>
            <h2>Contact Email: </h2>
            <span>{user.email}</span>
            <h2>Date:</h2>
            <span>{project.date}</span>
          </div>
          <div className="right-container">
            <h2>Company:</h2>
            <span>
              {project.company.name} ({project.company.vat})
            </span>
            <h2>Address:</h2>
            <span>{project.company.address}</span>
            <h2>Email:</h2>
            <span>{project.company.email}</span>
            <h2>Telephone:</h2>
            <span>{project.company.tel}</span>
          </div>
        </div>
      </div>
      <div className="project-files-container">
        <h1>Documents for Services</h1>
        <div className="category-container shadow-md">
          <h2>Purchase Orders (PO)</h2>
          <div className="category-files-container">
            <img
              src="https://www.freeiconspng.com/thumbs/pdf-icon-png/pdf-icon-4.png"
              alt="file type"
            />
            <div className="file-download">
              <h2>Technical study for the well GA-01</h2>
              <button className="btn btn-outline btn-xs btn-success">Download</button>
            </div>
          </div>
          <div className="category-files-container">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Microsoft_Word_2013-2019_logo.svg/1200px-Microsoft_Word_2013-2019_logo.svg.png"
              alt="file type"
            />
            <div className="file-download">
              <h2>Technical study for the well GA-01</h2>
              <button className="btn btn-outline btn-xs btn-success">Download</button>
            </div>
          </div>
        </div>
        <div className="category-container shadow-md">
          <h2>Private Agreement</h2>
          <div className="category-files-container">
            <img
              src="https://www.freeiconspng.com/thumbs/pdf-icon-png/pdf-icon-4.png"
              alt="file type"
            />
            <div className="file-download">
              <h2>The private agreement between companies for the current project</h2>
              <button className="btn btn-outline btn-xs btn-success">Download</button>
            </div>
          </div>
          <div className="category-files-container">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Microsoft_Word_2013-2019_logo.svg/1200px-Microsoft_Word_2013-2019_logo.svg.png"
              alt="file type"
            />
            <div className="file-download">
              <h2>Technical study for the well GA-01</h2>
              <button className="btn btn-outline btn-xs btn-success">Download</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Project;
