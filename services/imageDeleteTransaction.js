const {sequelize, Image, Category} = require('../model/imageModel');
/**
 *  删除图片
 * @param imageId - 图片ID
 * @param category - 分类
 * @returns {Promise<Object>} - 删除的图片数量
 */
module.exports = async function imageDeleteTransaction(imageId,category) {
    return sequelize.transaction(async (t) => {
        if (category) {
            await Category.destroy({
                where: { name: category },
                transaction: t
            });
        }

        if (!imageId) {
            throw new Error('No ID obtained!');
        }
        const deletedCount = await Image.destroy({
            where: { id : imageId },
            transaction: t
        });

        if (deletedCount === 0) {
            throw new Error('Image not found!');
        }

        return deletedCount;
    });
}
