import mongoose from "mongoose";

const ClinicVisitSchema = new mongoose.Schema(
  {
    locationId: { type: String, index: true },

    date: { type: Date, required: true },
    time: { type: String, required: true },

    empNo: { type: String, required: true, index: true  },
    employeeName: { type: String, required: true, trim: true, index: true  },

    emiratesId: {
      type: String,
      required: true,
      index: true, // not unique
    },

    insuranceId: { type: String, index: true  },
    trLocation: { type: String, required: true,  index: true },
    mobileNumber: { type: String, required: true },

    natureOfCase: { type: String, required: true },
    caseCategory: { type: String, required: true },

    nurseAssessment: [{ type: String }],
    symptomDuration: { type: String },

    temperature: { type: Number },
    bloodPressure: { type: String },
    heartRate: { type: Number },

    others: { type: String },

    tokenNo: { type: String, required: true, index: true  },
    sentTo: { type: String },
    providerName: { type: String },

    doctorName: { type: String },

    primaryDiagnosis: { type: String },
    secondaryDiagnosis: [{ type: String }],

    // MEDICINE (array of objects – still same schema)
    medicines: [
      {
        name: { type: String },
        course: { type: String },
        expiryDate: { type: Date },
      },
    ],

    // SICK LEAVE
    sickLeaveStatus: {
      type: String,
      enum: ["Approved", "Not Approved"],
    },
    sickLeaveStartDate: { type: Date },
    sickLeaveEndDate: { type: Date },
    totalSickLeaveDays: { type: Number },
    remarks: { type: String },

    // REFERRAL
    referrals: [
      {
        referralCode: { type: String },
        referralType: { type: String },
        referredToHospital: { type: String },
        visitDateReferral: { type: Date },
        specialistType: { type: String },
        doctorName: { type: String },
        investigationReports: { type: String },
        primaryDiagnosisReferral: { type: String },
        secondaryDiagnosisReferral: [{ type: String }],
        nurseRemarksReferral: { type: String },
        insuranceApprovalRequested: { type: Boolean, default: false },
        followUpRequired: { type: Boolean, default: false },
        followUpVisits: [
      {
        visitDate: { type: Date },
        visitRemarks: { type: String },
      },
    ],
      },
    ],

    visitStatus: {
      type: String,
      enum: ["Open", "Closed", "Referred", "Other"],
      default: "Open",
      index: true, 
    },

    finalRemarks: { type: String },
    ipAdmissionRequired: { type: Boolean, default: false },
    
    // References to Hospital records
    hospitalizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
    ],

    // References to Isolation records
    isolations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Isolation',
      },
    ],
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    }
  }
);

export default mongoose.model("ClinicVisit", ClinicVisitSchema);
