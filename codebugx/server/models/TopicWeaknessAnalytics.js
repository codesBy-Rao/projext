const mongoose = require('mongoose');

const topicWeaknessAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    bugCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    weaknessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable',
    },
    lastAnalyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'topic_weakness_analytics',
  }
);

topicWeaknessAnalyticsSchema.index({ user: 1, topic: 1 }, { unique: true });
topicWeaknessAnalyticsSchema.index({ weaknessScore: -1 });

module.exports = mongoose.model('TopicWeaknessAnalytics', topicWeaknessAnalyticsSchema);
