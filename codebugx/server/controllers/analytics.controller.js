const mongoose = require('mongoose');
const SubmissionHistory = require('../models/SubmissionHistory');
const BugPatternFrequency = require('../models/BugPatternFrequency');
const TopicWeaknessAnalytics = require('../models/TopicWeaknessAnalytics');

const getDateKey = (date) => date.toISOString().slice(0, 10);

const buildWeeklyTrend = (trendRows) => {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = getDateKey(date);
    days.push({ date: key, count: 0 });
  }

  const trendMap = new Map(trendRows.map((row) => [row.date, row.count]));
  return days.map((day) => ({
    date: day.date,
    count: trendMap.get(day.date) || 0,
  }));
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized user context missing');
      error.statusCode = 401;
      throw error;
    }

    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is not connected. Start MongoDB to view analytics.');
      error.statusCode = 503;
      throw error;
    }

    const totalSubmissions = await SubmissionHistory.countDocuments({ user: userId });

    const [mostFrequentBug] = await BugPatternFrequency.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $sort: { frequency: -1, lastDetectedAt: -1 } },
      { $limit: 1 },
      {
        $project: {
          _id: 0,
          bugType: '$bugType',
          topic: 1,
          severity: 1,
          frequency: 1,
        },
      },
    ]);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const weeklyRows = await SubmissionHistory.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          analyzedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);

    const weeklyTrend = buildWeeklyTrend(weeklyRows);

    const weakTopics = await TopicWeaknessAnalytics.find({ user: userId })
      .sort({ weaknessScore: -1 })
      .limit(6)
      .select('topic weaknessScore bugCount totalSubmissions trend')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        totalSubmissions,
        mostFrequentBug: mostFrequentBug || null,
        weeklyTrend,
        weakTopics,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWeeklyTrend = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized user context missing');
      error.statusCode = 401;
      throw error;
    }

    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is not connected. Start MongoDB to view analytics.');
      error.statusCode = 503;
      throw error;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const weeklyRows = await SubmissionHistory.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          analyzedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        weeklyTrend: buildWeeklyTrend(weeklyRows),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWeakTopics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized user context missing');
      error.statusCode = 401;
      throw error;
    }

    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is not connected. Start MongoDB to view analytics.');
      error.statusCode = 503;
      throw error;
    }

    const limit = Number(req.query.limit) || 6;

    const weakTopics = await TopicWeaknessAnalytics.find({ user: userId })
      .sort({ weaknessScore: -1 })
      .limit(limit)
      .select('topic weaknessScore bugCount totalSubmissions trend')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        weakTopics,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSubmissionHistory = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized user context missing');
      error.statusCode = 401;
      throw error;
    }

    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is not connected. Start MongoDB to view submission history.');
      error.statusCode = 503;
      throw error;
    }

    const requestedLimit = Number(req.query.limit) || 10;
    const requestedPage = Number(req.query.page) || 1;
    const limit = Math.min(50, Math.max(1, requestedLimit));
    const page = Math.max(1, requestedPage);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      SubmissionHistory.countDocuments({ user: userId }),
      SubmissionHistory.find({ user: userId })
        .sort({ analyzedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('language codeSnippet detectedBugs overallSeverity analyzedAt')
        .lean(),
    ]);

    const normalizedItems = items.map((item) => ({
      id: item._id,
      language: item.language,
      overallSeverity: item.overallSeverity,
      analyzedAt: item.analyzedAt,
      bugCount: item.detectedBugs.length,
      detectedBugs: item.detectedBugs,
      codePreview: item.codeSnippet.slice(0, 220),
    }));

    res.status(200).json({
      status: 'success',
      data: {
        items: normalizedItems,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getWeeklyTrend,
  getWeakTopics,
  getSubmissionHistory,
};
