const express = require('express');
const router = express.Router();
const { generateFlashcards, generateQuiz } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateFlashcards);
router.post('/generate-quiz', protect, generateQuiz);

module.exports = router;
