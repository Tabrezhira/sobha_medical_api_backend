import mongoose from "mongoose";

const ipAdmissionSchema = new mongoose.Schema(
  {
    locationId: { type: String, index: true },
    empNo: { type: String, required: true },
    name: { type: String, required: true },
    emiratesId: { type: String, required: true },
    insuranceId: { type: String },

    trLocation: { type: String },
    mobileNumber: { type: String },

    hospitalName: { type: String },

    doa: { type: Date }, // Date of Admission
    dod: { type: Date }, // Date of Discharge

    natureOfCase: { type: String },
    caseCategory: { type: String },

    primaryDiagnosis: { type: String },
    secondaryDiagnosis: { type: String },

    status: { type: String },
    dischargeSummaryReceived: { type: Boolean },

    noOfDaysHospitalized: { type: Number },

    // ✅ Converted Follow-Ups
    followUps: {
      type: [
        {
          followUpDate: { type: Date, required: true },
          remarks: { type: String }
        }
      ],
      default: []
    },

    fitnessStatus: { type: String },
    exitStatus: { type: String },

    isolationOrRehabilitationRequired: { type: Boolean },

    remarks: { type: String },

    hiManagers: { type: String },

    admissionMode: { type: String },
    admissionType: { type: String },

    insuranceApprovalStatus: { type: String },

    treatmentUndergone: { type: String },

    imVisitStatus: { type: String },
    noOfVisits: { type: Number },

    // ✅ Converted Visit Feedbacks
    visits: {
      type: [
        {
          visitNumber: { type: Number },
          technicianFeedback: { type: String },
          physicianFeedback: { type: String }
        }
      ],
      default: []
    },

    treatmentLocation: { type: String },
    placeOfLocation: { type: String },
    postRecoveryLocation: { type: String },

    fitToTravel: { type: Boolean },

    postRehabRequired: { type: Boolean },

    // ✅ Converted Rehab Extensions
    rehabExtensions: {
      type: [
        {
          extensionDate: { type: Date },
          durationInDays: { type: Number },
          remarks: { type: String }
        }
      ],
      default: []
    },

    memberResumeToWork: { type: Date },

    technicianFeedbackForm: { type: Boolean },

    // ✅ Converted H&I Tracking
    hiTracking: {
      discharged: { type: Boolean },
      dod: { type: Date }
    },

    source: { type: String },
    caseType: { type: String },

    dischargeComments: { type: String },
    caseTypeChangeComments: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("IpAdmission", ipAdmissionSchema);
