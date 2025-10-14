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
    const [openCommentsPubId, setOpenCommentsPubId] = useState(null);
    const [comments, setComments] = useState({});
    const [commentCounts, setCommentCounts] = useState({});
    const [newComment, setNewComment] = useState("");
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionSuggestions, setMentionSuggestions] = useState([]);
    const [replyTo, setReplyTo] = useState({}); // reply por publicación

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
                setPublications(prev => prev.map(p =>
                    p._id === pub._id
                        ? { ...p, liked: !pub.liked, likes_count: pub.liked ? pub.likes_count - 1 : pub.likes_count + 1 }
                        : p
                ));
            }
        } catch (error) {
            console.error("Error al dar like:", error);
        }
    };

    useEffect(() => {
        const fetchLikes = async () => {
            const token = localStorage.getItem("token");
            const updatedPubs = await Promise.all(publications.map(async pub => {
                try {
                    const resLiked = await fetch(Global.url + "like/has/" + pub._id, { headers: { "Authorization": token } });
                    const likedData = await resLiked.json();
                    const resCount = await fetch(Global.url + "like/" + pub._id, { headers: { "Authorization": token } });
                    const countData = await resCount.json();
                    return { ...pub, liked: likedData.liked, likes_count: countData.total };
                } catch {
                    return pub;
                }
            }));
            setPublications(updatedPubs);
        };
        if (publications.length > 0) fetchLikes();
    }, [publications.length]);

    const fetchCommentCountForPub = async (publicationId) => {
        const token = localStorage.getItem("token");
        try {
            const resList = await fetch(Global.url + `comment/list/${publicationId}`, { headers: { "Authorization": token } });
            if (resList.ok) {
                const data = await resList.json();
                if (data.status === "success" && Array.isArray(data.comments)) return data.comments.length;
            }
            return 0;
        } catch {
            return 0;
        }
    };

    const fetchCommentsCounts = async () => {
        if (!publications || publications.length === 0) return;
        const results = await Promise.all(publications.map(pub => fetchCommentCountForPub(pub._id)));
        const map = {};
        publications.forEach((pub, idx) => map[pub._id] = results[idx] || 0);
        setCommentCounts(map);
    };

    useEffect(() => {
        fetchCommentsCounts();
    }, [publications]);

    const loadComments = async (publicationId) => {
        const token = localStorage.getItem("token");
        const res = await fetch(Global.url + "comment/list/" + publicationId, { headers: { "Authorization": token } });
        const data = await res.json();
        if (data.status === "success") {
            setComments(prev => ({ ...prev, [publicationId]: data.comments }));
            setCommentCounts(prev => ({ ...prev, [publicationId]: data.comments.length }));
        }
    };

    const handleCommentChange = (e) => {
        const value = e.target.value;
        setNewComment(value);
        const mentionMatch = value.match(/@(\w*)$/);
        if (mentionMatch) {
            const query = mentionMatch[1];
            setMentionQuery(query);
            fetch(Global.url + `user/search/${query}`, { headers: { Authorization: localStorage.getItem("token") || "" } })
                .then(res => res.json())
                .then(data => data.status === "success" && setMentionSuggestions(data.users || []));
        } else {
            setMentionQuery("");
            setMentionSuggestions([]);
        }
    };

    const sendComment = async (e, publicationId) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem("token");
        const res = await fetch(Global.url + "comment/save", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({
                text: newComment,
                publicationId,
                replyTo: replyTo[publicationId] || null
            })
        });
        const data = await res.json();

        if (data.status === "success") {
            setComments(prev => ({
                ...prev,
                [publicationId]: [data.comment, ...(prev[publicationId] || [])]
            }));
            setCommentCounts(prev => ({
                ...prev,
                [publicationId]: (prev[publicationId] || 0) + 1
            }));
        }

        setNewComment("");
        setReplyTo(prev => ({ ...prev, [publicationId]: null }));
        setMentionQuery("");
        setMentionSuggestions([]);
    };

    const highlightMentions = (text) => {
        return text.split(/(@\w+)/g).map((part, i) =>
            part.startsWith("@") ? <span key={i} className="mention-user">{part}</span> : part
        );
    };

    return (
        <div>
            <div className="content__posts">
                {publications.map(pub => (
                    <article className="posts__post" key={pub._id}>
                        <div className="post__container">
                            <div className="post__image-user">
                                <Link to={"/social/perfil/" + pub.user._id} className="post__image-link">
                                    <img
                                        src={pub.user.image && pub.user.image !== "default.png"
                                            ? Global.url + "user/avatar/" + pub.user.image
                                            : avatar}
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
                                <button onClick={() => handleLike(pub)} className={`btn-button-likes ${pub.liked ? 'liked' : ''}`}>
                                    {pub.liked ? '❤️' : '🤍'} {pub.likes_count || 0}
                                </button>

                                <button className="btn-show-likes" onClick={() => setSelectedLikesPubId(selectedLikesPubId === pub._id ? null : pub._id)}>
                                    Ver Likes
                                </button>

                                <button
                                    className={`${(commentCounts[pub._id] ?? 0) === 0 ? "btn-comments-gray" : "btn-show-comments"}`}
                                    onClick={() => {
                                        if (openCommentsPubId === pub._id) {
                                            setOpenCommentsPubId(null);
                                        } else {
                                            setOpenCommentsPubId(pub._id);
                                            if (!comments[pub._id]) loadComments(pub._id);
                                        }
                                    }}>
                                    💬 {commentCounts[pub._id] ?? 0}
                                </button>

                                {auth._id === pub.user._id && (
                                    <button onClick={() => deletePublication(pub._id)} className="post__button">🗑️</button>
                                )}
                            </div>

                            {selectedLikesPubId === pub._id && (
                                <div className="likes-users-wrapper">
                                    <LikesUsers publicationId={pub._id} onClose={() => setSelectedLikesPubId(null)} />
                                </div>
                            )}

                            {openCommentsPubId === pub._id && (
                                <div className="comments-section">
                                    <form onSubmit={(e) => sendComment(e, pub._id)} className="comment-form">
                                        <input
                                            id={`comment-input-${pub._id}`}
                                            type="text"
                                            className="comment-input"
                                            value={newComment}
                                            onChange={handleCommentChange}
                                            placeholder={replyTo[pub._id] ? "Respondiendo..." : "Escribe un comentario..."}
                                        />
                                        <button type="submit" className="comment-btn">Enviar</button>

                                        <div className={`mention-suggestions-container ${mentionSuggestions.length > 0 ? 'active' : ''}`}>
                                            {mentionSuggestions.map(u => (
                                                <div
                                                    key={u._id}
                                                    className="mention-suggestion-item"
                                                    onClick={() => {
                                                        setNewComment(prev => prev.replace(/@\w*$/, `@${u.nick} `));
                                                        setMentionSuggestions([]);
                                                    }}
                                                >
                                                    {u.nick} ({u.name})
                                                </div>
                                            ))}
                                        </div>
                                    </form>

                                    <div className="comments-list">
                                        {(comments[pub._id] || [])
                                            .filter(c => !c.replyTo)
                                            .map(c => (
                                                <div key={c._id} className="comment-item">
                                                    <img
                                                        src={c.user.image && c.user.image !== "default.png"
                                                            ? Global.url + "user/avatar/" + c.user.image
                                                            : avatar}
                                                        alt={c.user.nick}
                                                        className="comment-avatar"
                                                    />
                                                    <div className="comment-content">
                                                        <span className="comment-author">{c.user.nick}</span>
                                                        <p className="comment-text">{highlightMentions(c.text)}</p>

                                                        <button
                                                            className="comment-reply-btn"
                                                            onClick={() => {
                                                                setReplyTo(prev => ({ ...prev, [pub._id]: c._id }));
                                                                setNewComment(`@${c.user.nick} `);
                                                                const input = document.querySelector(`#comment-input-${pub._id}`);
                                                                if (input) input.focus();
                                                            }}
                                                        >
                                                            Responder
                                                        </button>

                                                        <div className="comment-replies">
                                                            {(comments[pub._id] || [])
                                                                .filter(r => r.replyTo && (r.replyTo === c._id || r.replyTo._id === c._id))

                                                                .map(r => (
                                                                    <div key={r._id} className="comment-reply-item">
                                                                        <div className='comment-reply-item-card'>
                                                                            <img
                                                                                src={r.user.image && r.user.image !== "default.png"
                                                                                    ? Global.url + "user/avatar/" + r.user.image
                                                                                    : avatar}
                                                                                alt={r.user.nick}
                                                                                className="comment-avatar reply-avatar"
                                                                            />
                                                                            <div className="comment-content reply-content">
                                                                                <span className="comment-author">{r.user.nick}</span>
                                                                                <p className="comment-text">{highlightMentions(r.text)}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
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
