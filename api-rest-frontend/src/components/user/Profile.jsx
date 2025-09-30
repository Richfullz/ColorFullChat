import React, { useEffect, useState } from 'react';
import avatar from '../../assets/img/user.png';
import { GetProfile } from '../../helpers/GetProfile';
import { useParams, Link } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { PublicationList } from '../publication/PublicationList';

export const Profile = () => {
    const { auth, incrementFollowing, decrementFollowing, decrementPublications } = useAuth();
    const [user, setUser] = useState({});
    const params = useParams();
    const [iFollow, setIFollow] = useState(false);
    const [counters, setCounters] = useState({});
    const [publications, setPublications] = useState([]);
    const [page, setPage] = useState(1);
    const [more, setMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setPublications([]);
        setPage(1);
        setMore(true);
        getDataUser();
        getCounters();
        getPublications(1, true);
    }, []);

    useEffect(() => {
        setPublications([]);
        setPage(1);
        setMore(true);
        getDataUser();
        getCounters();
        getPublications(1, true);
    }, [params.userId]);

    const getDataUser = async () => {
        let dataUser = await GetProfile(params.userId, setUser);
        if (dataUser.following && dataUser.following._id) setIFollow(true);
        else setIFollow(false);
    };

    const getCounters = async () => {
        const token = localStorage.getItem("token");
        const request = await fetch(Global.url + "user/counters/" + params.userId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });
        const data = await request.json();
        if (data.following !== undefined) {
            setCounters(data);
        }
    };

    const follow = async (userId) => {
        const token = localStorage.getItem("token");
        const request = await fetch(Global.url + "follow/save", {
            method: "POST",
            body: JSON.stringify({ followed: userId }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
        });
        const data = await request.json();

        if (data.status === "success") {
            setIFollow(true);
            incrementFollowing(); // actualizar contador global
            setCounters(prev => ({ ...prev, following: (prev.following || 0) + 1 })); // actualizar local
        }
    };

    const unfollow = async (userId) => {
        const token = localStorage.getItem("token");
        const request = await fetch(Global.url + "follow/unfollow/" + userId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
        });
        const data = await request.json();

        if (data.status === "success") {
            setIFollow(false);
            decrementFollowing();
            setCounters(prev => ({ ...prev, following: (prev.following || 0) - 1 }));
        }
    };

    const getPublications = async (nextPage = 1, newProfile = false) => {
        try {
            const token = localStorage.getItem("token");
            const request = await fetch(Global.url + "publication/user/" + params.userId + "/" + nextPage, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });
            const data = await request.json();

            if (data.status === "success") {
                let newPublications = [];

                if (newProfile) {
                    // Reinicia publicaciones si es un nuevo perfil
                    newPublications = data.publications;
                } else if (nextPage > 1) {
                    // Acumula publicaciones de páginas siguientes sin perder anteriores
                    newPublications = [...publications, ...data.publications];
                } else {
                    // Primera carga o recarga inicial
                    newPublications = data.publications;
                }

                setPublications(newPublications);

                // Actualiza si hay más páginas para cargar o no
                setMore(data.pages > nextPage);
            }
        } catch (error) {
            console.error("Error cargando publicaciones:", error);
            setMore(false);
        }
    };


    return (
        <div className='style-profile'>
            <header className="aside__profile-info-profile">
                <div className="profile-info__general-info">
                    <div className="general-info__container-avatar">
                        {user.image && user.image !== "default.png" ? (
                            <img
                                src={Global.url + "user/avatar/" + user.image}
                                className="container-avatar__img"
                                alt="Foto de perfil"
                            />
                        ) : (
                            <img
                                src={avatar}
                                className="container-avatar__img"
                                alt="Foto de perfil"
                            />
                        )}
                    </div>

                    <div className="general-info__container-names">
                        <div className="container-names__name">
                            <h1>{user.name} {user.surname}</h1>
                        </div>
                        <h2 className="container-names__nickname">{user.nick}</h2>
                        <p>{user.bio}</p>
                    </div>

                    {user._id !== auth._id &&
                        (iFollow ? (
                            <button
                                onClick={() => unfollow(user._id)}
                                className="btn-unfollow-profile"
                            >
                                Dejar de seguir
                            </button>
                        ) : (
                            <button
                                onClick={() => follow(user._id)}
                                className="btn-follow-profile"
                            >
                                Seguir
                            </button>
                        ))
                    }
                </div>

                <div className="profile-info__stats">
                    <div className="stats__following">
                        <Link to={`/social/siguiendo/${user._id}`} className="following__link">
                            <span className="following__title">Siguiendo</span>
                            <span className="following__number">{counters.following >= 1 ? counters.following : 0}</span>
                        </Link>
                    </div>
                    <div className="stats__following">
                        <Link to={`/social/seguidores/${user._id}`} className="following__link">
                            <span className="following__title">Seguidores</span>
                            <span className="following__number">{counters.followed >= 1 ? counters.followed : 0}</span>
                        </Link>
                    </div>
                    <div className="stats__following">
                        <Link to={`/social/perfil/${user._id}`} className="following__link">
                            <span className="following__title">Publicaciones</span>
                            <span className="following__number">{counters.publications >= 1 ? counters.publications : 0}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Sección de publicaciones */}
            <PublicationList
                publications={publications}
                setPublications={setPublications}
                getPublications={getPublications}
                page={page}
                setPage={setPage}
                more={more}
                setMore={setMore}
                counters={counters}
                setCounters={setCounters}
            />

        </div>
    );
};
