import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ModalConfirm from '../components/ModalConfirm';
import AlertMessage from '../components/AlertMessage';
import { addPayment, getPayments, runDuePayments, updatePayment } from '../services/payments';

const frequencies = [
  { value: 'once', label: 'Único' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' }
];

export default function Pagos() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ serviceName: '', accountNumber: '', amount: '', date: '', frequency: 'once' });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: 'info', message: '' });
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'primary',
    onConfirm: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await runDuePayments();
        const list = await getPayments();
        setPayments(list);
      } catch (err) {
        setAlert({ type: 'error', message: err?.message || 'No se pudieron cargar los pagos.' });
      }
    };
    loadData();
  }, []);

  const refreshPayments = async () => {
    await runDuePayments();
    const list = await getPayments();
    setPayments(list);
  };

  const openConfirm = (config) => {
    setConfirmConfig({
      open: true,
      title: config.title,
      description: config.description,
      confirmText: config.confirmText || 'Confirmar',
      variant: config.variant || 'primary',
      onConfirm: config.onConfirm
    });
  };

  const handleConfirm = async () => {
    if (!confirmConfig.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmConfig.onConfirm();
    } finally {
      setConfirmLoading(false);
      setConfirmConfig((prev) => ({ ...prev, open: false }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const amountValue = Number(form.amount);
    if (!form.serviceName.trim()) nextErrors.serviceName = 'Ingresa el nombre del servicio';
    if (!form.accountNumber.trim()) nextErrors.accountNumber = 'Ingresa el número de cuenta del servicio';
    if (!Number.isFinite(amountValue) || amountValue <= 0) nextErrors.amount = 'Ingresa un monto válido';
    if (!form.date) nextErrors.date = 'Selecciona una fecha de ejecución';
    if (!form.frequency) nextErrors.frequency = 'Selecciona la frecuencia';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: 'info', message: '' });
    if (!validate()) return;

    const amountValue = Number(form.amount);
    const summary = `${form.serviceName} (Cuenta ${form.accountNumber}) por $${amountValue.toFixed(2)} el ${new Date(form.date).toLocaleDateString()}`;

    openConfirm({
      title: editingId ? 'Actualizar pago programado' : 'Programar nuevo pago',
      description: `Se ${editingId ? 'actualizará' : 'programará'} el pago de ${summary}.`,
      confirmText: editingId ? 'Actualizar' : 'Programar',
      onConfirm: async () => {
        const basePayload = {
          serviceName: form.serviceName.trim(),
          accountNumber: form.accountNumber.trim(),
          amount: amountValue,
          executionDate: form.date,
          frequency: form.frequency
        };

        try {
          if (editingId) {
            await updatePayment(editingId, { ...basePayload, nextExecutionDate: form.date, status: 'scheduled' });
            setAlert({ type: 'success', message: 'Pago actualizado correctamente.' });
          } else {
            await addPayment(basePayload);
            setAlert({ type: 'success', message: 'Pago programado correctamente.' });
          }
          setForm({ serviceName: '', accountNumber: '', amount: '', date: '', frequency: 'once' });
          setEditingId(null);
          setErrors({});
          await refreshPayments();
        } catch (err) {
          setAlert({ type: 'error', message: err?.message || 'No se pudo guardar el pago.' });
        }
      }
    });
  };

  const handleEdit = (payment) => {
    setForm({
      serviceName: payment.serviceName,
      accountNumber: payment.accountNumber || '',
      amount: String(payment.amount),
      date: payment.executionDate,
      frequency: payment.frequency
    });
    setEditingId(payment.id);
  };

  const handleCancel = (payment) => {
    openConfirm({
      title: 'Cancelar pago programado',
      description: `Se cancelará el pago de ${payment.serviceName} programado para ${new Date(payment.executionDate).toLocaleDateString()}.`,
      confirmText: 'Cancelar pago',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await updatePayment(payment.id, { status: 'cancelled' });
          setAlert({ type: 'warning', message: 'Pago cancelado correctamente.' });
          await refreshPayments();
        } catch (err) {
          setAlert({ type: 'error', message: err?.message || 'No se pudo cancelar el pago.' });
        }
      }
    });
  };

  const pendingPayments = useMemo(() => payments.filter((p) => p.status !== 'cancelled'), [payments]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <ModalConfirm
        open={confirmConfig.open}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />

      <header className="flex items-center mb-6 w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Pagos programados</h1>
          <Link
            to="/dashboard"
            className="px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 text-base"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{editingId ? 'Editar pago' : 'Programar pago'}</h2>
          {alert.message && (
            <div className="mb-4">
              <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base text-gray-700 mb-2">Servicio</label>
              <input
                type="text"
                value={form.serviceName}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceName: e.target.value }))}
                placeholder="Luz, agua, internet..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              {errors.serviceName && <p className="text-sm text-red-600 mt-1">{errors.serviceName}</p>}
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Número de cuenta del servicio</label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="0000 0000 0000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Monto</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="$ 0.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Fecha de ejecución</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
              {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-base text-gray-700 mb-2">Frecuencia</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              >
                {frequencies.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              {errors.frequency && <p className="text-sm text-red-600 mt-1">{errors.frequency}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors"
              >
                {editingId ? 'Actualizar pago' : 'Programar pago'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ serviceName: '', accountNumber: '', amount: '', date: '', frequency: 'once' });
                    setErrors({});
                  }}
                  className="px-5 py-3 rounded-xl font-semibold bg-slate-100 text-gray-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pagos programados</h2>
          {pendingPayments.length === 0 ? (
            <p className="text-gray-700">No hay pagos programados.</p>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="p-4 rounded-xl border border-slate-100 bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{payment.serviceName}</div>
                      <div className="text-sm text-gray-700">Cuenta: {payment.accountNumber || '—'}</div>
                      <div className="text-sm text-gray-700">
                        Próxima ejecución: {new Date(payment.nextExecutionDate || payment.executionDate).toLocaleDateString()} • {frequencies.find((f) => f.value === payment.frequency)?.label}
                      </div>
                    </div>
                    <div className="text-purple-700 font-bold text-lg">-${Number(payment.amount).toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(payment)}
                      className="px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-100"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(payment)}
                      className="px-3 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
    </div>
  );
}
