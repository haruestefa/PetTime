import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { petService } from '../services/petService';
import { clinicService } from '../services/clinicService';
import Sidebar from '../components/layout/Sidebar';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  scheduled: { label: 'Programada', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' }
};

const REASONS = [
  { group: 'Consultas generales', items: ['Medicina general', 'Urgencia / Emergencia', 'Control y seguimiento'] },
  { group: 'Prevención', items: ['Vacunación', 'Desparasitación', 'Vacunación y desparasitación'] },
  { group: 'Especialidades', items: [
    'Cirugía', 'Esterilización / Castración', 'Dermatología (piel y pelo)',
    'Odontología veterinaria', 'Oftalmología (ojos)', 'Ortopedia / Traumatología',
    'Cardiología', 'Nutrición y dietética',
    'Diagnóstico por imagen (radiografía / ecografía)',
    'Exámenes de laboratorio', 'Rehabilitación física'
  ]},
  { group: 'Otro', items: ['Otro'] }
];

// Fórmula de Haversine: distancia en km entre dos coordenadas
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Convierte fecha ISO de Supabase al formato requerido por datetime-local
const toLocalDatetimeInput = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};

// ── Wizard de nueva cita ──────────────────────────────────────────────────────

const WizardStep1 = ({ pets, form, setForm, onNext, onCancel }) => (
  <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</span>
      <h3 className="font-semibold text-gray-800">Información de la cita</h3>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
      <select
        required
        value={form.pet_id}
        onChange={e => setForm({ ...form, pet_id: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccionar mascota...</option>
        {pets.map(p => (
          <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
      <select
        required
        value={form.reason}
        onChange={e => setForm({ ...form, reason: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccionar motivo...</option>
        {REASONS.map(g => (
          <optgroup key={g.group} label={g.group}>
            {g.items.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
      <textarea
        value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })}
        placeholder="Observaciones adicionales..."
        rows={2}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>

    <div className="flex gap-3 pt-2">
      <button
        onClick={() => {
          if (!form.pet_id) return toast.error('Selecciona una mascota');
          if (!form.reason) return toast.error('Selecciona un motivo');
          onNext();
        }}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
      >
        Siguiente →
      </button>
      <button type="button" onClick={onCancel} className="text-gray-500 hover:underline text-sm">
        Cancelar
      </button>
    </div>
  </div>
);

const WizardStep2 = ({ form, setForm, onNext, onBack }) => {
  const [geoState, setGeoState] = useState('idle'); // idle | loading | granted | denied
  const [clinics, setClinics] = useState([]);
  const [userCoords, setUserCoords] = useState(null);

  const requestLocation = () => {
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });
        setGeoState('granted');
        try {
          const data = await clinicService.getAll();
          const sorted = data
            .map(c => ({
              ...c,
              distance: (c.latitude && c.longitude)
                ? haversineKm(latitude, longitude, c.latitude, c.longitude)
                : null
            }))
            .sort((a, b) => {
              if (a.distance === null && b.distance === null) return 0;
              if (a.distance === null) return 1;
              if (b.distance === null) return -1;
              return a.distance - b.distance;
            });
          setClinics(sorted);
        } catch {
          toast.error('Error al cargar clínicas');
        }
      },
      async () => {
        setGeoState('denied');
        try {
          const data = await clinicService.getAll();
          setClinics(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch {
          toast.error('Error al cargar clínicas');
        }
      }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</span>
        <h3 className="font-semibold text-gray-800">Seleccionar clínica</h3>
      </div>

      {geoState === 'loading' && (
        <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          Obteniendo tu ubicación...
        </div>
      )}

      {geoState === 'denied' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-700">
          📍 No se pudo acceder a tu ubicación. Clínicas ordenadas alfabéticamente.
        </div>
      )}

      {(geoState === 'granted' || geoState === 'denied') && clinics.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">No hay clínicas registradas.</p>
      )}

      {(geoState === 'granted' || geoState === 'denied') && clinics.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {clinics.map(clinic => (
            <button
              key={clinic.id}
              type="button"
              onClick={() => setForm({ ...form, clinic_id: clinic.id, clinic_name: clinic.name })}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition ${
                form.clinic_id === clinic.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{clinic.name}</p>
                  <p className="text-gray-500 text-xs">📍 {clinic.city}</p>
                </div>
                {clinic.distance !== null ? (
                  <span className="text-blue-600 text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">
                    {clinic.distance < 1
                      ? `${Math.round(clinic.distance * 1000)} m`
                      : `${clinic.distance.toFixed(1)} km`}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Sin coordenadas</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="text-gray-500 hover:underline text-sm">← Atrás</button>
        <button
          onClick={() => {
            if (!form.clinic_id) return toast.error('Selecciona una clínica para continuar');
            onNext();
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Siguiente →
        </button>
        <button
          onClick={() => { setForm({ ...form, clinic_id: null, clinic_name: '' }); onNext(); }}
          className="text-gray-400 hover:underline text-xs ml-auto"
        >
          Omitir clínica
        </button>
      </div>
    </div>
  );
};

const WizardStep3 = ({ form, setForm, pets, saving, onSubmit, onBack }) => {
  const pet = pets.find(p => p.id === form.pet_id);

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
        <h3 className="font-semibold text-gray-800">Fecha, hora y confirmación</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora *</label>
        <input
          type="datetime-local"
          required
          value={form.appointment_date}
          onChange={e => setForm({ ...form, appointment_date: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 mb-2">Resumen de la cita</p>
        <p>🐾 <span className="font-medium">{pet?.name}</span> ({pet?.species})</p>
        <p>📋 {form.reason}</p>
        {form.clinic_name && <p>🏥 {form.clinic_name}</p>}
        {!form.clinic_id && <p className="text-gray-400">🏥 Sin clínica asignada</p>}
        {form.notes && <p>📝 {form.notes}</p>}
        {form.appointment_date && (
          <p>📅 {new Date(form.appointment_date).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="text-gray-500 hover:underline text-sm">← Atrás</button>
        <button
          onClick={() => {
            if (!form.appointment_date) return toast.error('Selecciona fecha y hora');
            onSubmit();
          }}
          disabled={saving}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm"
        >
          {saving ? 'Agendando...' : 'Confirmar cita'}
        </button>
      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pet_id: '', reason: '', notes: '', clinic_id: null, clinic_name: '', appointment_date: ''
  });

  // Estado para edición
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [clinicsForEdit, setClinicsForEdit] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    Promise.all([fetchAppointments(), fetchPets()]).finally(() => setLoading(false));
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch {
      toast.error('Error al cargar citas');
    }
  };

  const fetchPets = async () => {
    try {
      const data = await petService.getAll();
      setPets(data);
    } catch {}
  };

  const fetchClinicsForEdit = async () => {
    if (clinicsForEdit.length > 0) return;
    try {
      const data = await clinicService.getAll();
      setClinicsForEdit(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      toast.error('Error al cargar clínicas');
    }
  };

  const openWizard = () => {
    setForm({ pet_id: '', reason: '', notes: '', clinic_id: null, clinic_name: '', appointment_date: '' });
    setWizardStep(1);
    setShowWizard(true);
  };

  const closeWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await appointmentService.create({
        pet_id: form.pet_id,
        reason: form.reason,
        notes: form.notes,
        clinic_id: form.clinic_id || null,
        appointment_date: form.appointment_date
      });
      toast.success('¡Cita agendada exitosamente!');
      closeWizard();
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al agendar cita');
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = async (apt) => {
    setEditingAppointment(apt.id);
    setEditForm({
      reason: apt.reason,
      notes: apt.notes || '',
      appointment_date: toLocalDatetimeInput(apt.appointment_date),
      clinic_id: apt.clinic_id || '',
      status: apt.status
    });
    await fetchClinicsForEdit();
  };

  const handleEditCancel = () => {
    setEditingAppointment(null);
    setEditForm({});
  };

  const handleEditSubmit = async (id) => {
    setSavingEdit(true);
    try {
      await appointmentService.update(id, {
        reason: editForm.reason,
        notes: editForm.notes,
        appointment_date: editForm.appointment_date,
        clinic_id: editForm.clinic_id || null,
        status: editForm.status
      });
      toast.success('Cita actualizada');
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar cita');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await appointmentService.update(id, { status: 'cancelled' });
      toast.success('Cita cancelada');
      fetchAppointments();
    } catch {
      toast.error('Error al cancelar la cita');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await appointmentService.remove(id);
      toast.success('Cita eliminada');
      setAppointments(appointments.filter(a => a.id !== id));
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 ml-56 max-w-4xl px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis citas</h2>
          {!showWizard && (
            <button
              onClick={openWizard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              + Agendar cita
            </button>
          )}
        </div>

        {/* Indicador de pasos */}
        {showWizard && (
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  step < wizardStep
                    ? 'bg-green-500 text-white'
                    : step === wizardStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < wizardStep ? '✓' : step}
                </div>
                <span className={`text-xs hidden sm:block ${step === wizardStep ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {step === 1 ? 'Detalles' : step === 2 ? 'Clínica' : 'Fecha'}
                </span>
                {step < 3 && <div className={`h-px w-8 ${step < wizardStep ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Wizard */}
        {showWizard && wizardStep === 1 && (
          <WizardStep1
            pets={pets}
            form={form}
            setForm={setForm}
            onNext={() => setWizardStep(2)}
            onCancel={closeWizard}
          />
        )}
        {showWizard && wizardStep === 2 && (
          <WizardStep2
            form={form}
            setForm={setForm}
            onNext={() => setWizardStep(3)}
            onBack={() => setWizardStep(1)}
          />
        )}
        {showWizard && wizardStep === 3 && (
          <WizardStep3
            form={form}
            setForm={setForm}
            pets={pets}
            saving={saving}
            onSubmit={handleSubmit}
            onBack={() => setWizardStep(2)}
          />
        )}

        {/* Lista de citas */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📅</div>
            <p>Aún no tienes citas agendadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => {
              const status = STATUS_LABELS[apt.status] || STATUS_LABELS.scheduled;

              // Modo edición: formulario inline
              if (editingAppointment === apt.id) {
                return (
                  <div key={apt.id} className="bg-white rounded-2xl shadow p-5 border-2 border-blue-400">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm">Editando cita</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                        <select
                          value={editForm.reason}
                          onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {REASONS.map(g => (
                            <optgroup key={g.group} label={g.group}>
                              {g.items.map(item => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                        <input
                          type="datetime-local"
                          value={editForm.appointment_date}
                          onChange={e => setEditForm({ ...editForm, appointment_date: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Clínica</label>
                        <select
                          value={editForm.clinic_id}
                          onChange={e => setEditForm({ ...editForm, clinic_id: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sin clínica</option>
                          {clinicsForEdit.map(c => (
                            <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          value={editForm.status}
                          onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="scheduled">Programada</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                          value={editForm.notes}
                          onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                          rows={2}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleEditSubmit(apt.id)}
                        disabled={savingEdit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="text-gray-500 hover:underline text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              // Modo lectura: tarjeta normal
              return (
                <div key={apt.id} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{apt.reason}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        🐾 {apt.pets?.name} · 📅 {formatDate(apt.appointment_date)}
                      </p>
                      {apt.clinics && (
                        <p className="text-gray-400 text-xs mt-1">🏥 {apt.clinics.name} — {apt.clinics.city}</p>
                      )}
                      {apt.notes && <p className="text-gray-400 text-xs">📝 {apt.notes}</p>}
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      {user?.role === 'admin' ? (
                        <>
                          <button
                            onClick={() => handleEditOpen(apt)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="text-red-400 hover:text-red-600 text-sm"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={apt.status === 'cancelled'}
                          className="text-red-400 hover:text-red-600 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {apt.status === 'cancelled' ? 'Cancelada' : 'Cancelar cita'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AppointmentsPage;
