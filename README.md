# E-Wallet Monorepo

Estructura unificada:
- `backend/`: API Express + MySQL
- `frontend/`: React + Vite

## Puesta en marcha rápida
1. Instala dependencias raíz (incluye concurrently):
   ```
   npm install
   ```
2. Backend: copia `backend/.env.example` a `backend/.env` y ajusta las credenciales MySQL si aplica.
3. Frontend: copia `frontend/.env.example` a `frontend/.env` si necesitas cambiar la URL del backend.
4. Levanta todo en una terminal desde la raíz:
   ```
   npm run dev
   ```
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5174

## Semilla de datos
El script SQL `backend/payment_wallet_db.sql` crea:
- Roles: admin (id=1), cliente (id=2)
- Usuario admin: `admin@ewallet.com` / `Admin123!`

## Notas
- Si otro proceso usa el puerto 5174, libera el puerto o ajusta `FRONTEND_ORIGINS` en el backend y el comando `npm run dev` en `package.json`.
