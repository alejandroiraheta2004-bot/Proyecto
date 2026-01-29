import * as Transaction from '../model/transaction.model.js';

export const getTransactions = async (req, res) => {
    try {
        // Devuelve todas las transacciones registradas
        const transactions = await Transaction.getTransactions();
        res.status(200).json({
            message:"Transacciones obtenidas exitosamente",
            data:transactions
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar obtener las transacciones",
            error:error
        });
    }    
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.getTransaction(req.params.id);
    if (!transaction) res.status(201).json({message:"No existe esta transaccion en el sistema"})
    res.status(200).json({
        message:"Transaccion obtenida exitosamente",
        data:transaction
    });
  } catch (error) {
    res.status(500).json({
        message:"Ocurrio un error al intentar obtener la transaccion",
        error:error
    });
  }  
};

export const createTransaction = async (req, res) => {
    try {
        // Inserta una nueva transacción
        const result = Transaction.createTransaction(req.body)
        res.status(201).json({
            message:"Transaccion ha sido registrada exitosamente",
            data:result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar registrar la transaccion",
            error:error
        });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        // console.log(req.body, " con");
        // Actualiza campos dinámicamente según request
        const result = await Transaction.updateTransaction(req.params.id, req.body);
        res.status(200).json({
            message:"La transaccion fue actualizada exitosamente",
            data:result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar acualizar la trasaccion",
            error:error
        });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        // Elimina transacción por id
        const result = await Transaction.deleteTransaction(req.params.id);
        res.status(200).json({
            message:"Transaccion eliminada exitosamente",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message:"Ocurrio un error al intentar eliminar la transaccion",
            error:error
        });
    }
};