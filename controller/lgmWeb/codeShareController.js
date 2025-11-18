const codeShareService = require('../../services/lgmWeb/codeShareTransaction.js');
const path = require('path');
const fs = require('fs');

// GET /code-share - 查询代码分享列表
exports.get = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase();
        const language = req.query.language;
        const omicsType = req.query.omicsType;
        const authorName = req.query.authorName;
        const status = req.query.status || 'normal';

        if (page < 1 || pageSize < 1 || !['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({ success: false, msg: 'Invalid pagination or sorting parameters.' });
        }

        const result = await codeShareService.getAllCodeShares({ 
            page, pageSize, sortBy, sortOrder, language, omicsType, authorName, status 
        });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve code shares.', error: error.message });
    }
};

// GET /code-share/:id - 获取单个代码分享详情
exports.getById = async (req, res) => {
    try {
        const codeShare = await codeShareService.getCodeShareById(req.params.id);
        if (!codeShare) return res.status(404).json({ success: false, msg: 'Code share not found' });
        res.status(200).json({ success: true, data: codeShare });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve code share.', error: error.message });
    }
};

// POST /code-share - 创建代码分享
exports.create = async (req, res) => {
    try {
        console.log('=== Code Share Create Debug ===');
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        
        const codeFile = req.files?.codeFile?.[0];
        const imageFiles = req.files?.images || [];
        
        console.log('codeFile:', codeFile);
        console.log('imageFiles count:', imageFiles.length);
        
        const codeShare = await codeShareService.createCodeShare(req.body, codeFile, imageFiles);
        res.status(201).json({ success: true, msg: 'Code share created successfully!', data: codeShare });
    } catch (error) {
        console.error('Create code share error:', error);
        res.status(500).json({ success: false, msg: 'Failed to create code share.', error: error.message });
    }
};

// PUT /code-share/:id - 更新代码分享
exports.update = async (req, res) => {
    try {
        const codeFile = req.files?.codeFile?.[0];
        const imageFiles = req.files?.images || [];
        
        const codeShare = await codeShareService.updateCodeShare(req.params.id, req.body, codeFile, imageFiles);
        res.status(200).json({ success: true, msg: 'Code share updated successfully!', data: codeShare });
    } catch (error) {
        if (error.message === 'Code share not found') {
            return res.status(404).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: 'Failed to update code share.', error: error.message });
    }
};

// DELETE /code-share/:id - 删除代码分享（软删除）
exports.delete = async (req, res) => {
    try {
        await codeShareService.deleteCodeShare(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Code share not found') {
            return res.status(404).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: 'Failed to delete code share.', error: error.message });
    }
};

// DELETE /code-share/images/:imageId - 删除预览图
exports.deleteImage = async (req, res) => {
    try {
        await codeShareService.deletePreviewImage(req.params.imageId);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Preview image not found') {
            return res.status(404).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: 'Failed to delete preview image.', error: error.message });
    }
};

// PUT /code-share/:id/cover/:imageId - 设置封面图
exports.setCover = async (req, res) => {
    try {
        const image = await codeShareService.setCoverImage(
            parseInt(req.params.id), 
            parseInt(req.params.imageId)
        );
        res.status(200).json({ success: true, msg: 'Cover image set successfully!', data: image });
    } catch (error) {
        if (error.message.includes('Invalid image')) {
            return res.status(400).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: 'Failed to set cover image.', error: error.message });
    }
};

// GET /code/:id/download - 下载文件
exports.downloadFile = async (req, res) => {
    try {
        const codeShare = await codeShareService.getCodeShareById(req.params.id);
        if (!codeShare) return res.status(404).json({ success: false, msg: 'Code share not found' });

        // 检查数据库中的 filePath 是否为空
        if (!codeShare.filePath || codeShare.filePath.trim() === '') {
            console.error('FilePath is empty in database for code share ID:', req.params.id);
            return res.status(404).json({ 
                success: false, 
                msg: 'File path is missing in database. The file was not uploaded correctly.'
            });
        }

        // 从URL或路径中提取实际的文件路径
        let filePath;
        if (codeShare.filePath.startsWith('http://') || codeShare.filePath.startsWith('https://')) {
            // 如果是URL，提取文件名并构建到 public/images/Code/ 目录
            const urlPath = new URL(codeShare.filePath).pathname;
            const fileName = path.basename(urlPath);
            
            if (!fileName || fileName === '') {
                console.error('Failed to extract filename from URL:', codeShare.filePath);
                return res.status(404).json({ 
                    success: false, 
                    msg: 'Invalid file path in database.',
                    dbPath: codeShare.filePath
                });
            }
            
            filePath = path.join(__dirname, '../../public/images/Code', fileName);
        } else if (codeShare.filePath.startsWith('/') || codeShare.filePath.match(/^[a-zA-Z]:/)) {
            // 绝对路径
            filePath = codeShare.filePath;
        } else {
            // 相对路径
            filePath = path.join(__dirname, '../../', codeShare.filePath);
        }
        
        console.log('Resolved file path:', filePath);
        
        // 检查文件是否存在且不是目录
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            console.error(`Original filePath from DB: ${codeShare.filePath}`);
            return res.status(404).json({ 
                success: false, 
                msg: 'File not found on server.',
                dbPath: codeShare.filePath,
                resolvedPath: filePath
            });
        }
        
        // 检查是否是目录
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            console.error(`Path is a directory, not a file: ${filePath}`);
            console.error(`Original filePath from DB: ${codeShare.filePath}`);
            return res.status(500).json({ 
                success: false, 
                msg: 'Invalid file path - points to a directory.',
                dbPath: codeShare.filePath,
                resolvedPath: filePath
            });
        }

        // 记录下载
        const userId = req.user?.id || null;
        const userName = req.user?.name || 'Anonymous';
        await codeShareService.recordDownload(req.params.id, userId, userName);
        
        // 设置响应头,触发浏览器下载
        res.download(filePath, codeShare.fileName, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, msg: 'Failed to download file.' });
                }
            }
        });
    } catch (error) {
        console.error('Download controller error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, msg: 'Failed to download file.', error: error.message });
        }
    }
};

// POST /code/:id/download - 记录下载（仅记录，不返回文件）
exports.download = async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const userName = req.user?.name || 'Anonymous';
        
        await codeShareService.recordDownload(req.params.id, userId, userName);
        res.status(200).json({ success: true, msg: 'Download recorded successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to record download.', error: error.message });
    }
};

// GET /code-share/:id/download-logs - 获取下载日志
exports.getDownloadLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        
        const result = await codeShareService.getDownloadLogs(req.params.id, page, pageSize);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve download logs.', error: error.message });
    }
};

// GET /code-share/languages - 获取语言列表
exports.getLanguages = async (req, res) => {
    try {
        const languages = await codeShareService.getLanguages();
        res.status(200).json({ success: true, data: languages });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve languages.', error: error.message });
    }
};

// GET /code-share/omics-types - 获取组学类型列表
exports.getOmicsTypes = async (req, res) => {
    try {
        const omicsTypes = await codeShareService.getOmicsTypes();
        res.status(200).json({ success: true, data: omicsTypes });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve omics types.', error: error.message });
    }
};
