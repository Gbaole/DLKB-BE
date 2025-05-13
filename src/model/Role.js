const mongoose = require("mongoose");

const Role_Schema = new mongoose.Schema(
  {
    key: { type: String },
    allCodeID: { ref: "Allcode", type: mongoose.SchemaTypes.ObjectId },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Role", Role_Schema);
