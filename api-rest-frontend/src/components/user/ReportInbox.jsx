import React, { useEffect, useState } from "react";
import { Global } from "../../helpers/Global";

const ReportInbox = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtro unificado
    const [filters, setFilters] = useState({
        searchTerm: "",
        dateFilter: "all",
        stateFilter: "all",
        sortOrder: "newest"
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(Global.url + "report/reportAdm", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    }
                });
                const data = await res.json();
                if (data.status === "success") {
                    const initialReports = data.reports.map(r => ({
                        ...r,
                        status: r.status === "pending" ? "pendiente" : "revisado"
                    }));
                    setReports(initialReports);
                }
            } catch (error) {
                console.error("Error al cargar denuncias:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "pendiente" ? "revisado" : "pendiente";

        setReports(prev =>
            prev.map(r => r._id === id ? { ...r, status: newStatus } : r)
        );

        try {
            const token = localStorage.getItem("token");
            await fetch(`${Global.url}report/reportAdm/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ status: newStatus === "pendiente" ? "pending" : "reviewed" })
            });
        } catch (error) {
            console.error("Error actualizando estado:", error);
            setReports(prev =>
                prev.map(r => r._id === id ? { ...r, status: currentStatus } : r)
            );
        }
    };

    // Filtrar y ordenar
    const displayedReports = reports
        .filter(r => filters.stateFilter === "all" || r.status === filters.stateFilter)
        .filter(r => {
            const matchesSearch =
                r.reportedNick.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (r.reporterEmail && r.reporterEmail.toLowerCase().includes(filters.searchTerm.toLowerCase()));
            const now = new Date();
            let matchesDate = true;
            if (filters.dateFilter === "day") {
                matchesDate = new Date(r.createdAt).toDateString() === now.toDateString();
            } else if (filters.dateFilter === "month") {
                const d = new Date(r.createdAt);
                matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            } else if (filters.dateFilter === "year") {
                matchesDate = new Date(r.createdAt).getFullYear() === now.getFullYear();
            }
            return matchesSearch && matchesDate;
        })
        .sort((a, b) => filters.sortOrder === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );

    // Separar pendientes y revisadas
    const pendientes = displayedReports.filter(r => r.status === "pendiente");
    const revisadas = displayedReports.filter(r => r.status === "revisado");

    if (loading) return <p className="inbox-loading">Cargando denuncias...</p>;

    return (
        <div className="inbox-container">
            <div className="inbox-panel">
                <h1 className="inbox-title">📥 Bandeja de denuncias</h1>

                {/* Controles unificados */}
                <div className="inbox-controls">
                    <input
                        type="text"
                        placeholder="Buscar por usuario o correo..."
                        className="inbox-search"
                        value={filters.searchTerm}
                        onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
                    />
                    <select
                        className="inbox-filter"
                        value={filters.dateFilter}
                        onChange={e => setFilters({ ...filters, dateFilter: e.target.value })}
                    >
                        <option value="all">Todos</option>
                        <option value="day">Hoy</option>
                        <option value="month">Este mes</option>
                        <option value="year">Este año</option>
                    </select>
                    <select
                        className="inbox-filter"
                        value={filters.stateFilter}
                        onChange={e => setFilters({ ...filters, stateFilter: e.target.value })}
                    >
                        <option value="all">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="revisado">Revisados</option>
                    </select>
                    <select
                        className="inbox-filter"
                        value={filters.sortOrder}
                        onChange={e => setFilters({ ...filters, sortOrder: e.target.value })}
                    >
                        <option value="newest">Más recientes</option>
                        <option value="oldest">Más antiguas</option>
                    </select>
                </div>

                {/* Sección Pendientes */}
                {pendientes.length > 0 && (
                    <>
                        <h2 className="inbox-subtitle">Pendientes</h2>
                        <div className="inbox-grid">
                            {pendientes.map(report => (
                                <div key={report._id} className="inbox-card">
                                    <div className="inbox-card-body">
                                        <p className="inbox-text">
                                            <span className="inbox-label">👤 Usuario denunciado:</span> {report.reportedNick}
                                        </p>
                                        <p className="inbox-text">
                                            <span className="inbox-label">⚠️ Motivo:</span> {report.description}
                                        </p>
                                        {report.link && report.link.trim() !== "" && (
                                            <p className="inbox-text">
                                                <span className="inbox-label">🔗 Link:</span>{" "}
                                                <a href={report.link} target="_blank" rel="noreferrer" className="inbox-link">
                                                    {report.link}
                                                </a>
                                            </p>
                                        )}
                                        <p className="inbox-text">
                                            <span className="inbox-label">📧 Denunciante:</span> {report.reporterEmail || "No proporcionado"}
                                        </p>
                                        <p className="inbox-date">
                                            <span className="inbox-label">📅 Fecha:</span> {new Date(report.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="inbox-card-footer">
                                        <span className={`inbox-badge ${report.status}`}>
                                            Pendiente
                                        </span>
                                        <button
                                            className="inbox-action"
                                            onClick={() => toggleStatus(report._id, report.status)}
                                        >
                                            Marcar como revisado
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Sección Revisadas */}
                {revisadas.length > 0 && (
                    <>
                        <h2 className="inbox-subtitle">Revisadas</h2>
                        <div className="inbox-grid">
                            {revisadas.map(report => (
                                <div key={report._id} className="inbox-card">
                                    <div className="inbox-card-body">
                                        <p className="inbox-text">
                                            <span className="inbox-label">👤 Usuario denunciado:</span> {report.reportedNick}
                                        </p>
                                        <p className="inbox-text">
                                            <span className="inbox-label">⚠️ Motivo:</span> {report.description}
                                        </p>
                                        {report.link && report.link.trim() !== "" && (
                                            <p className="inbox-text">
                                                <span className="inbox-label">🔗 Link:</span>{" "}
                                                <a href={report.link} target="_blank" rel="noreferrer" className="inbox-link">
                                                    {report.link}
                                                </a>
                                            </p>
                                        )}
                                        <p className="inbox-text">
                                            <span className="inbox-label">📧 Denunciante:</span> {report.reporterEmail || "No proporcionado"}
                                        </p>
                                        <p className="inbox-date">
                                            <span className="inbox-label">📅 Fecha:</span> {new Date(report.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="inbox-card-footer">
                                        <span className={`inbox-badge ${report.status}`}>
                                            Revisado
                                        </span>
                                        <button
                                            className="inbox-action"
                                            onClick={() => toggleStatus(report._id, report.status)}
                                        >
                                            Marcar como pendiente
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportInbox;
