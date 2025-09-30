import React, { useState } from 'react';

const Forgot = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setEmail('');
                setTimeout(() => setMessage(''), 3000)
            } else {
                setError(data.message || 'Error al enviar el correo');
                setTimeout(() => setError(''), 3000)
            }
        } catch (err) {
            setError('Error de conexión');
            setTimeout(() => setError(''), 3000)
        }
    };

    return (
        <div className="forgot-wrapper">

            <div className="forgot-container">
                {message && <div className="forgot-alert-success">{message}</div>}
                {error && <div className="forgot-alert-error">{error}</div>}
                <h2 className="forgot-title">Reestablecimiento de contraseña</h2>
                <p className="forgot-subtitle">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form className="forgot-form" onSubmit={handleSubmit}>
                    <div className="forgot-form-group">
                        <label className="forgot-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="forgot-input"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="forgot-button">
                        Enviar enlace
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Forgot;
