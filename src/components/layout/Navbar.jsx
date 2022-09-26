import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import FirebaseContext from '../../context/auth/FirebaseContext';
import LogoIcon from '../../assets/images/logo_icon.png';
import userDefaultImage from '../../assets/images/user.png';
import Avatar from 'react-avatar';

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
                  user?.profileImage !== '' ? (
                    <img src={user?.profileImage} alt="user" />
                  ) : (
                    <Avatar
                      color={stringToColour(`${user?.firstname} ${user?.lastname}`)}
                      fgColor={invertColor(stringToColour(`${user?.firstname} ${user?.lastname}`), true)}
                      name={`${user?.firstname} ${user?.lastname}`}
                      size="40"
                      round="true"
                    />
                  )
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
                      <Link to="/dashboard/user">
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

export default Navbar;
