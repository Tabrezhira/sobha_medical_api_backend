import mongoose from "mongoose";

const memberFeedback = new mongoose.Schema(
  {
    locationId: { type: String, index: true },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClinicVisit",
    },

    manager: { type: String },

    dateOfCall: { type: Date },

    treatment: [
      {
        wasTreatmentEffective: { type: Boolean },
        technicianFeedback: { type: String },
      },
    ],

    refReqToSpecialist: { type: Boolean },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MEMBER_FEEDBACK", memberFeedback);
