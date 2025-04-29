// controllers/uploadController.js
const multer = require('multer');
const path = require('path');

// Cài đặt multer để lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads/')); // Lưu vào public/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tên file duy nhất
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn kích thước file là 5MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: File upload chỉ chấp nhận định dạng hình ảnh!');
        }
    }
});

// Tạo endpoint upload
const uploadFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Vui lòng chọn file để upload.' });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    });
};

module.exports = {
    uploadFile,
};
