const Requests = require("../Models/Requests");
const Courses = require("../Models/Courses");
const Users = require("../Models/Users");

exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await Requests.find();
    res.status(200).json(requests);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await Requests.findById(req.params.request_id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json(request);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
