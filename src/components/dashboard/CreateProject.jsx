import { useState, useEffect, useContext } from 'react';
import FirebaseContext from '../../context/auth/FirebaseContext';
import { getDocs, getDoc, addDoc, setDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
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
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        // Get Users
        const userSnap = await getDocs(collection(db, 'users'));
        const users = userSnap.docs.map((doc) => doc.data());
        setUsers(users);
        // Get Companies
        const companiesSnap = await getDocs(collection(db, 'companies'));
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

    getUsers();
  }, [isReset]);

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
      onReset();
      setIsReset(!isReset);
      toast.success('Project created!');
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
            selected={projectForm.userRef}
            onChange={(e) => {
              setProjectForm({ ...projectForm, userRef: e.target.value });
            }}
          >
            <option disabled selected>
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
            selected={projectForm.companyRef}
            onChange={(e) => {
              setProjectForm({
                ...projectForm,
                companyRef: e.target.value,
                companyName: companies.find((company) => company.vat === e.target.value).title,
              });
            }}
          >
            <option disabled selected>
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
