const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    topic: { type: String, required: true },
  },
  { _id: false }
);

const analysisResultSchema = new mongoose.Schema(
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
    bugs: {
      type: [bugSchema],
      default: [],
    },
    overallSeverity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none',
    },
  },
  {
    timestamps: true,
    collection: 'analysis_results',
  }
);

analysisResultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
