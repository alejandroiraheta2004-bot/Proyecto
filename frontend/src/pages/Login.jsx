import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';
import ModalConfirm from '../components/ModalConfirm';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState('email');
  const [recoveryContact, setRecoveryContact] = useState('');
  const [recoveryStep, setRecoveryStep] = useState('method');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryAlert, setRecoveryAlert] = useState({ type: 'info', message: '' });
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'primary',
    onConfirm: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const knownAccounts = {
    emails: ['demo@wallet.com', 'juan.perez@email.com'],
    phones: ['+503 7000-0000', '+503 0000-0000']
  };

  // Actualiza campos controlados
  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Envía credenciales al backend y guarda el token
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Error de datos, compruebe la información');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSendRecoveryCode = () => {
    setRecoveryError('');
    setRecoveryAlert({ type: 'info', message: '' });
    const value = recoveryContact.trim();
    const isValid = recoveryMethod === 'email'
      ? knownAccounts.emails.includes(value)
      : knownAccounts.phones.includes(value);

    if (!value) {
      setRecoveryError('Ingresa tu correo o teléfono');
      return;
    }
    if (!isValid) {
      setRecoveryError('No encontramos una cuenta asociada con ese dato.');
      return;
    }
    setRecoveryStep('verify');
    setRecoveryAlert({ type: 'success', message: 'Código enviado. Revisa tu bandeja o mensajes.' });
  };

  const handleUpdatePassword = () => {
    setRecoveryError('');
    if (!verificationCode.trim()) {
      setRecoveryError('Ingresa el código de verificación');
      return;
    }
    if (verificationCode.trim() !== '123456') {
      setRecoveryError('El código ingresado no es válido');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setRecoveryError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    openConfirm({
      title: 'Actualizar contraseña',
      description: 'Se actualizará tu contraseña de acceso. ¿Deseas continuar?',
      confirmText: 'Actualizar',
      onConfirm: async () => {
        setRecoveryAlert({ type: 'success', message: 'Contraseña actualizada correctamente.' });
        setRecoveryStep('method');
        setRecoveryContact('');
        setVerificationCode('');
        setNewPassword('');
        setTimeout(() => setRecoveryOpen(false), 1200);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
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

      {recoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRecoveryOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Recuperar contraseña</h4>
            <p className="text-gray-700 mb-4">Selecciona el método de recuperación y sigue los pasos.</p>

            {recoveryAlert.message && (
              <div className="mb-3">
                <AlertMessage type={recoveryAlert.type} message={recoveryAlert.message} onClose={() => setRecoveryAlert({ type: 'info', message: '' })} />
              </div>
            )}

            {recoveryStep === 'method' && (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('email')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${recoveryMethod === 'email' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-gray-700'}`}
                  >
                    Correo
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('sms')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${recoveryMethod === 'sms' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-gray-700'}`}
                  >
                    SMS
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-base text-gray-700 mb-2">
                    {recoveryMethod === 'email' ? 'Correo asociado' : 'Teléfono asociado'}
                  </label>
                  <input
                    type="text"
                    value={recoveryContact}
                    onChange={(e) => setRecoveryContact(e.target.value)}
                    placeholder={recoveryMethod === 'email' ? 'tu@correo.com' : '+503 0000-0000'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </>
            )}

            {recoveryStep === 'verify' && (
              <>
                <div className="mb-4">
                  <label className="block text-base text-gray-700 mb-2">Código de verificación</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-base text-gray-700 mb-2">Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </>
            )}

            {recoveryError && (
              <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-3">
                {recoveryError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRecoveryOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-gray-700 hover:bg-slate-200"
              >
                Cancelar
              </button>
              {recoveryStep === 'method' ? (
                <button
                  type="button"
                  onClick={handleSendRecoveryCode}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500"
                >
                  Enviar código
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500"
                >
                  Actualizar contraseña
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <header className="flex items-center gap-4 mb-6">
        <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
      </header>

      <main className="w-full max-w-screen-xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl bg-white">
        <section className="bg-sky-600 text-white p-10 flex flex-col items-center justify-center gap-6">
          <img 
            src="/assets/icon-wallet.svg" 
            alt="wallet" 
            className="w-52 md:w-64 rounded-xl shadow-2xl"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-center leading-snug">La billetera digital en un solo lugar</h2>
          <p className="text-sky-50 max-w-md text-center text-base md:text-lg">
            Accede a tus movimientos y saldos de forma simple y segura.
          </p>
        </section>

        <section className="bg-slate-50 p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">Acceso seguro</h3>
          <p className="text-gray-700 text-base md:text-lg mb-6">Ingresa tus datos para continuar.</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-base text-gray-700 mb-1.5">Correo electrónico</label>
              <input
                name="email"
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-base text-gray-700 mb-1.5">Contraseña</label>
              <input
                name="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={form.password}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            {error && <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sky-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors text-center disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Ingresar →'}
              </button>
              <Link
                to="/register"
                className="bg-transparent text-sky-700 px-5 py-3 rounded-xl font-semibold border border-sky-200 hover:bg-sky-50 transition-colors"
              >
                Registrarse
              </Link>
            </div>

            <div className="text-base text-gray-700 pt-5">
              ¿Olvidaste la contraseña?{' '}
              <button
                type="button"
                onClick={() => {
                  setRecoveryOpen(true);
                  setRecoveryStep('method');
                  setRecoveryMethod('email');
                  setRecoveryContact('');
                  setRecoveryError('');
                  setRecoveryAlert({ type: 'info', message: '' });
                }}
                className="text-sky-700 font-semibold hover:underline"
              >
                Recuperar cuenta
              </button>
            </div>

            <div className="text-base text-gray-700 pt-6 border-t border-slate-200 mt-6">
              © 2025 Billetera digital
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
