import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Settings() {
  const [name, setName] = useState('Juan Pérez');
  const [email, setEmail] = useState('juan.perez@email.com');
  const [phone, setPhone] = useState('+503 0000-0000');
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="min-h-screen p-7">
      <header className="flex items-center mb-6 max-w-4xl mx-auto">
        <Link to="/dashboard">
          <img src="/assets/logo.svg" alt="E_Wallet Logo" className="h-12" />
        </Link>
        <h1 className="text-2xl font-bold ml-6">Configuración</h1>
      </header>

      <main className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <img src="/assets/icon-user.svg" className="h-6" alt="" />
            Perfil
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Seguridad y Privacidad</h2>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold">Notificaciones</div>
                <div className="text-sm text-muted">Recibe alertas de transacciones</div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  notifications ? 'bg-accent' : 'bg-slate-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold">Autenticación de dos factores</div>
                <div className="text-sm text-muted">Mayor seguridad para tu cuenta</div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  twoFactor ? 'bg-accent' : 'bg-slate-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  twoFactor ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base">
                Cambiar contraseña
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base">
                Historial de sesiones
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors font-semibold text-red-600">
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Acerca de</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-muted">Versión de la App</div>
              <div className="font-bold text-lg">1.0.0</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-muted">Última actualización</div>
              <div className="font-bold text-lg">Dic 2025</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-muted">Soporte</div>
              <div className="font-bold text-lg text-accent">Contactar</div>
            </div>
          </div>
        </div>
      </main>

      <div className="text-xs text-muted text-center mt-6">© 2025 E_Wallet</div>
    </div>
  );
}
