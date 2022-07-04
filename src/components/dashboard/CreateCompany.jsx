import { useState, useEffect } from 'react';
import SpinnerSmall from '../layout/SpinnerSmall';

function CreateCompany() {
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [vat, setVat] = useState('');
  const [createCompanyForm, setCreateCompanyForm] = useState({
    country: '',
    companyName: '',
    firstname: '',
    lastname: '',
    businessType: '',
    telephone: '',
    addressName: '',
    addressNumber: '',
    city: '',
    zipCode: '',
    email: '',
  });

  useEffect(() => {
    const fetchVat = async () => {
      setIsFetching(true);

      const body = `<env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:ns2="http://rgwspublic2/RgWsPublic2Service" xmlns:ns3="http://rgwspublic2/RgWsPublic2">
      <env:Header>
          <ns1:Security>
              <ns1:UsernameToken>
                  <ns1:Username>GEOTECH-09</ns1:Username>
                  <ns1:Password>geotech!09</ns1:Password>
              </ns1:UsernameToken>
          </ns1:Security>
      </env:Header>
      <env:Body>
          <ns2:rgWsPublic2AfmMethod>
              <ns2:INPUT_REC>
                  <ns3:afm_called_by/>
                  <ns3:afm_called_for>081827757</ns3:afm_called_for>
              </ns2:INPUT_REC>
          </ns2:rgWsPublic2AfmMethod>
      </env:Body>
      </env:Envelope>`;

      const url = 'https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml;charset=utf-8',
          'Content-Length': body.length,
        },
        body,
      });

      const data = await response.text();
      const xml = new DOMParser().parseFromString(data, 'text/xml');
      console.log(xml);
      setIsFetching(false);
    };

    if (vat.length === 9) {
      fetchVat();
    }
  }, [vat]);

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
            value={vat}
            onChange={(e) => setVat(e.target.value)}
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
