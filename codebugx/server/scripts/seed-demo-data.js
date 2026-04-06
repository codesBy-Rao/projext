require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const AnalysisResult = require('../models/AnalysisResult');
const SubmissionHistory = require('../models/SubmissionHistory');
const BugPatternFrequency = require('../models/BugPatternFrequency');
const TopicWeaknessAnalytics = require('../models/TopicWeaknessAnalytics');

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@codebugx.dev').toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoPass123!';

const dayOffsetDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(10 + (daysAgo % 5), 15, 0, 0);
  return date;
};

const demoSubmissions = [
  {
    language: 'javascript',
    codeSnippet: 'for (let i = 0; i <= arr.length; i++) { total += arr[i]; }',
    detectedBugs: [
      { type: 'loop boundary error', severity: 'high', topic: 'arrays & loops' },
    ],
    overallSeverity: 'high',
    analyzedAt: dayOffsetDate(6),
  },
  {
    language: 'javascript',
    codeSnippet: 'while (true) { if (ready) break; }',
    detectedBugs: [
      { type: 'infinite loop', severity: 'high', topic: 'loop control' },
    ],
    overallSeverity: 'high',
    analyzedAt: dayOffsetDate(5),
  },
  {
    language: 'typescript',
    codeSnippet: 'const user = null; return user.name;',
    detectedBugs: [
      { type: 'null access risk', severity: 'medium', topic: 'null safety' },
    ],
    overallSeverity: 'medium',
    analyzedAt: dayOffsetDate(4),
  },
  {
    language: 'javascript',
    codeSnippet: 'function sum(n){ return sum(n-1) + n }',
    detectedBugs: [
      { type: 'recursion base case missing', severity: 'high', topic: 'recursion' },
    ],
    overallSeverity: 'high',
    analyzedAt: dayOffsetDate(3),
  },
  {
    language: 'javascript',
    codeSnippet: 'const safe = [1,2,3]; for (let i = 0; i < safe.length; i++) {}',
    detectedBugs: [],
    overallSeverity: 'none',
    analyzedAt: dayOffsetDate(2),
  },
  {
    language: 'typescript',
    codeSnippet: 'if (profile) { return profile.name }',
    detectedBugs: [],
    overallSeverity: 'none',
    analyzedAt: dayOffsetDate(1),
  },
  {
    language: 'javascript',
    codeSnippet: 'for (let i = 0; i < items.length; i++) { render(items[i]); }',
    detectedBugs: [],
    overallSeverity: 'none',
    analyzedAt: dayOffsetDate(0),
  },
];

const clampScore = (score) => Math.max(0, Math.min(100, score));

const aggregateBugFrequencies = (userId, submissions) => {
  const map = new Map();

  for (const submission of submissions) {
    for (const bug of submission.detectedBugs) {
      const key = `${bug.type}|${bug.topic}|${submission.language}`;
      const current = map.get(key) || {
        user: userId,
        bugType: bug.type,
        topic: bug.topic,
        severity: bug.severity,
        language: submission.language,
        frequency: 0,
        lastDetectedAt: submission.analyzedAt,
      };

      current.frequency += 1;
      current.severity = bug.severity;
      if (submission.analyzedAt > current.lastDetectedAt) {
        current.lastDetectedAt = submission.analyzedAt;
      }
      map.set(key, current);
    }
  }

  return Array.from(map.values());
};

const aggregateWeakTopics = (userId, submissions) => {
  const topicMap = new Map();

  for (const submission of submissions) {
    const topics = submission.detectedBugs.length
      ? [...new Set(submission.detectedBugs.map((bug) => bug.topic))]
      : ['general'];

    for (const topic of topics) {
      const current = topicMap.get(topic) || {
        user: userId,
        topic,
        totalSubmissions: 0,
        bugCount: 0,
        lastAnalyzedAt: submission.analyzedAt,
      };

      current.totalSubmissions += 1;
      current.bugCount += submission.detectedBugs.filter((bug) => bug.topic === topic).length;
      if (submission.analyzedAt > current.lastAnalyzedAt) {
        current.lastAnalyzedAt = submission.analyzedAt;
      }

      topicMap.set(topic, current);
    }
  }

  return Array.from(topicMap.values()).map((item) => {
    const ratio = item.totalSubmissions > 0 ? item.bugCount / item.totalSubmissions : 0;
    const weaknessScore = clampScore(Number((ratio * 100).toFixed(2)));

    let trend = 'stable';
    if (weaknessScore >= 60) {
      trend = 'declining';
    } else if (weaknessScore <= 30) {
      trend = 'improving';
    }

    return {
      ...item,
      weaknessScore,
      trend,
    };
  });
};

const seed = async () => {
  await connectDB();

  let demoUser = await User.findOne({ email: DEMO_EMAIL });
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    demoUser = await User.create({ email: DEMO_EMAIL, password: hashedPassword });
  } else {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    demoUser.password = hashedPassword;
    await demoUser.save();
  }

  await Promise.all([
    AnalysisResult.deleteMany({ user: demoUser._id }),
    SubmissionHistory.deleteMany({ user: demoUser._id }),
    BugPatternFrequency.deleteMany({ user: demoUser._id }),
    TopicWeaknessAnalytics.deleteMany({ user: demoUser._id }),
  ]);

  const analysisDocs = demoSubmissions.map((submission) => ({
    user: demoUser._id,
    language: submission.language,
    codeSnippet: submission.codeSnippet,
    bugs: submission.detectedBugs,
    overallSeverity: submission.overallSeverity,
    createdAt: submission.analyzedAt,
    updatedAt: submission.analyzedAt,
  }));

  const historyDocs = demoSubmissions.map((submission) => ({
    user: demoUser._id,
    language: submission.language,
    codeSnippet: submission.codeSnippet,
    detectedBugs: submission.detectedBugs,
    overallSeverity: submission.overallSeverity,
    analyzedAt: submission.analyzedAt,
    createdAt: submission.analyzedAt,
    updatedAt: submission.analyzedAt,
  }));

  const frequencyDocs = aggregateBugFrequencies(demoUser._id, demoSubmissions);
  const weaknessDocs = aggregateWeakTopics(demoUser._id, demoSubmissions);

  if (analysisDocs.length) {
    await AnalysisResult.insertMany(analysisDocs);
  }

  if (historyDocs.length) {
    await SubmissionHistory.insertMany(historyDocs);
  }

  if (frequencyDocs.length) {
    await BugPatternFrequency.insertMany(frequencyDocs);
  }

  if (weaknessDocs.length) {
    await TopicWeaknessAnalytics.insertMany(weaknessDocs);
  }

  console.log('Demo data seeded successfully.');
  console.log(`Demo email: ${DEMO_EMAIL}`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
};

seed()
  .catch((error) => {
    console.error('Failed to seed demo data:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
