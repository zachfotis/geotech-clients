import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SpinnerSmall from '../layout/SpinnerSmall';

function CreateCompany() {
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [vat, setVat] = useState('');
  const [createCompanyForm, setCreateCompanyForm] = useState({
    doy: '',
    name: '',
    title: '',
    legal: '',
    address: '',
    number: '',
    zip: '',
    city: '',
    registration: '',
    businessType: [],
  });

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
          ...data,
        });
      } catch (error) {
        toast.error('VAT number is not valid');
        setCreateCompanyForm({
          doy: '',
          name: '',
          title: '',
          legal: '',
          address: '',
          number: '',
          zip: '',
          city: '',
          registration: '',
          businessType: [],
        });
      }

      setIsFetching(false);
    };

    if (!isEditing && vat.length === 9) {
      fetchVatFromGeotechServer();
    }
  }, [vat]);

  const onReset = () => {
    setVat('');
    setCreateCompanyForm({
      doy: '',
      name: '',
      title: '',
      legal: '',
      address: '',
      number: '',
      zip: '',
      city: '',
      registration: '',
      businessType: [],
    });
  };

  return (
    <div className="create-company">
      <h1 className="text-xl font-bold">{!isEditing ? 'Create New' : 'Modify Existing'} Company</h1>
      <form className="create-company-form" onReset={onReset}>
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
        <input type="text" required={true} placeholder="Phone Number" className="input input-bordered input-ghost" />
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
        <input type="text" required={true} placeholder="Country" className="input input-bordered input-ghost" />
        <input type="email" required={true} placeholder="Email" className="input input-bordered input-ghost" />
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
