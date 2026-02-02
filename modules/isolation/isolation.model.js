import mongoose from "mongoose";

const IsolationSchema = new mongoose.Schema({

  locationId: { type: String, index: true },

  clinicVisitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicVisit',
    required: true,
    index: true,
  },

    empNo: { type: String, required: true },
    type: { type: String },

    employeeName: { type: String, required: true, trim: true },

    emiratesId: { type: String, required: true, index: true },
    insuranceId: { type: String },

    mobileNumber: { type: String },
    trLocation: { type: String },

    isolatedIn: { type: String }, 
    isolationReason: { type: String },

    nationality: { type: String },

    slUpto: { type: Date },

    dateFrom: { type: Date },
    dateTo: { type: Date },

    currentStatus: {
      type: String,
    },

    remarks: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },

);


export default mongoose.model('Isolation', IsolationSchema);
