import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import ModalConfirm from '../components/ModalConfirm';
import AlertMessage from '../components/AlertMessage';

export default function Cards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ number: '', brand: '', color: 'sky', cvv: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    variant: 'primary',
    onConfirm: null
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

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

  const formatCardNumber = (value, brand) => {
    const rules = brandRules[brand] || brandRules.Otra;
    const digits = value.replace(/\D/g, '').slice(0, Math.max(...rules.lengths));
    if (brand === 'American Express') {
      const part1 = digits.slice(0, 4);
      const part2 = digits.slice(4, 10);
      const part3 = digits.slice(10, 15);
      return [part1, part2, part3].filter(Boolean).join(' ');
    }
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const brandRules = useMemo(() => ({
    Visa: { lengths: [13, 16, 19], cvv: 3 },
    Mastercard: { lengths: [16], cvv: 3 },
    'American Express': { lengths: [15], cvv: 4 },
    Discover: { lengths: [16, 19], cvv: 3 },
    JCB: { lengths: [16], cvv: 3 },
    Diners: { lengths: [14], cvv: 3 },
    Otra: { lengths: [13, 14, 15, 16, 17, 18, 19], cvv: 3 }
  }), []);

  const onChange = (e) => {
    if (e.target.name === 'brand') {
      setForm((prev) => ({ ...prev, brand: e.target.value, number: '', cvv: '' }));
      setFieldErrors((prev) => ({ ...prev, number: '', cvv: '', brand: '' }));
      return;
    }
    if (e.target.name === 'number') {
      const formatted = formatCardNumber(e.target.value, form.brand);
      setForm((prev) => ({ ...prev, number: formatted }));
      if (fieldErrors.number) setFieldErrors((prev) => ({ ...prev, number: '' }));
      return;
    }
    if (e.target.name === 'cvv') {
      const digits = e.target.value.replace(/\D/g, '');
      const rules = brandRules[form.brand] || brandRules.Otra;
      const limited = digits.slice(0, rules.cvv);
      setForm((prev) => ({ ...prev, cvv: limited }));
      if (fieldErrors.cvv) setFieldErrors((prev) => ({ ...prev, cvv: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateFields = () => {
    const errors = {};
    const digitsOnly = form.number.replace(/\s/g, '');
    const brand = form.brand;
    const rules = brandRules[brand] || brandRules.Otra;

    if (!digitsOnly) {
      errors.number = 'Ingresa el número de tarjeta';
    } else if (!rules.lengths.includes(digitsOnly.length)) {
      errors.number = `El número no coincide con la longitud de ${brand || 'la tarjeta'}`;
    }

    if (!brand) {
      errors.brand = 'No se pudo detectar el tipo de tarjeta';
    }

    if (!form.cvv || form.cvv.length !== rules.cvv) {
      errors.cvv = `El CVV debe tener ${rules.cvv} dígitos`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getMaxInputLength = (brand) => {
    const rules = brandRules[brand] || brandRules.Otra;
    const maxDigits = Math.max(...rules.lengths);
    if (brand === 'American Express') return 17;
    return maxDigits + Math.floor((maxDigits - 1) / 4);
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

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateFields()) return;
    const digitsOnly = form.number.replace(/\s/g, '');
    const last4 = digitsOnly.slice(-4);
    const brand = form.brand;

    openConfirm({
      title: 'Confirmar registro de tarjeta',
      description: `Se agregará una tarjeta ${brand} terminada en ${last4}. ¿Deseas continuar?`,
      confirmText: 'Agregar tarjeta',
      onConfirm: async () => {
        try {
          setSaving(true);
          const exists = cards.some((c) => c.last4 === last4 && c.brand === brand);
          if (exists) {
            setError('Esta tarjeta ya está registrada');
            return;
          }
          await api.createCard({ last4, brand, color: form.color });
          setForm({ number: '', brand: '', color: 'sky', cvv: '' });
          setSuccess('Tarjeta registrada exitosamente');
          await fetchCards();
        } catch (err) {
          setError(err?.message || 'No se pudo registrar la tarjeta');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const toggleCardStatus = (card) => {
    openConfirm({
      title: card.estado === 1 ? 'Desactivar tarjeta' : 'Activar tarjeta',
      description: `Se ${card.estado === 1 ? 'desactivará' : 'activará'} la tarjeta ${card.brand} •••• ${card.last4}.`,
      confirmText: card.estado === 1 ? 'Desactivar' : 'Activar',
      onConfirm: async () => {
        try {
          await api.updateCardStatus(card.id, { estado: card.estado === 1 ? 0 : 1 });
          await fetchCards();
          setSuccess('Estado de tarjeta actualizado');
        } catch (err) {
          setError(err?.message || 'No se pudo actualizar la tarjeta');
        }
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

  const brandLogo = (brand) => {
    const logos = {
      Visa: '/assets/card-logos%201.PNG',
      Mastercard: '/assets/card-logos%202.PNG',
      'American Express': '/assets/card-logos%203.PNG',
      Diners: '/assets/card-logos%204.PNG',
      Discover: '/assets/card-logos%206.png',
      JCB: '/assets/card-logos%205.png'
    };
    const extraClassMap = {
      JCB: 'mix-blend-multiply'
    };

    if (!logos[brand]) {
      return (
        <div className="logo-frame">
          <div className="w-full h-full bg-slate-200 text-slate-700 text-xs font-bold rounded flex items-center justify-center">
            CARD
          </div>
        </div>
      );
    }

    return (
      <div className="logo-frame">
        <img
          src={logos[brand]}
          alt={brand}
          className={`logo-img ${extraClassMap[brand] || ''}`}
        />
      </div>
    );
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
        loading={confirmLoading || saving}
      />
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
            ← Volver
          </Link>
        </div>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Agregar tarjeta</h2>
            <div className="space-y-2 mb-3">
              {error && (
                <AlertMessage type="error" message={error} onClose={() => setError('')} />
              )}
              {success && (
                <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
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
                  <option value="JCB">JCB</option>
                  <option value="Diners">Diners</option>
                  <option value="Otra">Otra</option>
                </select>
                {fieldErrors.brand && <p className="text-sm text-red-600 mt-1">{fieldErrors.brand}</p>}
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-2">Número de tarjeta</label>
                <input
                  type="text"
                  name="number"
                  maxLength={getMaxInputLength(form.brand)}
                  value={form.number}
                  onChange={onChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="1234 5678 9012 3456"
                  required
                  disabled={!form.brand}
                />
                {fieldErrors.number && <p className="text-sm text-red-600 mt-1">{fieldErrors.number}</p>}
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-2">CVV</label>
                <input
                  type="password"
                  name="cvv"
                  value={form.cvv}
                  onChange={onChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="***"
                  required
                  disabled={!form.brand}
                />
                {fieldErrors.cvv && <p className="text-sm text-red-600 mt-1">{fieldErrors.cvv}</p>}
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

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <img src="/assets/pci.png" alt="Pagos seguros" className="h-5 opacity-80" />
                <span>Pagos seguros</span>
              </div>
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
                    <div className="flex items-center gap-3">
                      {brandLogo(card.brand || 'Otra')}
                      <div>
                        <div className="font-semibold">{card.brand}</div>
                        <div className="text-base text-gray-700">•••• {card.last4}</div>
                        <div className="text-sm text-gray-500">Color: {card.color || 'sky'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCardStatus(card)}
                        className={`text-sm px-3 py-2 rounded-lg font-semibold ${card.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-gray-700'}`}
                      >
                        {card.estado === 1 ? 'Activa' : 'Inactiva'}
                      </button>
                      <button
                        onClick={() => {
                          openConfirm({
                            title: 'Eliminar tarjeta',
                            description: `Se eliminará la tarjeta ${card.brand} •••• ${card.last4}. Esta acción no se puede deshacer.`,
                            confirmText: 'Eliminar',
                            variant: 'danger',
                            onConfirm: async () => {
                              try {
                                await api.deleteCard(card.id);
                                await fetchCards();
                                setSuccess('Tarjeta eliminada correctamente');
                              } catch (err) {
                                setError(err?.message || 'No se pudo eliminar la tarjeta');
                              }
                            }
                          });
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
