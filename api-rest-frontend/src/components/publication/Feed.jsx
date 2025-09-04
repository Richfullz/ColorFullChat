import React, { useEffect, useState } from 'react';
import avatar from '../../assets/img/user.png';
import { Link, useParams } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { PublicationList } from '../publication/PublicationList';

export const Feed = () => {
    const { auth } = useAuth();
    const [counters, setCounters] = useState({});
    const [publications, setPublications] = useState([]);
    const [page, setPage] = useState(1);
    const [more, setMore] = useState(true);
    const params = useParams();

    useEffect(() => {
        // Reiniciar estado cuando se monta o cambia userId
        setPublications([]);
        setPage(1);
        setMore(true);
        getPublications(1, false);
    }, [params.userId]); // Dependencia para recargar al cambiar usuario

    const getPublications = async (nextPage = 1, showNews = false) => {
        if (showNews) {
            setPublications([]);
            setPage(1);
            nextPage = 1;
        }
        const token = localStorage.getItem("token");
        const request = await fetch(Global.url + "publication/feed/" + nextPage, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });
        const data = await request.json();

        if (data.status === "success") {
            let newPublications = data.publications;

            if (showNews && nextPage > 1) {

                newPublications = [...publications, ...data.publications];
            }

            setPublications(newPublications);
            if (!showNews && publications.length >= (data.local - data.publications.length)) {
                setMore(false)
            }
            if (data.pages <= nextPage) {
                // Si la página actual es la última, no hay más para cargar
                setMore(false);
            }
        }
    };

    const loadMore = () => {
        let next = page + 1;
        setPage(next);
        getPublications(next);
    };

    return (
        <>
            <header className="content__header">
                <h1 className="content__title">Timeline</h1>
                {/* Aquí el botón puede servir para recargar o verificar nuevas publicaciones */}
                <button className="content__button" onClick={() => getPublications(1, true)}>Mostrar nuevas</button>
            </header>

            <PublicationList
                publications={publications}
                setPublications={setPublications}
                getPublications={getPublications}
                page={page}
                setPage={setPage}
                more={more}
                setMore={setMore}
                counters={counters}
                setCounters={setCounters}
                loadMore={loadMore}
            />
        </>
    );
};
