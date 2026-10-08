const Interview = require('../models/Interview');
const { parseResumePdf } = require('../services/resumeParser');
const {
  generateInterviewQuestions,
  evaluateCandidateAnswer,
  generateFinalReport,
  generateFollowUpQuestion,
  getAdditionalQuestions,
} = require('../services/aiService');

// @desc    Create new mock interview with customizable duration and custom role support
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res) => {
  try {
    const {
      jobRole,
      jobRoleType,
      customSkills,
      customDescription,
      interviewType,
      experienceLevel,
      duration,
    } = req.body;

    if (!jobRole || !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your target job role.',
      });
    }

    if (!interviewType || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide interview type and experience level',
      });
    }

    const cleanedRole = jobRole.trim();
    const roleType = jobRoleType === 'custom' ? 'custom' : 'predefined';

    let parsedResumeText = null;
    let resumeFileName = null;

    if (req.file) {
      resumeFileName = req.file.originalname;
      parsedResumeText = await parseResumePdf(req.file.buffer);
    }

    // Validate duration: 10 to 90 minutes (default 30)
    let sessionDuration = parseInt(duration, 10);
    if (isNaN(sessionDuration) || sessionDuration < 10) sessionDuration = 30;
    if (sessionDuration > 90) sessionDuration = 90;

    // Estimate initial question batch based on selected duration
    // 10 min: ~6 Qs
    // 15–20 min: ~7 Qs
    // 25–35 min: ~10 Qs
    // 40–50 min: ~14 Qs
    // 55–70 min: ~18 Qs
    // 75–90 min: ~26 Qs
    let targetQuestionCount = 10;
    if (sessionDuration <= 12) targetQuestionCount = 6;
    else if (sessionDuration <= 20) targetQuestionCount = 7;
    else if (sessionDuration <= 35) targetQuestionCount = 10;
    else if (sessionDuration <= 50) targetQuestionCount = 14;
    else if (sessionDuration <= 70) targetQuestionCount = 18;
    else targetQuestionCount = 26;

    // Generate initial questions via AI
    const questions = await generateInterviewQuestions({
      jobRole: cleanedRole,
      jobRoleType: roleType,
      customSkills: customSkills || '',
      customDescription: customDescription || '',
      interviewType,
      experienceLevel,
      questionCount: targetQuestionCount,
      resumeSnippet: parsedResumeText || '',
    });

    const interview = await Interview.create({
      userId: req.user._id,
      jobRole: cleanedRole,
      jobRoleType: roleType,
      customSkills: (customSkills || '').trim(),
      customDescription: (customDescription || '').trim(),
      interviewType,
      experienceLevel,
      duration: sessionDuration,
      startTime: null,
      endTime: null,
      questionCount: 0,
      generatedQuestionCount: questions.length,
      answeredQuestionCount: 0,
      violationCount: 0,
      violations: [],
      resumeFileName,
      resumeTextSnippet: parsedResumeText ? parsedResumeText.substring(0, 1500) : null,
      status: 'ready',
      currentQuestionIndex: 0,
      questions,
    });

    return res.status(201).json({
      success: true,
      interviewId: interview._id,
      interview,
    });
  } catch (error) {
    console.error('Create interview error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize interview',
    });
  }
};

// @desc    Start interview when candidate completes setup and is ready
// @route   POST /api/interviews/:id/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Interview has already been completed' });
    }

    // Only set start and end times if not yet started
    if (interview.status === 'ready' || !interview.startTime) {
      interview.status = 'in_progress';
      const now = new Date();
      interview.startTime = now;
      interview.endTime = new Date(now.getTime() + (interview.duration || 30) * 60 * 1000);
      await interview.save();
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error('Start interview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start interview' });
  }
};

// @desc    Get interview session by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    return res.status(200).json({ success: true, interview });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve interview' });
  }
};

// @desc    Submit answer to a question, receive evaluation, and advance with pacing & time check
// @route   POST /api/interviews/:id/answer
// @access  Private
const submitAnswer = async (req, res) => {
  try {
    const { questionIndex, answerText, audioUsed, timeSpentSeconds } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This interview has already been completed' });
    }

    const idx = typeof questionIndex === 'number' ? questionIndex : interview.currentQuestionIndex;
    const currentQ = interview.questions[idx];

    if (!currentQ) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    // Evaluate answer via AI
    const evaluation = await evaluateCandidateAnswer({
      questionText: currentQ.questionText,
      category: currentQ.category,
      expectedKeywords: currentQ.expectedKeywords,
      userAnswer: answerText,
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
    });

    // Update question state
    currentQ.userAnswer = answerText || '';
    currentQ.audioUsed = Boolean(audioUsed);
    currentQ.timeSpentSeconds = Number(timeSpentSeconds) || 0;
    currentQ.evaluation = evaluation;

    // Check timer source of truth: is remaining time up?
    const now = Date.now();
    const endTimeMs = interview.endTime ? new Date(interview.endTime).getTime() : 0;
    const isTimeExpired = endTimeMs > 0 && now >= endTimeMs;

    let isCompleted = false;
    let nextIndex = idx + 1;

    if (isTimeExpired) {
      // Time is up: wrap up and finalize report
      isCompleted = true;
      interview.status = 'completed';
      interview.completedAt = new Date();
      interview.finalReport = generateFinalReport(interview.questions);
    } else {
      const remainingMs = endTimeMs - now;

      // Conversational flow: Check if an adaptive follow-up question should be injected
      // Only inject if remaining time is ample (> 2.5 minutes) and current question wasn't already a follow-up
      if (remainingMs > 150000 && !currentQ.questionText.startsWith('Follow-up:')) {
        const followUp = generateFollowUpQuestion({
          questionText: currentQ.questionText,
          userAnswer: answerText,
          evaluation,
          jobRole: interview.jobRole,
          experienceLevel: interview.experienceLevel,
        });

        if (followUp) {
          const followUpItem = {
            questionId: idx + 2,
            questionText: followUp.questionText,
            category: followUp.category || currentQ.category,
            expectedKeywords: followUp.expectedKeywords || [],
          };
          // Insert follow-up right after current question
          interview.questions.splice(idx + 1, 0, followUpItem);
          // Re-index subsequent questions
          for (let i = idx + 2; i < interview.questions.length; i++) {
            interview.questions[i].questionId = i + 1;
          }
        }
      }

      // Check if candidate reached the end of current question array
      if (nextIndex >= interview.questions.length) {
        // If more than 2 minutes remain, dynamically fetch additional questions to sustain practice
        if (remainingMs > 120000) {
          const extra = getAdditionalQuestions({
            jobRole: interview.jobRole,
            interviewType: interview.interviewType,
            experienceLevel: interview.experienceLevel,
            existingQuestions: interview.questions,
            count: 3,
          });

          if (extra.length > 0) {
            extra.forEach((eq, eqIdx) => {
              eq.questionId = interview.questions.length + eqIdx + 1;
              interview.questions.push(eq);
            });
            interview.currentQuestionIndex = nextIndex;
          } else {
            // No more questions to ask: complete
            isCompleted = true;
            interview.status = 'completed';
            interview.completedAt = new Date();
            interview.finalReport = generateFinalReport(interview.questions);
          }
        } else {
          // Less than 2 minutes left, wrap up cleanly
          isCompleted = true;
          interview.status = 'completed';
          interview.completedAt = new Date();
          interview.finalReport = generateFinalReport(interview.questions);
        }
      } else {
        interview.currentQuestionIndex = nextIndex;
      }
    }

    interview.generatedQuestionCount = interview.questions.length;
    interview.answeredQuestionCount = interview.questions.filter(
      (q) => q.userAnswer && q.userAnswer.trim().length > 0
    ).length;
    interview.questionCount = interview.answeredQuestionCount;
    await interview.save();

    return res.status(200).json({
      success: true,
      evaluation,
      isCompleted,
      nextQuestionIndex: isCompleted ? idx : nextIndex,
      interview,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit and evaluate answer',
    });
  }
};

// @desc    Explicitly finalize / complete an interview (e.g. when timer hits 0:00)
// @route   POST /api/interviews/:id/complete
// @access  Private
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status !== 'completed') {
      interview.status = 'completed';
      interview.completedAt = new Date();
      interview.generatedQuestionCount = interview.questions.length;
      interview.answeredQuestionCount = interview.questions.filter(
        (q) => q.userAnswer && q.userAnswer.trim().length > 0
      ).length;
      interview.questionCount = interview.answeredQuestionCount;
      interview.finalReport = generateFinalReport(interview.questions);
      await interview.save();
    }

    return res.status(200).json({
      success: true,
      isCompleted: true,
      report: interview.finalReport,
      interview,
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete interview session' });
  }
};

// @desc    Record a proctoring notice/violation during interview
// @route   POST /api/interviews/:id/violation
// @access  Private
const recordViolation = async (req, res) => {
  try {
    const { type } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status === 'completed') {
      return res.status(200).json({ success: true, violationCount: interview.violationCount || 0 });
    }

    const validTypes = ['fullscreen_exit', 'tab_switch'];
    const violationType = validTypes.includes(type) ? type : 'fullscreen_exit';

    interview.violationCount = (interview.violationCount || 0) + 1;
    if (!interview.violations) {
      interview.violations = [];
    }
    interview.violations.push({
      type: violationType,
      timestamp: new Date(),
    });

    await interview.save();

    return res.status(200).json({
      success: true,
      violationCount: interview.violationCount,
      violations: interview.violations,
    });
  } catch (error) {
    console.error('Record violation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record violation' });
  }
};

// @desc    Get final evaluation report
// @route   GET /api/interviews/:id/result
// @access  Private
const getFinalReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    return res.status(200).json({
      success: true,
      report: interview.finalReport,
      interview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve final report' });
  }
};

// @desc    Get all interview history for user
// @route   GET /api/interviews
// @access  Private
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select('jobRole jobRoleType customSkills customDescription interviewType experienceLevel duration questionCount generatedQuestionCount answeredQuestionCount questions status violationCount finalReport createdAt completedAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve interview history' });
  }
};

// @desc    Get dashboard metrics for user
// @route   GET /api/interviews/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const totalInterviews = interviews.length;
    const completed = interviews.filter((i) => i.status === 'completed' && i.finalReport?.overallScore > 0);

    let averageScore = 0;
    let bestScore = 0;

    if (completed.length > 0) {
      const sum = completed.reduce((acc, curr) => acc + (curr.finalReport.overallScore || 0), 0);
      averageScore = Math.round((sum / completed.length) * 10) / 10;
      bestScore = Math.max(...completed.map((i) => i.finalReport.overallScore || 0));
    }

    const recentInterviews = interviews.slice(0, 5).map((item) => {
      const answeredCount =
        item.answeredQuestionCount ??
        (item.questions?.filter((q) => q.userAnswer && q.userAnswer.trim().length > 0)?.length || item.questionCount || 0);
      const generatedCount =
        item.generatedQuestionCount ??
        (item.questions?.length || item.questionCount || 0);
      return {
        _id: item._id,
        jobRole: item.jobRole,
        interviewType: item.interviewType,
        experienceLevel: item.experienceLevel,
        duration: item.duration || 30,
        questionCount: answeredCount,
        answeredQuestionCount: answeredCount,
        generatedQuestionCount: generatedCount,
        status: item.status,
        score: item.finalReport?.overallScore || 0,
        createdAt: item.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalInterviews,
        completedCount: completed.length,
        averageScore,
        bestScore,
        recentInterviews,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats' });
  }
};

module.exports = {
  createInterview,
  startInterview,
  getInterview,
  submitAnswer,
  completeInterview,
  recordViolation,
  getFinalReport,
  getInterviewHistory,
  getDashboardStats,
};
