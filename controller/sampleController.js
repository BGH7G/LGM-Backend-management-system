const createSampleWithAssociations = require('../services/sampleTransaction')
const updateSampleWithAssociations = require('../services/sampleUpdateTransaction')
const deleteSampleWithAssociations = require('../services/sampleDeleteTransaction')
const {sequelize, Sample, Buyer, Tag} = require("../model/sampleModel");

exports.get = async (req, res) => {
    const pageNumber = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const offsets = (pageNumber - 1) * pageSize
    try {
        const {count, rows} = await Sample.findAndCountAll({
            limit: pageSize,
            offset: offsets,
            include: [
                {
                    model: Tag,
                    attributes: ['id', 'name']
                },
                Buyer
            ],
            order: [['createdAt', 'DESC']]
        })
        const totalPages = Math.ceil(count / pageSize);
        res.status(200).json({
            data: rows,
            total: count,
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalPages: totalPages
        })
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
        console.log(dataValues)
        res.status(200).json({
            msg: "Sample updated!",
            dataValues: dataValues,
            previousDataValues: _previousDataValues
        })
    } catch (e) {
        res.status(500).json({msg: 'Sample update failed!', errors: e});
    }
}


