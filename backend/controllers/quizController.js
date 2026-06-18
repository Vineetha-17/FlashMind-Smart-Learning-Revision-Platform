const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Subject = require('../models/Subject');

// @desc    Save completed quiz score and reward XP
// @route   POST /api/quizzes
// @access  Private
const saveQuizScore = async (req, res) => {
  try {
    const { subjectId, score, totalQuestions, topic } = req.body;
    const userId = req.user._id;

    if (!subjectId || score === undefined || !topic) {
      return res.status(400).json({ message: 'Subject ID, score, and topic are required' });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    // Save quiz
    const quiz = await Quiz.create({
      userId,
      subjectId,
      topic,
      score,
      totalQuestions: totalQuestions || 5
    });

    // Reward XP: +20 XP per correct answer
    const xpGained = score * 20;
    const user = await User.findById(userId);
    if (user) {
      user.xp += xpGained;
      await user.save();
    }

    res.status(201).json({
      message: `Quiz saved successfully! You scored ${score}/${totalQuestions} and gained ${xpGained} XP.`,
      quiz,
      xpGained,
      userXp: user ? user.xp : 0
    });

  } catch (error) {
    console.error('Error saving quiz score:', error);
    res.status(500).json({ message: 'Server error saving quiz score' });
  }
};

// @desc    Get user's quiz history
// @route   GET /api/quizzes/history
// @access  Private
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await Quiz.find({ userId })
      .populate('subjectId', 'subjectName')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ message: 'Server error fetching quiz history' });
  }
};

module.exports = {
  saveQuizScore,
  getQuizHistory
};
