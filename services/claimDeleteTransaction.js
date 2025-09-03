const { sequelize, Claim } = require('../model/claim/claimModel');

/**
 * 删除报账单
 * @param {Object} opts
 * @param {string} opts.id          报账单ID
 * @param {string} opts.requesterId 请求者用户ID
 * @param {boolean} opts.isAdmin    是否管理员
 * @returns {Promise<void>}
 */
module.exports = async function claimDeleteTransaction({ id, requesterId, isAdmin }) {
    console.log(id, requesterId, isAdmin)
  if (!id) throw new Error('ID_REQUIRED');
  return await sequelize.transaction(async (t) => {
    const claim = await Claim.findOne({ where: { id }, transaction: t });
    if (!claim) throw new Error('NOT_FOUND');

    // 非管理员只能删自己的且必须 pending
    if (!isAdmin) {
      if (claim.userId !== requesterId) throw new Error('FORBIDDEN');
      if (claim.status !== 'pending') throw new Error('CANNOT_DELETE');
    }

    await claim.destroy({ transaction: t }); // paranoid true  软删
  });
};