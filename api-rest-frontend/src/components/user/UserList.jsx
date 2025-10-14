import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import avatar from '../../assets/img/user.png';
import { Global } from '../../helpers/Global';
import { Link } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';

export const UserList = ({ users, getUsers, following, setFollowing, loading, more, page, setPage }) => {
    const { auth, incrementFollowing, decrementFollowing } = useAuth();

    //Arrays para solicitudes pendientes
    const [pendingRequests, setPendingRequests] = useState([]);
    const [doublePendingRequests, setDoublePendingRequests] = useState([]);

    // Cargar solicitudes pendientes al inicio
    useEffect(() => {
        const fetchPending = async () => {
            const token = localStorage.getItem("token");

            // Solicitudes enviadas pendientes
            const sentRes = await fetch(Global.url + "friend/sent", {
                headers: { Authorization: token }
            });
            const sentData = await sentRes.json();

            const pendingIds = [];
            const doubleIds = [];

            sentData.requests.forEach(req => {
                if (req.pendingFor === auth._id) {
                    doubleIds.push(req.receiver._id);
                } else {
                    pendingIds.push(req.receiver._id);
                }
            });

            setPendingRequests(pendingIds);
            setDoublePendingRequests(doubleIds);
        };

        fetchPending();
    }, [auth._id]);

    const nextPage = () => {
        const next = page + 1;
        setPage(next);
        getUsers(next);
    };

    //Función de follow
    const follow = async (user) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(Global.url + "friend/send", {
                method: "POST",
                body: JSON.stringify({ receiverId: user._id }),
                headers: { "Content-Type": "application/json", Authorization: token }
            });
            const data = await res.json();

            if (data.status === "success") {
                if (data.action === "friends_now") {
                    setFollowing(prev => [...prev, user._id]);
                    incrementFollowing();
                } else if (data.action === "request_sent") {
                    setPendingRequests(prev => [...prev, user._id]);
                }
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };
    //Dejar de seguir
    const unfollow = async (userId) => {
        const token = localStorage.getItem("token");
        try {
            const request = await fetch(Global.url + "follow/unfollow/" + userId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });
            const data = await request.json();

            if (data.status === "success") {
                setFollowing(prev => prev.filter(id => id !== userId));
                setPendingRequests(prev => prev.filter(id => id !== userId));
                setDoublePendingRequests(prev => prev.filter(id => id !== userId));
                decrementFollowing();
            }
        } catch (error) {
            console.error("Error dejando de seguir:", error);
        }
    };

    const renderButton = (user) => {
        if (user._id === auth._id) return null;

        if (following.includes(user._id))
            return <button className="post__button post__button--red" onClick={() => unfollow(user._id)}>Dejar de Seguir</button>;

        if (pendingRequests.includes(user._id))
            return <button className="post__button post__button--gray" disabled>Solicitud enviada</button>;

        return <button className="post__button post__button--purple" onClick={() => follow(user)}>
            {user.private ? "Solicitar amistad" : "Seguir"}
        </button>;
    };
    return (
        <div>
            <div className="content__posts">
                {users.map(user => (
                    <article className="posts__post" key={user._id}>
                        <div className="post__container">
                            <div className="post__image-user">
                                <Link to={"/social/perfil/" + user._id} className="post__image-link">
                                    {user.image && user.image !== "default.png" ? (
                                        <img
                                            src={Global.url + "user/avatar/" + user.image}
                                            className="post__user-image"
                                            alt="Foto de perfil"
                                        />
                                    ) : (
                                        <img
                                            src={avatar}
                                            className="post__user-image"
                                            alt="Foto de perfil"
                                        />
                                    )}
                                </Link>
                            </div>

                            <div className="post__body">
                                <div className="post__user-info">
                                    <Link to={"/social/perfil/" + user._id} className="user-info__name">
                                        {user.name} {user.surname}
                                    </Link>
                                    <span className="user-info__divider"> | </span>
                                    <Link to={"/social/perfil/" + user._id} className="user-info__create-date">
                                        <ReactTimeAgo
                                            date={user.create_at ? new Date(user.create_at) : new Date()}
                                            locale='es-ES'
                                            className="user-info__create-date"
                                        />
                                    </Link>
                                </div>

                                <h4 className="post__content">{user.bio}</h4>

                                {user.following_users && user.following_users.length > 0 && (
                                    <p className="post__followers">
                                        Le siguen:{" "}
                                        {user.following_users.slice(0, 3).map((follower, index) => (
                                            <span key={follower._id}>
                                                {follower.name}{index < Math.min(2, user.following_users.length - 1) ? ", " : ""}
                                            </span>
                                        ))}
                                        {user.following_users.length > 3 ? ` y ${user.following_users.length - 3} más` : ""}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            {renderButton(user)}
                        </div>
                    </article>
                ))}
            </div>

            {loading && <div className='loading'><h1>Cargando...</h1></div>}

            {more && (
                <div className="content__container-btn">
                    <button className="content__btn-more-post" onClick={nextPage}>
                        Ver más personas
                    </button>
                </div>
            )}
        </div>
    );
};
