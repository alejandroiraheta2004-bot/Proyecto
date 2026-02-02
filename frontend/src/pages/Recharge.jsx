import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getExecutedTotal, runDuePayments } from '../services/payments';
import ModalConfirm from '../components/ModalConfirm';

export default function Recharge() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardType, setCardType] = useState('debito');
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [balance, setBalance] = useState(0);
  const [executedTotal, setExecutedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'primary',
    onConfirm: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Obtiene el saldo actual del usuario
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      runDuePayments();
      setExecutedTotal(getExecutedTotal());
      const [meRes] = await Promise.all([api.me()]);
      setBalance(Number(meRes?.data?.saldo_actual ?? meRes?.user?.saldo_actual ?? 0));
    } catch (err) {
      setError(err?.message || 'No se pudo cargar tu perfil');
      if (err?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Simula recarga y refresca saldo
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 19);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validateFields = () => {
    const errors = {};
    const amountValue = Number(amount);
    const cardDigits = cardNumber.replace(/\s/g, '');

    if (!bankName.trim()) errors.bankName = 'Ingresa el banco emisor';
    if (!holderName.trim()) errors.holderName = 'Ingresa el titular';
    if (!/^[0-9]{13,19}$/.test(cardDigits)) errors.cardNumber = 'Número de tarjeta inválido';
    if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiry)) errors.expiry = 'Fecha inválida';
    if (!/^[0-9]{3}$/.test(cvv)) errors.cvv = 'CVV inválido';
    if (!Number.isFinite(amountValue) || amountValue <= 0) errors.amount = 'Ingresa un monto válido';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!validateFields()) return;

    const amountValue = Number(amount);
    const cardDigits = cardNumber.replace(/\s/g, '');

    setConfirmConfig({
      open: true,
      title: 'Confirmar recarga',
      description: `Se recargarán $${amountValue.toFixed(2)} desde la tarjeta terminada en ${cardDigits.slice(-4)}. ¿Deseas continuar?`,
      confirmText: 'Recargar',
      onConfirm: async () => {
        try {
          await api.recharge({
            bankName: bankName.trim(),
            cardType,
            holderName: holderName.trim(),
            cardNumber: cardDigits,
            expiry,
            cvv,
            amount: amountValue,
            description: description.trim() || undefined
          });
          await fetchProfile();
          setShowSuccess(true);
          setAmount('');
          setBankName('');
          setCardType('debito');
          setHolderName('');
          setCardNumber('');
          setExpiry('');
          setCvv('');
          setDescription('');
          setFieldErrors({});
          setTimeout(() => setShowSuccess(false), 2500);
        } catch (err) {
          setError(err?.message || 'No se pudo completar la recarga');
        }
      }
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <ModalConfirm
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={async () => {
          if (!confirmConfig.onConfirm) return;
          setConfirmLoading(true);
          try {
            await confirmConfig.onConfirm();
          } finally {
            setConfirmLoading(false);
            setConfirmConfig((prev) => ({ ...prev, open: false }));
          }
        }}
        loading={confirmLoading}
      />
      <header className="flex items-center mb-6 w-full max-w-screen-md mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
      </header>

      <main className="w-full max-w-screen-md mx-auto px-2 md:px-0">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Recarga</h2>
          <p className="text-gray-700 text-base md:text-lg mb-6">Usa tu tarjeta para ingresar dinero a tu cuenta de forma segura.</p>

            <div className="bg-slate-50 p-4 rounded-xl text-center mb-6">
              <div className="text-base text-gray-700">Saldo actual</div>
              {loading ? (
                <div className="text-base text-gray-700">Cargando...</div>
              ) : (
                <div className="text-2xl font-extrabold text-gray-900">${Math.max(0, balance - executedTotal).toFixed(2)}</div>
              )}
            </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base text-muted mb-2">Banco emisor</label>
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
              {fieldErrors.bankName && <p className="text-sm text-red-600 mt-1">{fieldErrors.bankName}</p>}
            </div>

            <div>
              <label className="block text-base text-muted mb-2">Tipo de tarjeta</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              >
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
              </select>
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
              {fieldErrors.holderName && <p className="text-sm text-red-600 mt-1">{fieldErrors.holderName}</p>}
            </div>

            <div>
              <label className="block text-base text-muted mb-2">Número de tarjeta</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              {fieldErrors.cardNumber && <p className="text-sm text-red-600 mt-1">{fieldErrors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base text-muted mb-2">Vencimiento</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
                {fieldErrors.expiry && <p className="text-sm text-red-600 mt-1">{fieldErrors.expiry}</p>}
              </div>
              <div>
                <label className="block text-base text-muted mb-2">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="***"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                />
                {fieldErrors.cvv && <p className="text-sm text-red-600 mt-1">{fieldErrors.cvv}</p>}
              </div>
            </div>

            <div>
              <label className="block text-base text-muted mb-2">Monto a recargar</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$ 100.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              {fieldErrors.amount && <p className="text-sm text-red-600 mt-1">{fieldErrors.amount}</p>}
            </div>

            <div>
              <label className="block text-base text-muted mb-2">Descripción (opcional)</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas de la recarga"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
              />
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <button
                type="submit"
                className="min-w-[190px] bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors"
              >
                Recargar ahora
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
            {error && (
              <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
      </main>
    </div>
  );
}
