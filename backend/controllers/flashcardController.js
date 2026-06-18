const Flashcard = require('../models/Flashcard');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get all flashcards for user, optionally filter by subjectId
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const query = { userId: req.user._id };
    
    if (subjectId) {
      query.subjectId = subjectId;
    }

    const flashcards = await Flashcard.find(query).sort({ createdAt: -1 });
    res.json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching flashcards' });
  }
};

// @desc    Create a new flashcard
// @route   POST /api/flashcards
// @access  Private
const createFlashcard = async (req, res) => {
  try {
    const { question, answer, subjectId, difficulty } = req.body;

    if (!question || !answer || !subjectId) {
      return res.status(400).json({ message: 'Question, answer, and subjectId are required' });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    const flashcard = await Flashcard.create({
      question,
      answer,
      subjectId,
      userId: req.user._id,
      difficulty: difficulty || 'medium',
      nextReviewDate: new Date() // ready to study immediately
    });

    res.status(201).json(flashcard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating flashcard' });
  }
};

// @desc    Update a flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
const updateFlashcard = async (req, res) => {
  try {
    const { question, answer, difficulty } = req.body;
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or unauthorized' });
    }

    flashcard.question = question || flashcard.question;
    flashcard.answer = answer || flashcard.answer;
    flashcard.difficulty = difficulty || flashcard.difficulty;

    const updatedFlashcard = await flashcard.save();
    res.json(updatedFlashcard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating flashcard' });
  }
};

// @desc    Delete a flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or unauthorized' });
    }

    await Flashcard.deleteOne({ _id: req.params.id });
    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting flashcard' });
  }
};

// @desc    Submit study review result (spaced repetition)
// @route   POST /api/flashcards/:id/review
// @access  Private
const reviewFlashcard = async (req, res) => {
  try {
    const { rating } = req.body; // 'easy' or 'hard'
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or unauthorized' });
    }

    let daysToAdd = 1;
    let xpGained = 2;

    if (rating === 'easy') {
      daysToAdd = 4;
      xpGained = 10;
      flashcard.difficulty = 'easy';
    } else {
      // Rating is 'hard'
      daysToAdd = 1;
      xpGained = 5;
      flashcard.difficulty = 'hard';
    }

    // Update nextReviewDate
    const newReviewDate = new Date();
    newReviewDate.setDate(newReviewDate.getDate() + daysToAdd);
    flashcard.nextReviewDate = newReviewDate;

    await flashcard.save();

    // Reward XP to the user
    const user = await User.findById(req.user._id);
    if (user) {
      user.xp += xpGained;
      await user.save();
    }

    res.json({
      message: `Card reviewed! Scheduled next revision in ${daysToAdd} days.`,
      flashcard,
      xpGained,
      userXp: user ? user.xp : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error reviewing flashcard' });
  }
};

module.exports = {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
};
