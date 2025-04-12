const {sequelize, Image, Category} = require('../model/imageModel');

module.exports = async function imageUpdateTransaction(req, res) {
    return await sequelize.transaction(async (t) => {
        const images = req.files
        const category = req.body;
        // 验证
        if (!category) {
            throw new Error('category not found !');
        }
        if (!images) {
            throw new Error('images not found !');
        }
        // 数据添加

        // 获取分类实例
        const [categoryInstance, created] = await Category.findOrCreate({
            where: {name: category.name},
            defaults: category,
            transaction: t
        })
        // map遍历数组并对每一个对象元素进行数据库添加
        const imagePromises = images.map(async (image) => {
            //提取数据
            const imageDate = {
                filename: image.filename,
                size: image.size,
                path: image.path,
                originalName: image.originalname,
                mimeType: image.mimetype
            }
            // 进行数据添加，并获取返回的Promise
            const results = await Image.create(imageDate, {transaction: t});
            // 添加关联关系
            await categoryInstance.addImages(results,{transaction: t});
            return results;
        });
        // 返回新的数据数组
        return await Promise.all(imagePromises);
    });
}