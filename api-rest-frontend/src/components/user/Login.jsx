import React, { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';

export const Login = () => {
    const { form, changed } = useForm({ email: '', password: '' });
    const [saved, setSaved] = useState('not_sended');
    const { setAuth } = useAuth();

    const loginUser = async e => {
        e.preventDefault();
        try {
            const response = await fetch(Global.url + 'user/login', {
                method: 'POST',
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.status === 'success') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuth(data.user);
                setSaved('login');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setSaved('error');
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch {
            setSaved('error');
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1 className="login-title">Login</h1>
                <br />
                {saved === 'login' && <div className="login-alert-success">Identificado Correctamente</div>}
                {saved === 'error' && <div className="login-alert-error">Algo no funcionó Correctamente</div>}

                <form onSubmit={loginUser} className="login-form">
                    <label htmlFor="email" className="login-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        className="login-input"
                        value={form.email}
                        onChange={changed}
                        required
                    />
                    <label htmlFor="password" className="login-label">Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className="login-input"
                        value={form.password}
                        onChange={changed}
                        required
                    />
                    <button type="submit" className="login-button">Identificate</button>
                </form>
            </div>
        </div>
    );
};
