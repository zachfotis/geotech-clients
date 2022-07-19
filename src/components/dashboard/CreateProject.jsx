import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FirebaseContext from '../../context/auth/FirebaseContext';
import { getDocs, getDoc, addDoc, setDoc, doc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { toast } from 'react-toastify';

function CreateProject() {
  const { setLoading } = useContext(FirebaseContext);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    companyRef: '',
    userRef: '',
    companyName: '',
  });

  const navigate = useNavigate();

  const getUsers = async () => {
    setLoading(true);
    try {
      // Get Users
      let q = query(collection(db, 'users'), orderBy('lastname', 'asc'));
      const userSnap = await getDocs(q);
      const users = userSnap.docs.map((doc) => doc.data());
      setUsers(users);
      // Get Companies
      q = query(collection(db, 'companies'), orderBy('title', 'asc'));
      const companiesSnap = await getDocs(q);
      const companies = companiesSnap.docs.map((doc) => doc.data());
      setCompanies(companies);
      // Get Current Project ID
      const projectIDSnap = await getDoc(doc(db, 'utilities', 'current-project-id'));
      const projectID = projectIDSnap.data().id + 1;
      setProjectForm({ ...projectForm, id: projectID });
    } catch (error) {
      console.log(error);
      toast.error('Error fetching users');
    }
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!projectForm.title.length > 0 || !projectForm.companyRef.length > 0 || !projectForm.userRef.length > 0) {
      toast.error('Please fill out all fields');
      return;
    }

    setLoading(true);
    try {
      const projectFormCopy = {
        ...projectForm,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'projects'), projectFormCopy);
      // Increment Current Project ID
      await setDoc(doc(db, 'utilities', 'current-project-id'), { id: projectFormCopy.id });
      toast.success('Project created!');
      navigate('/projects');
    } catch (error) {
      console.log(error);
      toast.error('Error creating project');
    }
    setLoading(false);
  };

  const onReset = () => {
    setProjectForm({
      id: '',
      title: '',
      companyRef: '',
      userRef: '',
      companyName: '',
    });
  };

  return (
    <div className="create-project">
      <h1 className="text-xl font-bold">Create Project</h1>
      <form className="create-project-form" onSubmit={onSubmit} onReset={onReset}>
        {/* Select user */}
        <div className="select-user">
          <label className="label" htmlFor="user-select">
            <span className="label-text">Select User</span>
          </label>
          <select
            className="select select-bordered select-sm"
            id="user-select"
            defaultValue={'default'}
            onChange={(e) => {
              setProjectForm({ ...projectForm, userRef: e.target.value });
            }}
          >
            <option disabled value="default">
              Select User
            </option>

            {users.map((user) => (
              <option key={user.userRef} value={user.userRef}>
                {user.lastname} {user.firstname}
              </option>
            ))}
          </select>
        </div>
        {/* Select Company */}
        <div className="select-company">
          <label className="label" htmlFor="company-select">
            <span className="label-text">Select Company</span>
          </label>
          <select
            className="select select-bordered select-sm"
            id="company-select"
            defaultValue={'default'}
            onChange={(e) => {
              setProjectForm({
                ...projectForm,
                companyRef: e.target.value,
                companyName: companies.find((company) => company.vat === e.target.value).title,
              });
            }}
          >
            <option disabled value="default">
              Select Company
            </option>

            {companies.map((company) => (
              <option key={company.vat} value={company.vat}>
                {company.title}
              </option>
            ))}
          </select>
        </div>
        <div className="project-id">
          <label className="label" htmlFor="project-id">
            <span className="label-text">Project Id</span>
          </label>
          <input
            type="text"
            required={true}
            placeholder="Project Id"
            id="project-id"
            disabled={true}
            className="input input-bordered input-ghost"
            value={projectForm.id}
            onChange={(e) => setProjectForm({ ...projectForm, id: e.target.value })}
          />
        </div>
        <div className="project-title">
          <label className="label" htmlFor="project-title">
            <span className="label-text">Project Title</span>
          </label>
          <input
            type="text"
            required={true}
            placeholder="Project Title"
            id="project-title"
            className="input input-bordered input-ghost"
            value={projectForm.title}
            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
          />
        </div>
        <input type="submit" className="btn btn-outline btn-success mt-8" value="Create Project" />
        <input type="reset" value="Clear Form" className="btn btn-outline btn-error" />
      </form>
    </div>
  );
}
export default CreateProject;
