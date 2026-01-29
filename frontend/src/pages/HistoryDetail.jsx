import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    fetchData();
  }, []);

  const tx = useMemo(() => transactions.find((t) => String(t.id) === String(id)), [transactions, id]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
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
            ← Regresar
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {loading ? (
            <p className="text-gray-700">Cargando...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
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
