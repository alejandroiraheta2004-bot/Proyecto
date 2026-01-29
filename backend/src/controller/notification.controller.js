import * as Notification from '../model/notification.model.js';

export const getNotifications = async (req, res) => {
    try {
        // Lista todas las notificaciones
        const notifications = await Notification.getNotifications();
        res.status(200).json({
            message:"Notificaciones obtenidas exitosamente",
            data:notifications
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrion un error al intentar obtener las notificaciones",
            error:error
        });
    }
};

export const getNotification = async (req, res) => {
    try {
        console.log(req.params.id, 't');
        
        const notification = await Notification.getNotification(req.params.id);
        if (!notification) res.status(200).json({message:"No existe esa notificacion en el sistema", data: notification});
        res.status(200).json({
            message:"Noficacion obtenida exitosamente",
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar obtener la notificacion",
            error:error
        });
    }
};

export const createNotification = async (req, res) => {
    try {
        // Registra una nueva notificación
        const newNotification = await Notification.createNotification(req.body);
        res.status(201).json({
            message: "La notification se creo exitosamente",
            data: newNotification
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar crear la notification",
            error:error
        });
    }
};

export const updateNotification = async (req, res) => {
    try {
        const notificacion = await Notification.updateNotification(req.params.id, req.body);
        res.status(200).json({
            message:"La notification fue actualizada exitosamente",
            data: notificacion
        })
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar actualizar la notication",
            error:error
        });
    }
}

export const deleteNofication = async (req, res) => {
    try {
        // Elimina notificación por id
        const result = await Notification.deleteNofication(req.params.id);
        res.status(200).json({
            message: "La notification ha sido eliminada exitosamente",
            data:result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar eliminar la notification",
            error:error
        });
    }
};