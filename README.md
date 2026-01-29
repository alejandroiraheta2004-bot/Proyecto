# E-Wallet Monorepo

Estructura unificada:
- `backend/`: API Express + MySQL
- `frontend/`: React + Vite

## Puesta en marcha rápida
1. Instala dependencias raíz (incluye concurrently):
   ```
   npm install
   ```
2. Backend: crear `backend/.env` (ya existe). Asegura `FRONTEND_ORIGIN=http://localhost:5173` y credenciales MySQL.
3. Frontend: en `frontend/.env` deja `VITE_API_URL=http://localhost:3000/api/v1`.
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
- Si otro proceso usa el puerto 5174, libera el puerto o ajusta `FRONTEND_ORIGIN` y el comando `npm run dev` en `package.json`.
