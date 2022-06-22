import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import FirebaseContext from '../context/auth/FirebaseContext';
import LogoIcon from '../assets/images/logo_icon.png';
import userDefaultImage from '../assets/images/user.png';

function Navbar() {
  // use context
  const { user, loggedIn, setLoading, setLoggedIn } = useContext(FirebaseContext);
  const navigate = useNavigate();
  const auth = getAuth();

  const onLogout = () => {
    setLoading(true);
    auth.signOut();
    setLoggedIn(false);
    setLoading(false);
    navigate('/');
  };

  return (
    <nav>
      <Link to="/" className="logo">
        <img src={LogoIcon} alt="logo" />
        <h1>Geotech Clients</h1>
        <div className="badge badge-accent badge-outline">BETA</div>
      </Link>

      <ul className="top-menu">
        {loggedIn && user ? (
          <li>
            <h1 className="mr-3">{`${user?.firstname} ${user?.lastname}`}</h1>
          </li>
        ) : (
          ''
        )}
        <li>
          <div className="dropdown dropdown-end">
            <label tabIndex="0" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {loggedIn && user ? (
                  <img src={user?.profileImage} alt="user" />
                ) : (
                  <img src={userDefaultImage} alt="user" />
                )}
              </div>
            </label>
            <ul
              tabIndex="0"
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              {loggedIn ? (
                <>
                  <li>
                    <Link to="/projects">Projects</Link>
                  </li>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <button onClick={onLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
