const mongoose = require('mongoose');

const companyEmailSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      index: true,
    },
    applicantEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyEmail = mongoose.model('CompanyEmail', companyEmailSchema);

module.exports = CompanyEmail;
