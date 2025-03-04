const Requests = require("../Models/Requests");
const Courses = require("../Models/Courses");
const Users = require("../Models/Users");
const { request } = require("express");

exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await Requests.find();
    if (!requests) {
      return res.status(404).json({ message: "Requests not found" });
    }
    const rs = [];
    for (let i = 0; i < requests.length; i++) {
      const tutor = await Users.findById(requests[i].tutor);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      rs.push({
        _id: requests[i]._id,
        course_id: requests[i].course,
        tutor_id: requests[i].tutor,
        course_title: requests[i].content[0].value,
        tutor_name: tutor.fullname,
        content: requests[i].content,
        request_type: requests[i].request_type,
        status: requests[i].status,
        request_date: requests[i].request_date,
      });
    }
    rs.sort((a, b) => b.request_date - a.request_date);
    res.status(200).json(rs);
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
