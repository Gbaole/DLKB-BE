const mongoose = require('mongoose');

const PhongKham_Schema = new mongoose.Schema({        
        name: { type: String },                
        address: { type: String },        
        description: { type: String },        
        image: { type: String },                
        sdtPK: { type: String },                
    }
);
module.exports = mongoose.model("PhongKham", PhongKham_Schema);