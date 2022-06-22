import { createContext, useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';

import Spinner from '../../components/Spinner';

const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const isMounted = useRef(true);

  // Check if user is logged in
  useEffect(() => {
    if (isMounted) {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUser((prevState) => ({
            ...prevState,
            uid: user.uid,
          }));
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
        setCheckingStatus(false);
      });

      if (!checkingStatus) {
        setLoading(false);
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, [isMounted, checkingStatus]);

  // Set user details on loggedIn change
  useEffect(() => {
    const subscribe = async () => {
      const q = query(collection(db, 'users'), where('userRef', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs[0].data();

      setUser((prevState) => ({
        ...prevState,
        uid: user.uid,
        ...userData,
      }));
    };

    if (loggedIn) {
      subscribe();
    } else {
      setUser(null);
    }
  }, [loggedIn]); // eslint-disable-line

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loggedIn,
        setLoading,
      }}
    >
      {children}
      {loading && <Spinner />}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;
