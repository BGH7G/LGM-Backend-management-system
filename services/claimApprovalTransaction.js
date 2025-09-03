const {sequelize, Claim} = require('../model/claim/claimModel');

/**
 * 管理员审批/驳回
 * @param {Object} opts
 * @param {string} opts.id           报账单ID
 * @param {boolean} opts.approve     true=通过, false=驳回
 * @param {string}  [opts.reason]    驳回原因
 * @returns {Promise<Claim>} 更新后的实例
 */
module.exports = async function claimApprovalTransaction({ id, approve, reason = '' }) {
  if (!id) throw new Error('ID_REQUIRED');
  return await sequelize.transaction(async (t) => {
    // 查询并锁定
    const claim = await Claim.findOne({ where: { id }, lock: t.LOCK.UPDATE, transaction: t });
    if (!claim) throw new Error('NOT_FOUND');
    if (claim.status !== 'pending') throw new Error('ALREADY_PROCESSED');

    if (approve) {
      claim.status = 'approved';
      claim.approvedAt = new Date();
    } else {
      if (!reason) throw new Error('REJECT_REASON_REQUIRED');
      claim.status = 'rejected';
      claim.rejectedAt = new Date();
      claim.rejectReason = reason;
    }
    await claim.save({ transaction: t });
    return claim;
  });
};