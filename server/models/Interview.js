const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Technical', 'HR', 'Behavioral', 'System Design', 'General'],
    default: 'Technical',
  },
  expectedKeywords: [String],
  userAnswer: {
    type: String,
    default: '',
  },
  audioUsed: {
    type: Boolean,
    default: false,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
  evaluation: {
    score: { type: Number, min: 0, max: 10 },
    technicalScore: { type: Number, min: 0, max: 10 },
    communicationScore: { type: Number, min: 0, max: 10 },
    relevanceScore: { type: Number, min: 0, max: 10 },
    problemSolvingScore: { type: Number, min: 0, max: 10 },
    positiveFeedback: String,
    missingPoints: [String],
    improvementSuggestion: String,
    evaluatedAt: Date,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    jobRoleType: {
      type: String,
      enum: ['predefined', 'custom'],
      default: 'predefined',
    },
    customSkills: {
      type: String,
      default: '',
    },
    customDescription: {
      type: String,
      default: '',
    },
    interviewType: {
      type: String,
      required: true,
      enum: ['Technical', 'HR', 'Mixed'],
      default: 'Technical',
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Fresher', '1–2 Years', '2–5 Years'],
      default: 'Fresher',
    },
    duration: {
      type: Number,
      min: 10,
      max: 90,
      default: 30,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    questionCount: {
      type: Number,
      default: 10,
    },
    resumeFileName: {
      type: String,
      default: null,
    },
    resumeTextSnippet: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questions: [questionSchema],
    finalReport: {
      overallScore: { type: Number, default: 0 },
      technicalAccuracy: { type: Number, default: 0 },
      communicationClarity: { type: Number, default: 0 },
      answerRelevance: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      strengths: [String],
      areasToImprove: [String],
      recommendations: [String],
      summary: String,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
