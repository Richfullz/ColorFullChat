import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import useAuth from '../../../hooks/useAuth'

export const PrivateLayout = () => {
    const { auth, loading } = useAuth();

    if (loading) {
        return <div className="loading-container">
            <h1 className="loading-rainbow">Cargando...</h1>
        </div>
    } else {
        return (
            <div className="layout">
                {/* Layout */}
                <Header />

                {/* Contenido Principal */}
                <section className="layout__content">
                    {auth._id ?
                        <Outlet /> :
                        <Navigate to="/login" />
                    }

                </section>

                {/* Barra Lateral */}
                <Sidebar />
            </div>
        )
    }
}

