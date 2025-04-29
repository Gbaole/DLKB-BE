const mongoose = require('mongoose');

const CauHoi_Schema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    chuyenKhoaId: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChuyenKhoa', 
        required: true 
    }],
    cauHoi: { 
        type: String, 
        required: true 
    },
    cauTraLoi: { 
        type: String, 
    },
    doctors: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor' 
    },
    status: { 
        type: Boolean, 
        default: false 
    }
}, 
{ 
    timestamps: true  // Tự động tạo trường createdAt và updatedAt
});

// // Hàm này sẽ tìm bác sĩ có chuyên khoa phù hợp và thêm vào danh sách bác sĩ
// CauHoi_Schema.methods.assignDoctors = async function() {
//     const doctors = await mongoose.model('Doctor').find({
//         chuyenKhoaId: this.chuyenKhoaId  // Lọc bác sĩ theo chuyên khoa của câu hỏi
//     });
//     this.doctors = doctors.map(doctor => doctor._id);  // Lưu danh sách bác sĩ vào trường 'doctors'
// };

// // Trước khi lưu câu hỏi, gán bác sĩ tương ứng
// CauHoi_Schema.pre('save', async function(next) {
//     await this.assignDoctors();  // Tìm và gán bác sĩ vào câu hỏi
//     next();
// });

module.exports = mongoose.model('CauHoi', CauHoi_Schema);
