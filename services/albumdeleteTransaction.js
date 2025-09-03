const { sequelize, Album, Image } = require('../model/imageModel');

/**
 * 删除相册业务：
 * 1. 将该相册下所有图片的 AlbumId 置为 NULL（保留图片）。
 * 2. 删除相册记录。
 * @param {number|string} albumId
 */
module.exports = async function albumDeleteTransaction(albumId) {
  if (!albumId) {
    throw new Error('albumId is required');
  }

  return await sequelize.transaction(async (t) => {
    const album = await Album.findByPk(albumId, { transaction: t });
    if (!album) {
      throw new Error('Album not found');
    }

    // 1. 解除图片关联
    await Image.update(
      { AlbumId: null },
      { where: { AlbumId: albumId }, transaction: t }
    );

    // 2. 删除相册
    await album.destroy({ transaction: t });

    return { deleted: true };
  });
};