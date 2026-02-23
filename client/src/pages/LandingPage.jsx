import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">PetTime</h1>
        <div className="flex gap-3">
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="text-6xl mb-6">🐾</div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Gestiona las citas veterinarias de tus mascotas
        </h2>
        <p className="text-lg text-gray-600 max-w-xl mb-8">
          PetTime te permite agendar, modificar y consultar citas en tiempo real.
          Accede al historial médico de tus mascotas de forma segura y sencilla.
        </p>
        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-md"
        >
          Comenzar gratis
        </Link>
      </main>

      {/* Features */}
      <section className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-800 mb-2">Agenda citas fácilmente</h3>
            <p className="text-gray-500 text-sm">Programa citas veterinarias en segundos desde tu celular o computador.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-800 mb-2">Recordatorios automáticos</h3>
            <p className="text-gray-500 text-sm">Nunca olvides una cita. Recibe recordatorios antes de cada visita.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-800 mb-2">Historial médico</h3>
            <p className="text-gray-500 text-sm">Accede al historial completo de salud de tus mascotas en cualquier momento.</p>
          </div>
        </div>
      </section>

      <footer className="text-center py-4 text-gray-400 text-sm">
        © 2025 PetTime — Pereira, Risaralda, Colombia
      </footer>
    </div>
  );
};

export default LandingPage;
