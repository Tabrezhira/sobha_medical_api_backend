import mongoose from "mongoose";


const notAnsCallSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
       index: true 
    },
    manager: {
      ref:"User",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true 
    },
    empNo: {
      type: String,
      required: true,
      index: true 
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

export default mongoose.model("NotAnsCall", notAnsCallSchema);
