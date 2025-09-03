const { generateActivationCodes, listActivationCodes, disableActivationCode } = require('../services/activationCodeService');

exports.generate = async (req, res) => {
  try {
    const { count = 1, prefix = 'ACT' } = req.body || {};
    const safeCount = Math.min(Number(count) || 1, 1000);
    const rows = await generateActivationCodes({ count: safeCount, prefix });
    // Return codes in plain text once (since we store plaintext)
    res.status(201).json({ msg: 'Activation codes generated', data: rows });
  } catch (err) {
    res.status(err.statusCode || 500).json({ msg: 'Generate activation codes failed', error: err.message || err });
  }
};

exports.list = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Number(req.query.offset) || 0;
    const rows = await listActivationCodes({ limit, offset });
    res.status(200).json({ msg: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ msg: 'List activation codes failed', error: err.message || err });
  }
};

exports.disable = async (req, res) => {
  try {
    const id = req.params.id;
    const row = await disableActivationCode(id);
    res.status(200).json({ msg: 'Activation code disabled', data: row });
  } catch (err) {
    res.status(err.statusCode || 500).json({ msg: 'Disable activation code failed', error: err.message || err });
  }
};
