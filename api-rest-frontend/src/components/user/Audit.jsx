import React, { useEffect, useState } from 'react';
import { Global } from '../../helpers/Global';


const Audit = () => {
    const [audits, setAudits] = useState([]);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetch(Global.url + "admin/audits", {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener auditoría");
                return res.json();
            })
            .then(data => setAudits(data.audits))
            .catch(err => console.error(err));
    }, []);

    const filteredAudits = audits.filter(a => filter === "all" || a.action === filter);

    return (
        <div className="audit-container">
            <div className='audit-table'>
                <h2 className="audit-title">Historial de perfiles</h2>

                <div className="audit-filters">
                    <button onClick={() => setFilter("all")} className="filter-btn filter-all">Todos</button>
                    <button onClick={() => setFilter("ban")} className="filter-btn filter-ban">Baneos</button>
                    <button onClick={() => setFilter("unban")} className="filter-btn filter-unban">Desbaneos</button>
                    <button onClick={() => setFilter("delete")} className="filter-btn filter-delete">Eliminaciones</button>
                </div>

                <table className="audit-table">
                    <thead>
                        <tr className="audit-table-header">
                            <th>Accion</th>
                            <th>Nombre</th>
                            <th>email</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAudits.map(audit => {
                            let rowClass = "audit-table-row";
                            if (audit.action === "delete") rowClass += " audit-delete";
                            if (audit.action === "ban") rowClass += " audit-ban";
                            if (audit.action === "unban") rowClass += " audit-unban";

                            return (
                                <tr key={audit._id} className={rowClass}>
                                    <td>{audit.action}</td>
                                    <td>
                                        {audit.action === "delete"
                                            ? audit.deletedNick || audit.deletedName
                                            : audit.targetUser?.nick || audit.targetUser?.name}
                                    </td>
                                    <td>
                                        {audit.action === "delete"
                                            ? audit.deletedEmail
                                            : audit.targetUser?.email}
                                    </td>

                                    <td>{new Date(audit.created_at).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>


                </table>
            </div>
        </div>
    )
}

export default Audit;
