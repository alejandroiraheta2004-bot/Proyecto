import {getRols, getRol, updateRol, createRol, deleteRol} from '../model/rol.model.js';

export const getAllRols = async (req, res) => {

    try {
        // Obtiene todos los roles disponibles
        const rols = await getRols();

        if ( !rols ) res.status(201).json({
            message:"No existe ningun rol todavia",
            data: rols
        });

        res.status(200).json({
            message: "Roles obtenidos exitosamente.",
            data: rols
        });
   } catch (error) {
      res.status(500).json({
        message:"Ocurrio un error al intentar obtener los roles",
        error:error
      });
   }
};

export const getSingleRol = async (req, res) => {
    try {
        const rol = await getRol(req.params.id);

        if (!rol) return res.status(201).json({
            message:"No existe en nuestro sistema",
            data: rol
        });

        res.json({
            message: 'Rol obtenido exitosamente.',
            data: rol
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar obtener el rol",
            error:error
        })
    }
};

export const creatNewRol = async (req, res) => {
    try {
        // Normaliza la descripción a minúsculas para evitar duplicados
        req.body.descripcion = req.body.descripcion.toLowerCase();
        const newRol = await createRol(req.body);      

        res.status(201).json({
            message:"Rol creado exitosamente",
            data:newRol
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar crear el rol",
            error:error
        });
    }
};

export const updateNowRol = async (req, res) => {
    try {
        // console.log( req.params.id, req.body, "test controller" );    
        const updatedRol = await updateRol( req.params.id, req.body );
        // console.log(updatedRol, "test controller");        

        res.status(200).json({
            message: "Rol actualizado exitosamente",
            data: updatedRol
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar acutalizar el rol",
            error:error
        });
    }
};

export const deleteNowRol = async (req, res) => {
    try {
        // Elimina rol por id
        const deletedRol = await deleteRol(req.params.id);
        res.status(200).json({
            message:"Rol eliminado exitosamente",
            data:deletedRol
        });
    } catch (error) {
        res.status(500).json({
            message: "Ocurrio un error al intentar eliminar el rol",
            error:error
        });
    }
};