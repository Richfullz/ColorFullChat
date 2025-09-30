import React, { useEffect, useState } from "react";
import avatar from "../../../assets/img/user.png";
import { NavLink } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { Global } from "../../../helpers/Global";

export const Nav = () => {
    const { auth } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                // Obtener notificaciones de seguidores
                const resFollows = await fetch(Global.url + "follow/notifications/" + auth._id, {
                    headers: { Authorization: localStorage.getItem("token") || "" },
                });
                const dataFollows = await resFollows.json();
                const unreadFollows = dataFollows.status === "success"
                    ? dataFollows.notifications.filter(n => !n.read).length
                    : 0;

                // Obtener notificaciones de likes
                const resLikes = await fetch(Global.url + "buzzon/" + auth._id, {
                    headers: { Authorization: localStorage.getItem("token") || "" },
                });
                const dataLikes = await resLikes.json();
                const unreadLikes = dataLikes.status === "success"
                    ? dataLikes.buzzons.filter(n => !n.read).length
                    : 0;

                // Sumar ambos para el círculo rojo
                setUnreadCount(unreadFollows + unreadLikes);
            } catch (err) {
                console.log(err);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 15000); // refrescar cada 15s
        return () => clearInterval(interval);
    }, [auth._id]);

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
                    {/* Correo con circulito rojo */}
                    <li className="menu-list__item">
                        <NavLink to="/social/box" className="menu-list__link notification-link">
                            <span className="menu-list__icon">📧</span>
                            <span className="menu-list__title">Bandeja</span>
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/chat" className="menu-list__link">
                            <span className="menu-list__icon">💬</span>
                            <span className="menu-list__title">Chat</span>
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/music" className="menu-list__link">
                            <span className="menu-list__icon">🎧</span>
                            <span className="menu-list__title">Música</span>
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/citas" className="menu-list__link">
                            <span className="menu-list__icon">🫂</span>
                            <span className="menu-list__title">Citas</span>
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/events" className="menu-list__link">
                            <span className="menu-list__icon">📅</span>
                            <span className="menu-list__title">Eventos</span>
                        </NavLink>
                    </li>
                </ul>

                <ul className="container-lists__list-end">
                    <li className="list-end__item">
                        <NavLink to={"/social/perfil/" + auth._id} className="list-end__link-image">
                            {auth.image && auth.image !== "default.png" ? (
                                <img
                                    src={Global.url + "user/avatar/" + auth.image}
                                    className="list-end__img"
                                    alt="Imagen del perfil"
                                />
                            ) : (
                                <img
                                    src={avatar}
                                    className="list-end__img"
                                    alt="Imagen del perfil"
                                />
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
