import { useState, useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getDoc, getDocs, doc, query, collection, where, orderBy, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import FirebaseContext from '../context/auth/FirebaseContext';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Modal from '../components/layout/Modal';

function Project() {
  const { user, isAdmin, loggedIn, setLoading, isLoading } = useContext(FirebaseContext);
  const { state } = useLocation();
  const [projectUser, setProjectUser] = useState(null);
  const [projectCompany, setProjectCompany] = useState(null);
  const [projectFiles, setProjectFiles] = useState(null);
  const [project, setProject] = useState(state);
  const [categories, setCategories] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);

  function openModal(file) {
    setModalIsOpen(true);
    setModalFile(file);
  }

  function closeModal() {
    setModalIsOpen(false);
  }

  const getProjectData = async () => {
    setLoading(true);
    //  Create Project Date and check if it new
    const currentDate = new Date();
    const projectDate = new Date(project.date);
    const daysAgo = currentDate - projectDate;
    const days = Math.round(daysAgo / (1000 * 60 * 60 * 24));
    const isNew = days <= 3;
    setProject({ ...project, date: projectDate.toLocaleDateString(), isNew });

    try {
      // Get Company
      const docRef = doc(db, 'companies', project.companyRef);
      const docSnap = await getDoc(docRef);
      const company = docSnap.data();
      setProjectCompany(company);
      // Get User
      const docRef2 = doc(db, 'users', project.userRef);
      const docSnap2 = await getDoc(docRef2);
      const current_user = docSnap2.data();
      setProjectUser(current_user);
      // Get Project Files
      let q = null;
      if (isAdmin) {
        q = query(collection(db, 'files'), where('projectRef', '==', project.id), orderBy('timestamp', 'desc'));
      } else {
        q = query(
          collection(db, 'files'),
          where('projectRef', '==', project.id),
          where('userRef', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
      }
      const filesSnap = await getDocs(q);
      const files = filesSnap.docs.map((doc) => {
        return {
          docRef: doc.ref,
          docProp: doc.data(),
        };
      });
      setProjectFiles(files);
    } catch (error) {
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
        fileTypeIcon = require(`../assets/file-types/${file.docProp.fileType.toLowerCase()}.png`);
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
    setModalFile(null);
    closeModal();
    setLoading(false);
    getProjectData();
  };

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  if (!isLoading)
    return (
      <section className="project-section">
        <Modal
          modalType="Delete File"
          modalContent="Are you sure you want to delete this file?"
          confirmFn={() => onFileDelete(modalFile)}
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
        />
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
              <a href={`mailto:${projectUser?.email}`}>{projectUser?.email}</a>
              <h2>Project Date:</h2>
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
              <a href={`mailto:${projectCompany?.email}`}>{projectCompany?.email}</a>
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
                  <h2>
                    {type.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
                    {categories[category][type].length > 1 && <span>s</span>}
                  </h2>
                  {categories[category][type].map((file) => (
                    <div key={file.fileName} className="category-files-container">
                      <a href={file.fileURL} download={file.fileName} target="_blank" rel="noreferrer">
                        <img src={file.fileTypeIcon} alt="file type" />
                      </a>
                      <div className="file-download">
                        <h2>
                          {file.fileName} {file.description ? <i> ( {file.description} )</i> : ''}
                        </h2>
                        <h2 className="uploaded">
                          Uploaded: {new Date(file.timestamp.seconds * 1000).toLocaleString()}
                        </h2>
                        <div className="buttons">
                          {isAdmin ? (
                            <>
                              <a
                                className="btn btn-outline btn-xs btn-success"
                                href={file.fileURL}
                                download={file.fileName}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download
                              </a>
                              <button
                                className="btn btn-outline btn-xs btn-error"
                                onClick={() => {
                                  openModal(file);
                                }}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <a
                              className="btn btn-outline btn-sm btn-success"
                              href={file.fileURL}
                              download={file.fileName}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download
                            </a>
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
