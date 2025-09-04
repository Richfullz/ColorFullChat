import { NavLink } from 'react-router-dom';
export const Nav = () => (

    <nav className="layout__navbar">
        <div className="navbar__container-lists">
            <ul className="container-lists__menu-list">
                <li className="menu-list__item">
                    <NavLink to="/login" className="menu-list__link">
                        <span className="menu-list__icon">👤</span>
                        <span className="menu-list__title">Login</span>
                    </NavLink>
                </li>
                <li className="menu-list__item">
                    <NavLink to="/registro" className="menu-list__link">
                        <span className="menu-list__icon">👥</span>
                        <span className="menu-list__title">Registro</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    </nav>
);
