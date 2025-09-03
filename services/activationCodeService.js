const crypto = require('crypto');
const sequelize = require('../model/index');
const { ActivationCode } = require('../model/activationCodeModel');
const { Op } = require('sequelize');

function generateRandomCode(prefix = 'ACT', bytes = 8) {
  const code = crypto.randomBytes(bytes).toString('hex').toUpperCase();
  return `${prefix}-${code}`;
}

function getExpiresAt24h() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

async function generateActivationCodes({ count = 1, prefix = 'ACT' } = {}) {
  const expiresAt = getExpiresAt24h();
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push({ code: generateRandomCode(prefix), status: 'enabled', expiresAt });
  }
  const created = await ActivationCode.bulkCreate(rows);
  return created;
}

async function listActivationCodes({ limit = 100, offset = 0 } = {}) {
  return ActivationCode.findAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
}

async function disableActivationCode(id) {
  const row = await ActivationCode.findByPk(id);
  if (!row) throw Object.assign(new Error('Activation code not found'), { statusCode: 404 });
  if (row.status === 'disabled') return row;
  row.status = 'disabled';
  await row.save();
  return row;
}

async function consumeActivationCode(rawCode, userId, t) {
  const code = await ActivationCode.findOne({
    where: {
      code: rawCode,
      status: 'enabled',
      expiresAt: { [Op.gt]: new Date() },
    },
    transaction: t,
    lock: true, // SELECT ... FOR UPDATE
  });
  if (!code) {
    throw Object.assign(new Error('Invalid or expired activation code'), { statusCode: 403, code: 'INVALID_CODE' });
  }
  if (code.usedBy || code.usedAt) {
    throw Object.assign(new Error('Activation code already used'), { statusCode: 403, code: 'CODE_USED' });
  }
  code.usedBy = userId || null; // single-use; record who used
  code.usedAt = new Date();
  code.status = 'disabled';
  await code.save({ transaction: t });
  return code;
}

module.exports = {
  generateActivationCodes,
  listActivationCodes,
  disableActivationCode,
  consumeActivationCode,
};
