const mongoose = require("mongoose");

const defaultRoleId = new mongoose.Types.ObjectId("66df1d48dcb551b86e4f7039");

const AccAdmin_Schema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, default: "Tú" },
    lastName: { type: String, default: "Khắc" },
    address: { type: String, default: "Hà Nội" },
    phone: { type: String },
    gender: { type: Boolean, default: true },
    isActive: { type: Boolean, default: false },
    image: { type: String },
    tokenAccess: { type: String },
    roleId: {
      ref: "Role",
      type: mongoose.SchemaTypes.ObjectId,
      default: defaultRoleId,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("AccAdmin", AccAdmin_Schema);
