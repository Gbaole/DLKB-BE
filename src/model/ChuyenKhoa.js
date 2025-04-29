const mongoose = require('mongoose');

const ChuyenKhoa_Schema = new mongoose.Schema({ 
        name: { type: String },        
        description: { type: String },        
        image: { type: String }        
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("ChuyenKhoa", ChuyenKhoa_Schema);