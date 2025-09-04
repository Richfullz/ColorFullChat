import React, { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { Global } from '../../helpers/Global';
import { SerializeForm } from '../../helpers/SerializeForm';
import avatar from "../../assets/img/user.png"

export const Config = () => {
    const { auth, setAuth } = useAuth();
    const [saved, setSaved] = useState("not_saved");

    const updateUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const newDataUser = SerializeForm(e.target);
        delete newDataUser.file0;

        const request = await fetch(Global.url + "user/update", {
            method: "PUT",
            body: JSON.stringify(newDataUser),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });
        const data = await request.json();

        if (data.status === "success" && data.user) {
            delete data.user.password;
            setAuth(data.user);
            setSaved("saved");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            setSaved("error");
            setTimeout(() => window.location.reload(), 1000);
        }

        // subida de imagen
        const fileInput = document.querySelector("#file");
        if (data.status === "success" && fileInput.files[0]) {
            const formData = new FormData();
            formData.append('file0', fileInput.files[0]);
            const uploadRequest = await fetch(Global.url + "user/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": token
                }
            });
            const uploadData = await uploadRequest.json();

            if (uploadData.status === "success" && uploadData.user) {
                delete uploadData.user.password;
                setAuth(uploadData.user);
                setSaved("saved");
            } else {
                setSaved("error");
            }
        }
    };

    return (
        <>
            <div className="settings-background">
                <header className="settings-header">
                    <h1 className="settings-title">Ajustes</h1>
                </header>

                <div className="settings-container">
                    {saved === "saved" && <strong className="message-config message-success">Usuario Actualizado</strong>}
                    {saved === "error" && <strong className="message-config message-danger">Algo no funcionó correctamente</strong>}

                    <form className="settings-form" onSubmit={updateUser}>
                        <div className="form-field">
                            <label htmlFor="name">Nombre</label>
                            <input type="text" name="name" defaultValue={auth.name} />
                        </div>

                        <div className="form-field">
                            <label htmlFor="surname">Apellidos</label>
                            <input type="text" name="surname" defaultValue={auth.surname} />
                        </div>

                        <div className="form-field">
                            <label htmlFor="nick">Nick</label>
                            <input type="text" name="nick" defaultValue={auth.nick} />
                        </div>

                        <div className="form-field">
                            <label htmlFor="bio">Biografía</label>
                            <textarea name="bio" defaultValue={auth.bio} />
                        </div>

                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <input type="text" name="email" defaultValue={auth.email} />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Contraseña</label>
                            <input type="password" name="password" />
                        </div>

                        <div className="form-field">
                            <label htmlFor="file0">Avatar</label>
                            <div className="avatar-preview">
                                {auth.image && auth.image !== "default.png"
                                    ? (
                                        <img
                                            src={Global.url + "user/avatar/" + auth.image}
                                            className="avatar-img"
                                            alt="Foto de perfil"
                                        />
                                    )
                                    : (
                                        <img
                                            src={avatar}
                                            className="avatar-img"
                                            alt="Foto de perfil"
                                        />
                                    )
                                }
                            </div>
                            <br />
                            <input type="file" name="file0" id="file" />
                        </div>

                        <br />
                        <input type="submit" value="Actualizar datos" className="btn-success" />
                    </form>
                </div>
            </div>
        </>
    );
};
