const mongoose = require("mongoose");
const validator = require("validator");

const internSchema = new mongoose.Schema({
  isDeleted: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      //Validating Email.
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email Format !!");
      }
    },
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    //validate
    match: /^[6-9]\d{9}$/,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: "College",
  },
});

module.exports = mongoose.model("Intern", internSchema);
