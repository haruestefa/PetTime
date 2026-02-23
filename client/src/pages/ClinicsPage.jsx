import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clinicService } from '../services/clinicService';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          {star <= (hovered || value) ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};

const ClinicsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [savingReview, setSavingReview] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', latitude: '', longitude: '' });

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const data = await clinicService.getAll();
      setClinics(data);
    } catch {
      toast.error('Error al cargar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (clinicId) => {
    try {
      const data = await clinicService.getReviews(clinicId);
      setReviews(data);
    } catch {
      toast.error('Error al cargar reseñas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clinicService.create(form);
      toast.success('Clínica agregada');
      setForm({ name: '', address: '', city: '', latitude: '', longitude: '' });
      setShowForm(false);
      fetchClinics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agregar clínica');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta clínica?')) return;
    try {
      await clinicService.remove(id);
      toast.success('Clínica eliminada');
      setClinics(clinics.filter(c => c.id !== id));
      if (selectedClinic?.id === id) setSelectedClinic(null);
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const openReviews = (clinic) => {
    setSelectedClinic(clinic);
    setReviewForm({ rating: 0, comment: '' });
    fetchReviews(clinic.id);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return toast.error('Selecciona una calificación');
    setSavingReview(true);
    try {
      await clinicService.saveReview(selectedClinic.id, reviewForm);
      toast.success('Reseña guardada');
      setReviewForm({ rating: 0, comment: '' });
      fetchReviews(selectedClinic.id);
      fetchClinics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar reseña');
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await clinicService.deleteReview(selectedClinic.id, reviewId);
      toast.success('Reseña eliminada');
      setReviews(reviews.filter(r => r.id !== reviewId));
      fetchClinics();
    } catch {
      toast.error('Error al eliminar reseña');
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400 text-sm">Sin calificación</span>;
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
        <span className="text-sm text-gray-500">{rating} / 5</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-56 max-w-4xl px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Clínicas veterinarias</h2>
            {isAdmin && (
              <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Administrador
              </span>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              + Agregar clínica
            </button>
          )}
        </div>

        {/* Formulario nueva clínica — solo admins */}
        {isAdmin && showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Nueva clínica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Clínica Veterinaria Los Andes"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Pereira"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Calle 15 # 10-20, Barrio Centro"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-2">
                  📍 Las coordenadas se detectan automáticamente. Ingrésalas solo si la detección falla.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitud <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={e => setForm({ ...form, latitude: e.target.value })}
                      placeholder="4.8133"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitud <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={e => setForm({ ...form, longitude: e.target.value })}
                      placeholder="-75.6961"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {saving ? 'Guardando...' : 'Guardar clínica'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:underline text-sm">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de clínicas */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🏥</div>
            <p>Aún no hay clínicas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinics.map(clinic => (
              <div key={clinic.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{clinic.name}</h3>
                    <p className="text-gray-500 text-sm">📍 {clinic.city}</p>
                    {clinic.address && <p className="text-gray-400 text-xs">{clinic.address}</p>}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(clinic.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="mt-2 mb-3">
                  {renderStars(clinic.avg_rating)}
                  {clinic.review_count > 0 && (
                    <span className="text-xs text-gray-400">{clinic.review_count} {clinic.review_count === 1 ? 'reseña' : 'reseñas'}</span>
                  )}
                </div>
                <button
                  onClick={() => openReviews(clinic)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Ver y agregar reseñas
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de reseñas */}
      {selectedClinic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">{selectedClinic.name}</h3>
                  <p className="text-gray-500 text-sm">📍 {selectedClinic.city}</p>
                </div>
                <button
                  onClick={() => setSelectedClinic(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Formulario nueva reseña */}
              <form onSubmit={handleSaveReview} className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
                <p className="font-semibold text-gray-700 text-sm">Tu calificación</p>
                <StarRating
                  value={reviewForm.rating}
                  onChange={val => setReviewForm({ ...reviewForm, rating: val })}
                />
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Escribe un comentario (opcional)..."
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={savingReview || reviewForm.rating === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingReview ? 'Guardando...' : 'Publicar reseña'}
                </button>
              </form>

              {/* Lista de reseñas */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-700 text-sm">Reseñas ({reviews.length})</p>
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Aún no hay reseñas. ¡Sé el primero!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-yellow-400 text-sm">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </div>
                          {review.comment && <p className="text-gray-600 text-sm mt-1">{review.comment}</p>}
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(review.created_at).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        {review.user_id === user?.id && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicsPage;
