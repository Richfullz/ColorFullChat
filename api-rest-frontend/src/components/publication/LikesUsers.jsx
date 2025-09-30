import React, { useState, useEffect } from 'react';
import avatar from '../../assets/img/user.png';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';

export const LikesUsers = ({ publicationId, onClose }) => {
    const { auth } = useAuth();
    const [likes, setLikes] = useState([]);
    const [page, setPage] = useState(1);
    const [more, setMore] = useState(true);

    const loadLikes = async (nextPage = 1) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${Global.url}like/${publicationId}?page=${nextPage}`, {
                headers: { "Authorization": token }
            });
            const data = await response.json();

            if (data.status === 'success') {
                // IMPORTANTE: data.likes debe contener array de likes con user
                const likesWithUser = data.likes.map(l => l.user ? l.user : { _id: '', nick: 'Usuario desconocido', image: 'default.png' });

                if (nextPage === 1) setLikes(likesWithUser);
                else setLikes(prev => [...prev, ...likesWithUser]);

                setMore(likesWithUser.length >= 10);
            }
        } catch (error) {
            console.error("Error cargando likes:", error);
        }
    };

    useEffect(() => {
        loadLikes(1);
    }, [publicationId]);

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        loadLikes(next);
    };

    return (
        <div className="likes-users-list">
            <div className="likes-users-header">
                <h3>Usuarios que dieron like</h3>
                <button className="likes-users-close" onClick={onClose}>×</button>
            </div>

            {likes.map(user => (
                <div className="like-user" key={user._id}>
                    <img
                        src={user.image && user.image !== "default.png" ? Global.url + "user/avatar/" + user.image : avatar}
                        alt={user.nick}
                        className="like-user-avatar"
                    />
                    <span className="like-user-nick">{user.nick}</span>
                </div>
            ))}

            {more && <button className="btn-more-likes" onClick={loadMore}>Ver más</button>}
        </div>

    );
};
