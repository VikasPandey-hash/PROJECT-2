const validator = require("validator"); //Validator Library.
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
    let collegeName = req.query.collegeName;

    //IF More than one Queries Provided => ERROR Response.
    if (Object.keys(req.query).length > 1) {
      return res.status(400).send({
        status: false,
        message:
          "Provide: <either> [NO Queries(to Get all College Details)] <OR> [ONLY 1 Query ('collegeName' for Specific College)].",
      });
    }

    //IF NO Query Provided -  Return All Colleges with Interns.
    if (Object.keys(req.query).length === 0) {
     
      return res.status(400).send({ status: false, msg: "no query given"  });
    }

    // IF ONLY 'collegeName' Query Provided => Return that College with its Interns.
    if (Object.keys(req.query).length === 1 && req.query.collegeName) {
      //Convert 'collegeName' in Query to Lowercase.
      collegeName = collegeName.toLowerCase();

      // Check 'collegeName' is Valid (Exists in Database).
      const college = await collegeModel.findOne({ name: collegeName });
      if (!college) {
        return res.status(404).send({
          status: false,
          message: `College 'name': <${collegeName}> NOT Found.`,
        });
      }
      // Get requested Intern(s) Details.
      let interns = await internModel
        .find({ collegeId: college._id })
        .select({ name: 1, email: 1, mobile: 1 });

      // If Interns[] is Empty.
      if (interns.length === 0) {
        interns = "NO one has applied for Internship.";
      }
      // Create requested Object for Response.
      let finalCollegeData = {
        name: college.name,
        fullName: college.fullName,
        logoLink: college.logoLink,
        interests: interns,
      };
      // Send Requested College-Details with its Intern-details.
      return res.status(200).send({ status: true, data: finalCollegeData });
    }

    // IF Invalid Query Provided(other than 'collegeName' Query).
    else {
      return res.status(400).send({
        status: false,
        message: "Invalid Query Provided.",
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

/*----------------------------------------------------------------------------------------------------------------- 2. API - CREATE A COLLEGE ------------------------------------------------------------------------------------------*/

const createCollege = async (req, res) => {
  try {
    const college = req.body;
    let { name, fullName, logoLink } = req.body; //Object Destructuring.

    //Empty Body Validation.
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({
        status: false,
        message: "NO Information Given(Request-BODY Empty).",
      });
    }

    //IF More than 3 Fields Provided in Request Body => ERROR Response.
    if (Object.keys(req.body).length > 3) {
      return res.status(400).send({
        status: false,
        message:
          "INVALID BODY: Provide ONLY 3 Fields in Request-Body: 'name', 'fullName' and 'logoLink'.",
      });
    }

    //"name" Validation.
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

    //Convert 'collegeName' in Query to Lowercase.
    name = name.toLowerCase();

    //"fullName" Validation.
    if (!isValid(fullName)) {
      return res.status(400).send({
        status: false,
        message: "College 'fullName' is required...!",
      });
    }
    if (!/^[a-zA-Z\-\, ]*$/.test(fullName)) {
      return res.status(400).send({
        status: false,
        message: `'fullName' can be "Alphabets, White-Spaces, Hyphen(-) and Comma(,)" ONLY.`,
      });
    }

    //"logoLink" Validation - String Present or Not.
    if (!isValid(logoLink)) {
      return res.status(400).send({
        status: false,
        message:
          "College 'logoLink' NOT Provided. (should be 'S3 (Amazon's Simple Service) Public URL' ONLY).",
      });
    }

    //"logoLink" Validation - Check Format of URL.
    if (
      !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.\+#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%\+.#?&//=]*)/.test(
        logoLink
      )
    ) {
      return res
        .status(400)
        .send({ status: false, msg: "This is an Invalid LogoLink" });
    }

    //College 'name' Should NOT be in Database (Unique 'name' ONLY).
    const isCollegeAlreadyRegistered = await collegeModel.findOne({ name });
    if (isCollegeAlreadyRegistered) {
      return res.status(400).send({
        status: false,
        message: `College with 'name': <${req.body.name}> is already registered.`,
      });
    }

    //Create College Document.
    const collegeData = await collegeModel.create(college);
    return res.status(201).send({ status: true, data: collegeData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { getCollegeDetails, createCollege };

// {
//   "name":  "",
//   "fullName": "",
//   "logoLink": "https://functionup-stg.s3.ap-south-1.amazonaws.com/radon/iitd.png"
// }
