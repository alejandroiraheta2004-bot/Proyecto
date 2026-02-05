const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper genérico para llamadas HTTP
async function request(path, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data?.message ||
        (res.status === 401 || res.status === 400
          ? 'Error de datos, compruebe la información'
          : 'Error al comunicarse con el servidor');
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      // Error de red/fetch
      throw new Error('No se pudo conectar con el servidor');
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (payload) => request('/auth/login/', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/users/', { method: 'POST', body: JSON.stringify(payload) }),
  // Perfil y transacciones
  me: () => request('/me', { method: 'GET', headers: authHeader() }),
  myTransactions: () => request('/me/transactions', { method: 'GET', headers: authHeader() }),
  createTransaction: (payload) => request('/me/transactions', { method: 'POST', body: JSON.stringify(payload), headers: authHeader() }),
  setPrimaryCard: (payload) => request('/me/primary-card', { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader() }),
  // Tarjetas
  myCards: () => request('/cards', { method: 'GET', headers: authHeader() }),
  createCard: (payload) => request('/cards', { method: 'POST', body: JSON.stringify(payload), headers: authHeader() }),
  updateCardStatus: (id, payload) => request(`/cards/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader() }),
  deleteCard: (id) => request(`/cards/${id}`, { method: 'DELETE', headers: authHeader() }),
  // Envíos
  sendInternal: (payload) => request('/transfers/internal', { method: 'POST', body: JSON.stringify(payload), headers: authHeader() }),
  sendExternal: (payload) => request('/transfers/external', { method: 'POST', body: JSON.stringify(payload), headers: authHeader() }),
  // Recargas
  recharge: (payload) => request('/recharges', { method: 'POST', body: JSON.stringify(payload), headers: authHeader() }),
  // Pagos programados
  listPayments: () => request('/payments', { method: 'GET', headers: authHeader() }),
  getPayment: (id) => request(`/payments/${id}`, { method: 'GET', headers: authHeader() }),
  createPayment: (payload) => request('/payments', { method: 'POST', body: JSON.stringify(payload), headers: authHeader() }),
  updatePayment: (id, payload) => request(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: authHeader() }),
  cancelPayment: (id) => request(`/payments/${id}/cancel`, { method: 'PATCH', headers: authHeader() }),
  listPaymentExecutions: () => request('/payments/executions', { method: 'GET', headers: authHeader() }),
  getPaymentExecution: (id) => request(`/payments/executions/${id}`, { method: 'GET', headers: authHeader() }),
  runDuePayments: () => request('/payments/run-due', { method: 'POST', headers: authHeader() })
};

// Adjunta token JWT si existe
function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
