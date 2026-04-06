const mongoose = require('mongoose');

const bugPatternFrequencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bugType: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
    },
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    frequency: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastDetectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'bug_pattern_frequency',
  }
);

bugPatternFrequencySchema.index(
  { user: 1, bugType: 1, topic: 1, language: 1 },
  { unique: true }
);

module.exports = mongoose.model('BugPatternFrequency', bugPatternFrequencySchema);
