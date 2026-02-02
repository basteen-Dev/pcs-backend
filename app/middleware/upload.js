const multer = require('multer');
const path = require('path');
const fs = require('fs');

const stroage = multer.diskStorage({
    destination: function (req, file, cb) {

        const uploadPath = path.join(__dirname, "../public/completedTicketImages");

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {

        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);

    }
});

// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
//     if (mimetype && extname) return cb(null, true);
//     cb(new Error('Only image files are allowed!'));
// };


const upload = multer({
    storage: stroage,
    // fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});


module.exports = upload;