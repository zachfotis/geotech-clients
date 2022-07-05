import { useState, useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Project() {
  const { user, loggedIn, setLoading, isLoading } = useContext(FirebaseContext);
  const { state } = useLocation();
  const [projectUser, setProjectUser] = useState(null);
  const [projectCompany, setProjectCompany] = useState(null);
  const [project, setProject] = useState(state);

  useEffect(() => {
    const getProjectData = async () => {
      setLoading(true);
      //  Create Project Date and check if it new
      const currentDate = new Date();
      const projectDate = new Date(project.timestamp.seconds * 1000);
      const daysAgo = currentDate.getDate() - projectDate.getDate();
      const isNew = daysAgo <= 3;
      setProject({ ...project, date: projectDate.toLocaleString(), isNew });

      try {
        // Get Company
        const docRef = doc(db, 'companies', project.companyRef);
        const docSnap = await getDoc(docRef);
        const company = docSnap.data();
        setProjectCompany(company);
        // Get User
        const docRef2 = doc(db, 'users', project.userRef);
        const docSnap2 = await getDoc(docRef2);
        const user = docSnap2.data();
        setProjectUser(user);
      } catch (error) {
        toast.error('Error fetching data');
      }
      setLoading(false);
    };

    if (loggedIn && user) {
      getProjectData();
    }
  }, []); // eslint-disable-line

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  if (!isLoading)
    return (
      <section className="project-section">
        <h1>
          {project.title} {project.isNew && <span className="badge badge-accent badge-md text-white">New</span>}
        </h1>
        <div className="project-info-container ">
          <div className="project-info shadow-lg outline outline-1 outline-teal-400 bg-teal-50">
            <div className="left-container">
              <h2>Reference:</h2>
              <span>{project.id}</span>
              <h2>Contact Person: </h2>
              <span>
                {projectUser?.firstname} {projectUser?.lastname}
              </span>
              <h2>Contact Email: </h2>
              <span>{projectUser?.email}</span>
              <h2>Created At:</h2>
              <span>{project.date}</span>
            </div>
            <div className="right-container">
              <h2>Company:</h2>
              <span>
                {projectCompany?.title} - {projectCompany?.vat}
              </span>
              <h2>Address:</h2>
              <span>
                {projectCompany?.address} {projectCompany?.number}, {projectCompany?.zip}, {projectCompany?.city}{' '}
                {projectCompany?.country}
              </span>
              <h2>Email:</h2>
              <span>{projectCompany?.email}</span>
              <h2>Phone:</h2>
              <span>{projectCompany?.phone}</span>
            </div>
          </div>
        </div>
        <div className="project-files-container">
          <h1>Documents for Services</h1>
          <div className="category-container shadow-md">
            <h2>Purchase Orders (PO)</h2>
            <div className="category-files-container">
              <img src="https://www.freeiconspng.com/thumbs/pdf-icon-png/pdf-icon-4.png" alt="file type" />
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
              <img src="https://www.freeiconspng.com/thumbs/pdf-icon-png/pdf-icon-4.png" alt="file type" />
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
