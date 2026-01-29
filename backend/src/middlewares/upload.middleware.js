import multer from "multer";
import path from 'path';


// Configuración de almacenamiento en disco para Multer
const storage = multer.diskStorage({
    destination:  (req, file, cb) => {
        cb(null, '../uploads/documents/'); // Carpeta donde se guardaran los documentos
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + ' - ' + Math.round(Math.random() * 1E9) + ext;
        cb(null, uniqueName);
    }
});

// Filtro para solo aceptar PDFs
const fileFilter = (req, file, cb) => {
    const allowedDocType = /pdf/;
    const mime = allowedDocType.test(file.mimetype);
    const ext = allowedDocType.test(path.extname(file.originalname).toLocaleLowerCase());

    if (mime && ext) {
        return cb(null, true);
    }

    cb(new Error('Solo se permiten archivos PDF'));

};

export const upload = multer({storage, fileFilter});