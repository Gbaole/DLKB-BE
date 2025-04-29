const mongoose = require('mongoose');

const Allcode_Schema = new mongoose.Schema({
        key: { type: String },
        type: { type: String },
        valueEn: { type: String },        
        valueVi: { type: String }                 
    }
);
module.exports = mongoose.model("Allcode", Allcode_Schema);