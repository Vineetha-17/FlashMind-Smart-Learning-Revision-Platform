const axios = require('axios');
const Flashcard = require('../models/Flashcard');
const Subject = require('../models/Subject');

// Helper to provide realistic educational mock flashcards if Gemini fails or is offline
const getMockFlashcards = (topic, notes) => {
  const normalized = (topic || notes || '').toLowerCase();
  
  if (normalized.includes('java') && normalized.includes('oop')) {
    return [
      { question: "What is Encapsulation in Java?", answer: "Encapsulation is the technique of making the fields in a class private and providing access to the fields via public methods (getters and setters). It achieves data hiding." },
      { question: "What is Inheritance in OOP?", answer: "Inheritance is the mechanism by which one class acquires the properties and behaviors (fields and methods) of a parent class using the 'extends' keyword." },
      { question: "What is Polymorphism?", answer: "Polymorphism means 'many forms'. In Java OOP, it allows us to perform a single action in different ways (e.g., method overriding and method overloading)." },
      { question: "What is an Abstract Class?", answer: "An abstract class is a restricted class that cannot be used to create objects. To access it, it must be inherited from another class. It can contain both abstract and regular methods." },
      { question: "What is the difference between Interface and Abstract Class?", answer: "An interface can only have abstract methods (before Java 8) and static/final variables, whereas an abstract class can have instance variables, constructors, and concrete methods." }
    ];
  }

  if (normalized.includes('java') || normalized.includes('jvm')) {
    return [
      { question: "What is JVM?", answer: "JVM stands for Java Virtual Machine. It is an engine that provides a runtime environment to drive the Java code, converting Java bytecode into machine language." },
      { question: "What is the difference between JDK and JRE?", answer: "JDK (Java Development Kit) is a software development environment used to develop Java applications. JRE (Java Runtime Environment) is the implementation of JVM and provides minimum requirements to run Java apps." },
      { question: "What is Garbage Collection in Java?", answer: "Garbage Collection is the process by which Java programs perform automatic memory management, reclaiming memory occupied by objects that are no longer in use." },
      { question: "What is a Just-In-Time (JIT) compiler?", answer: "The JIT compiler is a component of the JRE that improves the performance of Java applications by compiling bytecodes into native machine code at run time." }
    ];
  }

  if (normalized.includes('dbms') || normalized.includes('sql') || normalized.includes('database')) {
    return [
      { question: "What is DBMS?", answer: "Database Management System (DBMS) is software used to manage databases, allowing users to store, retrieve, update, and manage data efficiently." },
      { question: "What are ACID properties in a database?", answer: "ACID stands for Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent transactions), and Durability (permanently saved data)." },
      { question: "What is the difference between Primary Key and Foreign Key?", answer: "A Primary Key uniquely identifies a record in a table, whereas a Foreign Key is a field in one table that links to the Primary Key in another table to enforce referential integrity." },
      { question: "What is Normalization?", answer: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity (e.g., 1NF, 2NF, 3NF)." },
      { question: "What is a SQL Join?", answer: "A JOIN clause is used to combine rows from two or more tables based on a related column between them (e.g., INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN)." }
    ];
  }

  if (normalized.includes('machine learning') || normalized.includes('ml') || normalized.includes('supervised')) {
    return [
      { question: "What is Supervised Learning?", answer: "Supervised Learning is a type of machine learning where the model is trained on labeled data, meaning the inputs are paired with the correct outputs." },
      { question: "What is Unsupervised Learning?", answer: "Unsupervised Learning is where the model is trained on unlabeled data and must find patterns, relationships, or clusters in the data without human guidance." },
      { question: "What is Overfitting in ML?", answer: "Overfitting occurs when a model learns the training data too well, including its noise and outliers, resulting in poor generalization performance on new unseen data." },
      { question: "What is the difference between Classification and Regression?", answer: "Classification predicts discrete labels or classes (e.g., Spam vs. Not Spam), while Regression predicts continuous numerical outputs (e.g., housing prices)." },
      { question: "What is a Confusion Matrix?", answer: "A Confusion Matrix is a table used to evaluate the performance of a classification model, displaying true positives, false positives, true negatives, and false negatives." }
    ];
  }

  // Generic fallback if no specific keywords match
  const subjectName = topic || "this topic";
  return [
    { question: `What is the core concept of ${subjectName}?`, answer: `The core concept of ${subjectName} revolves around understanding its foundational principles, key definitions, and application in solving real-world problems.` },
    { question: `Why is studying ${subjectName} important?`, answer: `Studying ${subjectName} helps build essential competencies, enhances analytical skills, and provides the framework required for mastering advanced subtopics.` },
    { question: `What is a common misconception about ${subjectName}?`, answer: `A common misconception is that it is purely theoretical, whereas it actually has widespread practical, hands-on applications across industries.` },
    { question: `How can one practice active recall for ${subjectName}?`, answer: `Active recall can be practiced by testing oneself with flashcards, writing down summaries from memory, and teaching the concepts to others.` }
  ];
};

// @desc    Generate flashcards using Gemini AI or fallback, and save them to database
// @route   POST /api/ai/generate
// @access  Private
const generateFlashcards = async (req, res) => {
  try {
    const { topic, notes, subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    // Local Guardrail Check
    const normalizedInput = (topic || notes || '').toLowerCase().trim();
    const blockedKeywords = [
      'anushka', 'samantha', 'virat', 'salman', 'srk', 'dhoni', 'celebrity', 'actor', 'actress', 
      'movie', 'song', 'gossip', 'romance', 'chat', 'hello', 'hey', 'hi', 'inappropriate',
      'dating', 'bollywood', 'hollywood', 'popstar', 'joke', 'meme', 'prank', 'love', 'dating', 
      'girlfriend', 'boyfriend', 'crush', 'games', 'gaming', 'pubg', 'instagram', 'tiktok',
      'facebook', 'snapchat', 'twitter', 'youtube channel', 'vlog', 'entertainment'
    ];

    const isBlocked = blockedKeywords.some(keyword => normalizedInput.includes(keyword));

    const educationalKeywords = [
      'java', 'python', 'c++', 'dbms', 'sql', 'ml', 'ai', 'html', 'css', 'js', 'javascript',
      'react', 'node', 'express', 'mongo', 'programming', 'code', 'coding', 'science', 
      'math', 'physics', 'chemistry', 'biology', 'history', 'geography', 'computer', 'network',
      'algorithm', 'data structure', 'dsa', 'operating system', 'os', 'oop', 'encapsulation',
      'inheritance', 'polymorphism', 'abstraction', 'class', 'object', 'database', 'query',
      'normalization', 'index', 'join', 'schema', 'supervised', 'unsupervised', 'regression',
      'classification', 'clustering', 'neural', 'deep learning', 'learning', 'education',
      'study', 'revision', 'exam', 'test', 'course', 'lecture', 'notes', 'syllabus',
      'academic', 'book', 'theory', 'concept', 'definition', 'meaning', 'explain', 'what is'
    ];

    const words = normalizedInput.split(/\s+/);
    let isShortAndNonAcademic = false;
    if (words.length < 4) {
      const hasEduKeyword = educationalKeywords.some(keyword => normalizedInput.includes(keyword));
      if (!hasEduKeyword) {
        isShortAndNonAcademic = true;
      }
    }
    
    if (isBlocked || isShortAndNonAcademic || normalizedInput.length < 3) {
      return res.status(400).json({ 
        message: 'Guardrail Triggered: FlashMind only supports generating flashcards for educational, academic, or study-related topics. Please enter a valid educational topic!' 
      });
    }

    const inputSource = topic ? `Topic: ${topic}` : `Notes:\n${notes}`;
    const prompt = `You are an expert academic tutor and strict guardrail system. 
First, analyze if the following content is educational, academic, or study-related: "${topic || notes}".
If the content is NOT educational (e.g. proper names of actors/celebrities like 'Anushka', random names, chat, jokes, gibberish, or off-topic), you MUST return a JSON object with an "error" field explaining why it is invalid.
Example:
{"error": "This topic is not academic or study-related."}

Otherwise, generate exactly 5 comprehensive educational flashcards (questions and answers) on this topic.
Return the output ONLY as a JSON array of objects. Each object must have exactly two fields: "question" and "answer". Do NOT wrap the JSON in markdown codeblocks (such as \`\`\`json), and do NOT add any additional text, explanation, or commentary. Output raw, clean, parseable JSON text.
Example structure:
[
  {"question": "Q1", "answer": "A1"},
  {"question": "Q2", "answer": "A2"}
]`;

    let generatedCards = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.startsWith('YOUR_')) {
      try {
        let response;
        try {
          console.log('Sending request to Gemini API (gemini-1.5-flash)...');
          response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json'
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );
        } catch (flashErr) {
          console.log('Gemini 1.5 Flash failed, trying gemini-pro... Error:', flashErr.message);
          response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
              contents: [{ parts: [{ text: prompt }] }]
            },
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );
        }

        let responseText = response.data.candidates[0].content.parts[0].text.trim();
        
        // Clean markdown wrapper just in case Gemini ignored the "no markdown codeblocks" instruction
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }

        const parsedData = JSON.parse(responseText);

        // Check if Gemini triggered the guardrail error
        if (parsedData.error || (!Array.isArray(parsedData) && parsedData.error)) {
          return res.status(400).json({ 
            message: `Guardrail Triggered: ${parsedData.error || 'This topic is not academic or study-related.'}` 
          });
        }

        generatedCards = parsedData;
        console.log('Successfully generated cards via Gemini API!');
      } catch (apiError) {
        console.error('Gemini API Error, falling back to mock generator:', apiError.message);
        generatedCards = getMockFlashcards(topic, notes);
      }
    } else {
      console.log('Gemini API key not configured or mock key used, loading mock cards...');
      generatedCards = getMockFlashcards(topic, notes);
    }

    // Double check that generatedCards is a valid array
    if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
      generatedCards = getMockFlashcards(topic, notes);
    }

    // Save generated cards to MongoDB
    const cardsToInsert = generatedCards.map(card => ({
      question: card.question,
      answer: card.answer,
      subjectId: subjectId,
      userId: req.user._id,
      difficulty: 'medium',
      nextReviewDate: new Date()
    }));

    const savedCards = await Flashcard.insertMany(cardsToInsert);

    res.status(201).json({
      message: `Successfully generated and saved ${savedCards.length} flashcards.`,
      cards: savedCards,
      isMock: !apiKey || apiKey.startsWith('YOUR_')
    });

  } catch (error) {
    console.error('General Error in AI Controller:', error);
    res.status(500).json({ message: 'Server error generating flashcards' });
  }
};

const getMockQuiz = (topic) => {
  const normalized = (topic || '').toLowerCase();
  
  if (normalized.includes('java') || normalized.includes('oop')) {
    return [
      {
        question: "Which of the following is NOT a core OOP concept in Java?",
        options: ["Polymorphism", "Compilation", "Inheritance", "Encapsulation"],
        correctAnswer: "Compilation"
      },
      {
        question: "What keyword is used to inherit a class in Java?",
        options: ["implements", "inherits", "extends", "super"],
        correctAnswer: "extends"
      },
      {
        question: "Which access modifier makes a member visible only within its own class?",
        options: ["public", "private", "protected", "default"],
        correctAnswer: "private"
      },
      {
        question: "What does runtime polymorphism rely on in Java?",
        options: ["Method Overloading", "Method Overriding", "Strict Compilation", "Static Methods"],
        correctAnswer: "Method Overriding"
      },
      {
        question: "What is an abstract class in Java?",
        options: ["A class that cannot be instantiated", "A class with only static variables", "An interface subclass", "A class that cannot be inherited"],
        correctAnswer: "A class that cannot be instantiated"
      }
    ];
  }

  if (normalized.includes('dbms') || normalized.includes('sql') || normalized.includes('database')) {
    return [
      {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Simple Query Language", "Sequential Query Language", "Standard Query Language"],
        correctAnswer: "Structured Query Language"
      },
      {
        question: "Which key uniquely identifies each record in a table?",
        options: ["Foreign Key", "Primary Key", "Composite Key", "Unique Key"],
        correctAnswer: "Primary Key"
      },
      {
        question: "What does the 'A' in ACID properties stand for?",
        options: ["Availability", "Authority", "Atomicity", "Authentication"],
        correctAnswer: "Atomicity"
      },
      {
        question: "Which clause is used to filter records in a SQL SELECT statement?",
        options: ["GROUP BY", "ORDER BY", "HAVING", "WHERE"],
        correctAnswer: "WHERE"
      },
      {
        question: "Which JOIN returns all rows from the left table, even if there are no matches in the right table?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN"],
        correctAnswer: "LEFT JOIN"
      }
    ];
  }

  if (normalized.includes('machine learning') || normalized.includes('ml') || normalized.includes('supervised')) {
    return [
      {
        question: "Which of the following is a supervised learning task?",
        options: ["Clustering", "Dimensionality Reduction", "Classification", "Anomaly Detection"],
        correctAnswer: "Classification"
      },
      {
        question: "What is overfitting in machine learning?",
        options: ["Model performing poorly on training data", "Model learning training data noise too well, failing to generalize", "Model training too fast", "Model using too much memory"],
        correctAnswer: "Model learning training data noise too well, failing to generalize"
      },
      {
        question: "Which of the following is an unsupervised learning algorithm?",
        options: ["Linear Regression", "K-Means Clustering", "Support Vector Machines", "Decision Trees"],
        correctAnswer: "K-Means Clustering"
      },
      {
        question: "What is a confusion matrix used for?",
        options: ["Evaluating classification performance", "Generating random numbers", "Encrypting database keys", "Plotting linear regression lines"],
        correctAnswer: "Evaluating classification performance"
      },
      {
        question: "What type of ML model is used to predict continuous numerical values?",
        options: ["Classification", "Clustering", "Regression", "Association Rules"],
        correctAnswer: "Regression"
      }
    ];
  }

  // Generic fallback MCQ list
  const t = topic || "this subject";
  return [
    {
      question: `What is the core purpose of studying ${t}?`,
      options: ["To memorize facts without understanding", "To build foundational concepts and solve practical problems", "To compile code without testing", "To avoid exams"],
      correctAnswer: "To build foundational concepts and solve practical problems"
    },
    {
      question: `How does testing oneself on ${t} improve memory?`,
      options: ["By passive reading multiple times", "By active recall and spaced repetition self-testing", "By skipping revisions", "By sleeping during lectures"],
      correctAnswer: "By active recall and spaced repetition self-testing"
    },
    {
      question: `Which approach is best when learning a complex module of ${t}?`,
      options: ["Break it down into simpler component sub-concepts", "Try to memorize the entire book overnight", "Skip the topic completely", "Copy others' code blindly"],
      correctAnswer: "Break it down into simpler component sub-concepts"
    },
    {
      question: `What is a common pitfall when studying ${t}?`,
      options: ["Over-reliance on active testing", "Recognizing concepts instead of recalling them actively", "Doing too many practice quizzes", "Seeking tutor feedback"],
      correctAnswer: "Recognizing concepts instead of recalling them actively"
    },
    {
      question: `What is the best way to master ${t}?`,
      options: ["Consistent spaced revisions and practice quizzes", "Cramming 2 hours before the exam", "Passive slideshow reading", "Avoiding self-tests"],
      correctAnswer: "Consistent spaced revisions and practice quizzes"
    }
  ];
};

// @desc    Generate a multiple choice quiz using Gemini AI or fallback
// @route   POST /api/ai/quiz
// @access  Private
const generateQuiz = async (req, res) => {
  try {
    const { topic, subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    // Verify subject belongs to user
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or unauthorized' });
    }

    // Local Guardrail Check
    const normalizedInput = (topic || '').toLowerCase().trim();
    const blockedKeywords = [
      'anushka', 'samantha', 'virat', 'salman', 'srk', 'dhoni', 'celebrity', 'actor', 'actress', 
      'movie', 'song', 'gossip', 'romance', 'chat', 'hello', 'hey', 'hi', 'inappropriate',
      'dating', 'bollywood', 'hollywood', 'popstar', 'joke', 'meme', 'prank', 'love', 'dating', 
      'girlfriend', 'boyfriend', 'crush', 'games', 'gaming', 'pubg', 'instagram', 'tiktok',
      'facebook', 'snapchat', 'twitter', 'youtube channel', 'vlog', 'entertainment'
    ];

    const isBlocked = blockedKeywords.some(keyword => normalizedInput.includes(keyword));

    const educationalKeywords = [
      'java', 'python', 'c++', 'dbms', 'sql', 'ml', 'ai', 'html', 'css', 'js', 'javascript',
      'react', 'node', 'express', 'mongo', 'programming', 'code', 'coding', 'science', 
      'math', 'physics', 'chemistry', 'biology', 'history', 'geography', 'computer', 'network',
      'algorithm', 'data structure', 'dsa', 'operating system', 'os', 'oop', 'encapsulation',
      'inheritance', 'polymorphism', 'abstraction', 'class', 'object', 'database', 'query',
      'normalization', 'index', 'join', 'schema', 'supervised', 'unsupervised', 'regression',
      'classification', 'clustering', 'neural', 'deep learning', 'learning', 'education',
      'study', 'revision', 'exam', 'test', 'course', 'lecture', 'notes', 'syllabus',
      'academic', 'book', 'theory', 'concept', 'definition', 'meaning', 'explain', 'what is'
    ];

    const words = normalizedInput.split(/\s+/);
    let isShortAndNonAcademic = false;
    if (words.length < 4) {
      const hasEduKeyword = educationalKeywords.some(keyword => normalizedInput.includes(keyword));
      if (!hasEduKeyword) {
        isShortAndNonAcademic = true;
      }
    }
    
    if (isBlocked || isShortAndNonAcademic || normalizedInput.length < 3) {
      return res.status(400).json({ 
        message: 'Guardrail Triggered: FlashMind only supports generating quizzes for educational, academic, or study-related topics. Please enter a valid educational topic!' 
      });
    }

    const prompt = `You are an expert academic tutor and quiz generator. 
First, analyze if the following topic is educational, academic, or study-related: "${topic}".
If it is NOT educational (e.g. proper names of celebrities like 'Anushka', random names, chat, jokes, gibberish, or off-topic), you MUST return a JSON object with an "error" field explaining why it is invalid.
Example:
{"error": "This topic is not academic or study-related."}

Otherwise, generate exactly 5 multiple-choice questions (MCQs) on this topic.
Return the output ONLY as a JSON array of objects. Each object must have exactly three fields:
- "question" (string)
- "options" (an array of exactly 4 strings)
- "correctAnswer" (string which must EXACTLY match one of the 4 options)

Do NOT wrap the JSON in markdown codeblocks (such as \`\`\`json), and do NOT add any additional text, explanation, or commentary. Output raw, clean, parseable JSON text.`;

    let generatedQuiz = [];
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.startsWith('YOUR_')) {
      try {
        let response;
        try {
          console.log('Sending request to Gemini API (gemini-1.5-flash) for quiz...');
          response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
          );
        } catch (flashErr) {
          console.log('Gemini 1.5 Flash failed for quiz, trying gemini-pro... Error:', flashErr.message);
          response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
          );
        }

        let responseText = response.data.candidates[0].content.parts[0].text.trim();
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }

        const parsedData = JSON.parse(responseText);

        if (parsedData.error || (!Array.isArray(parsedData) && parsedData.error)) {
          return res.status(400).json({ 
            message: `Guardrail Triggered: ${parsedData.error || 'This topic is not academic or study-related.'}` 
          });
        }

        generatedQuiz = parsedData;
        console.log('Successfully generated quiz via Gemini API!');
      } catch (apiError) {
        console.error('Gemini API Quiz Error, falling back to mock generator:', apiError.message);
        generatedQuiz = getMockQuiz(topic);
      }
    } else {
      console.log('Gemini API key not configured or mock key used, loading mock quiz...');
      generatedQuiz = getMockQuiz(topic);
    }

    if (!Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
      generatedQuiz = getMockQuiz(topic);
    }

    res.status(200).json({
      message: 'Successfully generated quiz.',
      quiz: generatedQuiz,
      isMock: !apiKey || apiKey.startsWith('YOUR_')
    });

  } catch (error) {
    console.error('General Error in Quiz generation:', error);
    res.status(500).json({ message: 'Server error generating quiz' });
  }
};

module.exports = {
  generateFlashcards,
  generateQuiz,
};