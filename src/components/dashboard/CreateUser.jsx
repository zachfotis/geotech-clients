import { useState, useContext } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  setDoc,
  doc,
  getDocs,
  query,
  collection,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import FirebaseContext, { FirebaseProvider } from '../../context/auth/FirebaseContext';
import { db, secondaryApp } from '../../firebase.config';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import Avatar from 'react-avatar';

function CreateUser() {
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    accountType: 'user',
    profileImage: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchFormData, setSearchFormData] = useState({
    query: '',
    fetchedUsers: [],
    isLoading: false,
  });

  const onCreate = async (e) => {
    setLoading(true);
    e.preventDefault();

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

    try {
      // Store image in firebase and get url
      let imgUrl = '';
      if (formData.profileImage !== '') {
        imgUrl = await storeImage(formData.profileImage);
      }

      // Create user in firebase
      const auth = getAuth(secondaryApp);

      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      updateProfile(auth.currentUser, {
        displayName: formData.firstname + ' ' + formData.lastname,
      });

      const newUser = userCredentials.user;

      const userDataCopy = {
        ...formData,
        profileImage: imgUrl,
        userRef: newUser.uid,
        timestamp: serverTimestamp(),
      };
      delete userDataCopy.password;

      await setDoc(doc(db, 'users', newUser.uid), userDataCopy);
      toast.success('Account created successfully');
      auth.signOut();
      // clear state
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        accountType: 'user',
        profileImage: '',
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Could not create user!');
      setLoading(false);
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();

    setSearchFormData({ ...searchFormData, isLoading: true });

    try {
      // TODO: FirebaseError: Missing or insufficient permissions.
      const q = query(collection(db, 'users'), where('firstname', '==', searchFormData.query));
      const querySnapshot = await getDocs(q);
      const Users = querySnapshot.docs.map((doc) => doc.data());
      setSearchFormData({
        ...searchFormData,
        fetchedUsers: Users,
        isLoading: false,
      });
    } catch (error) {
      console.log(error);
      toast.error('Error fetching Users');
    }
  };

  const onReset = () => {
    setSearchFormData({
      query: '',
      fetchedUsers: [],
      isLoading: false,
    });
  };

  return (
    <div className="create-user">
      <form className="create-user-form" onSubmit={onCreate}>
        <div className="left-container">
          {formData.accountType === 'admin' && (
            <div className="badge badge-secondary badge-outline badge-lg">Admin</div>
          )}
          {formData.profileImage === '' ? (
            <Avatar
              color={stringToColour(`${formData.firstname} ${formData.lastname}`)}
              fgColor={invertColor(
                stringToColour(`${formData.firstname} ${formData.lastname}`),
                true
              )}
              name={`${formData.firstname} ${formData.lastname}`}
              size="80"
              textSizeRatio={2.5}
              round="true"
              className="rounded-xl"
            />
          ) : (
            <img src={require('../../assets/images/ready.png')} alt="avatar" />
          )}

          <label
            htmlFor="user-image-upload"
            className="custom-user-image-upload btn btn-outline btn-sm btn-accent"
          >
            Upload Image
          </label>
          <input
            id="user-image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, profileImage: e.target.files[0] })}
          />
        </div>
        <div className="right-container">
          <div className="fullname">
            <input
              type="text"
              placeholder="First Name"
              className="input input-bordered"
              value={formData.firstname}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  firstname: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input input-bordered"
              value={formData.lastname}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lastname: e.target.value,
                  password:
                    e.target.value !== ''
                      ? (e.target.value + new Date().getFullYear()).toLowerCase()
                      : '',
                })
              }
            />
          </div>
          <input
            autoComplete="off"
            type="email"
            placeholder="Email"
            className="input input-bordered "
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Password"
            className="input input-bordered"
            disabled={true}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="is-admin">
            <input
              type="checkbox"
              defaultChecked={false}
              className="checkbox checkbox-sm checkbox-accent"
              id="accountType"
              value={formData.accountType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  accountType: e.currentTarget.checked ? 'admin' : 'user',
                })
              }
            />
            <label htmlFor="accountType" className="label cursor-pointer">
              Administrator
            </label>
          </div>

          <input type="submit" value="Create User" className="btn btn-ghost btn-outline mt-5" />
        </div>
      </form>
      {/* EDIT FORM */}
      <form className="edit-user-form" onSubmit={onSearch} onReset={onReset}>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search only for editing a user"
            className="input input-bordered"
            value={searchFormData.query}
            onChange={(e) =>
              setSearchFormData({
                ...searchFormData,
                query: e.target.value,
              })
            }
          />
          <input type="submit" value="Search" className="btn btn-accent btn-outline" />
          <input type="reset" value="Reset" className="btn btn-error btn-outline" />
        </div>
        <div className="user-results-container">
          <div className="grid-headers contents text-sm uppercase font-semibold text-center">
            <h1 className="rounded-tl-xl">Avatar</h1>
            <h1>Name</h1>
            <h1>Email</h1>
            <h1>Type</h1>
            <h1 className="rounded-tr-xl">Actions</h1>
          </div>
          <div className="grid-content contents">
            <h1>Image</h1>
            <h1>Full Name</h1>
            <h1>Email</h1>
            <h1>Account Type</h1>
            <div className="buttons">
              {!isEditing ? (
                <button type="button" className="btn btn-xs btn-accent btn-outline">
                  Edit
                </button>
              ) : (
                <button type="button" className="btn btn-xs btn-warning btn-outline">
                  Cancel
                </button>
              )}
              <button type="button" className="btn btn-xs btn-error btn-outline">
                Delete
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
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
    // https://stackoverflow.com/a/3943023/112731
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

export default CreateUser;
