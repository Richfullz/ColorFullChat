// Reset.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Reset = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Error al actualizar contraseña');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    return (
        <div className="reset-container">
            <div className="reset-card">
                {message && <p className="login-alert-success">{message}</p>}
                {error && <p className="login-alert-error">{error}</p>}
                <h2>Restablecer contraseña</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <input
                        type="password"
                        placeholder="Confirmar nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button type="submit">Actualizar contraseña</button>
                </form>

            </div>
        </div>
    );
};

export default Reset;
