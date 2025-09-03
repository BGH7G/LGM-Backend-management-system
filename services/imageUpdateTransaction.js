const {sequelize, Image, Category, Album} = require('../model/imageModel');
/**
 * 图片添加
 * @param images - 图片数组
 * @param category - 分类信息
 * @param albumId - 相册ID
 * @returns {Promise<Object>} - 成功存储信息
 */
const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

module.exports = async function imageUpdateTransaction(images, category, albumId) {
    return await sequelize.transaction(async (t) => {
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
        // album check
        let album = null;
        if (albumId) {
            album = await Album.findByPk(albumId, { transaction: t });
            if (!album) throw new Error('Album not found');
        }
        // map遍历数组并对每一个对象元素进行数据库添加
        const imagePromises = images.map(async (image) => {
            let imageInstance = image.filename
            imageInstance = `${BASE_URL}/public/images/${imageInstance}`;
            const imageDate = {
                filename: imageInstance,
                size: image.size,
                path: image.path,
                originalName: image.originalname,
                mimeType: image.mimetype
            }
            // 追加 albumId
            if (album) imageDate.AlbumId = albumId;

            const results = await Image.create(imageDate, {transaction: t});
            await categoryInstance.addImages(results,{transaction: t});
            if (album) await album.addImage(results, { transaction: t });
            return results;
        });
        // 返回新的数据数组
        await Promise.all(imagePromises);
        // 如果相册无封面，设置第一张图为封面
        if (album && !album.cover && images.length > 0) {
            await album.update({ cover: `${BASE_URL}/public/images/${images[0].filename}` }, { transaction: t });
        }
        return await Promise.all(imagePromises);
    });
}