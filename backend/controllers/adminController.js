const User = require('../models/User');
const Subject = require('../models/Subject');
const Flashcard = require('../models/Flashcard');

// @desc    Get platform statistics and users list (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalSubjects = await Subject.countDocuments();
    const totalFlashcards = await Flashcard.countDocuments();

    // Get all users with their statistics, sorted by streak/XP
    const users = await User.find({ role: 'student' }).select('-password').sort({ xp: -1 });

    // Aggregate statistics per user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const subjectsCount = await Subject.countDocuments({ userId: user._id });
        const flashcardsCount = await Flashcard.countDocuments({ userId: user._id });
        
        // Count easy cards (mastered)
        const masteredCount = await Flashcard.countDocuments({ userId: user._id, difficulty: 'easy' });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          streak: user.streak,
          xp: user.xp,
          subjectsCount,
          flashcardsCount,
          masteredCount,
          createdAt: user.createdAt
        };
      })
    );

    res.json({
      summary: {
        totalUsers,
        totalSubjects,
        totalFlashcards
      },
      users: usersWithStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

// @desc    Delete a user and all their subjects/flashcards (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an administrator account' });
    }

    // Cascading delete
    await Flashcard.deleteMany({ userId });
    await Subject.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all associated subjects and flashcards deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = {
  getPlatformStats,
  deleteUser
};
