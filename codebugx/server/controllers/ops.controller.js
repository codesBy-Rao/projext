const { upsertDemoData } = require('../scripts/seed-demo-data');

const resetDemoData = async (req, res, next) => {
  try {
    const summary = await upsertDemoData({
      connectIfNeeded: true,
      disconnectAfter: false,
      log: false,
    });

    res.status(200).json({
      status: 'success',
      message: 'Demo data reset successfully',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  resetDemoData,
};
