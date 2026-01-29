import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Arranque del servidor Express
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));