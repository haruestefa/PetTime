import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard', icon: '🏠', label: 'Inicio' },
  { to: '/pets',      icon: '🐾', label: 'Mis mascotas' },
  { to: '/appointments', icon: '📅', label: 'Mis citas' },
  { to: '/clinics',   icon: '🏥', label: 'Clínicas' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="w-56 min-h-screen bg-white shadow-md flex flex-col fixed top-0 left-0 z-10">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600">🐾 PetTime</span>
      </div>

      {/* Usuario */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
        {isAdmin && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
            Administrador
          </span>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_LINKS.map(({ to, icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <span className="text-lg">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
