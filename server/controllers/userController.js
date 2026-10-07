const User = require('../models/User');

// @desc    Update user profile details
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, targetRole, experienceLevel, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (targetRole) user.targetRole = targetRole;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (typeof bio === 'string') user.bio = bio.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
        bio: user.bio,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

module.exports = { updateProfile };
