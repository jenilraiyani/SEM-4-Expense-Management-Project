const dashboardService = require('../services/dashboard.service');

exports.getTotals = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardTotals();
    res.status(200).json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};