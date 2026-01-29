import jwt from "jsonwebtoken";
import { isTokenActive } from "../model/token.model.js";

export const verifyToken = async(req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        // Exige header Authorization con formato Bearer
        if (!authHeader) return res.status(401).json({ message: "Necesita autorización" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Formato de autorización inválido" });

        try {
            console.log("token", token);
            // Verifica que el token siga activo en la tabla de sesión
            const isActive = await isTokenActive(token);
            console.log("isActive", isActive);
            if(!isActive) return res.status(401).json({ message: "No está autorizado. Por favor inicie sesión nuevamente." });
            // Valida firma y exp expiración
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Token inválido o expirado ☺" });
        }
    } catch (error) {
        return res
        .status(500)
        .json({ 
            message: "Ocurrió un error, por favor intenta de nuevo más tarde.",
            error: error 
        });
    }
};

export const requireAdmin = (req, res, next) => {
    // Solo permite rol admin
    if (req.user?.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso solo para administradores' });
    }
    next();
};

export const requireActiveUser = (req, res, next) => {
    // Bloquea usuarios marcados como inactivos
    if (req.user?.estado === 0) {
        return res.status(403).json({ message: 'Cuenta bloqueada: no puede realizar movimientos' });
    }
    next();
};