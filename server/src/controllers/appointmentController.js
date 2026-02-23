const supabase = require('../config/database');

const getAppointments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, pets(name, species), clinics(name, city)')
      .eq('user_id', req.user.id)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener citas', error: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, pets(name, species)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la cita', error: error.message });
  }
};

const createAppointment = async (req, res) => {
  const { pet_id, clinic_id, appointment_date, reason, notes } = req.body;

  if (!pet_id || !appointment_date || !reason) {
    return res.status(400).json({ message: 'Mascota, fecha y motivo son requeridos' });
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        pet_id,
        clinic_id: clinic_id || null,
        appointment_date,
        reason,
        notes,
        user_id: req.user.id,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Cita agendada exitosamente', appointment: data });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la cita', error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  const { clinic_id, appointment_date, reason, status, notes } = req.body;

  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ clinic_id: clinic_id || null, appointment_date, reason, status, notes })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json({ message: 'Cita actualizada', appointment: data });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la cita', error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Cita eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la cita', error: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
