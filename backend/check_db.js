const mongoose = require('mongoose');
require('dotenv').config();
const mongoose = require('mongoose');


const mongoUri = process.env.MONGO_URI;

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in Database:', collections.map(c => c.name));

  } catch (error) {
    console.error('Error querying DB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

run();

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in Database:', collections.map(c => c.name));

    // Get counts
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }), 'subjects');
    const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({}, { strict: false }), 'flashcards');

    const userCount = await User.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const cardCount = await Flashcard.countDocuments();

    console.log(`Counts: Users=${userCount}, Subjects=${subjectCount}, Flashcards=${cardCount}`);

    if (userCount > 0) {
      const users = await User.find().limit(5);
      console.log('Sample Users:', users.map(u => ({ name: u.name, email: u.email, role: u.role })));
    }

    if (subjectCount > 0) {
      const subjects = await Subject.find().limit(5);
      console.log('Sample Subjects:', subjects.map(s => ({ name: s.subjectName, userId: s.userId })));
    }

  } catch (error) {
    console.error('Error querying DB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

run();
