import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { Global } from "../../helpers/Global";
import Swal from "sweetalert2";

const Privacidad = () => {
    const { auth, setAuth } = useAuth();
    const [privacy, setPrivacy] = useState("publico");
    const [message, setMessage] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const updateText = (value) => {
        if (value === "publico") {
            setMessage("Tu perfil ahora es Público.");
            setDescription(
                "Tu Perfil es: Público, 🌍 Cualquier usuario podrá ver tu perfil, tus publicaciones ✏️ en tu Perfil 👤."
            );
        } else {
            setMessage("Tu perfil ahora es Privado.");
            setDescription(
                "Tu Perfil es: Privado, 🔒 Solo tus seguidores podrán ver tus publicaciones ✏️ y tu perfil 👤."
            );
        }
    };

    useEffect(() => {
        if (auth && auth.private !== undefined) {
            const initialPrivacy = auth.private ? "privado" : "publico";
            setPrivacy(initialPrivacy);
            updateText(initialPrivacy);
        }
    }, [auth.private]);

    const handleChange = async (e) => {
        const value = e.target.value;

        const currentPrivacy = auth.private ? "privado" : "publico";
        if (currentPrivacy === value) {
            setMessage("Ya tienes este estado de privacidad seleccionado.");
            return;
        }

        setPrivacy(value);
        updateText(value);
        await handleSave(value);
    };

    const handleSave = async (newValue) => {
        const token = localStorage.getItem("token");
        const privateValue = newValue === "privado";
        setLoading(true);

        try {
            const result = await Swal.fire({
                title: "¿Estás seguro?",
                html: `Tu perfil pasará a ser <strong>${newValue.toUpperCase()}</strong>`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#8e2de2",
                cancelButtonColor: "#ff416c",
                confirmButtonText: "Sí, cambiar",
                cancelButtonText: "Cancelar",
                customClass: {
                    title: 'swal2-title-lg-privacidad',
                    htmlContainer: 'swal2-text-lg-privacidad',
                    confirmButton: 'swal2-btn-lg-privacidad',
                    cancelButton: 'swal2-btn-lg-privacidad'
                }
            });

            if (!result.isConfirmed) {
                // Si cancela, restauramos el valor anterior
                setPrivacy(auth.private ? "privado" : "publico");
                updateText(auth.private ? "privado" : "publico");
                return;
            }

            const request = await fetch(Global.url + "user/update", {
                method: "PUT",
                body: JSON.stringify({ private: privateValue }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });

            if (request.status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Sesión expirada",
                    text: "Vuelve a iniciar sesión.",
                });
                return;
            }

            const data = await request.json();

            if (data.status === "success" && data.user) {
                delete data.user.password;
                setAuth((prev) => ({ ...prev, ...data.user }));
                updateText(newValue);
                Swal.fire({
                    icon: "success",
                    title: "Privacidad actualizada",
                    text: "Tu configuración se ha guardado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                throw new Error(data.message || "No se pudo actualizar la privacidad.");
            }
        } catch (error) {
            console.error("Error al guardar privacidad:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Ocurrió un problema al intentar guardar los cambios.",
            });
            // Restaurar valor previo en caso de error
            setPrivacy(auth.private ? "privado" : "publico");
            updateText(auth.private ? "privado" : "publico");
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = auth.role === 1;

    return (
        <div
            className={
                isAdmin
                    ? "settings-background-privacidad-admin"
                    : "settings-background-privacidad-user"
            }
        >
            <header className="settings-header">
                <h1 className="settings-title">Privacidad</h1>
            </header>

            <div
                className={`settings-container ${privacy === "privado" ? "private" : "public"
                    }`}
            >
                <div className="privacy-status">
                    Tu perfil actualmente es:
                    <span className={privacy}>
                        {" "}
                        {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
                    </span>
                </div>

                <div className="form-field">
                    <label
                        htmlFor="privacy"
                        className={privacy === "privado" ? "" : "publico"}
                    >
                        Selecciona la privacidad:
                    </label>
                    <select
                        id="privacy"
                        name="privacy"
                        value={privacy}
                        onChange={handleChange}
                        className="privacy-select"
                        disabled={loading}
                    >
                        <option value="publico">Público</option>
                        <option value="privado">Privado</option>
                    </select>
                </div>
            </div>

            <div
                className={`container-privacidad ${privacy === "privado"
                    ? "container-privacidad-private"
                    : "container-privacidad-public"
                    }`}
            >
                <h3>Información:</h3>
                <p className="privacy-message" aria-live="polite">{message}</p>
                <p className="privacy-description" aria-live="polite">{description}</p>
            </div>
        </div>
    );
};

export default Privacidad;
