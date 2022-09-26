import { useState, useContext, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc, getDocs, collection, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import FirebaseContext from '../../context/auth/FirebaseContext';
import { db, secondaryApp } from '../../firebase.config';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import Avatar from 'react-avatar';

function CreateUser() {
  const { setLoading, isSuperAdmin } = useContext(FirebaseContext);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    accountType: 'user',
    profileImage: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState({});
  const [searchFormData, setSearchFormData] = useState({
    query: '',
    fetchedUsers: [],
    matchingUsers: [],
  });
  const [notifyUser, setNotifyUser] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  // Notify User
  useEffect(() => {
    if (!notifyUser || !formData?.email) {
      setTargetEmail('');
      return;
    }

    setTargetEmail(formData.email);
  }, [notifyUser, formData]);

  // Send Email Fetch Function
  const sendEmail = async (type) => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: targetEmail,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType,
          emailType: type,
        }),
      };

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/v1/sendEmail`, options);
      const data = await response.json();

      if (data?.info?.messageId) {
        toast.success('Email sent successfully');
      } else {
        toast.error('Error sending email');
      }
    } catch (error) {
      toast.error('Error sending email');
    }
  };

  // Store Image to Firebase Storage -- PROMISE
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

  // Create new User
  const onCreate = async (e) => {
    e.preventDefault();

    if (notifyUser && !targetEmail) {
      toast.error('You cannot notify a non-connected user');
      return;
    }

    setLoading(true);

    try {
      // Store image in firebase and get url
      let imgUrl = '';
      if (formData.profileImage !== '') {
        imgUrl = await storeImage(formData.profileImage);
      }

      // Create user in firebase
      const auth = getAuth(secondaryApp);

      const userCredentials = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      updateProfile(auth.currentUser, {
        displayName: formData.firstname + ' ' + formData.lastname,
      });

      const newUser = userCredentials.user;

      // sendPasswordResetEmail(auth, newUser.email);

      const userDataCopy = {
        ...formData,
        profileImage: imgUrl,
        userRef: newUser.uid,
        timestamp: serverTimestamp(),
      };
      delete userDataCopy.password;

      await setDoc(doc(db, 'users', newUser.uid), userDataCopy);

      // Send Email
      if (notifyUser && targetEmail) {
        sendEmail('create-user');
      }

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

    onSearch();
  };

  // Edit and Update User
  const onUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userRef = doc(db, 'users', editingUser.userRef);
    const userData = {
      firstname: editingUser.firstname,
      lastname: editingUser.lastname,
      accountType: editingUser.accountType,
      profileImage: editingUser.profileImage,
    };
    try {
      // Update Image in Firebase Storage
      if (typeof editingUser.profileImage !== 'string') {
        const imgUrl = await storeImage(editingUser.profileImage);
        userData.profileImage = imgUrl;

        // Delete Old Image
        if (editingUser.oldProfileImage !== '') {
          const storage = getStorage();
          const avatarRef = ref(storage, editingUser.oldProfileImage);
          await deleteObject(avatarRef);
        }
      }

      // Update User in Firestore
      await updateDoc(userRef, userData);

      // Update User email in Firebase Auth

      setIsEditing(false);
      setEditingUser({});
      toast.success('User updated successfully');
    } catch (error) {
      console.log(error);
      toast.error('Error updating user');
    }
    setLoading(false);
    onSearch();
  };

  // Search for User
  const onSearch = async (e) => {
    e && e.preventDefault();

    setSearchFormData({ ...searchFormData, isLoading: true });

    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const Users = querySnapshot.docs.map((doc) => doc.data());
      const matchingUsers = Users.filter((user) => {
        return (
          user.firstname.toLowerCase().includes(searchFormData.query.toLowerCase()) ||
          user.lastname.toLowerCase().includes(searchFormData.query.toLowerCase()) ||
          user.email.toLowerCase().includes(searchFormData.query.toLowerCase()) ||
          user.accountType.toLowerCase().includes(searchFormData.query.toLowerCase())
        );
      });
      setSearchFormData({
        ...searchFormData,
        fetchedUsers: Users,
        matchingUsers: matchingUsers,
      });
    } catch (error) {
      console.log(error);
      toast.error('Error fetching Users');
    }
  };

  // Reset Search form
  const onResetSearch = () => {
    setSearchFormData({
      query: '',
      fetchedUsers: [],
      matchingUsers: [],
      isLoading: false,
    });
    setIsEditing(false);
    setEditingUser({});
  };

  // Reset Create form
  const onResetForm = (e) => {
    e.preventDefault();

    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      accountType: 'user',
      profileImage: '',
    });
  };

  // Edit button in search resulted user
  const onEdit = (user) => {
    setIsEditing(true);
    setEditingUser({
      ...user,
      oldProfileImage: user.profileImage,
    });
  };

  // Cancel button in search resulted user
  const onCancelEdit = () => {
    setIsEditing(false);
    setEditingUser({});
  };

  // Delete button in search resulted user
  const onDelete = async (user) => {
    if (!isSuperAdmin) {
      toast.error('You are not authorized to delete users');
      return;
    }

    setLoading(true);

    try {
      // Delete Image in Firebase Storage
      if (user.profileImage !== '') {
        const storage = getStorage();
        const avatarRef = ref(storage, user.profileImage);
        await deleteObject(avatarRef);
      }

      // Delete User in Firestore
      const userRef = doc(db, 'users', user.userRef);
      await deleteDoc(userRef);

      // Delete User in Firebase Auth by uid

      onSearch();
      toast.success('User deleted successfully');
    } catch (error) {
      console.log(error);
      toast.error('Error deleting user');
    }

    setLoading(false);
  };

  return (
    <div className="create-user">
      {/* CREATE FORM */}
      <form
        className="create-user-form"
        onSubmit={(e) => (isEditing ? onUpdate(e) : onCreate(e))}
        onReset={onResetForm}
      >
        <div className="create-user-container">
          <h1 className="text-xl font-bold">{!editMode ? 'Create New' : 'Modify Existing'} User</h1>
          <div className="checkbox-container">
            <label htmlFor="editCheckbox" className="label-text">
              Edit Mode
            </label>
            <input
              type="checkbox"
              className="toggle"
              id="editCheckbox"
              onChange={(e) => {
                setEditMode(e.target.checked);
                if (!e.target.checked) {
                  setIsEditing(false);
                  setEditingUser({});
                }
              }}
            />
          </div>
          <div className="create-user-form-container">
            <div className="avatar-container">
              {(!isEditing && formData.accountType === 'admin') ||
              (isEditing && editingUser.accountType === 'admin') ? (
                <div className="badge badge-secondary badge-outline badge-lg">Admin</div>
              ) : (
                ''
              )}
              {isEditing ? (
                editingUser.profileImage === '' ? (
                  <Avatar
                    color={stringToColour(`${editingUser.firstname} ${editingUser.lastname}`)}
                    fgColor={invertColor(stringToColour(`${editingUser.firstname} ${editingUser.lastname}`), true)}
                    name={`${editingUser.firstname} ${editingUser.lastname}`}
                    size="80"
                    textSizeRatio={2.5}
                    round="true"
                    className="rounded-xl"
                  />
                ) : (
                  <img
                    src={
                      typeof editingUser.profileImage === 'string'
                        ? editingUser.profileImage
                        : URL.createObjectURL(editingUser.profileImage)
                    }
                    alt="avatar"
                    className="rounded-xl"
                  />
                )
              ) : formData.profileImage === '' ? (
                <Avatar
                  color={stringToColour(`${formData.firstname} ${formData.lastname}`)}
                  fgColor={invertColor(stringToColour(`${formData.firstname} ${formData.lastname}`), true)}
                  name={`${formData.firstname} ${formData.lastname}`}
                  size="80"
                  textSizeRatio={2.5}
                  round="true"
                  className="rounded-xl"
                />
              ) : (
                <img
                  src={
                    typeof formData.profileImage === 'string'
                      ? formData.profileImage
                      : URL.createObjectURL(formData.profileImage)
                  }
                  alt="avatar"
                  className="rounded-xl"
                />
              )}

              <label htmlFor="user-image-upload" className="custom-user-image-upload btn btn-outline btn-sm btn-accent">
                Upload Image
              </label>

              {isEditing ? (
                <input
                  id="user-image-upload"
                  type="file"
                  accept="image/*"
                  files={[formData.profileImage]}
                  onChange={(e) => {
                    e.target.files.length > 0 && setEditingUser({ ...editingUser, profileImage: e.target.files[0] });
                  }}
                />
              ) : (
                <input
                  id="user-image-upload"
                  type="file"
                  accept="image/*"
                  files={[formData.profileImage]}
                  onChange={(e) =>
                    e.target.files.length > 0 && setFormData({ ...formData, profileImage: e.target.files[0] })
                  }
                />
              )}
            </div>
            <div className="form-container">
              <div className="fullname">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      required={true}
                      placeholder="First Name"
                      className="input input-bordered input-warning"
                      value={editingUser.firstname}
                      onChange={(e) => setEditingUser({ ...editingUser, firstname: e.target.value })}
                    />
                    <input
                      required={true}
                      type="text"
                      placeholder="Last Name"
                      className="input input-bordered input-warning"
                      value={editingUser.lastname}
                      onChange={(e) => setEditingUser({ ...editingUser, lastname: e.target.value })}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      required={true}
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
                      required={true}
                      placeholder="Last Name"
                      className="input input-bordered"
                      value={formData.lastname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastname: e.target.value,
                        })
                      }
                    />
                  </>
                )}
              </div>
              {isEditing ? (
                <>
                  <input
                    required={true}
                    autoComplete="off"
                    type="email"
                    placeholder="Email"
                    className="input input-bordered input-warning"
                    disabled={true}
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                  <input
                    required={true}
                    type="text"
                    placeholder="Password"
                    className="input input-bordered input-warning"
                    disabled={true}
                    value={editingUser?.password ? editingUser.password : ''}
                    onChange={(e) => editingUser({ ...editingUser, password: e.target.value })}
                  />
                </>
              ) : (
                <>
                  <input
                    required={true}
                    autoComplete="off"
                    type="email"
                    placeholder="Email"
                    className="input input-bordered "
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                        password:
                          e.target.value !== ''
                            ? (
                                e.target.value.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, '') + new Date().getFullYear()
                              ).toLowerCase()
                            : '',
                      })
                    }
                  />
                  <input
                    required={true}
                    type="text"
                    placeholder="Password"
                    className="input input-bordered"
                    disabled={true}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </>
              )}
              <div className="is-admin">
                {isEditing ? (
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-accent"
                    id="accountType"
                    checked={editingUser.accountType === 'admin'}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        accountType: e.target.checked ? 'admin' : 'user',
                      })
                    }
                  />
                ) : (
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-accent"
                    id="accountType"
                    checked={formData.accountType === 'admin'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountType: e.currentTarget.checked ? 'admin' : 'user',
                      })
                    }
                  />
                )}

                <label htmlFor="accountType" className="label cursor-pointer">
                  Administrator
                </label>
              </div>

              {!isEditing && (
                <div className="notify">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-accent"
                    id="notify-user"
                    checked={notifyUser}
                    onChange={(e) => {
                      setNotifyUser(e.target.checked);
                    }}
                  />
                  <label htmlFor="notify-user" className="label cursor-pointer">
                    Notify user {notifyUser && targetEmail && `(${targetEmail})`}
                  </label>
                </div>
              )}

              <input
                type="submit"
                value={isEditing ? 'Update User' : 'Create User'}
                className={isEditing ? 'btn btn-warning btn-outline mt-5' : 'btn btn-success btn-outline mt-5'}
              />
              {!isEditing && <input type="reset" value="Clear Form" className="btn btn-error btn-outline" />}
            </div>
          </div>
        </div>
      </form>

      {/* EDIT FORM */}
      {editMode && (
        <form className="edit-user-form" onSubmit={onSearch} onReset={onResetSearch}>
          <h1 className="text-xl font-bold">Search for User</h1>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search for editing a user"
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
          {searchFormData.matchingUsers.length > 0 && (
            <div className="user-results-container">
              <div className="grid-headers contents text-sm uppercase font-semibold text-center">
                <h1 className="rounded-tl-xl">Avatar</h1>
                <h1>Name</h1>
                <h1>Email</h1>
                <h1>Type</h1>
                <h1 className="rounded-tr-xl">Actions</h1>
              </div>

              {searchFormData.matchingUsers.map((user) => (
                <div className="grid-content contents" key={user.userRef}>
                  <div className="image-container w-full flex justify-center items-center">
                    {user.profileImage === '' ? (
                      <Avatar
                        color={stringToColour(`${user.firstname} ${user.lastname}`)}
                        fgColor={invertColor(stringToColour(`${user.firstname} ${user.lastname}`), true)}
                        name={`${user.firstname} ${user.lastname}`}
                        size="56"
                        textSizeRatio={2.5}
                        round="true"
                        className="rounded-xl"
                      />
                    ) : (
                      <img src={user.profileImage} alt="avatar" className="w-14 rounded-xl" />
                    )}
                  </div>
                  <h1>
                    {user.firstname} {user.lastname}
                  </h1>
                  <h1>{user.email}</h1>
                  <h1>{user.accountType}</h1>
                  <div className="buttons">
                    {isEditing && editingUser?.userRef === user.userRef ? (
                      <button type="button" className="btn btn-xs btn-warning btn-outline" onClick={onCancelEdit}>
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-xs btn-accent btn-outline"
                        onClick={() => {
                          onEdit(user);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        type="button"
                        className="btn btn-xs btn-error btn-outline"
                        onClick={() => {
                          onDelete(user);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>
      )}
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
