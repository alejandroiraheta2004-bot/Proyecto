import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
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
          <h2 className="text-3xl md:text-4xl font-bold text-center leading-snug">Tu billetera digital en un solo lugar</h2>
          <p className="text-sky-50 max-w-md text-center text-base md:text-lg">
            Accede a tus movimientos y saldos de forma simple y segura.
          </p>
        </section>

        <section className="bg-slate-50 p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">Acceso seguro</h3>
          <p className="text-gray-700 text-base md:text-lg mb-6">Ingresa tus datos para continuar.</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-base text-gray-700 mb-1.5">Correo Electrónico</label>
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
              ¿Necesitas ayuda?{' '}
              <span className="text-sky-700 font-semibold">Soporte (próximamente)</span>
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
