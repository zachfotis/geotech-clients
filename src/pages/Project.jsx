import { useState, useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getDoc, getDocs, doc, query, collection, where, orderBy, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Project() {
  const { user, isAdmin, loggedIn, setLoading, isLoading } = useContext(FirebaseContext);
  const { state } = useLocation();
  const [projectUser, setProjectUser] = useState(null);
  const [projectCompany, setProjectCompany] = useState(null);
  const [projectFiles, setProjectFiles] = useState(null);
  const [project, setProject] = useState(state);
  const [categories, setCategories] = useState(null);

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
      // Get Project Files
      const q = query(
        collection(db, 'files'),
        where('projectRef', '==', project.id.toString()),
        orderBy('timestamp', 'desc')
      );
      const filesSnap = await getDocs(q);
      const files = filesSnap.docs.map((doc) => {
        return {
          docRef: doc.ref,
          docProp: doc.data(),
        };
      });
      setProjectFiles(files);
    } catch (error) {
      console.log(error);
      toast.error('Error fetching data');
    }
    setLoading(false);
  };

  // Get Data
  useEffect(() => {
    if (loggedIn && user) {
      getProjectData();
    }
  }, []); // eslint-disable-line

  // Prepare categories for the project
  useEffect(() => {
    if (!projectFiles) {
      return;
    }
    const categoriesObject = projectFiles.reduce((acc, file) => {
      if (!acc[file.docProp.category]) {
        acc[file.docProp.category] = {};
      }
      if (!acc[file.docProp.category][file.docProp.type]) {
        acc[file.docProp.category][file.docProp.type] = [];
      }

      // Add file icon to each file
      let fileTypeIcon = null;
      try {
        fileTypeIcon = require(`../assets/file-types/${file.docProp.fileType}.png`);
      } catch (error) {
        fileTypeIcon = require('../assets/file-types/unknown.png');
      }

      acc[file.docProp.category][file.docProp.type].push({
        ...file.docProp,
        fileTypeIcon,
        docRef: file.docRef,
      });

      return acc;
    }, {});

    setCategories(categoriesObject);
  }, [projectFiles]);

  // On File Delete
  const onFileDelete = async (file) => {
    setLoading(true);
    // Delete file from storage
    const storage = getStorage();
    const avatarRef = ref(storage, file.fileURL);
    await deleteObject(avatarRef);

    // Delete User in Firestore
    const fileRef = file.docRef;
    await deleteDoc(fileRef);

    toast.success('File deleted');
    setLoading(false);
    getProjectData();
  };

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  if (!isLoading)
    return (
      <section className="project-section">
        <h1>
          {project.title} {project.isNew && <span className="badge badge-accent badge-md text-white">New</span>}
        </h1>
        <div className="project-info-container">
          <div className="project-info shadow-lg outline outline-1 outline-cyan-50 bg-cyan-50">
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
            <div className="right-container ">
              <h2>Company:</h2>
              <span>
                {projectCompany?.title} {projectCompany?.vat}
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
        {/* FILES */}
        {categories && Object.keys(categories).length === 0 && (
          <div className="not-found-container flex flex-col justify-center items-center w-full mt-10">
            <img src={require('../assets/icons/not-found.png')} alt="not found" />
            <p>No Files Found!</p>
          </div>
        )}
        {categories &&
          Object.keys(categories).map((category) => (
            <div key={category} className="project-files-container">
              <h1>
                Documents for{' '}
                {category.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
              </h1>
              {Object.keys(categories[category]).map((type) => (
                <div key={`${category}-${type}`} className="category-container shadow-md">
                  <h2>{type.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}s</h2>
                  {categories[category][type].map((file) => (
                    <div key={file.fileName} className="category-files-container">
                      <img src={file.fileTypeIcon} alt="file type" />
                      <div className="file-download">
                        <h2>
                          {file.fileName.replace(
                            /\w\S*/g,
                            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                          )}
                        </h2>
                        <h2>Uploaded: {new Date(file.timestamp.seconds * 1000).toLocaleString()}</h2>
                        <div className="buttons">
                          <a
                            className="btn btn-outline btn-xs btn-success"
                            href={file.fileURL}
                            download={file.fileName}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                          {isAdmin && (
                            <button
                              className="btn btn-outline btn-xs btn-error"
                              onClick={() => {
                                onFileDelete(file);
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
      </section>
    );
}

export default Project;
