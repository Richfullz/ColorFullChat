import React from "react";
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom';
import { PublicLayout } from "../components/layout/public/PublicLayout";
import { Login } from "../components/user/Login";
import { Register } from "../components/user/Register";
import { PrivateLayout } from "../components/layout/private/PrivateLayout";
import { Feed } from "../components/publication/Feed";
import { AuthProvider } from "../context/AuthProvider";
import { Logout } from "../components/user/Logout";
import { People } from "../components/user/People";
import { Config } from "../components/user/Config";
import { Chat } from "../components/user/Chat";
import { Music } from "../components/user/Music";
import { Citas } from "../components/user/Citas";
import { Events } from "../components/user/Events";
import { Following } from "../components/follow/Following";
import { Followers } from "../components/follow/Followers";
import { Profile } from "../components/user/Profile";
import { Portada } from "../components/user/Portada";
import Forgot from "../components/resetPassword/Forgot";
import Reset from "../components/resetPassword/Reset";
import Privacidad from "../components/user/Privacidad";
import { ConfigProfile } from "../components/user/ConfigProfile";
import ListSettings from "../components/user/ListSettings";
import Audit from "../components/user/Audit";
import { ReportForm } from "../components/layout/public/ReportForm";
import ReportInbox from "../components/user/ReportInbox";
import { Box } from "../components/user/Box";

export const Routing = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/" element={<PublicLayout />}>
                    {/* Ruta por defecto dentro del layout, muestra Portada */}
                    <Route index element={<Navigate to="portada" replace />} />
                    <Route index path="portada" element={<Portada />} />
                    <Route path="login" element={<Login />} />
                    <Route path="registro" element={<Register />} />
                    <Route path="/report" element={<ReportForm />} />
                    <Route path="forgot-password" element={<Forgot />} />
                    <Route path="reset-password/:token" element={<Reset />} />
                    {/* Redirección por si no coincide ninguna ruta */}
                    {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
                </Route>
                <Route path="/social" element={<PrivateLayout />}>
                    <Route index element={<Feed />} />
                    <Route path="feed" element={<Feed />} />
                    <Route path="logout" element={<Logout />} />
                    <Route path="gente" element={<People />} />
                    <Route path="ajustes" element={<Config />} />
                    <Route path="privacidad" element={<Privacidad />} />
                    <Route path="configProfile" element={<ConfigProfile />} />
                    <Route path="listSettings" element={<ListSettings />} />
                    <Route path="audit" element={<Audit />} />
                    <Route path="siguiendo/:userId" element={<Following />} />
                    <Route path="seguidores/:userId" element={<Followers />} />
                    <Route path="perfil/:userId" element={<Profile />} />
                    <Route path="reportInbox" element={<ReportInbox />} />
                    {/* extras */}
                    <Route path="box" element={<Box />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="music" element={<Music />} />
                    <Route path="citas" element={<Citas />} />
                    <Route path="events" element={<Events />} />
                </Route>
                <Route path="*" element={
                    <>
                        <h1>Error 404 Not Found</h1>
                        <p>
                            <Link to="/">Volver a inicio</Link>
                        </p>
                    </>
                } />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);
