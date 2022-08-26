import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  getAuth,
  updateEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import FirebaseContext from '../context/auth/FirebaseContext';
import Avatar from 'react-avatar';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

function Profile() {
  const { loggedIn, user, setUpdateProfileRequest, setLoading } = useContext(FirebaseContext);
  const [editingElement, setEditingElement] = useState(null);
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstname(user.firstname);
      setLastname(user.lastname);
    }
  }, []);

  const onEdit = async (e) => {
    const inputName = e.target.parentNode.querySelector('input').id;
    const inputValue = e.target.parentNode.querySelector('input').value;
    if (editingElement !== inputName) {
      setEditingElement(inputName);
    } else if (editingElement === inputName) {
      // Update Firebase with new values
      setLoading(true);
      const auth = getAuth();
      try {
        // Update Firestore
        const updateValue = {
          [inputName]: inputValue,
        };
        await updateDoc(doc(db, 'users', user.uid), updateValue);
        // Update Firebase Auth
        if (inputName === 'email') {
          const userPassword = prompt('Enter your password');
          if (!userPassword) {
            setLoading(false);
            return;
          }
          const credential = EmailAuthProvider.credential(user.email, userPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          await updateEmail(auth.currentUser, inputValue);
          toast.success(`${inputName.charAt(0).toUpperCase() + inputName.slice(1)} updated`);
        } else if (inputName === 'firstname' || inputName === 'lastname') {
          await updateProfile(auth.currentUser, {
            displayName: firstname + ' ' + lastname,
          });
          toast.success(`${inputName.charAt(0).toUpperCase() + inputName.slice(1)} updated`);
        }
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
      setUpdateProfileRequest(true);
      setEditingElement(null);
    }
  };

  const onNewPassword = async (e) => {
    setLoading(true);
    if (password === confirmPassword) {
      try {
        const auth = getAuth();
        const oldPassword = prompt('Enter your OLD password');
        if (!oldPassword) {
          setLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, password);
        setPassword('');
        setConfirmPassword('');
        auth.signOut();
        toast.success('Password updated');
      } catch (error) {
        toast.error(error.message);
      }
      setUpdateProfileRequest(true);
    } else {
      toast.error('Passwords do not match');
    }
    setLoading(false);
  };

  // Store Image to Firebase Storage | PROMISE
  const storeImage = async (image) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileName = `${uuidv4()}-${image.name}`;
      const storageRef = ref(storage, 'avatars/' + fileName);
      const uploadTask = uploadBytesResumable(storageRef, image);
      const toastId = toast.loading(`Uploading ${image.name}...`);

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

  const onAvatarChange = async (e) => {
    if (e.target.files.length > 0) {
      setLoading(true);
      try {
        // Upload New Image
        const file = e.target.files[0];
        const imgUrl = await storeImage(file);

        // Delete old avatar
        if (user.profileImage) {
          const storage = getStorage();
          let avatarRef = ref(storage, user.profileImage);
          await deleteObject(avatarRef);
        }

        // Update Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          profileImage: imgUrl,
        });

        setUpdateProfileRequest(true);
        toast.success('Avatar updated');
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    }
  };

  if (!loggedIn || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="profile-section">
      <h1>Profile</h1>
      <p>Hello, {user.firstname}!</p>
      <div className="profile-container">
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

          <>
            <label htmlFor="user-image-upload" className="custom-user-image-upload btn btn-outline btn-sm btn-accent">
              Update Avatar
            </label>
            <input
              id="user-image-upload"
              type="file"
              accept="image/*"
              files={[user.profileImage]}
              onChange={onAvatarChange}
            />
          </>
        </div>

        {/* FORM CONTAINER */}
        <form className="form-container">
          <label htmlFor="email">Email:</label>
          <div className="form-group">
            <input
              id="email"
              required={true}
              autoComplete="off"
              type="email"
              placeholder="Email"
              className="input input-bordered input-ghost"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={editingElement === 'email' ? false : true}
            />
            {editingElement === 'email' ? (
              <div className="badge badge-md badge-info badge-outline" onClick={onEdit}>
                Save
              </div>
            ) : (
              <div className="badge badge-md badge-ghost" onClick={onEdit}>
                Change
              </div>
            )}
          </div>

          <label htmlFor="firstname">First Name:</label>
          <div className="form-group">
            <input
              id="firstname"
              required={true}
              type="text"
              placeholder="First Name"
              className="input input-bordered input-ghost"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              disabled={editingElement === 'firstname' ? false : true}
            />

            {editingElement === 'firstname' ? (
              <div className="badge badge-md badge-info badge-outline" onClick={onEdit}>
                Save
              </div>
            ) : (
              <div className="badge badge-md badge-ghost" onClick={onEdit}>
                Change
              </div>
            )}
          </div>

          <label htmlFor="lastname">Last Name:</label>
          <div className="form-group">
            <input
              id="lastname"
              required={true}
              type="text"
              placeholder="Last Name"
              className="input input-bordered input-ghost"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              disabled={editingElement === 'lastname' ? false : true}
            />

            {editingElement === 'lastname' ? (
              <div className="badge badge-md badge-info badge-outline" onClick={onEdit}>
                Save
              </div>
            ) : (
              <div className="badge badge-md badge-ghost" onClick={onEdit}>
                Change
              </div>
            )}
          </div>

          <label htmlFor="password">New Password:</label>
          <div className="form-group">
            <input
              id="password"
              required={true}
              type="password"
              placeholder="Password"
              className="input input-bordered input-ghost"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {password.length > 0 && (
            <>
              <label htmlFor="confirm-password">Confirm Password:</label>
              <div className="form-group">
                <input
                  id="confirm-password"
                  required={true}
                  type="password"
                  placeholder="Confirm Password"
                  className="input input-bordered input-ghost"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {password.length > 0 && confirmPassword.length > 0 && (
            <div className="form-group mt-4">
              <input
                className="btn btn-success btn-outline"
                type="button"
                value="Update Password"
                onClick={onNewPassword}
              />
            </div>
          )}
        </form>
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
