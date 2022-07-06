import { useState, useEffect, useContext } from 'react';
import {
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  doc,
  collection,
  where,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase.config';
import FirebaseContext from '../../context/auth/FirebaseContext';
import { toast } from 'react-toastify';

function UploadFile() {
  const { setLoading } = useContext(FirebaseContext);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFile, setSelectedFile] = useState({
    file: null,
    name: '',
    type: '',
    imgSource: '',
  });
  const [description, setDescription] = useState('');

  const servicesTypes = [
    'quotation',
    'purchase order',
    'private agreement',
    'evaluation form',
    'technical report',
    'log',
    'delivery note',
    'invoice',
    'other',
  ];

  const salesTypes = ['quotation', 'purchase order', 'invoice', 'other'];

  // Get Companies
  useEffect(() => {
    const getCompanies = async () => {
      setLoading(true);

      try {
        // Get Companies
        let q = query(collection(db, 'companies'), orderBy('title', 'asc'));
        const companiesSnap = await getDocs(q);
        const companies = companiesSnap.docs.map((doc) => doc.data());
        setCompanies(companies);
      } catch (error) {
        toast.error('Error fetching companies');
      }

      setLoading(false);
    };

    getCompanies();
  }, []);

  // Get Projects
  useEffect(() => {
    const getProjects = async () => {
      if (!selectedCompany) {
        return;
      }
      setLoading(true);

      try {
        // Get Projects for selected company
        let q = query(collection(db, 'projects'), where('companyRef', '==', selectedCompany), orderBy('title', 'asc'));
        const projectsSnap = await getDocs(q);
        const projects = projectsSnap.docs.map((doc) => doc.data());
        setProjects(projects);
      } catch (error) {
        toast.error('Error fetching projects');
      }

      setLoading(false);
    };

    getProjects();
  }, [selectedCompany]);

  // Store File to Firebase Storage -- PROMISE
  const storeFile = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileName = file.name
        .split(' ')
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      const storageRef = ref(storage, `${selectedCategory}/${selectedType}/` + fileName);
      const uploadTask = uploadBytesResumable(storageRef, file.file);
      const toastId = toast.loading(`Uploading ${file.name}...`);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress < 100) {
            toast.update(toastId, {
              progress: parseInt(Math.ceil(progress).toFixed(0)) / 100,
              type: 'info',
            });
          }
        },

        (error) => {
          toast.update(toastId, { render: 'Upload failed!', type: 'error', isLoading: false });
          reject(error);
        },

        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            toast.update(toastId, {
              render: 'Uploaded successfully!',
              type: 'success',
              isLoading: false,
            });
            toast.dismiss(toastId);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !selectedProject || !selectedCategory || !selectedType || !selectedFile.file) {
      toast.error('Please fill out all fields');
      return;
    }

    setLoading(true);
    try {
      //  Upload file to Firebase Storage
      const downloadURL = await storeFile(selectedFile);

      // Upload to firestore
      const dataCopy = {
        projectRef: selectedProject,
        userRef: projects.filter((project) => project.companyRef === selectedCompany)[0].userRef,
        category: selectedCategory,
        type: selectedType,
        description: description,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileURL: downloadURL,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'files'), dataCopy);

      // Clear file input
      setSelectedFile({
        file: null,
        name: '',
        type: '',
        imgSource: '',
      });

      toast.success('File uploaded successfully');
    } catch (error) {
      console.log(error);
      toast.error('Error uploading file');
    }

    setLoading(false);
  };

  const onReset = () => {
    setSelectedCompany('');
    setSelectedProject('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedFile({
      file: null,
      name: '',
      type: '',
      imgSource: '',
    });
  };

  return (
    <div className="upload-file">
      <h1 className="text-xl font-bold">Add File to Project</h1>
      <form className="upload-file-form" onSubmit={onSubmit} onReset={onReset}>
        <div className="container-1">
          {/* Select company */}
          <div className="select-company">
            <label className="label" htmlFor="company-select">
              <span className="label-text">Select Company</span>
            </label>
            <select
              className="select select-bordered select-sm"
              id="company-select"
              defaultValue={'default'}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
              }}
            >
              <option disabled value="default">
                Company
              </option>
              {companies.map((company) => (
                <option key={company.vat} value={company.vat}>
                  {company.title}
                </option>
              ))}
            </select>
          </div>
          {/* Select project */}
          <div className="select-project">
            <label className="label" htmlFor="project-select">
              <span className="label-text">Select Project</span>
            </label>
            <select
              className="select select-bordered select-sm"
              id="project-select"
              defaultValue={'default'}
              onChange={(e) => {
                setSelectedProject(e.target.value);
              }}
            >
              <option disabled value="default">
                Project
              </option>
              {projects.length > 0 &&
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="container-2">
          {/* Select Category */}
          <div className="select-category">
            <label className="label" htmlFor="category-select">
              <span className="label-text">Select Category</span>
            </label>
            <select
              className="select select-bordered select-sm"
              id="category-select"
              defaultValue={'default'}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
            >
              <option disabled value="default">
                Category
              </option>
              <option value="services">Services</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          {/* Select Type */}
          <div className="select-type">
            <label className="label" htmlFor="type-select">
              <span className="label-text">Select Type</span>
            </label>
            <select
              className="select select-bordered select-sm"
              id="type-select"
              defaultValue={'default'}
              onChange={(e) => {
                setSelectedType(e.target.value);
              }}
            >
              <option disabled value="default">
                Type
              </option>
              {selectedCategory === 'services' &&
                servicesTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              {selectedCategory === 'sales' &&
                salesTypes.map((type) => (
                  <option key={type} value={type}>
                    {/* Capital each initial */}
                    {type.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="container-3">
          <label htmlFor="user-file-upload" className="btn btn-outline btn-sm btn-ghost">
            Select File
          </label>
          <input
            style={{ display: 'none' }}
            id="user-file-upload"
            type="file"
            accept=".doc, .docx, .pdf, .xls, .xlsx, .ppt, .pptx, .txt, .rtf, .jpg, .jpeg, .png, .gif, .zip, .rar"
            files={[selectedFile.file]}
            onChange={(e) => {
              if (e.target.files.length <= 0) {
                return;
              }
              const splitLength = e.target.files[0].name.split('.').length;
              const ext = e.target.files[0].name.split('.')[splitLength - 1];
              let imgSource = null;
              try {
                imgSource = require(`../../assets/file-types/${ext}.png`);
              } catch (error) {
                imgSource = require('../../assets/file-types/unknown.png');
              }

              setSelectedFile({
                ...selectedFile,
                file: e.target.files[0],
                name: e.target.files[0].name,
                type: ext,
                imgSource,
              });
            }}
          />
          {selectedFile.file && (
            <>
              <img src={selectedFile.imgSource} alt="file type" className="h-8" />
              <p>{selectedFile.file ? selectedFile.name : 'Please select a file'}</p>
            </>
          )}
        </div>
        <div className="container-4">
          <label className="label" htmlFor="description-text">
            <span className="label-text">Add Description (Optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered"
            id="description-text"
            placeholder="Add description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </div>
        <div className="container-5">
          <input type="submit" className="btn btn-outline btn-success" value="Upload File" />
          <input type="reset" value="Clear Form" className="btn btn-outline btn-error" />
        </div>
      </form>
    </div>
  );
}
export default UploadFile;
