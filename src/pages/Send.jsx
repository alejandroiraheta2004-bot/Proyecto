import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Send() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setRecipient('');
      setAmount('');
      setMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen p-7">
      <header className="flex items-center mb-6 max-w-4xl mx-auto">
        <Link to="/dashboard">
          <img src="/assets/logo.svg" alt="E_Wallet Logo" className="h-12" />
        </Link>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">Enviar Dinero</h2>
          <p className="text-muted mb-6">Envía dinero de forma rápida y segura a otros usuarios.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-2">¿A quién le envías?</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nombre, email o usuario"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Monto</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$ 0.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Añadir un mensaje (opcional)</label>
              <textarea
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Para la cena, regalo, etc."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="submit"
                className="min-w-[200px] bg-accent text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-cyan-700 transition-colors"
              >
                Enviar Dinero
              </button>
              <Link
                to="/dashboard"
                className="min-w-[150px] bg-slate-200 text-base px-6 py-4 rounded-xl font-semibold hover:bg-slate-300 transition-colors flex items-center justify-center"
              >
                Cancelar
              </Link>
            </div>

            {showSuccess && (
              <div className="flex items-center gap-3 bg-success border border-green-200 text-green-800 px-5 py-4 rounded-xl max-w-lg mx-auto">
                <img src="/assets/icon-check.svg" className="h-5" alt="" />
                <span className="font-medium">¡Envío realizado! La transacción fue exitosa.</span>
              </div>
            )}
          </form>
        </div>

        <div className="text-xs text-muted text-center mt-6">© 2025 E_Wallet</div>
      </main>
    </div>
  );
}
