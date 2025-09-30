import React, { useState, useRef, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { Global } from '../../helpers/Global';

export const Register = () => {
    const { form, changed } = useForm({});
    const [saved, setSaved] = useState("not_sended");

    const containerRef = useRef(null);
    const animFrame = useRef(null);

    // Posición actual y objetivo del degradado
    const pos = useRef({ x: 50, y: 50 });
    const target = useRef({ x: 50, y: 50 });

    // Animación suave
    const animate = () => {
        pos.current.x += (target.current.x - pos.current.x) * 0.03;
        pos.current.y += (target.current.y - pos.current.y) * 0.03;

        if (containerRef.current) {
            containerRef.current.style.background = `
        radial-gradient(circle at ${pos.current.x}% ${pos.current.y}%,
         #a8edea, #fed6e3, #c2e9fb, #d4fc79, #96e6a1
        )
      `;
        }

        animFrame.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        animate();
        return () => cancelAnimationFrame(animFrame.current);
    }, []);

    // Ratón dentro → seguir cursor
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        target.current.x = ((e.clientX - rect.left) / rect.width) * 100;
        target.current.y = ((e.clientY - rect.top) / rect.height) * 100;
    };

    // Ratón fuera → volver al centro
    const handleMouseLeave = () => {
        target.current.x = 50;
        target.current.y = 50;
    };

    // Guardar usuario
    const saveUser = async (e) => {
        e.preventDefault();
        let newUser = {
            ...form,
            email: form.email ? form.email.toLowerCase() : "",
            nick: form.nick ? form.nick.toLowerCase() : ""
        };

        const request = await fetch(Global.url + "user/register", {
            method: "POST",
            body: JSON.stringify(newUser),
            headers: { "Content-Type": "application/json" }
        });

        const data = await request.json();
        if (data.status === "success") {
            setSaved("saved");
            setTimeout(() => window.location.reload(), 5000);
        } else {
            setSaved("error");
            setTimeout(() => window.location.reload(), 5000);
        }
    };

    return (
        <div className="register-wrapper">
            <div
                className="register-container"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <h1 className="register-title">Registro</h1>

                {saved === "saved" && (
                    <div className="register-alert-success">Usuario registrado correctamente</div>
                )}
                {saved === "error" && (
                    <div className="register-alert-error">Algo no funcionó correctamente</div>
                )}

                <form className="register-form" onSubmit={saveUser}>
                    <div className="register-form-group">
                        <label className="register-label">Nombre</label>
                        <input type="text" name="name" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Apellidos</label>
                        <input type="text" name="surname" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Nick</label>
                        <input type="text" name="nick" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Email</label>
                        <input type="email" name="email" onChange={changed} className="register-input" required />
                    </div>

                    <div className="register-form-group">
                        <label className="register-label">Contraseña</label>
                        <input type="password" name="password" onChange={changed} className="register-input" required />
                    </div>

                    <button type="submit" className="register-button">Regístrate</button>
                </form>
            </div>
        </div>
    );
};
