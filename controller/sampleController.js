const createSampleWithAssociations = require('../services/sampleTransaction')
const updateSampleWithAssociations = require('../services/sampleUpdateTransaction')
const deleteSampleWithAssociations = require('../services/sampleDeleteTransaction')
const {sampleGetAllTransaction} = require('../services/sampleGetAllTransaction')

exports.get = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 50;
    let sortBy = req.query.sortBy || 'id';
    let sortOrder = (req.query.sortOrder || 'ASC').toUpperCase();
    try {
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

        const result = await sampleGetAllTransaction({
            page,
            pageSize,
            sortBy,
            sortOrder
        });
        res.status(200).json({
            success: true,
            msg: 'successfully!',
            ...result
        });
    } catch (error) {
        res.status(400).json({error: error});
    }
}

exports.add = async (req, res) => {
    try {
        const {dataValues, _previousDataValues} = await createSampleWithAssociations(req.body)
        res.status(201).json({
            msg: 'Sample added successfully!',
            dataValues: dataValues,
            previousDataValues: _previousDataValues
        })
    } catch (e) {
        res.status(500).json({msg: 'Sample addition failed!', errors: e});
    }
}

exports.delete = async (req, res) => {
    try {
        await deleteSampleWithAssociations(req);
        return res.status(204).end();
    } catch (err) {
        console.error('Error deleting sample:', err);
        // 根据错误信息判断响应状态码，比如未找到样品返回404
        if (err.message === 'No sample was found') {
            return res.status(404).json({ msg: err.message });
        }
        return res.status(500).json({ msg: 'Server error!', error: err.toString() });
    }
};

exports.edit = async (req, res) => {
    try {
        const {dataValues, _previousDataValues} = await updateSampleWithAssociations(req.body, req.params.id)
        res.status(200).json({
            msg: "Sample updated!",
            dataValues: dataValues,
            previousDataValues: _previousDataValues
        })
    } catch (e) {
        res.status(500).json({msg: 'Sample update failed!', errors: e});
    }
}


