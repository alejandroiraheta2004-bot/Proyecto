import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cards, setCards] = useState([]);
  const [primaryCardId, setPrimaryCardId] = useState('');
  const [cardError, setCardError] = useState('');
  const [cardSuccess, setCardSuccess] = useState('');

  // Recupera datos básicos del perfil
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const [meRes, cardsRes] = await Promise.all([api.me(), api.myCards()]);
      const user = meRes?.data || meRes?.user || {};
      setName([user.name, user.lastname].filter(Boolean).join(' ') || user.nombre || '');
      setEmail(user.email || '');
      setPhone(user.telefono || '');
      const list = cardsRes?.data || cardsRes?.cards || [];
      setCards(list);
      setPrimaryCardId(user.primary_card_id ? String(user.primary_card_id) : '');
    } catch (err) {
      setError(err?.message || 'No se pudo cargar tu perfil');
      if (err?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Simula guardado de configuración
  const handleSave = (e) => {
    e.preventDefault();
    alert('Configuración guardada exitosamente');
  };

  const handlePrimaryCardSave = async (e) => {
    e.preventDefault();
    setCardError('');
    setCardSuccess('');
    if (!primaryCardId) {
      setCardError('Selecciona una tarjeta');
      return;
    }
    try {
      await api.setPrimaryCard({ cardId: Number(primaryCardId) });
      setCardSuccess('Tarjeta principal actualizada');
    } catch (err) {
      setCardError(err?.message || 'No se pudo actualizar la tarjeta');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <header className="flex items-center mb-6 w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
        <h1 className="text-2xl font-bold ml-auto text-gray-900">Configuración</h1>
      </header>

      <main className="w-full max-w-screen-xl mx-auto grid md:grid-cols-2 gap-6 px-2 md:px-0">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <img src="/assets/icon-user.svg" className="h-6" alt="" />
            Perfil
          </h2>
          
          {error && <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-3">{error}</div>}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-base text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors"
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Seguridad y Privacidad</h2>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold">Notificaciones</div>
                <div className="text-base text-gray-700">Recibe alertas de transacciones</div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-colors ${
                    notifications ? 'bg-sky-600' : 'bg-slate-300'
                  }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="font-semibold">Seguridad en dos Pasos</div>
                <div className="text-base text-gray-700">Mayor seguridad para tu cuenta</div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-14 h-8 rounded-full transition-colors ${
                    twoFactor ? 'bg-sky-600' : 'bg-slate-300'
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

        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <img src="/assets/icon-wallet.svg" className="h-6" alt="" />
            Tarjeta principal
          </h2>

          {cardError && <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-3">{cardError}</div>}
          {cardSuccess && <div className="text-base text-green-800 bg-green-50 border border-green-100 px-3 py-2 rounded-lg mb-3">{cardSuccess}</div>}

          <form onSubmit={handlePrimaryCardSave} className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-base text-gray-700 mb-2">Selecciona la tarjeta a mostrar</label>
              <select
                value={primaryCardId}
                onChange={(e) => setPrimaryCardId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              >
                <option value="">Selecciona una tarjeta</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id} disabled={card.estado === 0}>
                    {card.brand} •••• {card.last4} {card.estado === 0 ? '(Inactiva)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full md:w-fit bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors"
            >
              Guardar tarjeta principal
            </button>
          </form>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Acerca de</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-base text-gray-700">Versión</div>
              <div className="font-bold text-lg">1.1.0</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-base text-gray-700">Actualización</div>
              <div className="font-bold text-lg">Ene 2026</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-base text-gray-700">Soporte</div>
              <div className="font-bold text-lg text-sky-600">Centro de ayuda</div>
            </div>
          </div>
        </div>
      </main>

      <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
    </div>
  );
}
