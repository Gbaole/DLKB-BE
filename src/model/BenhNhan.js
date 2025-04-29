const mongoose = require('mongoose');

const defaultRoleId = new mongoose.Types.ObjectId("66df1d92dcb551b86e4f703d");

const BenhNhan_Schema = new mongoose.Schema({   
        email: { type: String,   },
        password: { type: String,  },
        firstName: { type: String },        
        lastName: { type: String },        
        address: { type: String },        
        gender: { type: Boolean, },        
        isActive: { type: Boolean, default: true},        
        image: { type: String },  
        phone: { type: String },    
        roleId: {
            ref: "Role", 
            type: mongoose.SchemaTypes.ObjectId,
            default: defaultRoleId // Đặt giá trị mặc định
        },                                         
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("BenhNhan", BenhNhan_Schema);