import { useState } from 'react';
import { FcSearch } from 'react-icons/fc';
import SpinnerSmall from '../layout/SpinnerSmall';

function CreateCompany() {
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [createCompanyForm, setCreateCompanyForm] = useState({
    vat: '',
    country: '',
    companyName: '',
    businessType: '',
    telephone: '',
    addressName: '',
    addressNumber: '',
    city: '',
    zipCode: '',
    email: '',
  });

  return (
    <div className="create-company">
      <h1 className="text-xl font-bold">{!isEditing ? 'Create New' : 'Modify Existing'} Company</h1>
      <form className="create-company-form">
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
          />
          {isFetching && <SpinnerSmall />}
        </div>
        <input type="text" required={true} placeholder="Company Name" className="input input-bordered input-ghost" />
        <input
          type="text"
          required={true}
          placeholder="Type of Business"
          className="input input-bordered input-ghost"
        />
        <input type="text" required={true} placeholder="Phone Number" className="input input-bordered input-ghost" />
        <div className="address-container">
          <input type="text" required={true} placeholder="Address Name" className="input input-bordered input-ghost" />
          <input
            type="text"
            required={true}
            placeholder="Address Number"
            className="input input-bordered input-ghost"
          />
        </div>
        <div className="address-container-2">
          <input type="text" required={true} placeholder="City" className="input input-bordered input-ghost" />
          <input type="text" required={true} placeholder="Postal Code" className="input input-bordered input-ghost" />
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
