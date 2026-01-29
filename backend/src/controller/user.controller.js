import * as User from '../model/user.model.js';
import { generateUniqueAccountNumber } from '../services/user.service.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
    console.log(req.rol);
    
    try {
        // Lista todos los usuarios sin filtros
        const allUsers = await User.getUsers();
        // console.log(req.headers);
        
        res.status(200).json({
            message:"Usuarios obtenidos exitosamente",
            data: allUsers
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar obtener los usuarios",
            error:error
        });
    }
};

export const getSingleUser = async (req, res) => {
    try {
        const user = await User.getUser(req.params.id);

        if ( !user ) return res.status(200).json({message: "No se encotro el usuario"})

        res.status(200).json({
            message:"Usuario obtenido exitosamente",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message:"Usuario obtenido exitosamente",
            error:error
        });
    }
};

export const createNewUser = async (req, res) => {
    try {
        const { nombre, username, email, telefono, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();

        const accountNumber = await generateUniqueAccountNumber();

        // Encripta la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.createUser({
            id_rol: 2,
            nombre,
            username,
            account_number: accountNumber,
            email: normalizedEmail,
            telefono,
            password: hashedPassword,
            saldo_actual: 0,
            estado: 1
        });

        res.status(201).json({
            message:"Usuario creado exitosamente",
            data:{
                id: user?.[0]?.insertId,
                nombre,
                username,
                account_number: accountNumber,
                email: normalizedEmail
            }
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar crear el usuario",
            error:error
        });
    }
}

export const updateUser = async (req, res) => {
    try {
        const result = User.updateUser(req.params.id, req.body);
        res.status(200).json({
            message:"Usuario actualizado exsitosamente",
            data:result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar actualizar el usuario",
            error:error
        });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        if (estado !== 0 && estado !== 1 && estado !== '0' && estado !== '1') {
            return res.status(400).json({ message: 'Estado inválido, use 1 (activo) o 0 (bloqueado).' });
        }
        const normalized = Number(estado) === 1 ? 1 : 0;
        // Cambia flag de estado del usuario
        const result = await User.updateUserStatus(req.params.id, normalized);
        res.status(200).json({
            message: normalized === 1 ? 'Usuario activado' : 'Usuario bloqueado',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message: 'Ocurrió un error al actualizar el estado del usuario',
            error
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const result = User.deleteUser(req.params.id);
        res.status(200).json({
            message:"Usuario eliminado exitosamente",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar eliminar el usuario",
            error:error
        });
    }
};