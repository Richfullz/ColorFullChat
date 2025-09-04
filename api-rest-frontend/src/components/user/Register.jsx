import React, { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { Global } from '../../helpers/Global';

export const Register = () => {
    const { form, changed } = useForm({});
    const [saved, setSaved] = useState("not_sended");

    const saveUser = async (e) => {
        e.preventDefault();
        let newUser = {
            ...form,
            email: form.email ? form.email.toLowerCase() : "",
            nick: form.nick ? form.nick.toLowerCase() : ""
        };

        const request = await fetch(Global.url + "user/register", {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: { "Content-Type": "application/json" }
        });

        const data = await request.json();
        if (data.status === "success") {
            setSaved("saved");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            setSaved("error");
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <h1 className="register-title">Registro</h1>

                {saved === "saved" && (
                    <div className="register-alert-success">Usuario registrado correctamente</div>
                )}
                {saved === "error" && (
                    <div className="register-alert-error">Algo no funcionó correctamente</div>
                )}

                <form className="register-form" onSubmit={saveUser}>
                    <div className="register-form-group">
                        <label className="register-label">Nombre</label>
                        <input type="text" name="name" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Apellidos</label>
                        <input type="text" name="surname" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Nick</label>
                        <input type="text" name="nick" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Email</label>
                        <input type="email" name="email" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Contraseña</label>
                        <input type="password" name="password" onChange={changed} className="register-input" required />
                    </div>

                    <button type="submit" className="register-button">Regístrate</button>
                </form>
            </div>
        </div>
    );
};
