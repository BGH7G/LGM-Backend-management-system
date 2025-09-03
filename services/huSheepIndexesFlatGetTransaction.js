const { sequelize, HuSheep, HuSheepIndex, AgeMilestone } = require('../model/experimentalData/huSheepModel');
const { Op } = require('sequelize');

/**
 * 按“羊”分页，返回扁平化的 HuSheepIndex 列表
 * - 仅包含有指标的羊（required: true）
 * - 每条记录是一条 HuSheepIndex，顶层附带 sheep_id 与 sheep_number
 * - 展开 AgeMilestone 基本字段
 * - 结果按 HuSheepIndex.createdAt DESC 排序
 *
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.pageSize
 */
async function huSheepIndexesFlatGetTransaction({ page = 1, pageSize = 10 } = {}) {
  const offset = (page - 1) * pageSize;
  return await sequelize.transaction(async (t) => {
    // 1) 找到当前页的“羊”（仅包含有指标的），用于按羊分页
    const sheepPage = await HuSheep.findAndCountAll({
      attributes: ['id', 'sheep_number'],
      include: [
        {
          model: HuSheepIndex,
          attributes: [],
          required: true, // 仅包含有指标的羊
        },
      ],
      distinct: true,
      limit: pageSize,
      offset,
      transaction: t,
    });

    const totalSheep = typeof sheepPage.count === 'number' ? sheepPage.count : sheepPage.count.length;
    const totalPages = Math.ceil(totalSheep / pageSize) || 1;

    const sheepIds = sheepPage.rows.map((s) => s.id);
    if (sheepIds.length === 0) {
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          pageSize,
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      };
    }

    // 2) 拉取这些羊对应的所有 HuSheepIndex 行，并扁平化输出
    const indexes = await HuSheepIndex.findAll({
      where: { HuSheepId: { [Op.in]: sheepIds } },
      include: [
        { model: HuSheep, attributes: ['id', 'sheep_number'], required: true },
        {
          model: AgeMilestone,
          attributes: ['id', 'age_days', 'milestone_name', 'description'],
          required: false,
        },
      ],
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order: [['createdAt', 'DESC']],
      transaction: t,
    });

    const data = indexes.map((idx) => {
      const j = idx.toJSON();
      const sheep = j.HuSheep || {};
      delete j.HuSheep; // 去掉嵌套，转为顶层字段
      return {
        ...j,
        sheep_id: sheep.id,
        sheep_number: sheep.sheep_number,
      };
    });

    return {
      data,
      pagination: {
        totalItems: totalSheep, // 这里的 totalItems 指“羊”的数量
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  });
}

module.exports = {
  huSheepIndexesFlatGetTransaction,
};
