const mongoose = require("mongoose");
const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");

//Validations.
const isValid = function (value) {
  if (!value || typeof value != "string" || value.trim().length == 0)
    return false;
  return true;
};

const isValidName = function (value) {
  if (!/^[a-zA-Z ]*$/.test(value)) return false;
  return true;
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

/*--------------------------------------------------------------------------------------------------------- 1. API - GET College Details 'BY QUERY ONLY' with Interns ---------------------------------------------------------------------------------------- */

const getCollegeDetails = async (req, res) => {
  try {
    let query = req.query.collegeName;

    //NO Query Provided -  Return All Colleges with Interns.
    if (!query) {
      const college = await collegeModel.find();

      const interns = await internModel.find();

      let Arra;
      let DATA = [];
      for (let i = 0; i < college.length; i++) {
        let newArr = [];
        let Arr = [];
        newArr.push(college[i]);
        for (let j = 0; j < interns.length; j++) {
          if (college[i].id.toString() === interns[j].collegeId.toString()) {
            // Arr.push(interns[j]);
            intern = {
              id: interns[j]._id,
              name: interns[j].name,
              email: interns[j].email,
              mobile: interns[j].mobile,
            };
            Arr.push(intern);
          }
        }
        Arra = {
          name: newArr[0].name,
          fullName: newArr[0].fullName,
          logoLink: newArr[0].logoLink,
          interests: Arr,
        };
        DATA.push(Arra);
      }
      return res.status(200).send({ status: true, data: DATA });
      // return res
      //   .status(400)
      //   .send({ status: false, message: "Provide a collegeName in Query." });
    }

    //Query in Lower-Case ONLY.
    // if (query != query.toLowerCase()) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "Provide the collegeName in LowerCase ONLY.",
    //   });
    // }

    //Convert 'collegeName' in Query to Lowercase.
    query = query.toLowerCase();

    //Check 'collegeName' is Valid (Exists in Database).
    const college = await collegeModel.findOne({ name: query });
    if (!college) {
      return res.status(404).send({
        status: false,
        message: `College 'name': <${query}> NOT Found.`,
      });
    }

    //Return College-Details with Intern-details.
    let collegeData = await collegeModel
      .findOne({ name: query })
      .select({ name: 1, fullName: 1, logoLink: 1, _id: 0 });

    // console.log(collegeData)
    // console.log(collegeData._doc)

    let interns = await internModel
      .find({ collegeId: college._id })
      .select({ name: 1, email: 1, mobile: 1 });

    // let finalCollegeData = Object.assign(collegeData._doc);
    // finalCollegeData["interns"] = interns;
    if (interns.length === 0) {
      interns = "NO one has applied for Internship.";
    }

    let finalCollegeData = {
      name: collegeData.name,
      fullName: collegeData.fullName,
      logoLink: collegeData.logoLink,
      interests: interns,
    };

    return res.status(200).send({ status: true, data: finalCollegeData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/----------------------------------------------------------------------------------------------------------------- 2. API - CREATE A COLLEGE ------------------------------------------------------------------------------------------/

const createCollege = async (req, res) => {
  try {
    const college = req.body;
    let { name, fullName, logoLink } = req.body;

    //Empty Body Validation.
    if (!isValidRequestBody(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "NO Information Given." });
    }

    //"name" Validation
    if (!isValid(name)) {
      return res.status(400).send({
        status: false,
        message: "College 'name' is required...!",
      });
    }
    if (!/^[a-zA-Z]*$/.test(name)) {
      return res.status(400).send({
        status: false,
        message: `'name' ${name} can be "Alphabets ONLY (NO White-Spaces)".`,
      });
    }
    // if (name != name.toLowerCase()) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "Provide the college 'name' in Lower-Case ONLY.",
    //   });
    // }

    //Convert 'collegeName' in Query to Lowercase.
    name = name.toLowerCase();

    //"fullName" Validation
    if (!isValid(fullName)) {
      return res.status(400).send({
        status: false,
        message: "College 'fullName' is required...!",
      });
    }
    if (!/^[a-zA-Z\-\, ]*$/.test(fullName)) {
      return res.status(400).send({
        status: false,
        message: `'fullName' can be a "Alphabets(and White-Spaces), Hyphen(-) and Comma(,)" ONLY.`,
      });
    }

    //"logoLink" Validation
    if (!isValid(logoLink)) {
      return res.status(400).send({
        status: false,
        message:
          "College 'logoLink' NOT Provided. (should be 'S3 (Amazon's Simple Service) Public URL' ONLY).",
      });
    }

    //College 'name' Should NOT be in Database (Unique 'name' ONLY).
    const isCollegeAlreadyRegistered = await collegeModel.findOne({ name });
    if (isCollegeAlreadyRegistered) {
      return res.status(400).send({
        status: false,
        message: `College with 'name': <${req.body.name}> is already registered.`,
      });
    }

    const collegeData = await collegeModel.create(college);

    return res.status(201).send({ status: true, data: collegeData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { getCollegeDetails, createCollege };