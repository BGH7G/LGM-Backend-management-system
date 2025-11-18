const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保目录存在
const uploadDir = 'public/images/Code';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created directory: ${uploadDir}`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`[Multer] Saving file to: ${uploadDir}, fieldname: ${file.fieldname}, originalname: ${file.originalname}`);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        console.log(`[Multer] Generated filename: ${filename}`);
        cb(null, filename);
    }
})

// 创建 multer 实例，支持代码文件上传
const codeUpload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for code files
    }
});

module.exports = codeUpload;
