import { useState, useEffect, useContext } from 'react';
import FirebaseContext from '../../context/auth/FirebaseContext';
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.config';
import SpinnerSmall from '../layout/SpinnerSmall';
import { toast } from 'react-toastify';

function CreateCompany() {
  let emptyForm = {
    name: '',
    title: '',
    address: '',
    number: '',
    zip: '',
    city: '',
    businessType: [],
    email: '',
    country: '',
    phone: '',
  };
  const { setLoading } = useContext(FirebaseContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isServerConnecting, setIsServerConnecting] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [vat, setVat] = useState('');
  const [createCompanyForm, setCreateCompanyForm] = useState(emptyForm);

  // Fetch Vat from AADE
  useEffect(() => {
    const fetchVatFromGeotechServer = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`https://geotech-server.herokuapp.com/api/v1/getVat/${vat}`);
        if (response.status !== 200) {
          throw new Error('Something went wrong');
        }
        const data = await response.json();
        setCreateCompanyForm({
          ...createCompanyForm,
          name: data.name,
          title: data.title,
          address: data.address,
          number: data.number,
          zip: data.zip,
          city: data.city,
          businessType: data.businessType,
        });
      } catch (error) {
        toast.error('VAT number is not valid');
        setCreateCompanyForm(emptyForm);
      }

      setIsFetching(false);
    };

    const fetchVatFromFirebase = async () => {
      setIsFetching(true);
      try {
        const response = await getDoc(doc(db, 'companies', vat));
        if (response.exists()) {
          setCreateCompanyForm({
            name: response.data().name,
            title: response.data().title,
            address: response.data().address,
            number: response.data().number,
            zip: response.data().zip,
            city: response.data().city,
            businessType: response.data().businessType,
            phone: response.data().phone,
            email: response.data().email,
            country: response.data().country,
          });
        } else {
          throw new Error('Something went wrong');
        }
      } catch (error) {
        toast.error('VAT number is not valid');
        setCreateCompanyForm(emptyForm);
      }

      setIsFetching(false);
    };

    if (!isEditing && vat.length === 9) {
      fetchVatFromGeotechServer();
    } else if (isEditing && vat.length === 9) {
      fetchVatFromFirebase();
    }
  }, [vat]); // eslint-disable-line

  // Wake up server
  useEffect(() => {
    const getGeotechServerStatus = async () => {
      setIsServerConnecting(true);
      try {
        const response = await fetch('https://geotech-server.herokuapp.com/api/v1/status');
        const data = await response.json();
        if (data.status) {
          setIsServerConnected(true);
        } else {
          setIsServerConnected(false);
        }
        setIsServerConnecting(false);
      } catch (error) {
        setIsServerConnecting(false);
      }
    };

    getGeotechServerStatus();
  }, []);

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const dataCopy = {
        vat,
        ...createCompanyForm,
        timestamp: serverTimestamp(),
      };

      // Check if Doc Exists
      const docRef = doc(db, 'companies', vat);
      const docSnap = await getDoc(docRef);

      // Create new doc
      if (!isEditing) {
        if (docSnap.exists()) {
          toast.error('Company already exists');
        } else {
          await setDoc(doc(db, 'companies', vat), dataCopy);
          onReset();
          toast.success('Company created');
        }
      } else {
        // Update if exists
        if (docSnap.exists()) {
          await setDoc(docRef, dataCopy);
          onReset();
          toast.success('Company updated');
        } else {
          toast.error('Company does not exist');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    }

    setLoading(false);
  };

  const onReset = () => {
    setVat('');
    setCreateCompanyForm(emptyForm);
  };

  return (
    <div className="create-company">
      <div className="server-status">
        <p style={{ marginRight: 10 }}>Server Status: </p>
        {isServerConnecting && <SpinnerSmall />}
        {isServerConnected && (
          <img src={require('../../assets/icons/connected.png')} alt="green check" style={{ width: 20, height: 20 }} />
        )}
      </div>
      <h1 className="text-xl font-bold">{!isEditing ? 'Create New' : 'Modify Existing'} Company</h1>
      <form className="create-company-form" onReset={onReset} onSubmit={onSubmit}>
        <div className="checkbox-container">
          <label htmlFor="editCheckbox" className="label-text">
            Edit Mode
          </label>
          <input
            type="checkbox"
            className="toggle "
            id="editCheckbox"
            onChange={(e) => setIsEditing(e.target.checked)}
          />
        </div>
        <div className="vat-container">
          <input
            type="text"
            minLength="9"
            maxLength="9"
            required={true}
            placeholder="V.A.T."
            className="input input-bordered input-ghost"
            value={vat}
            onChange={(e) => setVat(e.target.value)}
          />
          {isFetching && <SpinnerSmall />}
        </div>
        <input
          type="text"
          required={true}
          placeholder="Company Title"
          className="input input-bordered input-ghost"
          value={createCompanyForm.title}
          onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, title: e.target.value })}
        />
        <input
          type="text"
          required={true}
          placeholder="Company Name"
          className="input input-bordered input-ghost"
          value={createCompanyForm.name}
          onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, name: e.target.value })}
        />
        <input
          type="text"
          required={true}
          placeholder="Type of Business"
          className="input input-bordered input-ghost"
          value={createCompanyForm.businessType}
          onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, businessType: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="input input-bordered input-ghost"
          value={createCompanyForm.phone}
          onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, phone: e.target.value })}
        />
        <div className="address-container">
          <input
            type="text"
            required={true}
            placeholder="Address Name"
            className="input input-bordered input-ghost"
            value={createCompanyForm.address}
            onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, address: e.target.value })}
          />
          <input
            type="text"
            required={true}
            placeholder="Address Number"
            className="input input-bordered input-ghost"
            value={createCompanyForm.number}
            onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, number: e.target.value })}
          />
        </div>
        <div className="address-container-2">
          <input
            type="text"
            required={true}
            placeholder="City"
            className="input input-bordered input-ghost"
            value={createCompanyForm.city}
            onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, city: e.target.value })}
          />
          <input
            type="text"
            required={true}
            placeholder="Postal Code"
            className="input input-bordered input-ghost"
            value={createCompanyForm.zip}
            onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, zip: e.target.value })}
          />
        </div>
        <input
          type="text"
          required={true}
          placeholder="Country"
          className="input input-bordered input-ghost"
          value={createCompanyForm.country}
          onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, country: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered input-ghost"
          value={createCompanyForm.email}
          onChange={(e) => setCreateCompanyForm({ ...createCompanyForm, email: e.target.value })}
        />
        {!isEditing ? (
          <input type="submit" value="Create Company" className="btn btn-outline btn-success" />
        ) : (
          <input type="submit" value="Update Company" className="btn btn-outline btn-warning" />
        )}
        <input type="reset" value="Clear Form" className="btn btn-outline btn-error" />
      </form>
    </div>
  );
}
export default CreateCompany;
