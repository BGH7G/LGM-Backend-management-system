const { sequelize, Claim } = require('../model/claim/claimModel');

/**
 * 更新报账申请（仅 pending 状态）
 * @param {Object} opts
 * @param {string} opts.id           报账单ID
 * @param {string} opts.requesterId  当前请求用户ID
 * @param {boolean} opts.isAdmin     是否管理员
 * @param {Object} opts.data         待更新字段
 */
module.exports = async function claimUpdateTransaction({ id, requesterId, isAdmin, data }) {
  if (!id) throw new Error('ID_REQUIRED');
  return await sequelize.transaction(async (t) => {
    const claim = await Claim.findOne({ where: { id }, transaction: t, lock: t.LOCK.UPDATE });
    if (!claim) throw new Error('NOT_FOUND');

    if (claim.status !== 'pending') throw new Error('CANNOT_UPDATE');

      console.log(id, requesterId, isAdmin)

    if (!isAdmin && claim.userId !== requesterId) throw new Error('FORBIDDEN');

    const allowed = ['amount', 'purchaseDate', 'seller', 'description'];
    for (const key of Object.keys(data)) {
      if (!allowed.includes(key)) delete data[key];
    }
    if ('amount' in data) {
      const num = Number(data.amount);
      if (isNaN(num) || num <= 0) throw new Error('INVALID_AMOUNT');
      data.amount = num;
    }
    if ('purchaseDate' in data && isNaN(Date.parse(data.purchaseDate))) throw new Error('INVALID_DATE');

    Object.assign(claim, data);
    await claim.save({ transaction: t });
    return claim;
  });
};