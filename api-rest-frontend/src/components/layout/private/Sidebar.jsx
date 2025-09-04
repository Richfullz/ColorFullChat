import React, { useState } from 'react';
import avatar from "../../../assets/img/user.png";
import useAuth from '../../../hooks/useAuth';
import { Global } from '../../../helpers/Global';
import { Link } from 'react-router-dom';
import { useForm } from '../../../hooks/useForm';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
    const { auth, counters, incrementPublications } = useAuth();
    const { form, changed, setForm } = useForm({ text: '' });
    const [stored, setStored] = useState("not_stored");
    const [file, setFile] = useState(null);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const savePublication = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const newPublication = { ...form, user: auth._id };

        const request = await fetch(Global.url + "publication/save", {
            method: "POST",
            body: JSON.stringify(newPublication),
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            }
        });

        const data = await request.json();

        if (data.status === "success") {
            if (file) {
                const formData = new FormData();
                formData.append("file0", file);
                const uploadRequest = await fetch(Global.url + 'publication/upload/' + data.publicationStored._id, {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Authorization": token,
                    }
                });
                const uploadData = await uploadRequest.json();

                if (uploadData.status === "success") {
                    setStored("stored");
                    incrementPublications();
                    setForm({ text: '' });
                    setFile(null);
                    document.getElementById("file").value = "";
                    setTimeout(() => setStored("not_stored"), 1000);
                } else {
                    setStored("error");
                    setTimeout(() => setStored("not_stored"), 1000);
                }
            } else {
                setStored("stored");
                incrementPublications();
                setForm({ text: '' });
                setTimeout(() => setStored("not_stored"), 1000);
            }
        } else {
            setStored("error");
        }
    };

    return (
        <aside className="layout__aside">
            <header className="aside__header">
                <h1 className="aside__title">Hola, {auth.name}</h1>
            </header>

            <div className="aside__container">
                <div className="aside__profile-info">
                    <div className="general-info__container-avatar">
                        {(auth.image && auth.image !== "default.png")
                            ? <img src={Global.url + "user/avatar/" + auth.image} className="container-avatar__img" alt="Foto de perfil" />
                            : <img src={avatar} className="container-avatar__img" alt="Foto de perfil" />
                        }
                    </div>

                    <div className="general-info__container-names">
                        <NavLink to={"/social/perfil/" + auth._id} className='container-names__name'>{auth.name} {auth.surname}</NavLink>
                        <p className="container-names__nickname">{auth.nick}</p>
                    </div>

                    <div className="profile-info__stats">
                        <div className="stats__following">
                            <Link to={"/social/siguiendo/" + auth._id} className="following__link">
                                <span className="following__title">Siguiendo</span>
                                <span className="following__number">{counters.following}</span>
                            </Link>
                        </div>
                        <div className="stats__following">
                            <Link to={"/social/seguidores/" + auth._id} className="following__link">
                                <span className="following__title">Seguidores</span>
                                <span className="following__number">{counters.followed}</span>
                            </Link>
                        </div>
                        <div className="stats__following">
                            <NavLink to={"/social/perfil/" + auth._id} className="following__link">
                                <span className="following__title">Publicaciones</span>
                                <span className="following__number">{counters.publications}</span>
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className="aside__container-form">
                    {stored === "stored" && <strong className='alert alert-success'>Publicación creada</strong>}
                    {stored === "error" && <strong className='alert alert-danger'>No se publicó nada</strong>}

                    <form className="container-form__form-post" onSubmit={savePublication}>
                        <div className="form-post__inputs">
                            <label htmlFor="text" className="form-post__label">¿Qué estás pensando hoy?</label>
                            <textarea
                                name="text"
                                className="form-post__textarea"
                                onChange={changed}
                                value={form.text || ''}
                            />
                        </div>
                        <div className="form-post__inputs">
                            <label htmlFor="file" className="form-post__label">Sube tu foto</label>
                            <input
                                type="file"
                                id="file"
                                name="file0"
                                className="form-post__image"
                                onChange={onFileChange}
                                accept="image/*"
                            />
                        </div>

                        <input type="submit" value="Enviar" className="form-post__btn-submit" />
                    </form>
                </div>
            </div>
        </aside>
    );
};
