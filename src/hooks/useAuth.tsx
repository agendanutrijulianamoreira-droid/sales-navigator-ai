import { useEffect, useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const subscribeToAuthChanges = async () => {
      try {
        const unsubscribe = await auth.onAuthStateChanged((currentUser) => {
          if (mountedRef.current) {
            setUser(currentUser);
          }
        });
        return unsubscribe;
      } catch (err) {
        if (mountedRef.current) {
          setError('Error subscribing to auth changes: ' + err.message);
        }
      }
    };

    const unsubscribe = subscribeToAuthChanges();

    return () => {
      mountedRef.current = false;
      if (unsubscribe) unsubscribe(); 
    };
  }, []);

  const handleLogin = async (credentials) => {
    try {
      // Your login logic here 
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  return { user, error, handleLogin };
};

export default useAuth;
