import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { petService } from '../services/petService';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';

const SPECIES_ICON = {
  perro: '🐶',
  gato: '🐱',
  ave: '🐦',
  conejo: '🐰',
  otro: '🐾'
};

const PetsPage = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [form, setForm] = useState({ name: '', species: '', breed: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const data = await petService.getAll();
      setPets(data);
    } catch {
      toast.error('Error al cargar mascotas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPet) {
        await petService.update(editingPet.id, form);
        toast.success('Mascota actualizada');
      } else {
        await petService.create(form);
        toast.success('Mascota agregada');
      }
      handleCancelForm();
      fetchPets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar mascota');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setForm({ name: pet.name, species: pet.species, breed: pet.breed || '', notes: pet.notes || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPet(null);
    setForm({ name: '', species: '', breed: '', notes: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta mascota?')) return;
    try {
      await petService.remove(id);
      toast.success('Mascota eliminada');
      setPets(pets.filter(p => p.id !== id));
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-56 max-w-4xl px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis mascotas</h2>
          <button
            onClick={() => {
              setEditingPet(null);
              setForm({ name: '', species: '', breed: '', notes: '' });
              setShowForm(!showForm || editingPet !== null);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + Agregar mascota
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-gray-800">
              {editingPet ? `Editando: ${editingPet.name}` : 'Nueva mascota'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Firulais"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                <select
                  required
                  value={form.species}
                  onChange={e => setForm({ ...form, species: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="ave">Ave</option>
                  <option value="conejo">Conejo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                <input
                  value={form.breed}
                  onChange={e => setForm({ ...form, breed: e.target.value })}
                  placeholder="Labrador"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Información adicional"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {saving ? 'Guardando...' : (editingPet ? 'Actualizar mascota' : 'Guardar mascota')}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-gray-500 hover:underline text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🐾</div>
            <p>Aún no tienes mascotas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map(pet => (
              <div key={pet.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl leading-none">
                      {SPECIES_ICON[pet.species] || SPECIES_ICON.otro}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{pet.name}</h3>
                      <p className="text-gray-500 text-sm capitalize">{pet.species} {pet.breed && `· ${pet.breed}`}</p>
                      {pet.notes && <p className="text-gray-400 text-xs mt-1">{pet.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(pet)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PetsPage;
