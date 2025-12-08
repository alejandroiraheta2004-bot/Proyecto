import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Recharge() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Banco VirtualSol');
  const [balance] = useState(1250.50);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAmount('');
    }, 3000);
  };

  return (
    <div className="min-h-screen p-7">
      <header className="flex items-center mb-6 max-w-lg mx-auto">
        <Link to="/dashboard">
          <img src="/assets/logo.svg" alt="E_Wallet Logo" className="h-12" />
        </Link>
      </header>

      <main className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">Simular Recarga de Saldo</h2>
          <p className="text-muted mb-6">Ingresa los detalles de la recarga.</p>

          <div className="bg-slate-50 p-4 rounded-xl text-center mb-6">
            <div className="text-sm text-muted">Saldo Actual</div>
            <div className="text-2xl font-extrabold text-base">${balance.toFixed(2)}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-2">Monto a recargar</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$ 100.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Selecciona un método de pago</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Banco VirtualSol</option>
                <option>Tarjeta débito</option>
                <option>Tarjeta crédito</option>
              </select>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="submit"
                className="min-w-[180px] bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors"
              >
                Recargar Ahora
              </button>
              <Link
                to="/dashboard"
                className="min-w-[120px] bg-slate-200 text-base px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors flex items-center justify-center"
              >
                Cancelar
              </Link>
            </div>

            {showSuccess && (
              <div className="flex items-center gap-3 bg-success border border-green-200 text-green-800 px-5 py-4 rounded-xl">
                <img src="/assets/icon-check.svg" className="h-5" alt="" />
                <span className="font-medium">¡Recarga exitosa! Tu nuevo saldo ha sido actualizado.</span>
              </div>
            )}
          </form>
        </div>

        <div className="text-xs text-muted text-center mt-6">© 2025 E_Wallet</div>
      </main>
    </div>
  );
}
