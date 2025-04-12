const imageUpdateTransaction = require('../services/imageUpdateTransaction');
const imageDeleteTransaction = require('../services/imageDeleteTransaction');
const imageGetTransaction = require('../services/imageGetTransaction');

exports.get = async function (req, res) {
    try{
        await imageGetTransaction(req, res);
    }catch(err){
        res.status(500).json({msg: 'Server error!',err: err});
    }
}

exports.post = async function (req, res) {
    try{
        await imageUpdateTransaction(req, res).catch((err) => {res.status(401).json({err: err});});
        res.status(201).json({msg: 'Image update successfully!'});
    }catch(err){
        res.status(500).json({msg: 'Server error!',err: err});
    }
}

exports.delete = async function (req, res) {
    try {
        const data = await imageDeleteTransaction(req);
        res.status(204).json({
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
