import React, { useEffect, useState, useRef } from "react";
import avatar from "../../../assets/img/user.png";
import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { Global } from "../../../helpers/Global";

export const Nav = () => {
    const { auth } = useAuth();
    const location = useLocation();

    const [unreadCount, setUnreadCount] = useState(0);
    const [showNumber, setShowNumber] = useState(true);
    const [hasNotifications, setHasNotifications] = useState(false);
    const hideNumberTimeoutRef = useRef(null);

    // Guardar el timestamp de última vez que se vio la bandeja
    const getLastSeen = () => parseInt(localStorage.getItem("lastSeenBox") || "0");
    const setLastSeen = (timestamp) => localStorage.setItem("lastSeenBox", timestamp);

    // 🔹 Obtener notificaciones no leídas
    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("token") || "";
            const lastSeen = getLastSeen();

            // 🔹 Follow
            const resFollows = await fetch(`${Global.url}follow/notifications/${auth._id}`, { headers: { Authorization: token } });
            const dataFollows = await resFollows.json();
            const followUnread = dataFollows.status === "success"
                ? dataFollows.notifications.filter(n => !n.read && new Date(n.createdAt).getTime() > lastSeen).length
                : 0;

            // 🔹 Buzzon
            const resBuzzons = await fetch(`${Global.url}buzzon/${auth._id}`, { headers: { Authorization: token } });
            const dataBuzzons = await resBuzzons.json();
            const buzzonUnread = dataBuzzons.status === "success"
                ? dataBuzzons.buzzons.filter(n => !n.read && new Date(n.createdAt).getTime() > lastSeen).length
                : 0;

            // 🔹 Friend requests
            const resRequests = await fetch(`${Global.url}friend/received`, { headers: { Authorization: token } });
            const dataRequests = await resRequests.json();
            const requestsUnread = dataRequests.requests
                ? dataRequests.requests.filter(r => !r.read && new Date(r.createdAt).getTime() > lastSeen).length
                : 0;

            const totalUnread = followUnread + buzzonUnread + requestsUnread;

            setUnreadCount(totalUnread);
            setShowNumber(totalUnread > 0);
            setHasNotifications(totalUnread > 0);

            // Ocultar número después de 10s
            if (hideNumberTimeoutRef.current) clearTimeout(hideNumberTimeoutRef.current);
            hideNumberTimeoutRef.current = setTimeout(() => setShowNumber(false), 10000);

        } catch (err) {
            console.error("Error al obtener notificaciones:", err);
            setUnreadCount(0);
            setShowNumber(false);
            setHasNotifications(false);
        }
    };

    // Inicializar fetch al montar y refrescar cada 15s (solo fuera de /box)
    useEffect(() => {
        if (location.pathname !== "/social/box") fetchUnreadCount();
        const interval = setInterval(() => {
            if (location.pathname !== "/social/box") fetchUnreadCount();
        }, 15000);

        return () => {
            clearInterval(interval);
            if (hideNumberTimeoutRef.current) clearTimeout(hideNumberTimeoutRef.current);
        };
    }, [auth._id, location.pathname]);

    // Manejo de la bandeja de entrada
    useEffect(() => {
        if (location.pathname === "/social/box") {
            // Marcar todas como leídas y guardar timestamp
            setUnreadCount(0);
            setShowNumber(false);
            setHasNotifications(false);
            setLastSeen(Date.now());
            if (hideNumberTimeoutRef.current) clearTimeout(hideNumberTimeoutRef.current);
        } else {
            fetchUnreadCount();
        }
    }, [location.pathname]);

    return (
        <nav className="layout__navbar">
            <div className="navbar__container-lists">
                <ul className="container-lists__menu-list">
                    <li className="menu-list__item">
                        <NavLink to="/social/feed" className="menu-list__link">
                            <span className="menu-list__icon">📋</span>
                            <span className="menu-list__title">Timeline</span>
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/gente" className="menu-list__link">
                            <span className="menu-list__icon">👥</span>
                            <span className="menu-list__title">Gente</span>
                        </NavLink>
                    </li>

                    {/* Bandeja con notificaciones */}
                    <li className="menu-list__item">
                        <NavLink to="/social/box" className="menu-list__link notification-link">
                            <span className="menu-list__icon">📧</span>
                            <span className="menu-list__title">Bandeja</span>
                            {hasNotifications && (
                                <span className={`notification-badge ${!showNumber ? "small" : ""}`}>
                                    {showNumber ? unreadCount : ""}
                                </span>
                            )}
                        </NavLink>
                    </li>

                    <li className="menu-list__item">
                        <NavLink to="/social/chat" className="menu-list__link">
                            <span className="menu-list__icon">💬</span>
                            <span className="menu-list__title">Chat</span>
                        </NavLink>
                    </li>
                </ul>

                <ul className="container-lists__list-end">
                    <li className="list-end__item">
                        <NavLink to={"/social/perfil/" + auth._id} className="list-end__link-image">
                            {auth.image && auth.image !== "default.png" ? (
                                <img src={Global.url + "user/avatar/" + auth.image} className="list-end__img" alt="Imagen del perfil" />
                            ) : (
                                <img src={avatar} className="list-end__img" alt="Imagen del perfil" />
                            )}
                        </NavLink>
                    </li>
                    <li className="list-end__item">
                        <NavLink className="list-end__link" to={"/social/perfil/" + auth._id}>
                            <span className="list-end__name">{auth.nick}</span>
                        </NavLink>
                    </li>
                    <li className="list-end__item">
                        <span className="list-end__arrow">▼</span>
                    </li>
                    <li className="list-end__item">
                        <NavLink className="list-end__link" to="/social/ajustes">
                            <span className="menu-list__icon">⚙️</span>
                            <span className="list-end__arrow">Ajustes</span>
                        </NavLink>
                    </li>
                    <li className="list-end__item">
                        <NavLink to="/social/logout" className="list-end__link">
                            <span className="menu-list__icon">🔚</span>
                            <span className="list-end__arrow">Cerrar sesión</span>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};
