import React, { useEffect, useState } from "react";
import { Global } from "../../helpers/Global";
import useAuth from "../../hooks/useAuth";

export const Box = () => {
    const { auth } = useAuth();
    const [followNotifications, setFollowNotifications] = useState([]);
    const [buzzonNotifications, setBuzzonNotifications] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // 🔹 Marcar todas como leídas al entrar al Box
    useEffect(() => {
        const markAllAsRead = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                await fetch(`${Global.url}follow/notifications/read/${auth._id}`, {
                    method: "PUT",
                    headers: { Authorization: token },
                });


            } catch (err) {
                console.error("Error marcando notificaciones como leídas:", err);
            }
        };

        markAllAsRead();
    }, [auth._id]);

    useEffect(() => {

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token") || "";

                // 🔹 Follow
                const resFollows = await fetch(`${Global.url}follow/notifications/${auth._id}`, {
                    headers: { Authorization: token },
                });
                const dataFollows = await resFollows.json();
                const followsWithType = dataFollows.status === "success"
                    ? dataFollows.notifications.map(n => ({
                        ...n,
                        type: "follow",
                        createdAt: n.createdAt || n.date || new Date(),
                    }))
                    : [];

                // 🔹 Buzzon
                const resBuzzons = await fetch(`${Global.url}buzzon/${auth._id}`, {
                    headers: { Authorization: token },
                });
                const dataBuzzons = await resBuzzons.json();
                const buzzonsWithType = dataBuzzons.status === "success"
                    ? dataBuzzons.buzzons.map(n => ({
                        ...n,
                        type: n.type || "like",
                        createdAt: n.createdAt || n.date || new Date(),
                    }))
                    : [];

                // 🔹 Solicitudes de amistad
                const resRequests = await fetch(`${Global.url}friend/received`, {
                    headers: { Authorization: token },
                });
                const dataRequests = await resRequests.json();
                const requests = dataRequests.requests?.map(r => ({
                    _id: r._id,
                    fromUser: r.sender,
                    type: "request",
                    createdAt: r.createdAt || r.date || new Date(),
                    read: r.read || false,
                })) || [];

                setFollowNotifications(followsWithType);
                setBuzzonNotifications(buzzonsWithType);
                setFriendRequests(requests);

                // 🔹 Marcar como leídas
                const markRead = async (notifications) => {
                    const unread = notifications.filter(n => !n.read);
                    for (let n of unread) {
                        const endpoint =
                            n.type === "follow"
                                ? `follow/notifications/read/${n._id}`
                                : `buzzon/${n._id}/read`;
                        await fetch(Global.url + endpoint, {
                            method: "PUT",
                            headers: { Authorization: token },
                        });
                    }
                };
                await markRead(followsWithType);
                await markRead(buzzonsWithType);

            } catch (err) {
                console.error("Error cargando notificaciones:", err);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [auth._id]);

    // 🔹 Función aceptar/rechazar solicitud
    const handleFriendAction = async (id, action) => {
        try {
            const token = localStorage.getItem("token") || "";
            let endpoint = "";

            switch (action) {
                case "accept":
                    endpoint = `${Global.url}friend/${id}/accept`;
                    break;
                case "reject":
                    endpoint = `${Global.url}friend/${id}/reject`;
                    break;
                default:
                    return;
            }

            const res = await fetch(endpoint, {
                method: "PUT",
                headers: { Authorization: token, "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();


            const acceptedRequest = friendRequests.find(r => r._id === id);

            // Actualizar estado de solicitudes eliminando la aceptada/rechazada
            setFriendRequests(prev => prev.filter(r => r._id !== id));

            if (action === "accept" && acceptedRequest) {

                // Agregar notificación instantánea tipo "follow"
                const newFollowNotification = {
                    _id: `follow-${id}`, // ID temporal
                    type: "follow",
                    fromUser: {
                        _id: acceptedRequest.fromUser._id,
                        nick: acceptedRequest.fromUser.nick,
                        image: acceptedRequest.fromUser.image,
                        name: acceptedRequest.fromUser.name
                    },
                    createdAt: new Date(),
                    read: false
                };

                setFollowNotifications(prev => [newFollowNotification, ...prev]);
            }

        } catch (err) {
            console.error("Error procesando solicitud:", err);
        }
    };

    // 🔹 Combinar todas las notificaciones
    const allNotifications = [...followNotifications, ...buzzonNotifications, ...friendRequests];
    const filteredNotifications = allNotifications.filter(n => {
        const validTypes = ["follow", "like", "comment", "mention", "request"];
        if (!validTypes.includes(n.type)) return false;
        if (filter === "all") return true;
        if (filter === "likes") return n.type === "like";
        if (filter === "follows") return n.type === "follow";
        if (filter === "friends") return n.type === "request";
        return true;
    });

    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        switch (sort) {
            case "newest": return dateB - dateA;
            case "oldest": return dateA - dateB;
            case "a-z": return (a.user?.nick || a.fromUser?.nick || "").localeCompare(b.user?.nick || b.fromUser?.nick || "");
            case "z-a": return (b.user?.nick || b.fromUser?.nick || "").localeCompare(a.user?.nick || a.fromUser?.nick || "");
            default: return 0;
        }
    });

    const getIcon = type => {
        switch (type) {
            case "follow": return "👤";
            case "like": return "❤️";
            case "comment": return "💬";
            case "mention": return "📣";
            case "request": return "📨";
            default: return "🔔";
        }
    };

    const getNotificationText = (n, userNick) => {
        switch (n.type) {
            case "follow": return <>{userNick} <span className="notif-action-follow">te sigue</span></>;
            case "like": return <>{userNick} <span className="notif-action-like">le gustó</span> tu publicación:</>;
            case "comment": return <>{userNick} <span className="notif-action-comment">comentó</span> tu publicación:</>;
            case "mention": return <>{userNick} <span className="notif-action-mention">te mencionó</span> en una publicación:</>;
            case "request": return <>{userNick} <span className="notif-action-request">te envió una solicitud de amistad</span></>;
            default: return null;
        }
    };

    return (
        <div className="box-container">
            <div className="box-select">
                <h3 className="notifications-box">Notificaciones</h3>

                <div className="container-box-sort">
                    <div className="box-sort">
                        <select value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="likes">Likes</option>
                            <option value="follows">Seguidores</option>
                            <option value="friends">Solicitudes</option>
                        </select>
                    </div>
                    <div className="box-sort">
                        <select value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="newest">Más recientes</option>
                            <option value="oldest">Más antiguos</option>
                            <option value="a-z">A-Z</option>
                            <option value="z-a">Z-A</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p>Cargando notificaciones...</p>
                ) : sortedNotifications.length > 0 ? (
                    sortedNotifications.map(n => {
                        const userToShow = n.fromUser || n.user;
                        const userNick = userToShow?.nick || "Usuario desconocido";

                        return (
                            <div key={n._id} className="box-card">
                                {userToShow?.image && (
                                    <img
                                        src={`${Global.url}user/avatar/${userToShow.image}`}
                                        alt={userNick}
                                        className="box-card-avatar"
                                        onError={e => e.target.src = `${Global.url}user/avatar/default.png`}
                                    />
                                )}

                                <div className="box-card-info">
                                    <p>
                                        <span className="notification-icon">{getIcon(n.type)}</span>{" "}
                                        {getNotificationText(n, userNick)}
                                    </p>

                                    {n.type === "request" ? (
                                        <div style={{ marginTop: '1rem' }}>
                                            <button className="btn-accept" onClick={() => handleFriendAction(n._id, "accept")}>✅ Aceptar</button>
                                            <button className="btn-decline" onClick={() => handleFriendAction(n._id, "reject")}>❌ Rechazar</button>
                                        </div>
                                    ) : n.publicationText ? (
                                        <div className="container-publication-text">
                                            <div className="publication-text">
                                                "{n.publicationText}"
                                                <div>{new Date(n.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="container-publication-text">
                                            <div className="publication-text">
                                                <div>{new Date(n.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No hay notificaciones todavía</p>
                )}
            </div>
        </div>
    );
};
