const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateProfile } = require('../controllers/userController');

router.use(protect);
router.put('/profile', updateProfile);

module.exports = router;
