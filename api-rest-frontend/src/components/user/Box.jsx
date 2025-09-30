import React, { useEffect, useState } from "react";
import { Global } from "../../helpers/Global";
import useAuth from "../../hooks/useAuth";

export const Box = () => {
    const { auth } = useAuth();
    const [followNotifications, setFollowNotifications] = useState([]);
    const [buzzonNotifications, setBuzzonNotifications] = useState([]);
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("all"); // all, likes, follows
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                // ---------------------------
                // Fetch Follow Notifications
                // ---------------------------
                const resFollows = await fetch(Global.url + "follow/notifications/" + auth._id, {
                    headers: { Authorization: localStorage.getItem("token") || "" },
                });
                const dataFollows = await resFollows.json();
                const followsWithType = dataFollows.status === "success"
                    ? dataFollows.notifications.map(n => ({ ...n, type: "follow" }))
                    : [];

                // ---------------------------
                // Fetch Buzzon Notifications (Likes)
                // ---------------------------
                const resBuzzons = await fetch(Global.url + "buzzon/" + auth._id, {
                    headers: { Authorization: localStorage.getItem("token") || "" },
                });
                const dataBuzzons = await resBuzzons.json();
                const buzzonsWithType = dataBuzzons.status === "success"
                    ? dataBuzzons.buzzons.map(n => ({ ...n, type: "like" }))
                    : [];

                setFollowNotifications(followsWithType);
                setBuzzonNotifications(buzzonsWithType);

                // ---------------------------
                // Mark all notifications as read
                // ---------------------------
                const markRead = async (notifications) => {
                    const unread = notifications.filter(n => !n.read);
                    for (let n of unread) {
                        await fetch(Global.url + (n.type === "follow" ? `follow/notifications/read/${n._id}` : `buzzon/${n._id}/read`), {
                            method: "PUT",
                            headers: { Authorization: localStorage.getItem("token") || "" },
                        });
                    }
                };

                await markRead(followsWithType);
                await markRead(buzzonsWithType);
            } catch (err) {
                console.log(err);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [auth._id]);

    // Combinar y filtrar notificaciones
    const allNotifications = [...followNotifications, ...buzzonNotifications];
    const filteredNotifications = allNotifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "likes") return n.type === "like";
        if (filter === "follows") return n.type === "follow";
        return true;
    });

    // Ordenar notificaciones
    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
        switch (sort) {
            case "newest":
                return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
            case "oldest":
                return new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at);
            case "a-z":
                return (a.user?.nick || "").localeCompare(b.user?.nick || "");
            case "z-a":
                return (b.user?.nick || "").localeCompare(a.user?.nick || "");
            default:
                return 0;
        }
    });

    const getIcon = type => {
        switch (type) {
            case "follow": return "👤";
            case "like": return "❤️";
            case "comment": return "💬";
            default: return "🔔";
        }
    };

    return (
        <div className="box-container">
            <div className="box-select">
                <h3 className="notifications-box">Notificaciones</h3>

                {/* Filtro y Orden */}
                <div className="container-box-sort">
                    <div className="box-sort">
                        <select value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="likes">Likes</option>
                            <option value="follows">Seguidores</option>
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

                {/* Lista de notificaciones */}
                {loading ? (
                    <p>Cargando notificaciones...</p>
                ) : sortedNotifications.length > 0 ? (
                    sortedNotifications.map(n => {
                        const userToShow = n.fromUser || n.user;

                        return (
                            <div key={n._id} className="box-card">
                                {userToShow?.image && (
                                    <img
                                        src={Global.url + "user/avatar/" + userToShow.image}
                                        alt={userToShow.nick}
                                        className="box-card-avatar"
                                    />
                                )}
                                <div className="box-card-info">
                                    <p>
                                        <span className="notification-icon">{getIcon(n.type)}</span>{" "}
                                        {n.message || (userToShow?.nick + (n.type === "follow" ? " te sigue" : " le gustó tu publicación:"))}
                                    </p>
                                    {n.type === "like" && n.publicationText && (
                                        <div className="container-publication-text">
                                            <div className="publication-text">"{n.publicationText}"

                                                <div>{new Date(n.createdAt || n.created_at).toLocaleString()}</div>
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
