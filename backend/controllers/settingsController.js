import Settings from '../models/settingsModel.js';

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const { 
      siteName, 
      contactEmail, 
      footerText, 
      socialFacebook, 
      socialTwitter, 
      socialGithub, 
      socialLinkedin 
    } = req.body;

    const updateData = {};
    if (siteName !== undefined) updateData.siteName = siteName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (footerText !== undefined) updateData.footerText = footerText;
    if (socialFacebook !== undefined) updateData.socialFacebook = socialFacebook;
    if (socialTwitter !== undefined) updateData.socialTwitter = socialTwitter;
    if (socialGithub !== undefined) updateData.socialGithub = socialGithub;
    if (socialLinkedin !== undefined) updateData.socialLinkedin = socialLinkedin;

    // Handle files if uploaded
    if (req.files) {
      if (req.files.siteLogo && req.files.siteLogo[0]) {
        updateData.siteLogo = `/uploads/${req.files.siteLogo[0].filename}`;
      }
      if (req.files.favicon && req.files.favicon[0]) {
        updateData.favicon = `/uploads/${req.files.favicon[0].filename}`;
      }
    }

    const updatedSettings = await Settings.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
};
