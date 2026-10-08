const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  createInterview,
  startInterview,
  getInterview,
  submitAnswer,
  completeInterview,
  recordViolation,
  getFinalReport,
  getInterviewHistory,
  getDashboardStats,
} = require('../controllers/interviewController');

// All interview routes are protected
router.use(protect);

router.post('/', upload.single('resume'), createInterview);
router.get('/', getInterviewHistory);
router.get('/dashboard/stats', getDashboardStats);
router.get('/:id', getInterview);
router.post('/:id/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.post('/:id/violation', recordViolation);
router.get('/:id/result', getFinalReport);

module.exports = router;
