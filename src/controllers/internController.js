const validator = require("validator"); //Validator Library for Email Validation.
const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");

//Validation Functions(Global).
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

const isValidMobile = function (value) {
  if (!isNaN(value)) {
    if (/^[6-9]\d{9}$/.test(value)) return true;
  } else return false;
};

const isValidNumber = function (value) {
  if (!/^[0-9]*$/.test(value)) return false;
  return true;
};

/*-------------------------------------------------------------------------------------------------------------------------- 1. API - CREATE an Intern ---------------------------------------------------------------------------------------- */

const createIntern = async function (req, res) {
  try {
    const requestBody = req.body;
    let collegeName = req.body.collegeName;
    const name = req.body.name;

    //Empty Body Validation.
    if (!isValidRequestBody(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide Intern details." });
    }

    //IF More than 4 Fields Provided in Request Body => ERROR Response.
    if (Object.keys(req.body).length > 4) {
      return res.status(400).send({
        status: false,
        message:
          "INVALID BODY: Provide ONLY 4 Fields in Request-Body: 'name', 'email', 'mobile' and 'collegeName'.",
      });
    }

    //"name" Validation
    if (!isValid(name)) {
      return res.status(400).send({
        status: false,
        message: "Intern Name is required...!",
      });
    }
    if (!isValidName(name)) {
      return res.status(400).send({
        status: false,
        message: `Name can be a "Alphabets(and White-Spaces)" ONLY.`,
      });
    }

    //"mobile" Validation.
    const mobileData = req.body.mobile;
    if (!isValid(mobileData)) {
      return res
        .status(400)
        .send({ status: false, message: "Mobile Number is required...!" });
    }

    //"mobile" should NOT be "Nan".
    const convertToNumberMobileData = Number(mobileData);
    if (convertToNumberMobileData == NaN) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter a valid mobile number" });
    }

    //"mobile" should be NUMBERS ONLY (No Alphabets, etc.).
    if (!isValidNumber(mobileData)) {
      return res.status(400).send({
        status: false,
        message:
          "'mobile' can be NUMBERS ONLY (No Alphabets, White-Spaces etc.).",
      });
    }

    //"Mobile" can be 10 Digits ONLY.
    const mobileNo = mobileData.toString();
    if (mobileNo.length != 10) {
      return res.status(400).send({
        status: false,
        message: "Please enter 10 Digit (Indian) Mobile Number.",
      });
    }

    //"mobile" should be an Indian-Number
    if (!isValidMobile(mobileData)) {
      return res.status(400).send({
        status: false,
        message: "Mobile Number can start with <6,7,8 or 9> Digit ONLY.",
      });
    }

    //"mobile" should NOT be "already registered".
    const isMobileAlreadyRegistered = await internModel.findOne({
      mobile: mobileNo,
    });
    if (isMobileAlreadyRegistered) {
      return res.status(400).send({
        status: false,
        message: ` Mobile Number: <${mobileNo}> is already registered.`,
      });
    }

    //"email" Validation.
    const email = req.body.email;
    //Validate String.
    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "email is required...!" });
    }
    //Validate (Format of) Email.
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid Email Format." });
    }

    //"email" should NOT be "already registered".
    const isEmailAlreadyRegistered = await internModel.findOne({ email });
    if (isEmailAlreadyRegistered) {
      return res
        .status(400)
        .send({ status: false, message: `<${email}> is already registered` });
    }

    //"collegeName" should be Valid (Exist in College Collection).
    const collegeNameCheck = await collegeModel.findOne({ name: collegeName });
    if (!collegeNameCheck) {
      return res
        .status(400)
        .send({ status: false, message: "College does not exist...!" });
    }

    //Create Intern's Document.
    collegeId1 = collegeNameCheck._id.toString();
    requestBody.collegeId = collegeId1;
    const intern = await internModel.create(requestBody);

    return res.status(201).send({ status: true, data: intern });
  } catch (error) {
    return res.status(500).send({ message: error.message, status: false });
  }
};

module.exports = { createIntern };

// {
//     "collegeName": "",
//     "mobile": "",
//     "email": "",
//     "name": ""
// }
