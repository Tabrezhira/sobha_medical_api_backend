import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema({
  followUpDate: { type: Date },
  remarks: { type: String }
}, { _id: false });

const technicianVisitSchema = new mongoose.Schema({
  visitNumber: { type: Number },
  technicianFeedback: { type: String },
  physicianFeedback: { type: String },
}, { _id: false });

const ipAdmissionSchema = new mongoose.Schema(
  {
  hospitalCase:{
    ref:"Hospital",
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

    empNo: { type: String, required: true, index: true },
    name: { type: String, required: true },
    emiratesId: { type: String, index: true },
    insuranceId: { type: String },

    trLocation: { type: String },
    mobileNumber: { type: String },
    hospitalName: { type: String },

    doa: { type: Date }, // Date of Admission
    natureOfCase: { type: String },
    caseCategory: { type: String },
    caseType: { type: String },

    primaryDiagnosis: { type: String },
    secondaryDiagnosis: { type: String },

    status: { 
      type: String,
    
    },

    dischargeSummaryReceived: { type: Boolean },
    dod: { type: Date }, // Date of Discharge
    noOfDaysHospitalized: { type: Number },

    followUps: [followUpSchema],

    fitnessStatus: { type: String },
    exitStatus: { type: String },

    isolationOrRehabilitationRequired: { type: Boolean },
    remarks: { type: String },

    hiManagers: { type: String },

    admissionMode: { type: String },
    admissionType: { type: String },

    insuranceApprovalStatus: {
      type: String,
    },

    treatmentUndergone: { type: String },

    imVisitStatus: { type: String },
    noOfVisits: { type: Number },

    technicianVisits: [technicianVisitSchema],

    treatmentLocation: { type: String },
    placeOfLocation: { type: String },
    postRecoveryLocation: { type: String },

    fitToTravel: { type: Boolean },
    postRehabRequired: { type: Boolean },
    durationOfRehab: { type: Number },

    followUpRequired: { type: Boolean },
    rehabExtension: { type: Boolean },
    rehabExtensionDuration: { type: Number },

    memberResumeToWork: { type: Date },

    technicianFeedbackForm: { type: String },

    dischargedHI: { type: Boolean },
    dodHI: { type: Date },

    source: { type: String },

    dischargeComments: { type: String },
    caseTypeChangeComments: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("IpAdmission", ipAdmissionSchema);
