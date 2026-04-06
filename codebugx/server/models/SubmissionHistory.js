const mongoose = require('mongoose');

const detectedBugSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const submissionHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    codeSnippet: {
      type: String,
      required: true,
    },
    detectedBugs: {
      type: [detectedBugSchema],
      default: [],
    },
    overallSeverity: {
      type: String,
      enum: ['low', 'medium', 'high', 'none'],
      default: 'none',
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'submission_history',
  }
);

submissionHistorySchema.index({ user: 1, analyzedAt: -1 });
submissionHistorySchema.index({ language: 1, analyzedAt: -1 });

module.exports = mongoose.model('SubmissionHistory', submissionHistorySchema);
