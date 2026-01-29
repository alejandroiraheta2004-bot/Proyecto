import { AccessControl } from "accesscontrol";
import { doesRolDescriptionAlreadyExist } from '../services/rol.service.js';


const accesscontrol = new AccessControl();

accesscontrol
// Permisos por rol base
.grant('admin')
    .createAny('user')
    .deleteAny('user')
    .readAny('user')
    .updateAny('user')
.grant('manager')
.readAny('user')
// user rol permissions
.grant('user')
    .readOwn('user');

let permission = accesscontrol.can('user').readOwn('user');
console.log(permission.granted);
console.log(permission.attributes);

permission = accesscontrol.can('admin').updateAny('user');
console.log(permission.granted);
console.log(permission.attributes);


export const readUsersPermissionAccess = async (req, res, next) => {    

    try {
        console.log(" testing access middle ware readUsersPermission Access");
        
        // Confirma que el rol enviado exista
        const rol = await doesRolDescriptionAlreadyExist(req.body.rol); 
        console.log(rol, ' access control middleware');
               
        if (!rol) return res.status(403).json({message: "Usted no esta autorizado."});
        

        // Evalúa permiso para leer usuarios
        const permission = accesscontrol.can(req.body.rol).readAny('user');

        if (permission.granted) {
            next();
        } else {
            // resource is forbidden for the current user/roles
            res.status(403).json({
                message:"Accesso denegado, usted no tiene permiso para acceder a esta informacion, por favor contacte al administrador del sistema"
            }).end();
        }
        
    } catch (error) {
        res
        .status(500)
        .json({
            message: "Ocurrio un error",
            error: error
        });
    }

    
};

export const readUserPermissionAccess = (req, res, next) => {
    // Permiso de lectura sobre su propio recurso
    const permission = accesscontrol.can(req.body.rol).readOwn('user');

    if (!permission.granted) {
         res.status(403).json({
            message:"Accesso denegado, usted no tiene permiso para acceder a esta informacion, por favor contacte al administrador del sistema"
        }).end();
    }

    next();
}
