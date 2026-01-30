import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Cards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ number: '', brand: '', color: 'sky' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.myCards();
      setCards(res?.data || res?.cards || []);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar las tarjetas');
      if (err?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 19);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const onChange = (e) => {
    if (e.target.name === 'number') {
      const formatted = formatCardNumber(e.target.value);
      setForm((prev) => ({ ...prev, number: formatted }));
      return;
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const digitsOnly = form.number.replace(/\s/g, '');
    if (!/^[0-9]{13,19}$/.test(digitsOnly)) {
      setError('Ingresa un número de tarjeta válido');
      return;
    }
    if (!form.brand.trim()) {
      setError('Ingresa el tipo de tarjeta');
      return;
    }

    try {
      setSaving(true);
      const last4 = digitsOnly.slice(-4);
      const exists = cards.some((c) => c.last4 === last4 && c.brand === form.brand.trim());
      if (exists) {
        setError('Esta tarjeta ya está registrada');
        return;
      }
      await api.createCard({ last4, brand: form.brand.trim(), color: form.color });
      setForm({ number: '', brand: '', color: 'sky' });
      setSuccess('Tarjeta registrada exitosamente');
      await fetchCards();
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la tarjeta');
    } finally {
      setSaving(false);
    }
  };

  const toggleCardStatus = async (card) => {
    try {
      await api.updateCardStatus(card.id, { estado: card.estado === 1 ? 0 : 1 });
      await fetchCards();
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la tarjeta');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <header className="flex items-center mb-6 w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Tarjetas</h1>
          <Link
            to="/dashboard"
            className="px-4 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 text-base"
          >
            ← Regresar
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Agregar tarjeta</h2>
            {error && (
              <div className="text-base text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-3">
                {error}
              </div>
            )}
            {success && (
              <div className="text-base text-green-800 bg-green-50 border border-green-100 px-3 py-2 rounded-lg mb-3">
                {success}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-base text-gray-700 mb-2">Número de tarjeta</label>
                <input
                  type="text"
                  name="number"
                  maxLength={19}
                  value={form.number}
                  onChange={onChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-2">Tipo de tarjeta</label>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={onChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                  <option value="Diners">Diners</option>
                </select>
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-2">Color de tarjeta</label>
                <select
                  name="color"
                  value={form.color}
                  onChange={onChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  required
                >
                  <option value="sky">Celeste</option>
                  <option value="blue">Azul</option>
                  <option value="indigo">Morado</option>
                  <option value="emerald">Verde</option>
                  <option value="amber">Naranja</option>
                  <option value="rose">Rosado</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar tarjeta'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Tarjetas registradas</h2>
            {loading ? (
              <p className="text-gray-700">Cargando...</p>
            ) : cards.length === 0 ? (
              <p className="text-gray-700">No hay tarjetas registradas.</p>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-semibold">{card.brand}</div>
                      <div className="text-base text-gray-700">•••• {card.last4}</div>
                      <div className="text-sm text-gray-500">Color: {card.color || 'sky'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCardStatus(card)}
                        className={`text-sm px-3 py-2 rounded-lg font-semibold ${card.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-gray-700'}`}
                      >
                        {card.estado === 1 ? 'Activa' : 'Inactiva'}
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('¿Eliminar esta tarjeta?')) {
                            await api.deleteCard(card.id);
                            await fetchCards();
                          }
                        }}
                        className="text-sm px-3 py-2 rounded-lg font-semibold bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-700 text-center mt-6">© 2025 Billetera digital</div>
      </main>
    </div>
  );
}
