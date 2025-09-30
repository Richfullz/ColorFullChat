import React, { useState, useEffect, useRef } from 'react';
import { Global } from '../../helpers/Global';
import Swal from 'sweetalert2';

const ListSettings = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortOption, setSortOption] = useState("");
    const token = localStorage.getItem("token");
    const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
    const topRef = useRef(null);

    const normalize = (s) =>
        s ? s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

    const applyFilters = (usersArray) => {
        let filtered = [...usersArray];

        const q = normalize(search).trim();
        if (q) {
            filtered = filtered.filter(u =>
                normalize(u.name).includes(q) ||
                normalize(u.surname).includes(q) ||
                normalize(u.nick).includes(q)
            );
        }

        if (filterStatus === "active") filtered = filtered.filter(u => !u.banned);
        else if (filterStatus === "banned") filtered = filtered.filter(u => u.banned);

        if (sortOption === "banned") filtered.sort((a, b) => (b.banned ? 1 : 0) - (a.banned ? 1 : 0));
        else if (sortOption === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortOption === "nick") filtered.sort((a, b) => a.nick.localeCompare(b.nick));

        return filtered;
    };

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const allUsers = [];
                let currentPage = 1;
                let more = true;
                while (more) {
                    const res = await fetch(`${Global.url}user/list/${currentPage}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json", "Authorization": token }
                    });
                    const data = await res.json();
                    if (data.status === "success") {
                        const filteredPage = data.users.filter(u => u._id !== currentUserId);
                        allUsers.push(...filteredPage);
                        more = filteredPage.length === 5;
                        currentPage++;
                    } else {
                        more = false;
                    }
                }
                setUsers(allUsers);
            } catch (err) {
                console.error("Error cargando usuarios:", err);
            }
        };
        fetchAllUsers();
    }, [token, currentUserId]);

    useEffect(() => {
        setFilteredUsers(applyFilters(users));
    }, [users, search, filterStatus, sortOption]);

    const scrollToTop = () => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Banear usuario
    const banUser = async (id, name) => {
        const confirm = await Swal.fire({
            title: `¿Seguro de banear a ${name}?`,
            html: `El usuario será baneado y no podrá acceder a la plataforma.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, banear",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ff416c",
            cancelButtonColor: "#8e2de2",
            customClass: {
                title: 'swal2-title-lg-listSettings',
                htmlContainer: 'swal2-text-lg-listSettings',
                confirmButton: 'swal2-btn-lg-listSettings',
                cancelButton: 'swal2-btn-lg-listSettings'
            }
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${Global.url}admin/ban/${id}`, { method: "PUT", headers: { Authorization: token } });
            const data = await res.json();
            if (data.status === "success") {
                setUsers(users.map(u => u._id === id ? { ...u, banned: true } : u));
                Swal.fire({
                    icon: "success",
                    title: "Usuario baneado",
                    html: `${name} ha sido baneado correctamente.`,
                    timer: 1800,
                    showConfirmButton: false,
                    customClass: {
                        title: 'swal2-title-lg-admin',
                        htmlContainer: 'swal2-text-lg-admin'
                    }
                });
            }
        } catch (err) { console.error(err); }
    };

    // Desbanear usuario
    const unbanUser = async (id, name) => {
        const confirm = await Swal.fire({
            title: `¿Seguro de desbanear a ${name}?`,
            html: `El usuario recuperará acceso a la plataforma.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, desbanear",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#8e2de2",
            cancelButtonColor: "#ff416c",
            customClass: {
                title: 'swal2-title-lg-listSettings',
                htmlContainer: 'swal2-text-lg-listSettings',
                confirmButton: 'swal2-btn-lg-listSettings',
                cancelButton: 'swal2-btn-lg-listSettings'
            }
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${Global.url}admin/unban/${id}`, { method: "PUT", headers: { Authorization: token } });
            const data = await res.json();
            if (data.status === "success") {
                setUsers(users.map(u => u._id === id ? { ...u, banned: false } : u));
                Swal.fire({
                    icon: "success",
                    title: "Usuario desbaneado",
                    html: `${name} ha recuperado acceso correctamente.`,
                    timer: 1800,
                    showConfirmButton: false,
                    customClass: {
                        title: 'swal2-title-lg-listSettings',
                        htmlContainer: 'swal2-text-lg-listSettings',
                        confirmButton: 'swal2-btn-lg-listSettings',
                        cancelButton: 'swal2-btn-lg-listSettings'
                    }
                });
            }
        } catch (err) { console.error(err); }
    };

    // Eliminar usuario
    const deleteUser = async (id, name) => {
        const confirm = await Swal.fire({
            title: `¿Seguro de eliminar a ${name}?`,
            html: `Esta acción es irreversible y eliminará todos los datos del usuario.`,
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ff416c",
            cancelButtonColor: "#8e2de2",
            customClass: {
                title: 'swal2-title-lg-listSettings',
                htmlContainer: 'swal2-text-lg-listSettings',
                confirmButton: 'swal2-btn-lg-listSettings',
                cancelButton: 'swal2-btn-lg-listSettings'
            }
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`${Global.url}admin/delete/${id}`, { method: "DELETE", headers: { Authorization: token } });
            const data = await res.json();
            if (data.status === "success") {
                setUsers(users.filter(u => u._id !== id));
                Swal.fire({
                    icon: "success",
                    title: "Usuario eliminado",
                    html: `${name} ha sido eliminado correctamente.`,
                    timer: 1800,
                    showConfirmButton: false,
                    customClass: {
                        title: 'swal2-title-lg-admin',
                        htmlContainer: 'swal2-text-lg-admin'
                    }
                });
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="settings-background-list" ref={topRef}>
            <div className="container-list">
                <header className="settings-header">
                    <h1 className="settings-title">Nuestros Usuarios</h1>
                </header>

                <div className="filters-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-buttons">
                        <button className='filter-btn-list' onClick={() => setFilterStatus("all")}>Todos</button>
                        <button className='filter-btn-list' onClick={() => setFilterStatus("active")}>Activos</button>
                        <button className='filter-btn-list' onClick={() => setFilterStatus("banned")}>Baneados</button>
                        <select className='filter-btn-list' value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="">Ordenar por</option>
                            <option value="banned">Baneados</option>
                            <option value="name">Nombre</option>
                            <option value="nick">Nick</option>
                        </select>
                    </div>
                </div>

                <div className="cards-list">
                    {filteredUsers.map(user => (
                        <div key={user._id} className={`user-list ${user.banned ? 'banned' : 'active'}`}>
                            <div className="user-info">
                                <h2>{user.name} {user.surname}</h2>
                                <p className='subuser-list'><b>Nick:</b> {user.nick}</p>
                            </div>
                            <div className="user-actions">
                                {user.banned ? (
                                    <button className="unban-btn" onClick={() => unbanUser(user._id, user.name)}>Desbanear🧭</button>
                                ) : (
                                    <button className="ban-btn" onClick={() => banUser(user._id, user.name)}>Banear 🚨</button>
                                )}
                                <button className="delete-btn" onClick={() => deleteUser(user._id, user.name)}>Eliminar 🔴</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='boton-list-settings'>
                    <button className='boton-settings-list' onClick={scrollToTop}>⬆️ Arriba</button>
                </div>
            </div>
        </div>
    );
};

export default ListSettings;
