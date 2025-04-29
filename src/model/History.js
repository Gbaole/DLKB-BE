const mongoose = require('mongoose');

const History_Schema = new mongoose.Schema({
        doctorID: {ref: "Doctor", type: mongoose.SchemaTypes.ObjectId},
        patientID: {ref: "BenhNhan", type: mongoose.SchemaTypes.ObjectId},     
        description: { type: String },
        files: { type: String },
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("History", History_Schema);