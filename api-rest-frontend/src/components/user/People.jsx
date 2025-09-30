import React, { useEffect, useState } from 'react'
import { Global } from '../../helpers/Global'
import { UserList } from './UserList'

export const People = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [more, setMore] = useState(true);
    const [following, setFollowing] = useState();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Normaliza texto: minúsculas + quita acentos
    const normalize = (s) =>
        s
            ? s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            : '';

    // Función que aplica el filtro sobre un array de usuarios
    const applyFilter = (usersArray, query) => {
        const q = normalize(query).trim();
        if (!q) return usersArray;
        return usersArray.filter((u) => {
            // Ajusta las propiedades según lo que devuelva tu API:
            // prueban con name / username / nick / fullname etc.
            return (
                normalize(u.name).includes(q) ||
                normalize(u.username).includes(q) ||
                normalize(u.nick).includes(q) ||
                normalize(u.fullname).includes(q)
            );
        });
    };

    useEffect(() => {
        getUsers(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-aplica el filtro cada vez que cambian users o search
    useEffect(() => {
        setFilteredUsers(applyFilter(users, search));
    }, [users, search]);

    const getUsers = async (nextPage = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${Global.url}user/list/${nextPage}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
            });

            const data = await response.json();

            if (data.status === "success" && Array.isArray(data.users)) {
                // Actualiza users de forma segura usando la versión previa
                setUsers((prev) => {
                    const updated = nextPage === 1 ? data.users : [...prev, ...data.users];

                    // Actualiza filteredUsers inmediatamente (por si hay texto en search)
                    setFilteredUsers(applyFilter(updated, search));

                    // Control simple de paginación usando data.total (si tu API lo proporciona)
                    if (typeof data.total === "number") {
                        if (updated.length >= data.total) setMore(false);
                        else setMore(true);
                    } else {
                        // fallback: si el backend no da total, si no han venido usuarios nuevos, no hay más.
                        setMore(data.users.length > 0);
                    }

                    return updated;
                });

                // actualiza followers
                setFollowing(data.user_following);
            } else {
                // Manejo simple de error/respuesta vacía
                if (nextPage === 1) {
                    setUsers([]);
                    setFilteredUsers([]);
                }
                setMore(false);
            }
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        // no hace falta filtrar aquí, lo hace el useEffect
    };

    return (
        <div>
            <div className="style-people">
                <header className="content__header">
                    <h1 className="content__title">Personas que quizás conozcas ⬇️</h1>
                </header>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={search}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                <UserList
                    users={filteredUsers}
                    getUsers={getUsers}
                    following={following}
                    setFollowing={setFollowing}
                    more={more}
                    loading={loading}
                    page={page}
                    setPage={setPage}
                />
            </div>
        </div>
    );
};
