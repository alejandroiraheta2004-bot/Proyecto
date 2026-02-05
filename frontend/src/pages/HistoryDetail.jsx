import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import ModalConfirm from '../components/ModalConfirm';
import AlertMessage from '../components/AlertMessage';
import { getExecutionById, getPaymentById, runDuePayments, updatePayment } from '../services/payments';

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);
  const [execution, setExecution] = useState(null);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const txRes = await api.myTransactions();
      setTransactions(txRes?.data || txRes?.transactions || []);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la transacción');
      if (err?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (String(id || '').startsWith('payment-exec-')) {
        const executionId = String(id).replace('payment-exec-', '');
        await runDuePayments();
        const exec = await getExecutionById(executionId);
        setExecution(exec);
        setLoading(false);
        return;
      }
      if (String(id || '').startsWith('payment-')) {
        const paymentId = String(id).replace('payment-', '');
        await runDuePayments();
        const pay = await getPaymentById(paymentId);
        setPayment(pay);
        setLoading(false);
        return;
      }
      fetchData();
    };
    loadData();
  }, [id]);

  const tx = useMemo(() => transactions.find((t) => String(t.id) === String(id)), [transactions, id]);
  const isExecution = String(id || '').startsWith('payment-exec-');
  const isPayment = String(id || '').startsWith('payment-') && !isExecution;

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
          <h1 className="text-2xl font-bold text-gray-900">Detalle de transacción</h1>
          <Link
            to="/history"
            className="px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 text-base"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {loading ? (
            <p className="text-gray-700">Cargando...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : isExecution ? (
            !execution ? (
              <p className="text-gray-700">No se encontró la ejecución del pago.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">ID</div>
                  <div className="text-lg font-semibold">{execution.id}</div>

                  <div className="text-sm text-gray-500">Tipo</div>
                  <div className="text-lg font-semibold">Pago ejecutado</div>

                  <div className="text-sm text-gray-500">Monto</div>
                  <div className="text-2xl font-extrabold text-purple-600">
                    -${Math.abs(Number(execution.amount || 0)).toFixed(2)}
                  </div>

                  <div className="text-sm text-gray-500">Fecha de ejecución</div>
                  <div className="text-lg font-semibold">{new Date(execution.executionDate).toLocaleDateString()}</div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Servicio</div>
                  <div className="text-lg font-semibold">{execution.serviceName}</div>

                  <div className="text-sm text-gray-500">Frecuencia</div>
                  <div className="text-lg font-semibold">{execution.frequency}</div>

                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="text-lg font-semibold">Ejecutado</div>
                </div>
              </div>
            )
          ) : isPayment ? (
            !payment ? (
              <p className="text-gray-700">No se encontró el pago programado.</p>
            ) : (
              <div className="space-y-6">
                {alert.message && (
                  <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">ID</div>
                    <div className="text-lg font-semibold">payment-{payment.id}</div>

                    <div className="text-sm text-gray-500">Tipo</div>
                    <div className="text-lg font-semibold">Pago programado</div>

                    <div className="text-sm text-gray-500">Monto</div>
                    <div className="text-2xl font-extrabold text-purple-600">
                      -${Math.abs(Number(payment.amount || 0)).toFixed(2)}
                    </div>

                    <div className="text-sm text-gray-500">Próxima ejecución</div>
                    <div className="text-lg font-semibold">{new Date(payment.nextExecutionDate || payment.executionDate).toLocaleDateString()}</div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">Servicio</div>
                    <div className="text-lg font-semibold">{payment.serviceName}</div>

                    <div className="text-sm text-gray-500">Frecuencia</div>
                    <div className="text-lg font-semibold">{payment.frequency}</div>

                    <div className="text-sm text-gray-500">Estado</div>
                    <div className="text-lg font-semibold">
                      {payment.status === 'cancelled' ? 'Cancelado' : payment.status === 'completed' ? 'Completado' : 'Programado'}
                    </div>
                  </div>
                </div>

                {payment.status !== 'cancelled' && payment.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      openConfirm({
                        title: 'Cancelar pago programado',
                        description: 'Se cancelará este pago y ya no se ejecutará en la fecha indicada.',
                        confirmText: 'Cancelar pago',
                        variant: 'danger',
                        onConfirm: async () => {
                          try {
                            const updated = await updatePayment(payment.id, { status: 'cancelled' });
                            setPayment(updated);
                            setAlert({ type: 'warning', message: 'Pago cancelado correctamente.' });
                          } catch (err) {
                            setAlert({ type: 'error', message: err?.message || 'No se pudo cancelar el pago.' });
                          }
                        }
                      });
                    }}
                    className="px-5 py-3 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100"
                  >
                    Cancelar pago
                  </button>
                )}
              </div>
            )
          ) : !tx ? (
            <p className="text-gray-700">No se encontró la transacción.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-500">ID</div>
                <div className="text-lg font-semibold">{tx.id}</div>

                <div className="text-sm text-gray-500">Tipo</div>
                <div className="text-lg font-semibold">{tx.type}</div>

                {tx.transactionType && (
                  <>
                    <div className="text-sm text-gray-500">Operación</div>
                    <div className="text-lg font-semibold">{tx.transactionType}</div>
                  </>
                )}

                <div className="text-sm text-gray-500">Monto</div>
                <div className={`text-2xl font-extrabold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'credit' ? '+' : '-'}${Math.abs(Number(tx.amount || 0)).toFixed(2)}
                </div>

                <div className="text-sm text-gray-500">Fecha</div>
                <div className="text-lg font-semibold">{new Date(tx.createdAt).toLocaleString()}</div>
              </div>

              <div className="space-y-4">
                {tx.description && (
                  <>
                    <div className="text-sm text-gray-500">Descripción</div>
                    <div className="text-lg font-semibold">{tx.description}</div>
                  </>
                )}

                {tx.reference && (
                  <>
                    <div className="text-sm text-gray-500">Referencia</div>
                    <div className="text-lg font-semibold">{tx.reference}</div>
                  </>
                )}

                {tx.status && (
                  <>
                    <div className="text-sm text-gray-500">Estado</div>
                    <div className="text-lg font-semibold">{tx.status}</div>
                  </>
                )}

                {tx.origin && (
                  <>
                    <div className="text-sm text-gray-500">Origen</div>
                    <div className="text-lg font-semibold">{tx.origin}</div>
                  </>
                )}

                {tx.destination && (
                  <>
                    <div className="text-sm text-gray-500">Destino</div>
                    <div className="text-lg font-semibold">{tx.destination}</div>
                  </>
                )}

                {tx.transactionType === 'recharge_external' && (
                  <>
                    {(tx.bankName || tx.destination) && (
                      <>
                        <div className="text-sm text-gray-500">Método</div>
                        <div className="text-lg font-semibold">
                          Tarjeta externa - {tx.bankName || tx.destination}
                        </div>
                      </>
                    )}

                    {tx.cardType && (
                      <>
                        <div className="text-sm text-gray-500">Tipo de tarjeta</div>
                        <div className="text-lg font-semibold">{tx.cardType}</div>
                      </>
                    )}

                    {tx.cardLast4 && (
                      <>
                        <div className="text-sm text-gray-500">Últimos 4 dígitos</div>
                        <div className="text-lg font-semibold">{tx.cardLast4}</div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
      </main>
    </div>
  );
}
