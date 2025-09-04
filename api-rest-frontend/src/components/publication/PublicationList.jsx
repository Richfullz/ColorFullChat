import React, { useState } from 'react';
import avatar from '../../assets/img/user.png';
import { Link } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import ReactTimeAgo from 'react-time-ago'
export const PublicationList = ({ publications, setPublications, getPublications, page, setPage, more, counters }) => {
    const { auth, decrementPublications } = useAuth();

    const nextPage = () => {
        let next = page + 1;
        setPage(next);
        getPublications(next);
    };
    const deletePublication = async (publicationId) => {
        const token = localStorage.getItem("token");

        const response = await fetch(Global.url + "publication/remove/" + publicationId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            }
        });

        const data = await response.json();

        if (data.status === "success") {
            // Eliminar localmente la publicación
            setPublications(prev => prev.filter(pub => pub._id !== publicationId));
            // Actualizar contador global
            decrementPublications();
        } else {
            alert("No se pudo eliminar la publicación");
        }
    }
    return (
        <div>
            <div className="content__posts">
                {publications.map(publication => (
                    <article className="posts__post" key={publication._id}>
                        <div className="post__container">
                            <div className="post__image-user">
                                <Link to={"/social/perfil/" + publication.user_id} className="post__image-link">
                                    {publication.user.image && publication.user.image !== "default.png" ? (
                                        <img
                                            src={Global.url + "user/avatar/" + publication.user.image}
                                            className="post__user-image "
                                            alt="Foto de perfil"
                                        />
                                    ) : (
                                        <img
                                            src={avatar}
                                            className="post__user-image "
                                            alt="Foto de perfil"
                                        />
                                    )}
                                </Link>
                            </div>

                            <div className="post__body">
                                <div className="post__user-info">
                                    <a href="#" className="user-info__name">{publication.user.name} {publication.user.surname}</a>
                                    <span className="user-info__divider"> | </span>

                                    <ReactTimeAgo
                                        date={publication.create_at ? new Date(publication.create_at) : new Date()}
                                        locale='es-ES'
                                        className="user-info__create-date"
                                    />

                                </div>
                                <h4 className="post__content">{publication.text}</h4>
                                {publication.file && <img className='img-publication' src={Global.url + "publication/media/" + publication.file} />}
                            </div>
                        </div>

                        {auth._id === publication.user._id && (
                            <div className="post__buttons">
                                <button onClick={() => deletePublication(publication._id)} href="#" className="post__button">
                                    🗑️
                                </button>
                            </div>
                        )}
                    </article>
                ))}
            </div>
            {more &&
                <div className="content__container-btn">
                    {counters.publications > 5 && publications.length < counters.publications && (
                        <button className="content__btn-more-post" onClick={nextPage}>
                            Ver más publicaciones
                        </button>
                    )}
                    <br />
                </div>
            }
        </div>
    )
}

