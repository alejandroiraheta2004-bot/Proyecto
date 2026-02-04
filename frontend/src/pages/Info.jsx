import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const TABS = {
  about: 'Acerca de nosotros',
  terms: 'Términos y Condiciones',
  security: 'Seguridad'
};

const getBool = (key, fallback = false) => {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
};

export default function Info() {
  const [activeTab, setActiveTab] = useState('about');
  const [securityState, setSecurityState] = useState({
    twoFactor: false,
    biometrics: false
  });

  useEffect(() => {
    const loadState = () => {
      setSecurityState({
        twoFactor: getBool('ewallet_two_factor', false),
        biometrics: getBool('ewallet_biometrics', false)
      });
    };
    loadState();
    const handleStorage = () => loadState();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <header className="flex items-center mb-6 w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="E-Wallet Logo" className="h-12" />
        </Link>
        <h1 className="text-2xl font-bold ml-auto text-gray-900">Información</h1>
      </header>

      <main className="w-full max-w-screen-xl mx-auto px-2 md:px-0">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(TABS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg font-semibold text-base transition-colors ${
                  activeTab === key
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <section className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Acerca de nosotros</h2>
              <p>
                Somos una billetera virtual moderna diseñada para impulsar la inclusión financiera en El Salvador,
                ofreciendo una experiencia rápida, confiable y sencilla para usuarios y negocios. Nuestra plataforma
                permite gestionar fondos, realizar pagos y transferencias en tiempo real, con una interfaz clara que
                reduce fricciones y mejora la accesibilidad digital.
              </p>
              <p>
                Promovemos la transparencia en cada operación, con herramientas de control y notificaciones que ayudan
                a los usuarios a entender sus movimientos en todo momento. Creemos en la tecnología como puente para
                facilitar el acceso a servicios financieros seguros y eficientes.
              </p>
            </section>
          )}

          {activeTab === 'terms' && (
            <section className="space-y-4 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
              <p>
                En cumplimiento del marco salvadoreño aplicable al comercio electrónico y la protección al consumidor,
                esta billetera virtual opera bajo principios de información clara, consentimiento explícito y trazabilidad
                de las operaciones. Los usuarios reciben confirmación de las transacciones y acceso al historial para
                fines de control y conciliación.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold">Manejo de fondos:</span> Los saldos se administran como dinero electrónico,
                  con registros detallados de cargas, pagos y transferencias. Las transacciones quedan reflejadas en el
                  historial de movimientos de la cuenta.
                </li>
                <li>
                  <span className="font-semibold">Comisiones:</span> Cualquier comisión aplicable se informa de forma previa,
                  clara y visible antes de confirmar la operación, respetando los principios de transparencia y publicidad
                  veraz.
                </li>
                <li>
                  <span className="font-semibold">Derechos del consumidor:</span> Los usuarios pueden presentar reclamos y
                  solicitar soporte sobre operaciones no reconocidas o fallidas. Se mantiene un canal de atención y se
                  documentan las respuestas conforme a la Ley de Protección al Consumidor.
                </li>
                <li>
                  <span className="font-semibold">Validez electrónica:</span> Las confirmaciones, mensajes y comprobantes
                  digitales son válidos como prueba de la operación, de acuerdo con la Ley de Comercio Electrónico.
                </li>
                <li>
                  <span className="font-semibold">Jurisdicción:</span> Cualquier controversia se resuelve bajo la legislación
                  y tribunales competentes de la República de El Salvador.
                </li>
              </ul>
              <p>
                Este resumen se alinea con la Ley de Facilitación de Compras en Línea, la Ley de Comercio Electrónico y
                la Ley de Protección al Consumidor, priorizando la transparencia, la seguridad y la resolución efectiva
                de conflictos.
              </p>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="space-y-5 text-gray-700">
              <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Credenciales y acceso</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Biometría: {securityState.biometrics ? 'Activada' : 'Disponible para activar'} en dispositivos compatibles.
                    </li>
                    <li>
                      2FA: {securityState.twoFactor ? 'Activado' : 'Disponible para activar'} desde la sección de Ajustes.
                    </li>
                    <li>
                      Encriptación de extremo a extremo para credenciales y sesiones en tránsito, además de cifrado TLS.
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-2">
                    Puedes gestionar la biometría y el 2FA en Ajustes para reforzar la protección de tu cuenta.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Convenios y licencias</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Registro como Proveedor de Dinero Electrónico ante el BCR.</li>
                    <li>Cumplimiento con la Ley para Facilitar la Inclusión Financiera.</li>
                    <li>Buenas prácticas alineadas a estándares PCI DSS para manejo de tarjetas.</li>
                    <li>Políticas de privacidad alineadas con la Ley de Protección de Datos Personales.</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Transacciones 365</h3>
                <p>
                  Operamos sobre infraestructura de pagos en tiempo real (como Transfer365 del BCR), lo que permite
                  transferencias y liquidaciones 24/7, con trazabilidad y confirmaciones inmediatas.
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="text-sm text-gray-700 text-center mt-6">© 2026 Billetera digital</div>
      </main>
    </div>
  );
}
