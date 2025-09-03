const imageUpdateTransaction = require('../services/imageUpdateTransaction');
const imageDeleteTransaction = require('../services/imageDeleteTransaction');
const {imageGetAllTransaction} = require('../services/imageGetTransaction');

exports.get = async function (req, res) {
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 20;
    let sortBy = req.query.sortBy || 'id';
    let sortOrder = (req.query.sortOrder || 'ASC').toUpperCase();
    let albumId = req.params.id ? parseInt(req.params.id) : (req.query.id ? parseInt(req.query.id) : null);
    try{
        if (page < 1 || pageSize < 1) {
            return res.status(400).json({
                success: false,
                msg: '无效的分页参数'
            });
        }

        if (!['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({
                success: false,
                msg: '排序方式必须是ASC或DESC'
            });
        }

        const result = await imageGetAllTransaction({
            page,
            pageSize,
            sortBy,
            sortOrder,
            albumId
        });
        res.status(200).json({
            success: true,
            msg: 'successfully!',
            ...result
        });
    }catch(err){
        res.status(500).json({msg: 'Server error!',err: err});
    }
}

exports.post = async function (req, res) {
    let images = req.files
    let category = { name: req.body.name, description: req.body.description }
    const albumId = req.body.albumId ? parseInt(req.body.albumId) : null;
    try{
        const data = await imageUpdateTransaction(images, category, albumId)
        res.status(201).json({msg: 'Image update successfully!',data: data});
    }catch(err){
        res.status(500).json({msg: 'Server error!',err: err});
    }
}

exports.delete = async function (req, res) {
    let imageId = req.params.id;
    let category = req.body.name;
    try {
        const data = await imageDeleteTransaction(imageId,category);
        res.status(201).json({
            msg: 'Image deleted successfully!',
            removeImageNumber: data
        });
    } catch (err) {
        // 根据错误类型返回不同的状态码
        if (err.message === 'No ID obtained!' || err.message === 'Image not found!') {
            res.status(404).json({
                error: err.message
            });
        } else {
            // 其他错误视为服务器错误
            console.error('Delete error:', err); // 记录完整错误到日志
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
}
