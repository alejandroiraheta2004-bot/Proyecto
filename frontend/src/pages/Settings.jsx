import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import ModalConfirm from '../components/ModalConfirm';
import AlertMessage from '../components/AlertMessage';

export default function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cards, setCards] = useState([]);
  const [primaryCardId, setPrimaryCardId] = useState('');
  const [cardError, setCardError] = useState('');
  const [cardSuccess, setCardSuccess] = useState('');
  const [alert, setAlert] = useState({ type: 'info', message: '' });
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'primary',
    onConfirm: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

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
  const openConfirm = (config) => {
    setConfirmConfig({
      open: true,
      title: config.title,
      description: config.description,
      confirmText: config.confirmText || 'Confirmar',
      variant: config.variant || 'primary',
      onConfirm: config.onConfirm
    });
  };

  const handleConfirm = async () => {
    if (!confirmConfig.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmConfig.onConfirm();
    } finally {
      setConfirmLoading(false);
      setConfirmConfig((prev) => ({ ...prev, open: false }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    openConfirm({
      title: 'Guardar cambios de perfil',
      description: 'Se actualizarán tus datos personales. ¿Deseas continuar?',
      confirmText: 'Guardar',
      onConfirm: async () => {
        setAlert({ type: 'success', message: 'Perfil actualizado correctamente.' });
        setIsEditing(false);
      }
    });
  };

  const handleEditProfile = () => {
    openConfirm({
      title: 'Editar perfil',
      description: 'Se habilitará la edición de tus datos personales.',
      confirmText: 'Editar',
      onConfirm: async () => {
        setIsEditing(true);
        setAlert({ type: 'info', message: 'Edición habilitada. Actualiza tus datos y guarda los cambios.' });
      }
    });
  };

  const handleNotificationPreferences = () => {
    openConfirm({
      title: 'Preferencias de notificaciones',
      description: 'Se guardarán tus preferencias de notificación actuales.',
      confirmText: 'Guardar',
      onConfirm: async () => {
        setAlert({ type: 'success', message: 'Preferencias guardadas correctamente.' });
      }
    });
  };

  const handlePrimaryCardSave = async (e) => {
    e.preventDefault();
    setCardError('');
    setCardSuccess('');
    if (!primaryCardId) {
      setCardError('Selecciona una tarjeta');
      return;
    }
    openConfirm({
      title: 'Actualizar tarjeta principal',
      description: 'Se cambiará la tarjeta principal que se muestra en tu cuenta.',
      confirmText: 'Actualizar',
      onConfirm: async () => {
        try {
          await api.setPrimaryCard({ cardId: Number(primaryCardId) });
          setCardSuccess('Tarjeta principal actualizada');
        } catch (err) {
          setCardError(err?.message || 'No se pudo actualizar la tarjeta');
        }
      }
    });
  };

  const handleToggleNotifications = () => {
    openConfirm({
      title: notifications ? 'Desactivar notificaciones' : 'Activar notificaciones',
      description: notifications
        ? 'Dejarás de recibir alertas de transacciones.'
        : 'Recibirás alertas de transacciones importantes.',
      confirmText: notifications ? 'Desactivar' : 'Activar',
      onConfirm: async () => {
        setNotifications(!notifications);
        setAlert({ type: 'success', message: 'Preferencias de notificación actualizadas.' });
      }
    });
  };

  const handleToggleTwoFactor = () => {
    openConfirm({
      title: twoFactor ? 'Desactivar seguridad en dos pasos' : 'Activar seguridad en dos pasos',
      description: twoFactor
        ? 'Se desactivará la autenticación de dos pasos para tu cuenta.'
        : 'Se activará la autenticación de dos pasos para tu cuenta.',
      confirmText: twoFactor ? 'Desactivar' : 'Activar',
      onConfirm: async () => {
        setTwoFactor(!twoFactor);
        setAlert({ type: 'success', message: 'Configuración de seguridad actualizada.' });
      }
    });
  };

  const handleChangePassword = () => {
    openConfirm({
      title: 'Cambiar contraseña',
      description: 'Se enviará un enlace o código para actualizar tu contraseña. ¿Deseas continuar?',
      confirmText: 'Enviar',
      onConfirm: async () => {
        setAlert({ type: 'success', message: 'Se enviaron instrucciones para cambiar tu contraseña.' });
      }
    });
  };

  const handleSessionHistory = () => {
    openConfirm({
      title: 'Consultar historial de sesiones',
      description: 'Se actualizará el historial de sesiones recientes en tu cuenta.',
      confirmText: 'Actualizar',
      onConfirm: async () => {
        setAlert({ type: 'info', message: 'Historial de sesiones actualizado.' });
      }
    });
  };

  const handleDeleteAccount = () => {
    openConfirm({
      title: 'Eliminar cuenta',
      description: 'Se iniciará el proceso de eliminación de tu cuenta. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        setAlert({ type: 'warning', message: 'Tu solicitud de eliminación fue enviada.' });
      }
    });
  };

  const handleLogout = () => {
    openConfirm({
      title: 'Cerrar sesión',
      description: 'Se cerrará tu sesión actual. ¿Deseas continuar?',
      confirmText: 'Cerrar sesión',
      onConfirm: async () => {
        localStorage.removeItem('token');
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <ModalConfirm
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />
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
          
          <div className="space-y-2 mb-3">
            {alert.message && (
              <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />
            )}
            {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-base text-gray-700 mb-2">Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading || !isEditing}
              />
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading || !isEditing}
              />
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading || !isEditing}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={handleEditProfile}
                className="flex-1 bg-slate-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                disabled={loading}
              >
                Editar perfil
              </button>
              <button
                type="submit"
                className="flex-1 bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors disabled:opacity-60"
                disabled={loading || !isEditing}
              >
                {loading ? 'Cargando...' : 'Guardar Cambios'}
              </button>
            </div>
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
                onClick={handleToggleNotifications}
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
                <div className="font-semibold">Seguridad en dos pasos</div>
                <div className="text-base text-gray-700">Mayor seguridad para tu cuenta</div>
              </div>
              <button
                onClick={handleToggleTwoFactor}
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
              <button
                type="button"
                onClick={handleNotificationPreferences}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base"
              >
                Preferencias de notificaciones
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base"
              >
                Cambiar contraseña
              </button>
              <button
                type="button"
                onClick={handleSessionHistory}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base"
              >
                Historial de sesiones
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors font-semibold text-red-600"
              >
                Eliminar cuenta
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base text-sky-700"
              >
                Cerrar sesión
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
              <div className="font-bold text-lg">1.2.0</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-base text-gray-700">Actualización</div>
              <div className="font-bold text-lg">Feb 2026</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-base text-gray-700">Soporte</div>
              <div className="font-bold text-lg text-sky-600">Centro de ayuda</div>
            </div>
          </div>
        </div>
      </main>

      <div className="text-sm text-gray-700 text-center mt-6">© 2026 Billetera digital</div>
    </div>
  );
}
