import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function Send() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExternalSuccess, setShowExternalSuccess] = useState(false);
  const [transferType, setTransferType] = useState('internal');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [holderName, setHolderName] = useState('');
  const [externalAmount, setExternalAmount] = useState('');
  const [externalMessage, setExternalMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Carga perfil y movimientos para calcular saldo
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [meRes] = await Promise.all([api.me()]);
      setProfile(meRes?.data || meRes?.user || null);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar tu información');
      if (err?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcula saldo disponible en base a ingresos y egresos
  const stats = useMemo(() => ({
    balance: Number(profile?.saldo_actual ?? 0)
  }), [profile]);

  // Simula envío y limpia formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    if (!recipient.trim()) {
      setError('Ingresa un username o número de cuenta');
      return;
    }

    setConfirmAction(() => () =>
      api.sendInternal({
        identifier: recipient.trim(),
        amount: amountValue,
        description: message || `Envío a ${recipient}`
      })
        .then(async () => {
          await fetchData();
          setShowSuccess(true);
          setRecipient('');
          setAmount('');
          setMessage('');
          setTimeout(() => setShowSuccess(false), 2500);
        })
        .catch((err) => {
          setError(err?.message || 'No se pudo realizar el envío');
        })
    );
    setConfirmOpen(true);
  };

  const handleExternalSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amountValue = Number(externalAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    if (!bankName.trim() || !bankAccount.trim() || !holderName.trim()) {
      setError('Completa todos los datos del banco');
      return;
    }

    setConfirmAction(() => () =>
      api.sendExternal({
        bankName: bankName.trim(),
        accountNumber: bankAccount.trim(),
        holderName: holderName.trim(),
        amount: amountValue,
        description: externalMessage || `Envío a ${holderName}`
      })
        .then(async () => {
          await fetchData();
          setShowExternalSuccess(true);
          setBankName('');
          setBankAccount('');
          setHolderName('');
          setExternalAmount('');
          setExternalMessage('');
          setTimeout(() => setShowExternalSuccess(false), 2500);
        })
        .catch((err) => {
          setError(err?.message || 'No se pudo realizar el envío');
        })
    );
    setConfirmOpen(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Confirmar acción</h4>
            <p className="text-gray-700 mb-4">¿Deseas continuar con esta operación?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-gray-700 hover:bg-slate-200"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmAction;
                  setConfirmOpen(false);
                  if (action) await action();
                }}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500"
              >
                Sí
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="flex items-center mb-6 w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Enviar Dinero</h2>
              <p className="text-gray-700 text-base md:text-lg mb-2">Envía dinero de forma rápida y segura a otros usuarios.</p>
              {error && <p className="text-base text-red-700">{error}</p>}
            </div>
            <div className="text-right">
              <div className="text-base text-gray-700">Saldo disponible</div>
              {loading ? (
                <div className="text-base text-gray-700">Cargando...</div>
              ) : (
                <div className="text-2xl font-extrabold text-gray-900">${stats.balance.toFixed(2)}</div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex gap-2 w-full md:w-fit">
            <button
              type="button"
              onClick={() => setTransferType('internal')}
              className={`px-4 py-2 rounded-lg font-semibold text-base transition-colors ${transferType === 'internal' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-slate-200'}`}
            >
              Envío a usuario
            </button>
            <button
              type="button"
              onClick={() => setTransferType('external')}
              className={`px-4 py-2 rounded-lg font-semibold text-base transition-colors ${transferType === 'external' ? 'bg-sky-600 text-white' : 'bg-white text-gray-700 border border-slate-200'}`}
            >
              Envío a banco
            </button>
          </div>

          <form
            onSubmit={transferType === 'internal' ? handleSubmit : handleExternalSubmit}
            className="space-y-5 bg-slate-50 rounded-xl p-6 border border-slate-100"
          >
            <div className="flex items-center gap-2">
              <img src={transferType === 'internal' ? '/assets/icon-send.svg' : '/assets/icon-wallet.svg'} className="h-5" alt="" />
              <h3 className="text-lg font-semibold">
                {transferType === 'internal' ? 'Envío a usuario E-Wallet' : 'Envío a otros bancos'}
              </h3>
            </div>

            {transferType === 'internal' ? (
              <>
                <div>
                  <label className="block text-base text-muted mb-2">Username o número de cuenta</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="@usuario o 10xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base text-muted mb-2">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="$ 0.00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base text-muted mb-2">Concepto o descripción</label>
                  <textarea
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Para la cena, regalo, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-base text-muted mb-2">Banco</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  >
                    <option value="">Selecciona un banco</option>
                    <option value="Banco Agrícola">Banco Agrícola</option>
                    <option value="Banco Cuscatlán">Banco Cuscatlán</option>
                    <option value="BAC Credomatic">BAC Credomatic</option>
                    <option value="Davivienda El Salvador">Davivienda El Salvador</option>
                    <option value="Banco Promerica">Banco Promerica</option>
                    <option value="Banco Hipotecario">Banco Hipotecario</option>
                    <option value="Banco de Fomento Agropecuario (BFA)">Banco de Fomento Agropecuario (BFA)</option>
                    <option value="Banco Azul">Banco Azul</option>
                    <option value="Banco Industrial El Salvador">Banco Industrial El Salvador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base text-muted mb-2">Cuenta destino</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base text-muted mb-2">Titular</label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="Nombre del titular"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base text-muted mb-2">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={externalAmount}
                    onChange={(e) => setExternalAmount(e.target.value)}
                    placeholder="$ 0.00"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base text-muted mb-2">Concepto o descripción</label>
                  <textarea
                    rows="3"
                    value={externalMessage}
                    onChange={(e) => setExternalMessage(e.target.value)}
                    placeholder="Pago de servicios, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                  />
                </div>
              </>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="submit"
                className="min-w-[200px] bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-sky-500 transition-colors"
              >
                {transferType === 'internal' ? 'Enviar Dinero' : 'Enviar a banco'}
              </button>
              <Link
                to="/dashboard"
                className="min-w-[130px] bg-slate-200 text-base px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors flex items-center justify-center"
              >
                Cancelar
              </Link>
            </div>

            {showSuccess && transferType === 'internal' && (
              <div className="flex items-center gap-3 bg-success border border-green-200 text-green-800 px-5 py-4 rounded-xl">
                <img src="/assets/icon-check.svg" className="h-5" alt="" />
                <span className="font-medium">¡Envío realizado! La transacción fue exitosa.</span>
              </div>
            )}
            {showExternalSuccess && transferType === 'external' && (
              <div className="flex items-center gap-3 bg-success border border-green-200 text-green-800 px-5 py-4 rounded-xl">
                <img src="/assets/icon-check.svg" className="h-5" alt="" />
                <span className="font-medium">¡Envío externo realizado! La transacción fue exitosa.</span>
              </div>
            )}
          </form>

          {error && !loading && (
            <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mt-4">
              {error}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
      </main>
    </div>
  );
}
