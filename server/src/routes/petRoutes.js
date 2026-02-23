const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPets, getPetById, createPet, updatePet, deletePet } = require('../controllers/petController');

router.use(protect);

router.get('/', getPets);
router.post('/', createPet);
router.get('/:id', getPetById);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

module.exports = router;
