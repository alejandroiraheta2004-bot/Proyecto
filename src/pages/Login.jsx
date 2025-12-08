import { Link } from 'react-router-dom';

export default function Login() {
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
          <h2 className="text-3xl font-bold">Tus finanzas, seguras y al instante</h2>
          <p className="text-cyan-100 max-w-xs text-center">
            Únete a la revolución de los pagos digitales. Simple, rápido y seguro. 
            Con E_Wallet gestiona tu dinero desde donde quieras.
          </p>
        </section>

        {/* Right Section */}
        <section className="flex-1 bg-slate-50 p-10 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h3>
          <p className="text-muted mb-5">Inicia sesión para continuar a tu billetera.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm text-muted mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                to="/dashboard"
                className="flex-1 bg-accent text-white px-5 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors text-center"
              >
                Ingresar →
              </Link>
              <Link
                to="/register"
                className="bg-transparent text-accent px-5 py-3 rounded-xl font-semibold border border-accent/20 hover:bg-accent/5 transition-colors"
              >
                Registrarse
              </Link>
            </div>

            <div className="text-sm text-muted pt-4">
              ¿Olvidaste tu contraseña?{' '}
              <a href="#" className="text-accent hover:underline">Recuperar</a>
            </div>

            <div className="text-xs text-muted pt-6 border-t border-slate-200 mt-6">
              © 2025 E_Wallet — Demo educativa de billetera virtual
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
