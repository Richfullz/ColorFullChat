import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Global } from "../../helpers/Global";

export const Config = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                if (!storedUser) throw new Error("No hay usuario logueado");

                const userId = storedUser.id;
                const token = localStorage.getItem("token");

                const res = await fetch(Global.url + "user/profile/" + userId, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });

                const data = await res.json();
                if (data.status !== "success") throw new Error("Error al cargar usuario");

                const user = data.user;
                setUserRole(user.role);

                // Tarjetas base (para todos los usuarios)
                const userCards = [
                    {
                        title: "Cambiar Perfil",
                        description: "Personaliza tu perfil: cambia tu nombre, apellidos, nick y biografía, y sube un avatar que te represente.",
                        route: "/social/configProfile",
                        color: "#0d00ff",
                        bgGradient: "linear-gradient(135deg, #a29dff, #a8a0ff)"
                    },
                    {
                        title: "Detalles / Privacidad",
                        description: "Controla quién puede ver tu Perfil. Configura tu privacidad de forma rápida y segura.",
                        route: "/social/privacidad",
                        color: "#ff0000",
                        bgGradient: "linear-gradient(135deg, #ff6b6b, #ff9999)"
                    }
                ];

                // Tarjetas extra si es admin
                if (user.role === 1) {
                    userCards.push(
                        {
                            title: "Listado de Usuarios",
                            description: "Visualiza todos los usuarios registrados y gestiona baneos, desbaneos y eliminaciones.",
                            route: "/social/listSettings",
                            color: "#129a43",
                            bgGradient: "linear-gradient(135deg, #01ff4d, #00b894)"
                        },
                        {
                            title: "Auditoría",
                            description: "Revisa los registros de acciones administrativas: baneos, desbaneos, usuarios eliminados.",
                            route: "/social/audit",
                            color: "#ffb700",
                            bgGradient: "linear-gradient(135deg, #ff9f43, #ffb142)"
                        },
                        {
                            title: "ReportInbox",
                            description: "Revisa el buzón de denuncias enviadas por los usuarios y gestiona su estado.",
                            route: "/social/reportInbox",
                            color: "#8e44ad",
                            bgGradient: "linear-gradient(135deg, #c39bd3, #8e44ad)"
                        }
                    );
                }

                setCards(userCards);

            } catch (error) {
                console.error("Error al cargar usuario:", error);
            }
        };

        fetchUser();
    }, []);

    if (userRole === null) {
        return <p className="loading">Cargando...</p>;
    }

    return (
        <div className={userRole === 1 ? "settings-background-adm" : "settings-background"}>
            <header className="settings-header">
                <h1 className={userRole === 1 ? "settings-title-adm" : "settings-title"}>Ajustes</h1>
            </header>

            <div className="settings-cards-container">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="settings-card"
                        style={{ borderColor: card.color, background: card.bgGradient }}
                    >
                        <h2 className="card-title">{card.title}</h2>
                        <p className="card-description">{card.description}</p>
                        <button
                            className="card-button"
                            style={{ backgroundColor: card.color, color: "#fff" }}
                            onClick={() => navigate(card.route)}
                        >
                            Ir a {card.title}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
