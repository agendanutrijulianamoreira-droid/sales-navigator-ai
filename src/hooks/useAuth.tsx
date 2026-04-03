import React, { useEffect, useState } from 'react';
import { getSession } from 'some-auth-library'; // Adjust the import according to your project's structure.

const useAuth = () => {
    const [authState, setAuthState] = useState(null);
    const mountedRef = React.useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        const fetchSession = async () => {
            try {
                const session = await getSession();
                if (mountedRef.current) {
                    setAuthState(session);
                }
            } catch (error) {
                if (mountedRef.current) {
                    setAuthState(null);
                }
                console.error('Error fetching session:', error);
            }
        };

        fetchSession();

        return () => {
            mountedRef.current = false;
        };
    }, []);

    return authState;
};

export default useAuth;