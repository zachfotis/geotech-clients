import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';

function Profile() {
  const { loggedIn } = useContext(FirebaseContext);

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  return <div>Profile</div>;
}

export default Profile;
