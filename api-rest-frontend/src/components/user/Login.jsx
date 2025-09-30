import React, { useState } from 'react';
import { useForm } from '../../hooks/useForm';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export const Login = () => {
    const { form, changed } = useForm({ email: '', password: '' });
    const [saved, setSaved] = useState('not_sended');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuth();

    const loginUser = async e => {
        e.preventDefault();
        setLoading(true);
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
            } else if (data.status === 'banned') {
                setSaved('banned');
                setTimeout(() => setSaved('not_sended'), 4000);
            } else {
                setSaved('error');
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch {
            setSaved('error');
            setTimeout(() => window.location.reload(), 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1 className="login-title">Login</h1>
                <br />
                {saved === 'login' && <div className="login-alert-success">Identificado Correctamente</div>}
                {saved === 'error' && <div className="login-alert-error">Algo no funcionó Correctamente</div>}
                {saved === 'banned' && (
                    <div className="login-alert-banned">
                        🚫 Tu cuenta ha sido baneada.
                        Si crees que es un error, contacta con soporte.
                    </div>
                )}

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
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="btn-loading-content">
                                <div className="spinner"></div> Cargando...
                            </div>
                        ) : (
                            'Identifícate'
                        )}
                    </button>


                </form>

                <div className="forgot-cta">
                    <p className="forgot-text">¿Problemas para entrar?</p>
                    <Link to="/forgot-password" className="forgot-btn">
                        Recuperar acceso
                    </Link>
                </div>

                <div className="register-cta">
                    <p className="register-text">Únete ahora y empieza a formar parte.</p>
                    <Link to="/registro" className="register-btn">
                        Regístrate
                    </Link>
                </div>

                <div className="report-cta">
                    <p className="report-text">¿Has visto contenido ilegal?</p>
                    <Link to="/report" className="report-btn">
                        Reportar ahora
                    </Link>
                </div>
            </div>
        </div>
    );
};
