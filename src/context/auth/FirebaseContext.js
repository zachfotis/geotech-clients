import { createContext, useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';

import Spinner from '../../components/layout/Spinner';

const FirebaseContext = createContext();

export const FirebaseProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const isMounted = useRef(true);

  // Check if user is logged in
  useEffect(() => {
    if (isMounted) {
      setLoading(true);
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const q = query(collection(db, 'users'), where('userRef', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const userData = querySnapshot.docs[0].data();

          setUser({
            ...userData,
            uid: user.uid,
          });

          setLoggedIn(true);
        } else {
          setUser(null);
          setLoggedIn(false);
        }
        setLoading(false);
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        loggedIn,
        setLoading,
        setLoggedIn,
      }}
    >
      {children}
      {loading && <Spinner />}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;
