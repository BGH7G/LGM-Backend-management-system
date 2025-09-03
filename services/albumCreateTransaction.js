const { sequelize, Album } = require('../model/imageModel');

/**
 * 创建相册事务
 * @param {Object} albumData { name, description, cover }
 * @returns {Promise<Album>} 新建的相册实例
 */
const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

module.exports = async function createAlbumTransaction(albumData) {
  if (!albumData || typeof albumData !== 'object') {
    throw new Error('albumData is required');
  }

  const { name, description, cover = '' } = albumData;

  if (!name || !name.trim()) {
    throw new Error('Album name is required');
  }

  // 事务包裹创建，避免并发下重复名称
  return await sequelize.transaction(async (t) => {
    // 检查重名
    const exists = await Album.findOne({ where: { name }, transaction: t });
    if (exists) {
      throw new Error('Album name already exists');
    }

    return await Album.create(
      {
        name: name.trim(),
        description: description || '',
        cover: `${BASE_URL}/public/images/${cover}`,
      },
      { transaction: t }
    );
  });
};