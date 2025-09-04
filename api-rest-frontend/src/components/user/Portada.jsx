import React from 'react'
import { Link } from 'react-router-dom'
import ilustracion from '../../assets/img/ilustracion.png';
export const Portada = () => {
    return (
        <div className="portada-grid">
            {/* Columna izquierda: texto y botones */}
            <div className="contenido-izquierda">
                <header>
                    <h1 className="titulo-portada">
                        Bienvenido a{' '}
                        <span className="rainbow-text">ColorFullchat</span>
                    </h1>

                    <p className='texto-social'>Conecta, comparte y vive nuevas experiencias.</p>
                </header>
                <div className="acciones">
                    <Link to="/login" className="btn btn-login">Iniciar sesión</Link>
                    <Link to="/registro" className="btn btn-register">Crear cuenta</Link>
                </div>
                <section className="caracteristicas">
                    <div className="card">
                        <i className="icon-chat" />
                        <h3>Chat en vivo</h3>
                        <p>Conecta en tiempo real con tus amigos.</p>
                    </div>
                    <div className="card">
                        <i className="icon-events" />
                        <h3>Eventos y citas</h3>
                        <p>Organiza y participa en actividades sociales.</p>
                    </div>
                    <div className="card">
                        <i className="icon-people" />
                        <h3>Conocer gente nueva</h3>
                        <p>Ampliar tu círculo social nunca fue tan fácil.</p>
                    </div>
                    <div className="card">
                        <i className="icon-music" />
                        <h3>Música compartida</h3>
                        <p>Disfruta y comparte tus playlists favoritas.</p>
                    </div>
                </section>
            </div>

            {/* Columna derecha: imagen o ilustración */}
            <div className="contenido-derecha">
                <img
                    src={ilustracion}
                    alt="Ilustración Chat ColorFullchat"
                    className="imagen-portada"
                />
            </div>
        </div>
    )
}
