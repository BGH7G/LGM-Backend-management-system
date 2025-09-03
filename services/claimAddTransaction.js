const { sequelize, Claim } = require('../model/claim/claimModel');

/**
 * 创建报账申请
 * @param {Object} payload
 * @param {string} payload.userId 申请人ID
 * @param {string|number} payload.amount 金额
 * @param {string} payload.purchaseDate 购买日期 YYYY-MM-DD
 * @param {string} payload.seller 卖家
 * @param {string} [payload.description] 描述
 * @returns {Promise<Claim>} 新建 Claim 实例
 */
module.exports = async function claimAddTransaction(payload) {
  const { userId, amount, purchaseDate, seller, description } = payload;
  if (!userId || !amount || !purchaseDate || !seller) {
    throw new Error('MISSING_REQUIRED_FIELD');
  }

  // 基础校验
  const num = Number(amount);
  if (isNaN(num) || num <= 0) throw new Error('INVALID_AMOUNT');
  if (isNaN(Date.parse(purchaseDate))) throw new Error('INVALID_DATE');

  return await sequelize.transaction(async (t) => {
    const claim = await Claim.create(
      {
        userId,
        amount: num,
        purchaseDate,
        seller,
        description,
        status: 'pending',
      },
      { transaction: t }
    );
    return claim;
  });
};