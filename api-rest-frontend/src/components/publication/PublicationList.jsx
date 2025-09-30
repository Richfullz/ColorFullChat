import React, { useState, useEffect } from 'react';
import avatar from '../../assets/img/user.png';
import { Link } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import ReactTimeAgo from 'react-time-ago';
import { LikesUsers } from './LikesUsers';

export const PublicationList = ({ publications, setPublications, getPublications, page, setPage, more, counters }) => {
    const { auth, decrementPublications } = useAuth();

    const [selectedLikesPubId, setSelectedLikesPubId] = useState(null);

    const nextPage = () => {
        const next = page + 1;
        setPage(next);
        getPublications(next);
    };

    const deletePublication = async (publicationId) => {
        const token = localStorage.getItem("token");
        const response = await fetch(Global.url + "publication/remove/" + publicationId, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": token }
        });
        const data = await response.json();
        if (data.status === "success") {
            setPublications(prev => prev.filter(pub => pub._id !== publicationId));
            decrementPublications();
        } else {
            alert("No se pudo eliminar la publicación");
        }
    };

    const handleLike = async (pub) => {
        const token = localStorage.getItem("token");
        try {
            const method = pub.liked ? 'DELETE' : 'POST';
            const response = await fetch(Global.url + `like/${pub._id}`, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": token }
            });
            const data = await response.json();
            if (data.status === "success") {
                setPublications(prev => prev.map(p => {
                    if (p._id === pub._id) {
                        return {
                            ...p,
                            liked: !pub.liked,
                            likes_count: pub.liked ? pub.likes_count - 1 : pub.likes_count + 1
                        };
                    }
                    return p;
                }));
            }
        } catch (error) {
            console.error("Error al dar like:", error);
        }
    };

    // Inicializar likes en las publicaciones
    useEffect(() => {
        const fetchLikes = async () => {
            const token = localStorage.getItem("token");
            const updatedPubs = await Promise.all(publications.map(async pub => {
                try {
                    const resLiked = await fetch(Global.url + "like/has/" + pub._id, { headers: { "Authorization": token } });
                    const likedData = await resLiked.json();
                    const resCount = await fetch(Global.url + "like/" + pub._id, { headers: { "Authorization": token } });
                    const countData = await resCount.json();
                    return {
                        ...pub,
                        liked: likedData.liked,
                        likes_count: countData.total
                    };
                } catch (error) {
                    console.error("Error cargando likes:", error);
                    return pub;
                }
            }));
            setPublications(updatedPubs);
        };
        if (publications.length > 0) fetchLikes();
    }, [publications.length]);

    return (
        <div>
            <div className="content__posts">
                {publications.map(pub => (
                    <article className="posts__post" key={pub._id}>
                        <div className="post__container">
                            <div className="post__image-user">
                                <Link to={"/social/perfil/" + pub.user._id} className="post__image-link">
                                    <img
                                        src={pub.user.image && pub.user.image !== "default.png" ? Global.url + "user/avatar/" + pub.user.image : avatar}
                                        className="post__user-image"
                                        alt="Foto de perfil"
                                    />
                                </Link>
                            </div>

                            <div className="post__body">
                                <div className="post__user-info">
                                    <a href="#" className="user-info__name">{pub.user.name} {pub.user.surname}</a>
                                    <span className="user-info__divider"> | </span>
                                    <ReactTimeAgo date={pub.create_at ? new Date(pub.create_at) : new Date()} locale='es-ES' className="user-info__create-date" />
                                </div>
                                <h4 className="post__content">{pub.text}</h4>
                                {pub.file && <img className='img-publication' src={Global.url + "publication/media/" + pub.file} />}
                            </div>
                        </div>

                        <div className="post-actions-container">
                            <div className="btn-likes-container">
                                <button
                                    onClick={() => handleLike(pub)}
                                    className={`btn-button-likes ${pub.liked ? 'liked' : ''}`}
                                >
                                    {pub.liked ? '❤️' : '🤍'} {pub.likes_count || 0}
                                </button>

                                <button
                                    className="btn-show-likes"
                                    onClick={() =>
                                        setSelectedLikesPubId(selectedLikesPubId === pub._id ? null : pub._id)
                                    }
                                >
                                    Ver Likes
                                </button>

                                {auth._id === pub.user._id && (
                                    <button onClick={() => deletePublication(pub._id)} className="post__button">
                                        🗑️
                                    </button>
                                )}
                            </div>

                            {/* Tarjeta de LikesUsers pegada justo debajo de los botones */}
                            {selectedLikesPubId === pub._id && (
                                <div className="likes-users-wrapper">
                                    <LikesUsers
                                        publicationId={pub._id}
                                        onClose={() => setSelectedLikesPubId(null)}
                                    />
                                </div>
                            )}
                        </div>

                    </article>
                ))}
            </div>

            {more && (
                <div className="content__container-btn">
                    {counters.publications > 5 && publications.length < counters.publications && (
                        <button className="content__btn-more-post" onClick={nextPage}>
                            Ver más publicaciones
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
