import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { Global } from "../../helpers/Global";
import { SerializeForm } from "../../helpers/SerializeForm";
import Swal from "sweetalert2";
import avatarDefault from "../../assets/img/user.png";

export const ConfigProfile = () => {
    const { auth, setAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(
        auth.image && auth.image !== "default.png"
            ? Global.url + "user/avatar/" + auth.image
            : avatarDefault
    );
    const [formValues, setFormValues] = useState({
        name: auth.name,
        surname: auth.surname,
        nick: auth.nick,
        bio: auth.bio,
        email: auth.email,
        password: "",
        file0: null
    });

    const isAdmin = auth.role === 1;

    // Detectar cambios para habilitar botón
    const hasChanges = () => {
        return Object.keys(formValues).some((key) => {
            if (key === "password") return formValues[key] !== "";
            if (key === "file0") return formValues[key] !== null;
            return formValues[key] !== auth[key];
        });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: files ? files[0] : value
        }));

        if (files && files[0]) {
            const objectUrl = URL.createObjectURL(files[0]);
            setPreview(objectUrl);
        }
    };

    // Actualizar usuario con confirmación
    const updateUser = async (e) => {
        e.preventDefault();
        if (!hasChanges()) return;

        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Tu Perfil se va a actualizar",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "No",
            confirmButtonColor: "#ff416c",
            cancelButtonColor: "#8e2de2",
            customClass: {
                title: 'swal2-title-lg-configProfile',
                htmlContainer: 'swal2-text-lg-configProfile',
                confirmButton: 'swal2-btn-lg-configProfile',
                cancelButton: 'swal2-btn-lg-configProfile'
            }
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const formDataObj = { ...formValues };
            const file = formDataObj.file0;
            delete formDataObj.file0;

            // Actualizar datos
            const response = await fetch(Global.url + "user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify(formDataObj)
            });
            const data = await response.json();

            if (data.status !== "success") {
                Swal.fire("Error", "No se pudo actualizar tu perfil", "error");
                setLoading(false);
                return;
            }

            let updatedUser = data.user;
            delete updatedUser.password;
            updatedUser.role = auth.role;
            setAuth(updatedUser);

            // Subida de imagen
            if (file && file.name) {
                const formData = new FormData();
                formData.append("file0", file);

                const uploadResponse = await fetch(Global.url + "user/upload", {
                    method: "POST",
                    headers: { Authorization: token },
                    body: formData
                });

                const uploadData = await uploadResponse.json();
                if (uploadData.status === "success") {
                    let uploadedUser = uploadData.user;
                    delete uploadedUser.password;
                    uploadedUser.role = auth.role;
                    setAuth(uploadedUser);
                } else {
                    Swal.fire("Error", "No se pudo actualizar la imagen", "error");
                }
            }

            Swal.fire({
                icon: "success",
                title: "¡Perfil actualizado!",
                showConfirmButton: false,
                timer: 1500
            });

            // Limpiar contraseña y archivo después de actualizar
            setFormValues((prev) => ({ ...prev, password: "", file0: null }));

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Ocurrió un problema al conectar con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    // Eliminar cuenta con confirmación
    const handleDeleteAccount = async () => {
        const confirmDelete = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Tus datos serán borrados de la plataforma",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ff416c",
            cancelButtonColor: "#8e2de2",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            customClass: {
                title: 'swal2-title-lg-configProfile',
                confirmButton: 'swal2-btn-lg-configProfile',
                cancelButton: 'swal2-btn-lg-configProfile'
            }
        });

        if (!confirmDelete.isConfirmed) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(Global.url + "user/remove", {
                method: "DELETE",
                headers: { Authorization: token }
            });
            const data = await response.json();

            if (data.status === "success") {
                localStorage.clear();
                setAuth({});
                Swal.fire({
                    icon: "success",
                    title: "Cuenta eliminada",
                    showConfirmButton: false,
                    timer: 1500
                });
                setTimeout(() => (window.location.href = "/login"), 1500);
            } else {
                Swal.fire("Error", "No se pudo eliminar la cuenta", "error");
            }
        } catch (err) {
            Swal.fire("Error", "Ocurrió un problema al conectar con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    // Clases dinámicas
    const classes = {
        container: isAdmin ? "admin-settings" : "settings-background",
        form: isAdmin ? "settings-form-adm" : "settings-form",
        btnSuccess: isAdmin ? "btn-success-adm" : "btn-success"
    };

    return (
        <div className={classes.container}>
            <div className="config-profile">
                <form className={classes.form} onSubmit={updateUser}>
                    <h1>Configuración Perfil {isAdmin ? "Administrador" : "Usuario"}</h1>
                    <br />

                    <input
                        className="config-form"
                        type="text"
                        name="name"
                        value={formValues.name}
                        placeholder="Nombre"
                        onChange={handleChange}
                    />
                    <input
                        className="config-form"
                        type="text"
                        name="surname"
                        value={formValues.surname}
                        placeholder="Apellidos"
                        onChange={handleChange}
                    />
                    <input
                        className="config-form"
                        type="text"
                        name="nick"
                        value={formValues.nick}
                        placeholder="Nick"
                        onChange={handleChange}
                    />
                    <textarea
                        className="config-form"
                        name="bio"
                        value={formValues.bio}
                        placeholder="Biografía"
                        onChange={handleChange}
                    />
                    <input
                        className="config-form"
                        type="text"
                        name="email"
                        value={formValues.email}
                        placeholder="Email"
                        onChange={handleChange}
                    />
                    <input
                        className="config-form"
                        type="password"
                        name="password"
                        value={formValues.password}
                        placeholder="Contraseña"
                        onChange={handleChange}
                    />

                    <div className="avatar-preview config-form">
                        <img src={preview} className="avatar-img" alt={`${auth.name} avatar`} />
                    </div>
                    <input
                        className="config-form"
                        type="file"
                        name="file0"
                        onChange={handleChange}
                    />

                    {hasChanges() && (
                        <input
                            type="submit"
                            value={loading ? "Actualizando..." : "Actualizar perfil"}
                            className={classes.btnSuccess}
                            disabled={loading}
                        />
                    )}

                    <button
                        type="button"
                        className="btn-danger"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                    >
                        Eliminar cuenta
                    </button>
                </form>
            </div>
        </div>
    );
};
