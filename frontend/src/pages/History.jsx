import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import ModalConfirm from '../components/ModalConfirm';
import AlertMessage from '../components/AlertMessage';
import { getExecutions, getPayments, runDuePayments, updatePayment } from '../services/payments';

export default function History() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [executions, setExecutions] = useState([]);
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

  // Obtiene todas las transacciones del usuario
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const txRes = await api.myTransactions();
      const list = txRes?.data || txRes?.transactions || [];
      await runDuePayments();
      const [paymentList, executionList] = await Promise.all([getPayments(), getExecutions()]);
      setPayments(paymentList);
      setExecutions(executionList);
      // ordena de reciente a antiguo
      setTransactions([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el historial');
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

  const paymentTransactions = useMemo(() => (
    payments
      .filter((payment) => payment.status !== 'completed')
      .map((payment) => ({
      id: `payment-${payment.id}`,
      description: `Pago programado: ${payment.serviceName}`,
      amount: Number(payment.amount || 0),
      type: 'debit',
      transactionType: 'payment_scheduled',
      createdAt: payment.createdAt || payment.executionDate,
      paymentId: payment.id,
      status: payment.status,
      executionDate: payment.executionDate,
      frequency: payment.frequency,
      category: 'payment'
    }))
  ), [payments]);

  const executionTransactions = useMemo(() => (
    executions.map((exec) => ({
      id: `payment-exec-${exec.id}`,
      description: `Pago ejecutado: ${exec.serviceName}`,
      amount: Number(exec.amount || 0),
      type: 'debit',
      transactionType: 'payment_executed',
      createdAt: exec.executedAt || exec.executionDate,
      paymentId: exec.paymentId,
      status: exec.status,
      executionDate: exec.executionDate,
      frequency: exec.frequency,
      category: 'payment'
    }))
  ), [executions]);

  const allTransactions = useMemo(() => (
    [...transactions, ...paymentTransactions, ...executionTransactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  ), [transactions, paymentTransactions, executionTransactions]);

  // Resumen rápido de conteos por tipo
  const stats = useMemo(() => ({
    total: allTransactions.length,
    ingresos: allTransactions.filter((t) => t.type === 'credit').length,
    egresos: allTransactions.filter((t) => t.type === 'debit').length,
  }), [allTransactions]);

  const filteredTransactions = useMemo(() => {
    let list = [...allTransactions];

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`);
      list = list.filter((t) => new Date(t.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`);
      list = list.filter((t) => new Date(t.createdAt) <= to);
    }

    if (typeFilter !== 'all') {
      list = list.filter((t) => {
        const category = t.transactionType === 'payment'
          ? 'payment'
          : t.transactionType?.includes('recharge')
            ? 'recharge'
            : t.transactionType?.includes('send')
              ? 'send'
              : t.category;

        if (typeFilter === 'credit' || typeFilter === 'debit') {
          return t.type === typeFilter;
        }

        return category === typeFilter;
      });
    }

    return list;
  }, [transactions, dateFrom, dateTo, typeFilter]);

  const setRange = (days) => {
    const today = new Date();
    const to = new Date(today);
    const from = new Date(today);
    from.setDate(from.getDate() - (days - 1));
    const toStr = to.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);
    setDateFrom(fromStr);
    setDateTo(toStr);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTypeFilter('all');
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
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />
      <header className="flex items-center mb-6 w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Historial de transacciones</h1>
          <Link
            to="/dashboard"
            className="px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 text-base"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Todos los movimientos</h2>
              <p className="text-base md:text-lg text-gray-700">{stats.total} transacciones registradas</p>
            </div>
            <div className="flex gap-4 text-base md:text-lg text-gray-700">
              <span>Ingresos: {stats.ingresos}</span>
              <span>Egresos: {stats.egresos}</span>
            </div>
          </div>

          {alert.message && (
            <div className="mb-4">
              <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />
            </div>
          )}

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5 mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setRange(1)}
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-gray-700 hover:bg-slate-100"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setRange(7)}
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-gray-700 hover:bg-slate-100"
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => setRange(30)}
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-gray-700 hover:bg-slate-100"
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-base text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  inputMode="numeric"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  inputMode="numeric"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="all">Todos</option>
                  <option value="credit">Ingresos</option>
                  <option value="debit">Egresos</option>
                  <option value="recharge">Recargas</option>
                  <option value="send">Envíos</option>
                  <option value="payment">Pagos programados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-700">Cargando...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-gray-700">No hay transacciones registradas.</p>
            ) : (
              filteredTransactions.map((tx) => {
                const amount = Number(tx.amount || 0);
                const isCredit = tx.type === 'credit';
                const isPayment = String(tx.transactionType || '').startsWith('payment');
                const rowBg = isPayment
                  ? 'bg-purple-50'
                  : tx.transactionType === 'send_internal'
                    ? 'bg-sky-50'
                    : isCredit
                      ? 'bg-green-50'
                      : 'bg-red-50';
                return (
                  <div
                    key={tx.id || `${tx.description}-${tx.createdAt}`}
                    className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center p-4 rounded-xl transition-colors border border-slate-100 ${rowBg}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isPayment ? 'bg-purple-100' : isCredit ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <img
                          src={isPayment ? '/assets/icon-wallet.svg' : `/assets/icon-${isCredit ? 'recharge' : 'send'}.svg`}
                          className="h-6"
                          alt=""
                        />
                      </div>
                      <div>
                        <div className="font-bold">{tx.description || 'Transacción'}</div>
                        <div className="text-base text-gray-700 flex flex-wrap items-center gap-2">
                          <span>{new Date(tx.createdAt).toLocaleString()}</span>
                          <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{tx.type}</span>
                          {tx.transactionType && (
                            <span className={`text-xs px-2 py-1 rounded-full ${isPayment ? 'bg-purple-100 text-purple-700' : 'bg-sky-50 text-sky-700'}`}>
                              {tx.transactionType}
                            </span>
                          )}
                          {isPayment && tx.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                              {tx.status === 'cancelled' ? 'Cancelado' : tx.status === 'executed' ? 'Ejecutado' : 'Programado'}
                            </span>
                          )}
                        </div>
                        {(tx.origin || tx.destination) && (
                          <div className="text-sm text-gray-600 mt-1">
                            {tx.origin && <span>Origen: {tx.origin}</span>}
                            {tx.origin && tx.destination && <span className="mx-2">•</span>}
                            {tx.destination && <span>Destino: {tx.destination}</span>}
                          </div>
                        )}
                        {tx.transactionType === 'recharge_external' && tx.destination && (
                          <div className="text-sm text-gray-600 mt-1">
                            Método: Tarjeta externa - {tx.destination}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-end">
                      <div className={`text-xl font-bold ${isPayment ? 'text-purple-600' : isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                      </div>
                      {tx.id && (
                        <Link
                          to={`/history/${tx.id}`}
                          className="text-sky-700 hover:text-sky-600 font-semibold text-base"
                        >
                          Ver detalles
                        </Link>
                      )}
                      {tx.transactionType === 'payment_scheduled' && tx.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            openConfirm({
                              title: 'Cancelar pago programado',
                              description: 'Se cancelará este pago programado y ya no se ejecutará.',
                              confirmText: 'Cancelar pago',
                              variant: 'danger',
                              onConfirm: async () => {
                                try {
                                  await updatePayment(tx.paymentId, { status: 'cancelled' });
                                  await runDuePayments();
                                  const [paymentList, executionList] = await Promise.all([getPayments(), getExecutions()]);
                                  setPayments(paymentList);
                                  setExecutions(executionList);
                                  setAlert({ type: 'warning', message: 'Pago cancelado correctamente.' });
                                } catch (err) {
                                  setAlert({ type: 'error', message: err?.message || 'No se pudo cancelar el pago.' });
                                }
                              }
                            });
                          }}
                          className="text-red-600 font-semibold text-base hover:underline"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button className="text-sky-700 hover:text-sky-600 hover:underline font-semibold text-base">
              Cargar más transacciones
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
      </main>
    </div>
  );
}
