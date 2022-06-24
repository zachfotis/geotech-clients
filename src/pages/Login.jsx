import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FirebaseContext from '../context/auth/FirebaseContext';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo_icon.png';

function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const { user, setLoading } = useContext(FirebaseContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      if (userCredentials.user) {
      }
    } catch (error) {
      toast.error('Invalid email or password');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      user?.accountType === 'admin'
        ? toast.info('Admin privileges granted!')
        : toast.success('Login successful!');
      navigate('/projects');
    }
  }, [user]); // eslint-disable-line

  return (
    <section className="bg-stone-50 px-4 py-6 w-full flex-auto flex flex-col flex-wrap justify-center items-center">
      <div className="bg-white py-8 px-4 shadow rounded-2xl w-full sm:w-2/3 sm:px-6 sm:max-w-sm">
        <div className="w-100 flex flex-col flex-wrap justify-center items-center">
          <img src={logo} alt="logo" className="w-24 mb-4" />
          <h1 className="text-2xl font-bold">WELCOME</h1>
          <h1 className="text-xl font-light mb-6">Please login to access your profile!</h1>
        </div>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                required
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-start">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className={`font-medium text-teal-600 hover:text-teal-500`}
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-400 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login;
