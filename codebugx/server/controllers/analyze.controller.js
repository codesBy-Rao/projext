const mongoose = require('mongoose');
const AnalysisResult = require('../models/AnalysisResult');
const SubmissionHistory = require('../models/SubmissionHistory');
const BugPatternFrequency = require('../models/BugPatternFrequency');
const TopicWeaknessAnalytics = require('../models/TopicWeaknessAnalytics');
const { analyzeCodeRules } = require('../services/analyze.service');

const severityOrder = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const getOverallSeverity = (bugs) => {
  if (!bugs.length) {
    return 'none';
  }

  let highest = 'none';
  for (const bug of bugs) {
    if (severityOrder[bug.severity] > severityOrder[highest]) {
      highest = bug.severity;
    }
  }

  return highest;
};

const clampScore = (score) => Math.max(0, Math.min(100, score));

const analyzeCode = async (req, res, next) => {
  try {
    const { codeSnippet, language } = req.body;
    const userId = req.user?.userId;

    if (!codeSnippet || !language) {
      const error = new Error('codeSnippet and language are required');
      error.statusCode = 400;
      throw error;
    }

    if (!userId) {
      const error = new Error('Unauthorized user context missing');
      error.statusCode = 401;
      throw error;
    }

    const bugs = analyzeCodeRules(codeSnippet, language);
    const overallSeverity = getOverallSeverity(bugs);

    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is not connected. Start MongoDB to store analysis results.');
      error.statusCode = 503;
      throw error;
    }

    const result = await AnalysisResult.create({
      user: userId,
      codeSnippet,
      language,
      bugs,
      overallSeverity,
    });

    const submission = await SubmissionHistory.create({
      user: userId,
      language,
      codeSnippet,
      detectedBugs: bugs,
      overallSeverity,
      analyzedAt: new Date(),
    });

    if (bugs.length) {
      const frequencyBulkOps = bugs.map((bug) => ({
        updateOne: {
          filter: {
            user: userId,
            bugType: bug.type,
            topic: bug.topic,
            language,
          },
          update: {
            $set: {
              severity: bug.severity,
              lastDetectedAt: new Date(),
            },
            $inc: {
              frequency: 1,
            },
          },
          upsert: true,
        },
      }));

      await BugPatternFrequency.bulkWrite(frequencyBulkOps);
    }

    const topicAgg = new Map();
    for (const bug of bugs) {
      const current = topicAgg.get(bug.topic) || { bugCount: 0 };
      current.bugCount += 1;
      topicAgg.set(bug.topic, current);
    }

    const touchedTopics = topicAgg.size ? Array.from(topicAgg.keys()) : ['general'];

    const weaknessBulkOps = touchedTopics.map((topic) => {
      const bugCount = topicAgg.get(topic)?.bugCount || 0;
      return {
        updateOne: {
          filter: { user: userId, topic },
          update: {
            $inc: {
              totalSubmissions: 1,
              bugCount,
            },
            $set: {
              lastAnalyzedAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    await TopicWeaknessAnalytics.bulkWrite(weaknessBulkOps);

    const updatedWeaknessDocs = await TopicWeaknessAnalytics.find({
      user: userId,
      topic: { $in: touchedTopics },
    });

    const weaknessSavePromises = updatedWeaknessDocs.map(async (doc) => {
      const ratio = doc.totalSubmissions > 0 ? doc.bugCount / doc.totalSubmissions : 0;
      const score = clampScore(Number((ratio * 100).toFixed(2)));
      let trend = 'stable';
      if (score >= 60) {
        trend = 'declining';
      } else if (score <= 30) {
        trend = 'improving';
      }

      doc.weaknessScore = score;
      doc.trend = trend;
      return doc.save();
    });

    const updatedWeakness = await Promise.all(weaknessSavePromises);

    res.status(201).json({
      status: 'success',
      data: {
        id: result._id,
        submissionId: submission._id,
        language: result.language,
        bugs: result.bugs,
        overallSeverity: result.overallSeverity,
        analytics: {
          topicsUpdated: updatedWeakness.map((doc) => ({
            topic: doc.topic,
            totalSubmissions: doc.totalSubmissions,
            bugCount: doc.bugCount,
            weaknessScore: doc.weaknessScore,
            trend: doc.trend,
          })),
        },
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeCode,
};
