const express = require('express');
const router = express.Router();
const { saveQuizScore, getQuizHistory } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all quiz endpoints

router.route('/')
  .post(saveQuizScore);

router.get('/history', getQuizHistory);

module.exports = router;
