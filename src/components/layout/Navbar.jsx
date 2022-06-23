import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import FirebaseContext from '../../context/auth/FirebaseContext';
import LogoIcon from '../../assets/images/logo_icon.png';
import userDefaultImage from '../../assets/images/user.png';

function Navbar() {
  const { user, loggedIn, setLoading } = useContext(FirebaseContext);

  const onLogout = () => {
    setLoading(true);
    const auth = getAuth();
    auth.signOut();
    setLoading(false);
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
                  {loggedIn && user?.accountType === 'admin' ? (
                    <li>
                      <Link to="/dashboard/project">
                        Dashboard <span className="badge badge-secondary badge-sm">admin</span>{' '}
                      </Link>
                    </li>
                  ) : null}
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
