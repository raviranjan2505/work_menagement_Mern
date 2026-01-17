import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    businessType: { type: String, enum: ["Individual", "Firm", "Company", "LLP"], required: true },

    pan: { type: String, unique: true, required: true },
    aadhaar: { type: String },
    gst: { type: String },

    email: { type: String },
    mobile: { type: String },
    address: { type: String },

    contactPerson: { type: String },
    natureOfBusiness: { type: String },

    documents: [{ type: String }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);
export default Client;
