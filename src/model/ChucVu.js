const mongoose = require('mongoose');

const ChucVu_Schema = new mongoose.Schema({ 
        name: { type: String },        
        description: { type: String },        
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("ChucVu", ChucVu_Schema);