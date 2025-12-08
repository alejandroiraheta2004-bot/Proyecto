import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: 'icon-wallet.svg', label: 'Inicio' },
    { path: '/history', icon: 'icon-history.svg', label: 'Historial' },
    { path: '/send', icon: 'icon-send.svg', label: 'Enviar' },
    { path: '/recharge', icon: 'icon-recharge.svg', label: 'Recargar' },
    { path: '/settings', icon: 'icon-user.svg', label: 'Configuración' },
  ];

  return (
    <aside className="w-56 bg-white rounded-xl p-5 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <img src="/assets/icon-wallet.svg" alt="" className="h-7" />
        <div>
          <div className="font-bold text-sm">Plataforma de Pagos</div>
          <div className="text-xs text-muted">Billetera Virtual</div>
        </div>
      </div>

      <nav className="mt-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              location.pathname === item.path
                ? 'bg-cyan-50 text-accent font-semibold'
                : 'text-muted hover:bg-slate-50'
            }`}
          >
            <img src={`/assets/${item.icon}`} className="h-4" alt="" />
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        to="/"
        className="flex items-center gap-2 mt-5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </Link>
    </aside>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen p-7 max-w-7xl mx-auto">
      <header className="flex items-center mb-5">
        <img src="/assets/logo.svg" alt="E_Wallet Logo" className="h-12" />
        <div className="ml-auto flex gap-3 items-center">
          <Link to="/history">
            <img src="/assets/icon-history.svg" className="h-5" alt="history" />
          </Link>
          <Link to="/settings" className="bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <img src="/assets/icon-user.svg" className="h-5" alt="user" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-100 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </Link>
        </div>
      </header>

      <main className="flex gap-5 mt-5">
        <Sidebar />

        <section className="flex-1">
          {/* Balance Card */}
          <div className="flex gap-5 mb-5">
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted">Tu Saldo Actual</div>
                  <div className="text-4xl font-extrabold text-base my-2">$1,234.56</div>
                  <div className="flex gap-3 mt-3">
                    <Link
                      to="/recharge"
                      className="flex items-center gap-2 bg-accent text-white px-5 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
                    >
                      <img src="/assets/icon-recharge.svg" className="h-4" alt="" />
                      Recargar Saldo
                    </Link>
                    <Link
                      to="/send"
                      className="bg-cyan-50 text-accent px-5 py-3 rounded-xl font-semibold hover:bg-cyan-100 transition-colors"
                    >
                      Enviar Dinero
                    </Link>
                  </div>
                </div>
                <div className="w-36 h-20 rounded-xl bg-gradient-to-r from-cyan-50 to-white flex items-center justify-center text-muted">
                  Gráfico
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="w-80 bg-white rounded-xl shadow-lg p-6">
              <div className="font-bold mb-3">Estadísticas</div>
              <div className="space-y-2 text-sm">
                <div className="text-muted">
                  Transacciones mes: <strong className="text-base">18</strong>
                </div>
                <div className="h-3"></div>
                <div className="text-muted">
                  Total enviado: <strong className="text-accent">$1,200.00</strong>
                </div>
                <div className="text-muted">
                  Total recibido: <strong className="text-highlight">$1,140.00</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <div className="font-bold text-lg">Últimos Movimientos</div>
              <Link to="/history" className="text-accent hover:underline">
                Ver todo
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Envío a Spotify', date: '15 de Julio, 2024', amount: -9.99 },
                { title: 'Recepción de Maria López', date: '14 de Julio, 2024', amount: 50.00 },
                { title: 'Recarga de Saldo', date: '12 de Julio, 2024', amount: 200.00 },
                { title: 'Pago en Cafetería Local', date: '11 de Julio, 2024', amount: -5.75 },
              ].map((tx, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="font-bold">{tx.title}</div>
                    <div className="text-sm text-muted">{tx.date}</div>
                  </div>
                  <div className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted text-center mt-6">
            © 2025 E_Wallet — Demo educativa
          </div>
        </section>
      </main>
    </div>
  );
}
