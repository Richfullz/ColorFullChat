import React, { createContext, useState, useEffect } from 'react';
import { Global } from '../helpers/Global';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [counters, setCounters] = useState({ following: 0, followed: 0, publications: 0 });
    const [loading, setLoading] = useState(true);

    const authUser = async () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
            setLoading(false);
            return;
        }

        try {
            const userObj = JSON.parse(user);
            const userId = userObj.id;

            const request = await fetch(Global.url + "user/profile/" + userId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                }
            });

            const data = await request.json();

            const requestCounters = await fetch(Global.url + "user/counters/" + userId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                }
            });

            const dataCounters = await requestCounters.json();

            if (data.status === "success" && data.user) {
                setAuth(data.user);
                setCounters({
                    following: dataCounters.following || 0,
                    followed: dataCounters.followed || 0,
                    publications: dataCounters.publications || 0,
                });
            } else {
                setAuth({});
                setCounters({ following: 0, followed: 0, publications: 0 });
            }
            setLoading(false);
        } catch (error) {
            setAuth({});
            setCounters({ following: 0, followed: 0, publications: 0 });
            setLoading(false);
        }
    };

    useEffect(() => {
        authUser();
    }, []);

    const incrementFollowing = () => {
        setCounters(prev => ({ ...prev, following: prev.following + 1 }));
    };

    const decrementFollowing = () => {
        setCounters(prev => ({ ...prev, following: prev.following - 1 }));
    };

    const incrementFollowers = () => {
        setCounters(prev => ({ ...prev, followed: prev.followed + 1 }));
    };

    const decrementFollowers = () => {
        setCounters(prev => ({ ...prev, followed: prev.followed - 1 }));
    };
    const incrementPublications = () => {
        setCounters(prev => ({ ...prev, publications: (prev.publications || 0) + 1 }));
    };
    const decrementPublications = () => {
        setCounters(prev => ({
            ...prev,
            publications: prev.publications > 0 ? prev.publications - 1 : 0
        }));
    };

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            counters,
            setCounters,
            loading,
            incrementFollowing,
            decrementFollowing,
            incrementFollowers,
            decrementFollowers,
            incrementPublications,
            decrementPublications
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
