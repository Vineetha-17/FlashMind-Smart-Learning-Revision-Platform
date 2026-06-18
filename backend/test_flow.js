const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const mongoUri = 'mongodb+srv://SumaHarshitha:Suma_1417@mernstackws.lalv9jr.mongodb.net/flashmind';
const jwtSecret = 'flashmind_jwt_secret_key_1417_harshitha_sumi';
const baseUrl = 'http://localhost:5000/api';

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    // Get User and Subject
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }), 'subjects');

    const user = await User.findOne({ email: 'sumaharshitha24@gmail.com' });
    if (!user) {
      console.error('User Suma not found!');
      return;
    }
    console.log(`Found User: ${user.name} (${user._id})`);

    const subject = await Subject.findOne({ userId: user._id });
    if (!subject) {
      console.error('No subjects found for user Suma!');
      return;
    }
    console.log(`Found Subject: ${subject.subjectName} (${subject._id})`);

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    console.log('Signed JWT Token for authorization.');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n--- 1. Testing Guardrail Trigger with Off-Topic Input ("Anushka") ---');
    try {
      await axios.post(`${baseUrl}/ai/generate-quiz`, {
        subjectId: subject._id,
        topic: 'Anushka'
      }, { headers });
      console.log('FAIL: Off-topic query was not blocked by guardrails.');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('SUCCESS: Guardrail blocked the off-topic input! Response message:', err.response.data.message);
      } else {
        console.error('Unexpected error on guardrail check:', err.message);
      }
    }

    console.log('\n--- 2. Testing Quiz Generation with Academic Input ("SQL Joins") ---');
    let generatedQuiz = null;
    try {
      const res = await axios.post(`${baseUrl}/ai/generate-quiz`, {
        subjectId: subject._id,
        topic: 'SQL Joins'
      }, { headers });
      
      generatedQuiz = res.data.quiz;
      console.log(`SUCCESS: Quiz generated! Number of questions: ${generatedQuiz.length}`);
      console.log('First Question:', JSON.stringify(generatedQuiz[0], null, 2));
    } catch (err) {
      console.error('FAIL: Quiz generation failed:', err.response?.data || err.message);
    }

    if (generatedQuiz && generatedQuiz.length > 0) {
      console.log('\n--- 3. Testing Saving Quiz Score and Gaining XP ---');
      try {
        const res = await axios.post(`${baseUrl}/quizzes`, {
          subjectId: subject._id,
          score: 4,
          totalQuestions: 5,
          topic: 'SQL Joins'
        }, { headers });

        console.log('SUCCESS: Quiz score saved! Response payload:');
        console.log(JSON.stringify(res.data, null, 2));
      } catch (err) {
        console.error('FAIL: Saving quiz score failed:', err.response?.data || err.message);
      }

      console.log('\n--- 4. Testing Fetching Quiz History ---');
      try {
        const res = await axios.get(`${baseUrl}/quizzes/history`, { headers });
        console.log(`SUCCESS: History fetched! Number of records: ${res.data.length}`);
        console.log('Latest record topic:', res.data[0].topic, 'Score:', res.data[0].score);
      } catch (err) {
        console.error('FAIL: Fetching quiz history failed:', err.response?.data || err.message);
      }
    }

  } catch (error) {
    console.error('General Test Runner Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Test complete.');
  }
}

runTest();
