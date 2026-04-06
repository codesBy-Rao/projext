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

const buildCoachHints = (topic) => {
  const normalized = (topic || 'general').toLowerCase();

  if (normalized.includes('array') || normalized.includes('loop')) {
    return [
      {
        level: 1,
        title: 'Level 1: Boundary sanity check',
        content: 'Before running code, verify your loop start/end and confirm the last index is length - 1.',
      },
      {
        level: 2,
        title: 'Level 2: Guard edge cases',
        content: 'Test with empty and single-item arrays. If either fails, adjust guards before entering the loop.',
      },
      {
        level: 3,
        title: 'Level 3: Safer iteration strategy',
        content: 'Prefer `for...of` or array helpers when index math is not required to reduce off-by-one mistakes.',
      },
    ];
  }

  if (normalized.includes('null') || normalized.includes('object')) {
    return [
      {
        level: 1,
        title: 'Level 1: Identify nullable values',
        content: 'Mark variables that can be null/undefined at function boundaries before property access.',
      },
      {
        level: 2,
        title: 'Level 2: Add guard rails',
        content: 'Use optional chaining and explicit early-return checks to prevent access on null values.',
      },
      {
        level: 3,
        title: 'Level 3: Defensive defaults',
        content: 'Normalize incoming objects to safe defaults so downstream logic never receives null references.',
      },
    ];
  }

  if (normalized.includes('recursion')) {
    return [
      {
        level: 1,
        title: 'Level 1: Base-case first',
        content: 'Write and verify the base case before adding recursive calls.',
      },
      {
        level: 2,
        title: 'Level 2: Progress guarantee',
        content: 'Ensure each call moves input toward the base case with no cycles.',
      },
      {
        level: 3,
        title: 'Level 3: Trace recursion tree',
        content: 'Dry-run a small input and track returns to verify no branch misses a return value.',
      },
    ];
  }

  return [
    {
      level: 1,
      title: 'Level 1: Define failure mode',
      content: 'State the exact bug pattern you are trying to eliminate before editing code.',
    },
    {
      level: 2,
      title: 'Level 2: Add focused test',
      content: 'Write one edge-case test that reproduces the issue and run it after each change.',
    },
    {
      level: 3,
      title: 'Level 3: Refactor for clarity',
      content: 'Simplify branching and isolate complex conditions into named helper functions.',
    },
  ];
};

const calculateStreakDays = (weeklyTrend) => {
  let streak = 0;
  for (let i = weeklyTrend.length - 1; i >= 0; i -= 1) {
    if (weeklyTrend[i].count > 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

const getCoachInsights = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      const error = new Error('Unauthorized user context missing');
      error.statusCode = 401;
      throw error;
    }

    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database is not connected. Start MongoDB to view coach insights.');
      error.statusCode = 503;
      throw error;
    }

    const weakTopics = await TopicWeaknessAnalytics.find({ user: userId })
      .sort({ weaknessScore: -1 })
      .limit(3)
      .select('topic weaknessScore bugCount totalSubmissions trend')
      .lean();

    const topWeakTopic = weakTopics[0] || {
      topic: 'general',
      weaknessScore: 0,
      bugCount: 0,
      totalSubmissions: 0,
      trend: 'stable',
    };

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
    const activeDays = weeklyTrend.filter((day) => day.count > 0).length;
    const totalThisWeek = weeklyTrend.reduce((sum, day) => sum + day.count, 0);
    const dailyTarget = Math.max(2, Math.ceil(totalThisWeek / Math.max(1, activeDays || 1)) + 1);
    const todayCount = weeklyTrend[weeklyTrend.length - 1]?.count || 0;
    const streakDays = calculateStreakDays(weeklyTrend);

    let trendBoost = 0;
    for (let i = 1; i < weeklyTrend.length; i += 1) {
      if (weeklyTrend[i].count > weeklyTrend[i - 1].count) {
        trendBoost += 4;
      } else if (weeklyTrend[i].count < weeklyTrend[i - 1].count) {
        trendBoost -= 3;
      }
    }

    const consistency = Math.round((activeDays / 7) * 100);
    const riskPenalty = Math.round((topWeakTopic.weaknessScore || 0) * 0.45);
    const score = Math.max(0, Math.min(100, Math.round(45 + consistency * 0.45 + trendBoost - riskPenalty)));

    const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'E';
    const suggestedReduction = Math.max(15, Math.min(70, Math.round((topWeakTopic.weaknessScore || 0) * 0.6)));

    res.status(200).json({
      status: 'success',
      data: {
        dailyMission: {
          topic: topWeakTopic.topic,
          targetSubmissions: dailyTarget,
          completedToday: todayCount,
          targetBugReductionPercent: suggestedReduction,
          message:
            topWeakTopic.topic === 'general'
              ? 'Run at least two focused submissions today to unlock adaptive missions.'
              : `Focus on ${topWeakTopic.topic}: complete ${dailyTarget} focused submissions today and aim to reduce related bugs by ${suggestedReduction}%.`,
        },
        weeklyProgress: {
          score,
          grade,
          consistency,
          streakDays,
          trend: topWeakTopic.trend || 'stable',
        },
        hintPlan: {
          topic: topWeakTopic.topic,
          hints: buildCoachHints(topWeakTopic.topic),
        },
      },
    });
  } catch (error) {
    next(error);
  }
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
  getCoachInsights,
};
