import jwt from "jsonwebtoken";
import { verifyPassword } from "../services/user.service.js";
import { saveToken, deleteToken } from "../model/token.model.js";

export const login = async(req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const password = req.body.password || '';
        console.log("email", email);

        // Verifica credenciales contra la base de datos
        const user = await verifyPassword(email, password);
        console.log(user, " info auth controller js");
        
        if (!user) return res.status(401).json({ message: "Verifique sus credenciales" });

        // Crear token JWT con rol y estado
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol, estado: user.estado },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
        console.log("token", token);
        console.log("user", user);

        await saveToken(user.id, token);

        return res.json({ 
            message: "Inicio de sesión exitoso",
            token: token 
        });
    } catch (error) {
        return res
        .status(500)
        .json({ 
            message: "Ocurrió un error, por favor intenta de nuevo más tarde.",
            error: error 
        });
    }
};

export const logout = async(req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.status(401).json({ message: "Necesita autorización" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Formato de autorización inválido" });

        // Elimina el token de la lista de activos
        const tokenDeleted = await deleteToken(token);
        if(!tokenDeleted) return res.status(400).json({ message: "No se pudo cerrar la sesión. Token inválido." });

        return res.status(200).json({ message: "Sesión cerrada exitosamente" });
    } catch (error) {
        return res
        .status(500)
        .json({ 
            message: "Ocurrió un error, por favor intenta de nuevo más tarde.",
            error: error 
        });
    }
};