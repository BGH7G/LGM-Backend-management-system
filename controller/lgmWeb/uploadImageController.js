const {EditorImage} = require('../../model/lgmWeb/EditorImagesModel');
const path = require('path');

const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

exports.uploadImage = async (req, res) => {
    try {
        const file = req.file;             // 由 multer 注入
        if (!file) return res.status(400).json({ errno: 1, message: 'No file' });

        const url = `/images/EditorImages/${file.filename}`;   // 静态目录已通过 app.use('/images', express.static(...))

        // 记录数据库
        const record = await EditorImage.create({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mime: file.mimetype,
            url,
            uploaderId: req.user?.id         // 如有 JWT 解析出的用户
        });

        res.json({
            errno: 0,
            data: {
                url: `${BASE_URL}${record.url}`,
                alt: record.originalName || '',
                href: ''
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ errno: 1, message: 'upload error' });
    }
};