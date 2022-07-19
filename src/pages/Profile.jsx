import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';
import Avatar from 'react-avatar';

function Profile() {
  const { loggedIn, user } = useContext(FirebaseContext);
  const [isEditing, setIsEditing] = useState(false);

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="profile-section">
      <h1>Profile</h1>
      <p>Hello, {user.firstname}!</p>
      <div className="profile-container">
        <div className="top-container">
          <div className="checkbox-container">
            <label htmlFor="editCheckbox" className="label-text">
              Edit Mode
            </label>
            <input
              type="checkbox"
              className="toggle"
              id="editCheckbox"
              onChange={(e) => {
                setIsEditing(e.target.checked);
                if (!e.target.checked) {
                  setIsEditing(false);
                }
              }}
            />
          </div>
        </div>
        <div className="bottom-container">
          {/* AVATAR CONTAINER */}
          <div className="avatar-container">
            {/* ADMIN BADGE */}
            {user.accountType === 'admin' && <div className="badge badge-secondary badge-outline badge-lg">Admin</div>}
            {/* AVATAR */}
            {user.profileImage === '' ? (
              <Avatar
                color={stringToColour(`${user.firstname} ${user.lastname}`)}
                fgColor={invertColor(stringToColour(`${user.firstname} ${user.lastname}`), true)}
                name={`${user.firstname} ${user.lastname}`}
                size="140"
                textSizeRatio={2.5}
                round="true"
                className="rounded-xl"
              />
            ) : (
              <img
                src={typeof user.profileImage === 'string' ? user.profileImage : URL.createObjectURL(user.profileImage)}
                alt="avatar"
                className="rounded-xl"
              />
            )}
            {/* UPLOAD AVATAR */}
            {isEditing && (
              <>
                <label
                  htmlFor="user-image-upload"
                  className="custom-user-image-upload btn btn-outline btn-sm btn-accent"
                >
                  Upload Image
                </label>
                <input id="user-image-upload" type="file" accept="image/*" files={[user.profileImage]} />
              </>
            )}
          </div>

          {/* FORM CONTAINER */}
          <form className="form-container">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              required={true}
              autoComplete="off"
              type="email"
              placeholder="Email"
              className="input input-bordered input-ghost"
              disabled={!isEditing}
              value={user.email}
            />
            <label htmlFor="firstname">First Name:</label>
            <input
              id="firstname"
              required={true}
              type="text"
              placeholder="First Name"
              className="input input-bordered input-ghost"
              value={user.firstname}
              disabled={!isEditing}
            />
            <label htmlFor="lastname">Last Name:</label>
            <input
              id="lastname"
              required={true}
              type="text"
              placeholder="Last Name"
              className="input input-bordered input-ghost"
              value={user.lastname}
              disabled={!isEditing}
            />
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              required={true}
              type="text"
              placeholder="Password"
              className="input input-bordered input-ghost"
              disabled={!isEditing}
              value={user.password}
            />
            {isEditing && <input type="submit" value="Update Profile" className="btn btn-success btn-outline mt-5" />}
          </form>
        </div>
      </div>
    </section>
  );
}

const stringToColour = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
};

function invertColor(hex, bw) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}

export default Profile;
