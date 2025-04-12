const {sequelize, Image, Category} = require('../model/imageModel');

module.exports = async function imageGetTransaction(req, res) {
    return await sequelize.transaction(async (t) => {
        const pageNumber = parseInt(req.query.page) || 1
        const pageSize = parseInt(req.query.pageSize) || 10
        const offsets = (pageNumber - 1) * pageSize
        try {
            const {count, rows} = await Image.findAndCountAll({
                limit: pageSize,
                offset: offsets,
                include: [
                    {
                        model: Category,
                        attributes: ['id', 'name']
                    }
                ],
                order: [['createdAt', 'DESC']],
                transaction:t
            })
            const totalPages = Math.ceil(count / pageSize);
            res.status(200).json({
                msg:'The images query was successful!',
                data: rows,
                total : count,
                pageNumber : pageNumber,
                pageSize : pageSize,
                totalPages : totalPages
            })
        } catch (error) {
            res.status(400).json({msg:'The images query was failed!',error: error});
        }
    })
}