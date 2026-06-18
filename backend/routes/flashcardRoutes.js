const express = require('express');
const router = express.Router();
const { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard, reviewFlashcard } = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all flashcard routes

router.route('/')
  .get(getFlashcards)
  .post(createFlashcard);

router.route('/:id')
  .put(updateFlashcard)
  .delete(deleteFlashcard);

router.post('/:id/review', reviewFlashcard);

module.exports = router;
