const AdminActivityHistory = require("../Models/AdminActivityHistory");

//get all admin activity history
exports.getAllAdminActivityHistory = async (req, res) => {
  try {
    const adminActivityHistory = await AdminActivityHistory.find();
    res.json(adminActivityHistory);
  } catch (err) {
    res.json({ message: err });
  }
};
