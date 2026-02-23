const supabase = require('../config/database');

const getClinics = async (req, res) => {
  try {
    // Obtener clínicas con promedio de calificación calculado desde reviews
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        reviews(rating)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Calcular promedio de rating para cada clínica
    const clinicsWithRating = data.map(clinic => {
      const ratings = clinic.reviews.map(r => r.rating);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;
      return {
        ...clinic,
        avg_rating: avgRating ? parseFloat(avgRating) : null,
        review_count: ratings.length,
        reviews: undefined
      };
    });

    res.json(clinicsWithRating);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clínicas', error: error.message });
  }
};

const getClinicById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select(`
        *,
        reviews(id, rating, comment, created_at, user_id)
      `)
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Clínica no encontrada' });
    }

    const ratings = data.reviews.map(r => r.rating);
    const avgRating = ratings.length > 0
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : null;

    res.json({ ...data, avg_rating: avgRating, review_count: ratings.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la clínica', error: error.message });
  }
};

const geocodeClinic = async (address, city) => {
  try {
    const query = [address, city, 'Colombia'].filter(Boolean).join(', ');
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PetTimeApp/1.0 (pettime@example.com)' }
    });
    const results = await response.json();
    if (results.length > 0) {
      return { latitude: parseFloat(results[0].lat), longitude: parseFloat(results[0].lon) };
    }
  } catch {
    // Geocodificación opcional — no bloquea la creación
  }
  return { latitude: null, longitude: null };
};

const createClinic = async (req, res) => {
  const { name, address, city, latitude: manualLat, longitude: manualLon } = req.body;

  if (!name || !city) {
    return res.status(400).json({ message: 'Nombre y ciudad son requeridos' });
  }

  try {
    let latitude = manualLat !== undefined && manualLat !== '' ? parseFloat(manualLat) : null;
    let longitude = manualLon !== undefined && manualLon !== '' ? parseFloat(manualLon) : null;

    // Solo geocodificar si no se ingresaron coordenadas manualmente
    if (latitude === null || longitude === null) {
      const coords = await geocodeClinic(address, city);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    const { data, error } = await supabase
      .from('clinics')
      .insert({ name, address, city, latitude, longitude, created_by: req.user.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Clínica creada exitosamente', clinic: data });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la clínica', error: error.message });
  }
};

const updateClinic = async (req, res) => {
  const { name, address, city } = req.body;

  try {
    const { data, error } = await supabase
      .from('clinics')
      .update({ name, address, city })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Clínica no encontrada' });
    }
    res.json({ message: 'Clínica actualizada', clinic: data });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la clínica', error: error.message });
  }
};

const deleteClinic = async (req, res) => {
  try {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Clínica eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la clínica', error: error.message });
  }
};

module.exports = { getClinics, getClinicById, createClinic, updateClinic, deleteClinic };
