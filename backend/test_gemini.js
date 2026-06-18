const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
  const prompt = 'Explain what DNA is in one sentence.';
  try {
    console.log('Testing gemini-2.5-flash...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    }, { headers: { 'Content-Type': 'application/json' } });
    console.log('gemini-2.5-flash SUCCESS:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('gemini-2.5-flash FAILED:', err.response ? err.response.status + ' ' + JSON.stringify(err.response.data) : err.message);
  }
}

testGemini();
