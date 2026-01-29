import * as Audits from '../model/audit.model.js';

export const getAudits = async (req, res) => {    
    try {
        // Lista todas las auditorías
        const audits = await Audits.getAudits();
        res.status(200).json({
            message:"Auditorias obtenidas exitosamente",
            data:audits
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al internat obtener las auditorias",
            error:error
        });
    }
};

export const getAudit = async (req, res) => {
    try {
        const audit = await Audits.getAudit(req.params.id);

        if (!audit) return res.status(200).json({message:"La auditoria no se encontro en el sistema", data:audit});

        res.status(200).json({
            message:"La auditoria fue obtenida exitosamente",
            data:audit
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar obtener la auditoria en el sistema",
            error:error
        });
    }
};

export const createAudit = async (req, res)  => {
    try {
        // Registra evento de auditoría
        const result = await Audits.createAudit(req.body);
        res.status(201).json({
            message:"La auditoria fue creada exitosamente",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar crear la auditoria",
            error:error
        });
    }
};

export const updateAudit = async (req, res) => {
    try {
        const result = await Audits.updateAudit(req.params.id, req.body);
        res.status(200).json({
            message:"La auditoria fue actualizada exitosamente",
            data:result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar actualizar la auditoria",
            error:error
        });
    }
};

export const deleteAudit = async (req, res) => {
    try {
        // Elimina auditoría por id
        const result = await Audits.deleAudit(req.params.id);
        res.status(200).json({
            message:"La auditoria fue eliminada exitosamente",
            data:result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar eliminar la auditoria",
            error:error
        });
    }
};