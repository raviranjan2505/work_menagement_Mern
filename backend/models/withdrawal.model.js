import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
export default Withdrawal;
