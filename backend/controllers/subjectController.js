const Subject = require('../models/Subject');
const Flashcard = require('../models/Flashcard');

// @desc    Get all subjects for the logged-in user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id });
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching subjects' });
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const { subjectName, description } = req.body;

    if (!subjectName) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const subject = await Subject.create({
      subjectName,
      description: description || '',
      userId: req.user._id,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating subject' });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    const { subjectName, description } = req.body;
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    subject.subjectName = subjectName || subject.subjectName;
    subject.description = description !== undefined ? description : subject.description;

    const updatedSubject = await subject.save();
    res.json(updatedSubject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating subject' });
  }
};

// @desc    Delete a subject and its associated flashcards
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    // Cascade delete all flashcards associated with this subject
    await Flashcard.deleteMany({ subjectId: req.params.id });
    
    // Delete the subject
    await Subject.deleteOne({ _id: req.params.id });

    res.json({ message: 'Subject and associated flashcards deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting subject' });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
