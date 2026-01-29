import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    username: '',
    email: '',
    telefono: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Actualiza cada campo del formulario
  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Crea la cuenta y redirige al login
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.register(form);
      setSuccess('Cuenta creada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/'), 700);
    } catch (err) {
      setError(err?.message || 'Error de datos, compruebe la información');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      <main className="w-full max-w-screen-2xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl bg-white">
        <section className="bg-sky-600 text-white p-10 flex flex-col items-center justify-center gap-6">
          <img 
            src="/assets/icon-wallet.svg" 
            alt="wallet" 
            className="w-52 md:w-64 rounded-xl shadow-2xl"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-center leading-snug">Crea tu cuenta</h2>
          <p className="text-sky-50 max-w-md text-center text-base md:text-lg">
            Regístrate y empieza a usar tu billetera digital.
          </p>
        </section>

        <section className="bg-slate-50 p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">Crear cuenta</h3>
          <p className="text-gray-700 text-base md:text-lg mb-6">Completa tus datos para continuar.</p>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="block text-base text-gray-700 mb-1.5">Nombre completo</label>
              <input
                name="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={form.nombre}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-1.5">Nombre de usuario</label>
              <input
                name="username"
                type="text"
                placeholder="@juanp"
                value={form.username}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>
            
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
              <label className="block text-base text-gray-700 mb-1.5">Número de teléfono</label>
              <input
                name="telefono"
                type="tel"
                placeholder="+503 0000-0000"
                value={form.telefono}
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
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            {error && <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>}
            {success && <div className="text-base text-green-800 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">{success}</div>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sky-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors text-center disabled:opacity-60"
              >
                {loading ? 'Creando...' : 'Crear cuenta'}
              </button>
              <Link
                to="/"
                className="bg-slate-200 text-base px-5 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </Link>
            </div>

            <div className="text-base text-gray-700 pt-4 text-center">
              ¿Ya tienes cuenta?{' '}
              <Link to="/" className="text-sky-700 hover:underline font-semibold">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
