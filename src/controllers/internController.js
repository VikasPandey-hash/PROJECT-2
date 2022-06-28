const mongoose = require("mongoose");
const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");

const createIntern = async (req, res) => {
  try {
    return res.status(201).send({ status: true, data: "OK" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createIntern };

// {
//     "collegeId": "",
//     "mobile": "",
//     "email": "",
//     "name": ""
// }
