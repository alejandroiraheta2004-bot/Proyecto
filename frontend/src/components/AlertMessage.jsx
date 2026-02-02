const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800'
};

const iconByType = {
  success: '/assets/icon-check.svg',
  error: '/assets/icon-error.svg',
  info: '/assets/icon-wallet.svg',
  warning: '/assets/icon-recharge.svg'
};

export default function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-3 border px-4 py-3 rounded-xl ${styles[type] || styles.info}`}>
      <img src={iconByType[type] || iconByType.info} className="h-5" alt="" />
      <span className="font-medium flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-semibold hover:underline"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
