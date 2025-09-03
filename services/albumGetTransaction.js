const { sequelize, Album, Image } = require('../model/imageModel');
/**
 * 获取所有相册（分页）
 * @param {number} currentPage 当前页码
 * @param {number} pageSize 每页数量
 * @returns {Promise<{data: Album[], pagination: object}>}
 */
async function getAllAlbums(currentPage = 1, pageSize = 10) {
  const page = Number(currentPage) || 1;
  const size = Number(pageSize) || 10;
  const offset = (page - 1) * size;

  return await sequelize.transaction(async (t) => {
    const { count, rows } = await Album.findAndCountAll({
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Images WHERE Images.AlbumId = Album.id)'), 'imageCount']
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: size,
      offset,
      transaction: t,
      distinct: true, // Important for correct counting with includes
    });

    const totalPages = Math.ceil(count / size) || 1;

    return {
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        pageSize: size,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  });
}

/**
 * 获取单个相册详情
 * @param {string|number} albumId 相册ID
 * @returns {Promise<Album>}
 */
async function getAlbumById(albumId) {
  if (!albumId) {
    throw new Error('Album ID is required.');
  }
  return await sequelize.transaction(async (t) => {
    const album = await Album.findByPk(albumId, {
      include: [{
        model: Image, // Include associated images
        attributes: ['id', 'originalName', 'path', 'createdAt'] // Specify which image fields to return
      }],
      transaction: t
    });

    if (!album) {
      throw new Error('Album not found.');
    }

    // Manually add image count to the top-level object for consistency
    const albumJSON = album.toJSON();
    albumJSON.imageCount = album.Images ? album.Images.length : 0;

    return albumJSON;
  });
}

module.exports = {
  getAllAlbums,
  getAlbumById
};