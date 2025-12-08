import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-7">
      <header className="flex items-center gap-4 mb-6">
        <img src="/assets/logo.svg" alt="E_Wallet Logo" className="h-12" />
        <div className="text-2xl font-bold">E_Wallet</div>
      </header>

      <main className="w-full max-w-6xl flex rounded-2xl overflow-hidden shadow-xl h-[640px]">
        {/* Left Section */}
        <section className="flex-[1.1] bg-base text-white p-9 flex flex-col items-center justify-center gap-5">
          <img 
            src="/assets/icon-wallet.svg" 
            alt="wallet" 
            className="w-64 rounded-xl shadow-2xl"
          />
          <h2 className="text-3xl font-bold">Únete a E_Wallet</h2>
          <p className="text-cyan-100 max-w-xs text-center">
            Crea tu cuenta gratuita y comienza a disfrutar de la forma más simple 
            de manejar tu dinero digital.
          </p>
        </section>

        {/* Right Section */}
        <section className="flex-1 bg-slate-50 p-10 flex flex-col justify-center overflow-y-auto">
          <h3 className="text-2xl font-bold mb-2">Crear cuenta nueva</h3>
          <p className="text-muted mb-5">Completa tus datos para registrarte.</p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted mb-1">Nombre completo</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">Teléfono</label>
              <input
                type="tel"
                placeholder="+503 0000-0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/dashboard"
                className="flex-1 bg-accent text-white px-5 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors text-center"
              >
                Crear cuenta
              </Link>
              <Link
                to="/"
                className="bg-slate-200 text-base px-5 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </Link>
            </div>

            <div className="text-sm text-muted pt-3 text-center">
              ¿Ya tienes cuenta?{' '}
              <Link to="/" className="text-accent hover:underline font-semibold">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
