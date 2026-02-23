const supabase = require('../config/database');

const getReviewsByClinic = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('clinic_id', req.params.clinicId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reseñas', error: error.message });
  }
};

const createOrUpdateReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { clinicId } = req.params;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'La calificación debe ser entre 1 y 5' });
  }

  try {
    // Verificar si ya existe una reseña del usuario para esta clínica
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('user_id', req.user.id)
      .single();

    let data, error;

    if (existing) {
      // Actualizar reseña existente
      ({ data, error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      // Crear nueva reseña
      ({ data, error } = await supabase
        .from('reviews')
        .insert({ clinic_id: clinicId, user_id: req.user.id, rating, comment })
        .select()
        .single());
    }

    if (error) throw error;
    res.status(existing ? 200 : 201).json({
      message: existing ? 'Reseña actualizada' : 'Reseña agregada',
      review: data
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la reseña', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la reseña', error: error.message });
  }
};

module.exports = { getReviewsByClinic, createOrUpdateReview, deleteReview };
