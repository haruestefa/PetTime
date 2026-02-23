const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { getClinics, getClinicById, createClinic, updateClinic, deleteClinic } = require('../controllers/clinicController');
const { getReviewsByClinic, createOrUpdateReview, deleteReview } = require('../controllers/reviewController');

// Todas las rutas requieren autenticación
router.use(protect);

// Lectura: disponible para todos los usuarios autenticados
router.get('/', getClinics);
router.get('/:id', getClinicById);

// Escritura: solo administradores pueden crear, editar o eliminar clínicas
router.post('/', requireAdmin, createClinic);
router.put('/:id', requireAdmin, updateClinic);
router.delete('/:id', requireAdmin, deleteClinic);

// Reseñas: todos los usuarios autenticados pueden ver y escribir reseñas
router.get('/:clinicId/reviews', getReviewsByClinic);
router.post('/:clinicId/reviews', createOrUpdateReview);
router.delete('/:clinicId/reviews/:id', deleteReview);

module.exports = router;
