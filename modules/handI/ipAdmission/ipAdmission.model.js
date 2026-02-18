import mongoose from "mongoose";


const ipAdmissionSchema = new mongoose.Schema(
  {
  hospitalCase:{
    ref:"Hospital",
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

   hiManager: { 
      type: String, 
      required: true 
    },

    admissionMode: { 
      type: String 
    },

    admissionType: { 
      type: String 
    },

    insuranceApprovalStatus: { 
      type: String,
      enum: ["Pending", "Approved", "Rejected", "NA"],
      default: "Pending"
    },

    treatmentUndergone: { 
      type: String 
    },

    imVisitStatus: { 
      type: String 
    },

    noOfVisits: { 
      type: Number, 
      default: 0 
    },

    visits: [
      {
        visitNumber: { type: Number },
        technicianFeedback: { type: String },
        treatingPhysicianFeedback: { type: String },
        visitDate: { type: Date }
      }
    ],

    treatmentLocation: { 
      type: String 
    },

    placeOfLocation: { 
      type: String 
    },

    postRecoveryLocation: { 
      type: String 
    },

    fitToTravel: { 
      type: Boolean 
    },

    postRehabRequired: { 
      type: Boolean 
    },

    durationOfRehab: { 
      type: Number   // in days
    },

    followUpRequired: { 
      type: Boolean 
    },

    rehabExtension: { 
      type: Boolean 
    },

    rehabExtensionDuration: { 
      type: Number   // in days
    },

    memberResumeToWork: { 
      type: Date 
    },

    technicianFeedbackForm: { 
      type: String 
    },

    dischargedHI: { 
      type: Date 
    },

    dodHI: { 
      type: Date 
    },

    source: { 
      type: String 
    },

    caseType: { 
      type: String 
    },

    dischargeComments: { 
      type: String 
    }
  },
  { timestamps: true }
);

export default mongoose.model("IpAdmission", ipAdmissionSchema);
