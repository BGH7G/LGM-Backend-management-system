const {sequelize, Claim} = require('../model/claim/claimModel')
const { Op } = require('sequelize');

/**
 * 在可复用的事务辅助函数中，获取声明列表或单个声明
 * @param {Object} opts
 * @param {string} opts.id       可选的报账ID，用于获取单个报账的详细信息
 * @param {string} opts.userId   当前请求的用户 ID - 用于过滤非管理员查询
 * @param {boolean} opts.isAdmin 当前申请者是否为管理员
 * @param {number} opts.page     Pagination page (default 1)
 * @param {number} opts.pageSize Page size (default 10)
 * @param {string} opts.sortBy   Sort by field (default 'updatedAt')
 * @param {string} opts.sortOrder Sort order (default 'DESC')
 * @param {string} opts.status   Status filter
 * @returns {Promise<object>} result
 */
module.exports.getClaim = async function ({ id, userId, isAdmin, page = 1, pageSize = 10, sortBy = 'updatedAt', sortOrder = 'DESC', status }) {
  return await sequelize.transaction(async (t) => {
    // 若带 id 则查详情
    if (id) {
      const where = { id };
      if (!isAdmin) where.userId = userId; // 普通用户只能看自己的
      const claim = await Claim.findOne({ where, transaction: t });
      if (!claim) throw new Error('NOT_FOUND');
      return { claim };
    }
    // 列表
    const where = {};
    if (!isAdmin) where.userId = userId;
    if (status) where.status = status;
    const order = [[sortBy, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];
    const total = await Claim.count({ where, transaction: t });
    const rows = await Claim.findAll({
      where,
      order,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      transaction: t,
    });
    return { total, list: rows };
  });
}