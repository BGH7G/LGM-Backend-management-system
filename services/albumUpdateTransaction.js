const { sequelize, Album, Image } = require('../model/imageModel');
const fs = require('fs').promises;
const path = require('path');

/**
 * 更新相册信息事务
 * @param {number|string} albumId 相册ID
 * @param {Object} albumData 需要更新的字段，如 { name, description, cover }
 * @returns {Promise<Album>} 更新后的相册实例
 */
module.exports = async function albumUpdateTransaction(albumId, albumData = {}) {
  if (!albumId) throw new Error('albumId is required');
  if (!albumData || typeof albumData !== 'object') throw new Error('albumData is required');

  const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

  return await sequelize.transaction(async (t) => {
    const album = await Album.findByPk(albumId, { transaction: t });
    if (!album) throw new Error('Album not found');

    if (albumData.name && albumData.name !== album.name) {
      const duplicate = await Album.findOne({ where: { name: albumData.name }, transaction: t });
      if (duplicate) throw new Error('Album name already exists');
    }

    // 保存旧封面路径，便于更新后删除
    const oldCover = album.cover;

    // 如果上传了新封面，将其转换为完整 URL，并覆盖 albumData.cover
    if (albumData.cover) {
      const filename = path.basename(albumData.cover).replace(/\\/g, '/');
      albumData.cover = `${BASE_URL}/public/images/${filename}`;
    }

    const result = await album.update(albumData, { transaction: t });

    // 如果有新的封面且与旧封面不同，则删除旧封面文件
    if (albumData.cover && oldCover && albumData.cover !== oldCover) {
      try {
        // 去掉可能的域名前缀，转换为实际文件系统路径
        const relativePath = oldCover.replace(/^https?:\/\/[^/]+\//, '');
        const filePath = path.join(__dirname, '..', relativePath);
        await fs.unlink(filePath);
      } catch (err) {
        // 仅记录错误，不影响主事务
        console.error('Failed to delete old cover image:', err);
      }
    }

    // 统计该相册包含的图片数量
    const totalItems = await Image.count({
      where: { AlbumId: albumId },
      transaction: t,
    });

    return {
      data: result.dataValues,
      totalItems,
    }
  });
};