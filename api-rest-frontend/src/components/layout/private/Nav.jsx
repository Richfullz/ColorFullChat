import React from 'react';
import avatar from '../../../assets/img/user.png'
import { NavLink } from "react-router-dom";
import useAuth from '../../../hooks/useAuth'
import { Global } from '../../../helpers/Global';

export const Nav = () => {

    const { auth } = useAuth();

    return (
        <nav className="layout__navbar">
            <div className="navbar__container-lists">
                <ul className="container-lists__menu-list">
                    <li className="menu-list__item">
                        <NavLink to="/social" className="menu-list__link">
                            <span className="menu-list__icon">🏠</span>
                            <span className="menu-list__title">Inicio</span>
                        </NavLink>
                    </li>
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
                    <li className="menu-list__item">
                        <NavLink to="/social/chat" className="menu-list__link">
                            <span className="menu-list__icon">💬</span>
                            <span className="menu-list__title">Chat</span>
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/music" className="menu-list__link">
                            <span className="menu-list__icon">🎧</span>
                            <span className="menu-list__title">musica</span>
                        </NavLink>
                    </li>
                    <li className="menu-list__item">
                        <NavLink to="/social/citas" className="menu-list__link">
                            <span className="menu-list__icon">🫂</span>
                            <span className="menu-list__title">citas</span>
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
                        <NavLink to={"/social/perfil/" + auth._id} className='list-end__link-image'>

                            {/* Si la imagen del usuario NO es la por defecto... */}
                            {auth.image && auth.image !== "default.png"
                                ? (
                                    // Mostramos la imagen subida, construyendo la URL completa
                                    <img
                                        src={Global.url + "user/avatar/" + auth.image}
                                        className="list-end__img"
                                        alt="Imagen del perfil"
                                    />
                                )
                                : (
                                    // Si no, mostramos la imagen por defecto local
                                    <img
                                        src={avatar}
                                        className="list-end__img"
                                        alt="Imagen del perfil"
                                    />
                                )
                            }
                        </NavLink>
                    </li>
                    <li className="list-end__item">
                        <NavLink className="list-end__link" to={"/social/perfil/" + auth._id}  >
                            <span className="list-end__name">{auth.nick}</span>
                        </NavLink>
                    </li>
                    <li className="list-end__item">
                        <span className="list-end__arrow">▼</span>
                    </li>
                    <li className="list-end__item">
                        <NavLink className="list-end__link" to="/social/ajustes" >
                            <span className="menu-list__icon">⚙️</span>
                            <span className="list-end__arrow">Ajustes</span>
                        </NavLink>
                    </li>
                    <li className="list-end__item">
                        <NavLink to="/social/logout" className="list-end__link" >
                            <span className="menu-list__icon">🔚</span>
                            <span className="list-end__arrow">Cerrar sesion</span>
                        </NavLink>
                    </li>
                </ul>

            </div>
        </nav >
    );
}