import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import FirebaseContext from '../context/auth/FirebaseContext';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const { setLoading } = useContext(FirebaseContext);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setEmail('');
      toast.success('Check your email for a password reset link');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      return toast.error('Something went wrong');
    }

    navigate('/login');
  };

  return (
    <section className="forgot-password-section">
      <h1>Reset Your Password</h1>
      <p>Did you forget your password? No worries, we have you covered! </p>

      <form className="forgot-password-form label-text" onSubmit={onSubmit}>
        <label className="label" htmlFor="email">
          <span className="label-text">Enter your email: </span>
          <input
            type="email"
            placeholder="Enter your email"
            id="email"
            className="input input-bordered input-ghost input-sm"
            required={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <input type="submit" value="Reset Password" className="btn btn-outline btn-info btn-sm" />
      </form>
    </section>
  );
}

export default ForgotPassword;
