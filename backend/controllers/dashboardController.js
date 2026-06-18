const Subject = require('../models/Subject');
const Flashcard = require('../models/Flashcard');
const User = require('../models/User');
const Quiz = require('../models/Quiz');

// @desc    Get user dashboard analytics
// @route   GET /api/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user details for streak and XP
    const user = await User.findById(userId).select('name email streak xp createdAt');
    
    // Fetch subjects count
    const subjects = await Subject.find({ userId });
    const totalSubjects = subjects.length;

    // Fetch flashcards count
    const totalCards = await Flashcard.countDocuments({ userId });
    
    // Fetch mastered cards (marked as 'easy' by spaced repetition)
    const masteredCards = await Flashcard.countDocuments({ userId, difficulty: 'easy' });

    // Fetch cards due today
    const now = new Date();
    const dueCards = await Flashcard.countDocuments({ 
      userId, 
      nextReviewDate: { $lte: now } 
    });

    // Calculate Memory Health Score per subject
    const subjectProgress = await Promise.all(
      subjects.map(async (subj) => {
        const totalSubjCards = await Flashcard.countDocuments({ subjectId: subj._id, userId });
        const easySubjCards = await Flashcard.countDocuments({ 
          subjectId: subj._id, 
          userId, 
          difficulty: 'easy' 
        });

        const score = totalSubjCards === 0 ? 0 : Math.round((easySubjCards / totalSubjCards) * 100);

        return {
          subjectId: subj._id,
          subjectName: subj.subjectName,
          description: subj.description,
          totalCards: totalSubjCards,
          easyCards: easySubjCards,
          memoryScore: score,
        };
      })
    );

    // Calculate overall memory health score (average of subject scores, or overall easy/total)
    const overallMemoryScore = totalCards === 0 ? 0 : Math.round((masteredCards / totalCards) * 100);

    // Fetch quiz statistics
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const quizzes = await Quiz.find({ userId });
    let avgQuizScore = 0;
    if (totalQuizzes > 0) {
      const sumScores = quizzes.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0);
      avgQuizScore = Math.round((sumScores / totalQuizzes) * 100);
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        streak: user.streak,
        xp: user.xp,
        createdAt: user.createdAt
      },
      stats: {
        totalSubjects,
        totalCards,
        masteredCards,
        dueCards,
        overallMemoryScore,
        totalQuizzes,
        avgQuizScore
      },
      subjectProgress
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error loading dashboard stats' });
  }
};

module.exports = {
  getUserDashboard,
};
