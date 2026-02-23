const supabase = require('../config/database');

const getPets = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mascotas', error: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la mascota', error: error.message });
  }
};

const createPet = async (req, res) => {
  const { name, species, breed, date_of_birth, weight_kg, notes } = req.body;

  if (!name || !species) {
    return res.status(400).json({ message: 'Nombre y especie son requeridos' });
  }

  try {
    const { data, error } = await supabase
      .from('pets')
      .insert({ name, species, breed, date_of_birth, weight_kg, notes, user_id: req.user.id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Mascota creada exitosamente', pet: data });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la mascota', error: error.message });
  }
};

const updatePet = async (req, res) => {
  const { name, species, breed, date_of_birth, weight_kg, notes } = req.body;

  try {
    const { data, error } = await supabase
      .from('pets')
      .update({ name, species, breed, date_of_birth, weight_kg, notes })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Mascota no encontrada' });
    }
    res.json({ message: 'Mascota actualizada', pet: data });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la mascota', error: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Mascota eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la mascota', error: error.message });
  }
};

module.exports = { getPets, getPetById, createPet, updatePet, deletePet };
