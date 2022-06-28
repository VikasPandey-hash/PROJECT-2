const mongoose = require("mongoose");
const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");

const getCollegeDetails = async (req, res) => {
  try {
    return res.status(200).json({ status: true, data: "OK" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const createCollege = async (req, res) => {
  try {
    return res.status(201).send({ status: true, data: "OK" });
  } catch (error) {
    return res(500).send({ status: false, message: error.message });
  }
};

module.exports = { getCollegeDetails, createCollege };
