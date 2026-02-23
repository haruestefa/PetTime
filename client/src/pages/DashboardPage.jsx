import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import Sidebar from '../components/layout/Sidebar';

const STATUS_LABELS = {
  scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Completada',  color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelada',   color: 'bg-red-100 text-red-700' },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [loadingApts, setLoadingApts] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const data = await appointmentService.getAll();
        const now = new Date();
        // Citas programadas con fecha futura, ordenadas por fecha, máximo 5
        const next = data
          .filter(a => a.status === 'scheduled' && new Date(a.appointment_date) >= now)
          .slice(0, 5);
        setUpcoming(next);
      } catch {
        // silencioso: los recordatorios son opcionales
      } finally {
        setLoadingApts(false);
      }
    };
    fetchUpcoming();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

  // Días restantes hasta la cita
  const daysUntil = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-56 px-8 py-10">
        <div className="flex items-end gap-3 mb-2 w-full">
          <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
            Bienvenido, {user?.name} 👋
          </h2>
          <div className="flex items-end gap-3 flex-1 overflow-hidden">
            {Array.from({ length: 12 }, (_, i) => (
              <svg
                key={i}
                className="paw-walk flex-shrink-0"
                width="26" height="26"
                viewBox="0 0 100 100"
                fill="#9ca3af"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginTop: i % 2 === 1 ? '8px' : '0px' }}
              >
                {/* Almohadilla principal */}
                <ellipse cx="45" cy="62" rx="22" ry="20" />
                {/* Dedo superior izquierdo */}
                <ellipse cx="28" cy="38" rx="9" ry="11" transform="rotate(-15 28 38)" />
                {/* Dedo superior central */}
                <ellipse cx="45" cy="30" rx="9" ry="11" transform="rotate(5 45 30)" />
                {/* Dedo superior derecho arriba */}
                <ellipse cx="62" cy="35" rx="8" ry="10" transform="rotate(20 62 35)" />
                {/* Dedo derecho bajo */}
                <ellipse cx="70" cy="55" rx="7" ry="9" transform="rotate(35 70 55)" />
              </svg>
            ))}
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-8">¿Qué quieres hacer hoy?</p>

        {/* Tarjetas de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <Link
            to="/pets"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="text-4xl">🐶</div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">Mis mascotas</h3>
              <p className="text-gray-500 text-xs">Administra el perfil de tus mascotas</p>
            </div>
          </Link>

          <Link
            to="/appointments"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="text-4xl">📅</div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">Mis citas</h3>
              <p className="text-gray-500 text-xs">Agenda y consulta citas veterinarias</p>
            </div>
          </Link>

          <Link
            to="/clinics"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition flex items-center gap-4"
          >
            <div className="text-4xl">🏥</div>
            <div>
              <h3 className="font-semibold text-gray-800 text-base">Clínicas</h3>
              <p className="text-gray-500 text-xs">Gestiona clínicas y consulta reseñas</p>
            </div>
          </Link>
        </div>

        {/* Recordatorios de próximas citas */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">🔔 Próximas citas</h3>
            <Link to="/appointments" className="text-blue-600 text-sm hover:underline">
              Ver todas →
            </Link>
          </div>

          {loadingApts ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No tienes citas programadas próximamente</p>
              <Link
                to="/appointments"
                className="mt-3 inline-block text-blue-600 text-sm hover:underline"
              >
                + Agendar una cita
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map(apt => {
                const status = STATUS_LABELS[apt.status] || STATUS_LABELS.scheduled;
                const days = daysUntil(apt.appointment_date);
                const urgent = new Date(apt.appointment_date) - new Date() < 1000 * 60 * 60 * 48;
                return (
                  <li
                    key={apt.id}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                      urgent ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{apt.reason}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        🐾 {apt.pets?.name} · 📅 {formatDate(apt.appointment_date)}
                      </p>
                      {apt.clinics && (
                        <p className="text-gray-400 text-xs">🏥 {apt.clinics.name}</p>
                      )}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-4 whitespace-nowrap ${
                      urgent ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {days}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
