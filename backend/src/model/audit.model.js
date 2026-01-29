import pool from '../config/database.js';

export const getAudits = async () => {
    // Devuelve todas las auditorías
    const [rows] = await pool.query(`
        SELECT * FROM audits;
    `);

    return rows;
};

export const getAudit = async (id) => {
    // Busca auditoría por id
    const [rows] = await  pool.query(`
        SELECT * FROM audits
        WHERE id = "${id}";
    `);

    return rows[0];
};

export const createAudit = async (auditInfo) => {
    const {id_user, actions, ip, navegador} = auditInfo;   
    
    // Inserta registro de auditoría
    const result = await pool.query(`
        INSERT INTO audits (id_user, accion, ip, navegador)
        VALUES ("${id_user}", "${actions}", "${ip}", "${navegador}");   
    `);

    return result;
}

export const updateAudit = async (id, auditInfo) => {
    //  console.log('                   model audit', auditInfo, 'whattt???');
    const {field, value} = auditInfo;
   
    // Actualiza campo dinámico en auditoría
    const result = await pool.query(`
        UPDATE audits
        SET 
        ${field} = "${value}"
        WHERE id = "${id}";
    `);

    return result;
}

export const deleAudit = async ( id ) => {    
    // Elimina auditoría por id
    const result = await pool.query(`
        DELETE FROM audits
        WHERE id = "${id}";
    `);

    return result;
}