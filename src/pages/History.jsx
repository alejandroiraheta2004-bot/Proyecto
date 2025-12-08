import { Link } from 'react-router-dom';

export default function History() {
  const transactions = [
    { id: 1, title: 'Envío a Spotify', date: '15 de Diciembre, 2025', amount: -9.99, type: 'Pago' },
    { id: 2, title: 'Recepción de Maria López', date: '14 de Diciembre, 2025', amount: 50.00, type: 'Recepción' },
    { id: 3, title: 'Recarga de Saldo', date: '12 de Diciembre, 2025', amount: 200.00, type: 'Recarga' },
    { id: 4, title: 'Pago en Cafetería Local', date: '11 de Diciembre, 2025', amount: -5.75, type: 'Pago' },
    { id: 5, title: 'Envío a Juan Pérez', date: '10 de Diciembre, 2025', amount: -25.00, type: 'Envío' },
    { id: 6, title: 'Recepción de Carlos Ruiz', date: '9 de Diciembre, 2025', amount: 100.00, type: 'Recepción' },
    { id: 7, title: 'Pago en Amazon', date: '8 de Diciembre, 2025', amount: -45.99, type: 'Pago' },
    { id: 8, title: 'Recarga de Saldo', date: '5 de Diciembre, 2025', amount: 300.00, type: 'Recarga' },
  ];

  return (
    <div className="min-h-screen p-7">
      <header className="flex items-center mb-6 max-w-5xl mx-auto">
        <Link to="/dashboard">
          <img src="/assets/logo.svg" alt="E_Wallet Logo" className="h-12" />
        </Link>
        <h1 className="text-2xl font-bold ml-6">Historial de Transacciones</h1>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Todos los Movimientos</h2>
              <p className="text-sm text-muted">{transactions.length} transacciones registradas</p>
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                <option>Todos</option>
                <option>Envíos</option>
                <option>Recepciones</option>
                <option>Recargas</option>
                <option>Pagos</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <img
                      src={`/assets/icon-${tx.amount > 0 ? 'recharge' : 'send'}.svg`}
                      className="h-6"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="font-bold">{tx.title}</div>
                    <div className="text-sm text-muted flex items-center gap-2">
                      <span>{tx.date}</span>
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{tx.type}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button className="text-accent hover:underline font-semibold">
              Cargar más transacciones
            </button>
          </div>
        </div>

        <div className="text-xs text-muted text-center mt-6">© 2025 E_Wallet</div>
      </main>
    </div>
  );
}
