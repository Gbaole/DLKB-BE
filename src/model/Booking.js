const mongoose = require('mongoose');

const Booking_Schema = new mongoose.Schema({
        doctorID: {ref: "Doctor", type: mongoose.SchemaTypes.ObjectId},
        patientID: {ref: "BenhNhan", type: mongoose.SchemaTypes.ObjectId},       
        statusID: { type: String },
        date: { type: Date },        
        timeType: { type: String },                 
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("Booking", Booking_Schema);