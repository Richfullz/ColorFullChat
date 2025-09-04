import React from 'react';
import useAuth from '../../hooks/useAuth';
import avatar from '../../assets/img/user.png';
import { Global } from '../../helpers/Global';
import { Link } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago'

export const UserList = ({ users, getUsers, following, setFollowing, loading, more, page, setPage }) => {
    const { auth, incrementFollowing, decrementFollowing } = useAuth();

    const nextPage = () => {
        const next = page + 1;
        setPage(next);
        getUsers(next);
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
            setFollowing(prev => [...prev, userId]); // actualización segura con callback
            incrementFollowing(); // incrementar contador global inmediatamente
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
            setFollowing(prev => prev.filter(id => id !== userId)); // actualización segura con callback
            decrementFollowing(); // decrementar contador global inmediatamente
        }
    };

    return (
        <>
            <div>
                <div className="content__posts">
                    {users.map(user => (
                        <article className="posts__post" key={user._id}>
                            <div className="post__container">
                                <div className="post__image-user">
                                    <Link to={"/social/perfil/" + user._id} className="post__image-link">
                                        {user.image && user.image !== "default.png"
                                            ? (
                                                <img
                                                    src={Global.url + "user/avatar/" + user.image}
                                                    className="post__user-image"
                                                    alt="Foto de perfil"
                                                />
                                            )
                                            : (
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
                                        <Link to={"/social/perfil/" + user._id} className="user-info__name">{user.name}, {user.surname}</Link>
                                        <span className="user-info__divider"> | </span>
                                        <Link to={"/social/perfil/" + user._id} className="user-info__create-date">  <ReactTimeAgo
                                            date={user.create_at ? new Date(user.create_at) : new Date()}
                                            locale='es-ES'
                                            className="user-info__create-date"
                                        /></Link>
                                    </div>
                                    <h4 className="post__content">{user.bio}</h4>
                                </div>
                            </div>

                            {user._id !== auth._id && (
                                <div className="post__buttons">
                                    {!following.includes(user._id) ? (
                                        <button to={"/social/perfil/" + user._id} className="post__button post__button--green" onClick={() => follow(user._id)}>Seguir</button>
                                    ) : (
                                        <button to={"/social/perfil/" + user._id} className="post__button" onClick={() => unfollow(user._id)}>Dejar de Seguir</button>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
                </div>

                {loading ? <div className='loading'><h1>cargando...</h1></div> : ""}
                {more && (
                    <div className="content__container-btn">
                        <button className="content__btn-more-post" onClick={nextPage}>
                            Ver mas Personas
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

