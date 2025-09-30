import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Global } from '../../../helpers/Global';

export const ReportForm = () => {
    const [form, setForm] = useState({ reportedNick: '', description: '', link: '', reporterEmail: '' });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState('not_sended');
    const navigate = useNavigate();

    const changed = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submitReport = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(Global.url + 'report', {
                method: 'POST',
                body: JSON.stringify(form),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setSaved('success');
                setForm({ reportedNick: '', description: '', link: '', reporterEmail: '' });
                setTimeout(() => navigate('/login'), 3000);
            } else if (response.status === 409) {
                setSaved('duplicate');
            } else {
                setSaved('error');
            }
        } catch (err) {
            setSaved('error');
        } finally {
            setLoading(false);
            setTimeout(() => setSaved('not_sended'), 4000);
        }
    };

    return (
        <div className='container-wrapper'>
            <div className="report-wrapper">
                <h2 className="report-title">Denunciar usuario</h2>

                {saved === 'success' && (
                    <div className="report-alert report-success">
                        ✅ Denuncia enviada correctamente. Redirigiendo a login...
                    </div>
                )}
                {saved === 'duplicate' && (
                    <div className="report-alert report-warning">
                        ⚠️ Ya has denunciado a este usuario recientemente.
                    </div>
                )}
                {saved === 'error' && (
                    <div className="report-alert report-error">
                        ❌ Error al enviar la denuncia.
                    </div>
                )}

                <form onSubmit={submitReport} className="report-form">
                    <div className="report-group">
                        <label htmlFor="reportedNick" className="report-label">Nick del usuario denunciado</label>
                        <input
                            type="text"
                            name="reportedNick"
                            id="reportedNick"
                            value={form.reportedNick}
                            onChange={changed}
                            required
                            className="report-input"
                        />
                    </div>

                    <div className="report-group">
                        <label htmlFor="description" className="report-label">Motivo de la denuncia</label>
                        <textarea
                            name="description"
                            id="description"
                            value={form.description}
                            onChange={changed}
                            required
                            className="report-textarea"
                        />
                    </div>

                    <div className="report-group">
                        <label htmlFor="link" className="report-label">Link de la publicación (opcional)</label>
                        <input
                            type="url"
                            name="link"
                            id="link"
                            value={form.link}
                            onChange={changed}
                            className="report-input"
                        />
                    </div>

                    <div className="report-group">
                        <label htmlFor="reporterEmail" className="report-label">Tu email (opcional)</label>
                        <input
                            type="email"
                            name="reporterEmail"
                            id="reporterEmail"
                            value={form.reporterEmail}
                            onChange={changed}
                            className="report-input"
                        />
                    </div>

                    <div className="report-cta">
                        <button type="submit" disabled={loading} className="report-button">
                            {loading ? "Enviando..." : "Enviar denuncia"}
                        </button>
                        <button type="button" className="report-button-login" onClick={() => navigate('/login')}>
                            Volver a Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
