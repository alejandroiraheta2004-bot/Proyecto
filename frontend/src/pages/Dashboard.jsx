import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getExecutedTotal, getExecutions, runDuePayments } from '../services/payments';
import ModalConfirm from '../components/ModalConfirm';

// Barra lateral con navegación principal y cierre de sesión
const Sidebar = ({ onLogout, onClose }) => {
  const location = useLocation();
  // Opciones de menú con sus rutas
  const menuItems = [
    { label: 'Inicio', path: '/dashboard' },
    { label: 'Recargar', path: '/recharge' },
    { label: 'Enviar', path: '/send' },
    { label: 'Pagos', path: '/pagos' },
    { label: 'Historial', path: '/history' },
    { label: 'Tarjetas', path: '/cards' },
    { label: 'Ajustes', path: '/settings' },
  ];

  // Marca visualmente la ruta activa
  const isActive = (path) => (location.pathname === path ? 'bg-sky-600 text-white' : 'text-white');

  return (
    <aside className="bg-sky-700 text-white w-64 min-h-screen h-screen p-6 flex flex-col shadow-lg sticky top-0">
      <div className="flex items-center space-x-3 mb-10">
        <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-10" />
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-3 py-2 rounded-lg hover:bg-sky-600 transition ${isActive(item.path)}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="mt-10 text-left text-base text-sky-100 hover:text-white"
      >
        Salir
      </button>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 text-left text-base text-sky-100 hover:text-white md:hidden"
        >
          Cerrar menú
        </button>
      )}
    </aside>
  );
};

const StatCard = ({ title, value, accent }) => (
  <div className="bg-white shadow rounded-xl p-4 border border-gray-100">
    <p className="text-base text-gray-700">{title}</p>
    <p className="text-3xl font-semibold mt-2" style={{ color: accent }}>{value}</p>
  </div>
);

const TransactionRow = ({ description, amount, type, createdAt, transactionType }) => {
  // Ajusta color y signo según el tipo de movimiento
  const color = type === 'credit' ? 'text-green-600' : 'text-red-600';
  const sign = type === 'credit' ? '+' : '-';
  const bgClass = transactionType === 'send_internal'
    ? 'bg-sky-50'
    : type === 'credit'
      ? 'bg-green-50'
      : 'bg-red-50';
  return (
    <div className={`flex items-center justify-between py-3 px-3 rounded-lg border border-gray-100 ${bgClass} last:border-b-0`}>
      <div>
        <p className="font-medium text-gray-800">{description || 'Transacción'}</p>
        <p className="text-sm text-gray-700">{new Date(createdAt).toLocaleString()}</p>
      </div>
      <div className="text-right">
        <p className={`text-base font-semibold ${color}`}>{`${sign}$${Math.abs(amount || 0).toFixed(2)}`}</p>
        <p className="text-base text-gray-700">{type}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [executedTotal, setExecutedTotal] = useState(0);
  const [executions, setExecutions] = useState([]);
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

  // Carga perfil y transacciones en paralelo
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      runDuePayments();
      setExecutedTotal(getExecutedTotal());
      setExecutions(getExecutions());
      const results = await Promise.allSettled([api.me(), api.myTransactions(), api.myCards()]);
      const [meRes, txRes, cardsRes] = results;

      if (meRes.status === 'fulfilled') {
        setProfile(meRes.value?.data || meRes.value?.user || null);
      } else {
        setError(meRes.reason?.message || 'No se pudo cargar el perfil.');
      }

      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value?.data || txRes.value?.transactions || []);
      } else if (!error) {
        setError(txRes.reason?.message || 'No se pudo cargar el historial.');
      }

      if (cardsRes.status === 'fulfilled') {
        setCards(cardsRes.value?.data || cardsRes.value?.cards || []);
      } else if (!error) {
        setError(cardsRes.reason?.message || 'No se pudo cargar las tarjetas.');
      }
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la información.');
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

  // Calcula totales para tarjetas de resumen
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((tx) => tx.type === 'credit')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const totalExpense = transactions
      .filter((tx) => tx.type === 'debit')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const balance = Number(profile?.saldo_actual ?? totalIncome - totalExpense) - executedTotal;
    return {
      totalIncome,
      totalExpense,
      balance,
    };
  }, [transactions, profile, executedTotal]);

  // Últimas 5 transacciones para vista rápida
  const lastTransactions = useMemo(() => {
    const paymentExecutions = executions.map((exec) => ({
      id: `payment-exec-${exec.id}`,
      description: `Pago ejecutado: ${exec.serviceName}`,
      amount: Number(exec.amount || 0),
      type: 'debit',
      transactionType: 'payment_executed',
      createdAt: exec.executedAt || exec.executionDate
    }));

    return [...transactions, ...paymentExecutions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [transactions, executions]);

  const selectedCard = useMemo(() => {
    if (!cards.length) return null;
    const preferred = cards.find((c) => String(c.id) === String(profile?.primary_card_id));
    return preferred || cards[0];
  }, [cards, profile]);

  // Limpia token y redirige al inicio
  const handleLogout = () => {
    setConfirmConfig({
      open: true,
      title: 'Cerrar sesión',
      description: 'Se cerrará tu sesión actual. ¿Deseas continuar?',
      confirmText: 'Cerrar sesión',
      variant: 'primary',
      onConfirm: async () => {
        localStorage.removeItem('token');
        navigate('/');
      }
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
    <div className="min-h-screen bg-gray-50 flex">
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
      {/* Sidebar escritorio */}
      <div className="hidden md:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Sidebar móvil */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative">
            <Sidebar onLogout={handleLogout} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 px-4 pb-4 pt-4 md:px-8 md:pb-8 md:pt-4 space-y-6">
        {/* Header móvil */}
        <div className="md:hidden flex items-center justify-between bg-white rounded-xl shadow border border-gray-100 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3 py-2 bg-sky-700 text-white rounded-lg"
          >
            Menú
          </button>
          <div className="flex items-center gap-2">
            <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-8" />
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500"
          >
            Actualizar
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-base text-gray-700">Inicio de</p>
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile ? `${profile.nombre || profile.name || ''}`.trim() || 'Usuario' : 'Cargando...'}
            </h2>
          </div>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 hidden md:inline-flex"
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-3 md:p-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Datos de la cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base text-gray-700">
              <div>
                <p className="text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-900">{profile?.nombre || profile?.name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Usuario</p>
                <p className="font-semibold text-gray-900">{profile?.username || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Número de cuenta</p>
                <p className="font-semibold text-gray-900">{profile?.account_number || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Saldo actual</p>
                <p className="font-semibold text-gray-900">${Math.max(0, Number(profile?.saldo_actual ?? 0) - executedTotal).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-3 md:p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tarjeta principal</h3>
            {!selectedCard ? (
              <p className="text-gray-700">No hay tarjetas registradas.</p>
            ) : (
              <div
                className={`rounded-2xl text-white p-4 shadow-lg bg-gradient-to-r ${
                  (selectedCard.color || 'sky') === 'blue' ? 'from-blue-600 to-blue-800'
                  : (selectedCard.color || 'sky') === 'indigo' ? 'from-indigo-600 to-indigo-800'
                  : (selectedCard.color || 'sky') === 'emerald' ? 'from-emerald-500 to-emerald-700'
                  : (selectedCard.color || 'sky') === 'amber' ? 'from-amber-500 to-amber-700'
                  : (selectedCard.color || 'sky') === 'rose' ? 'from-rose-500 to-rose-700'
                  : 'from-sky-500 to-sky-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm uppercase tracking-widest">E-Wallet</span>
                  <span className="text-sm font-semibold">{selectedCard.brand}</span>
                </div>
                <div className="text-2xl font-semibold tracking-widest">•••• •••• •••• {selectedCard.last4}</div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full ${selectedCard.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {selectedCard.estado === 1 ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className="text-xs uppercase tracking-widest">{selectedCard.color || 'sky'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Saldo" value={`$${stats.balance.toFixed(2)}`} accent="#0f172a" />
          <StatCard title="Entradas" value={`$${stats.totalIncome.toFixed(2)}`} accent="#16a34a" />
          <StatCard title="Salidas" value={`$${stats.totalExpense.toFixed(2)}`} accent="#dc2626" />
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Últimas 5 transacciones</h3>
            <Link to="/history" className="text-base text-sky-700 hover:text-sky-600">Ver todo</Link>
          </div>
          {loading ? (
            <p className="text-gray-700">Cargando...</p>
          ) : lastTransactions.length === 0 ? (
            <p className="text-gray-700">No hay transacciones registradas.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {lastTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id || `${tx.description}-${tx.createdAt}`}
                  description={tx.description}
                  amount={Number(tx.amount || 0)}
                  type={tx.type}
                  transactionType={tx.transactionType}
                  createdAt={tx.createdAt}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
