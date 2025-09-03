const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images/EditorImages'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = 'editor-' + Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, name + ext);
    }
});

module.exports = multer({storage});