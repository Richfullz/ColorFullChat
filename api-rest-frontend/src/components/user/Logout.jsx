import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth';

export const Logout = () => {
    const { setAuth, setCounters } = useAuth();
    const Navigate = useNavigate();
    useEffect(() => {
        //vaciar el localStorage
        localStorage.clear();
        //setear estados globales a vacio
        setAuth({});
        setCounters({});
        //Navigate(redirección) a login
        Navigate("/login");
    })
    return (
        <div>
            <h1>Cerrando Sesión...</h1>
        </div>
    )
}

