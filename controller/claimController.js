const claimAddTransaction = require('../services/claimAddTransaction');
const claimDeleteTransaction = require('../services/claimDeleteTransaction');
const claimApprovalTransaction = require('../services/claimApprovalTransaction');
const claimUpdateTransaction = require('../services/claimUpdateTransaction');
const {getClaim} = require('../services/claimGetTransaction');

exports.list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const { sortBy = 'updatedAt', sortOrder = 'DESC', status } = req.query;

    try {
        const result = await getClaim({
            userId: req.user.id,
            isAdmin: req.user.role === 'admin',
            page,
            pageSize,
            sortBy,
            sortOrder,
            status,
        });
        res.status(200).json({success: true, ...result});
    } catch (err) {
        res.status(500).json({success: false, msg: err.message});
    }
};

exports.detail = async (req, res) => {
    try {
        const {claim} = await getClaim({
            id: req.params.id,
            userId: req.user.id,
            isAdmin: req.user.role === 'admin',
        });
        res.status(200).json({success: true, data: claim});
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({msg: 'Not found'});
        res.status(500).json({success: false, msg: err.message});
    }
};

exports.create = async (req, res) => {
    try {
        const {amount, purchaseDate, seller, description} = req.body;
        const claim = await claimAddTransaction({
            userId: req.user.id,
            amount,
            purchaseDate,
            seller,
            description,
        });
        res.status(201).json({success: true, data: claim});
    } catch (err) {
        if (['MISSING_REQUIRED_FIELD', 'INVALID_AMOUNT', 'INVALID_DATE'].includes(err.message)) {
            return res.status(400).json({msg: err.message});
        }
        res.status(500).json({msg: err.message});
    }
}

exports.update = async (req, res) => {
    try {
        const claim = await claimUpdateTransaction({
            id: req.params.id,
            requesterId: req.user.id,
            isAdmin: req.user.role === 'admin',
            data: req.body,
        });
        res.status(200).json({ success: true, data: claim });
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Not found' });
        if (['FORBIDDEN', 'CANNOT_UPDATE', 'INVALID_AMOUNT', 'INVALID_DATE'].includes(err.message)) return res.status(400).json({ msg: err.message });
        res.status(500).json({ msg: err.message });
    }
}

exports.remove = async (req, res) => {
    try {
        await claimDeleteTransaction({
            id: req.params.id,
            requesterId: req.user.id,
            isAdmin: req.user.role === 'admin',
        });
        res.status(200).json({ success: true });
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Not found' });
        if (['FORBIDDEN', 'CANNOT_DELETE'].includes(err.message)) return res.status(400).json({ msg: err.message });
        res.status(500).json({ msg: err.message });
    }
}

exports.approve = async (req, res) => {
    try {
        const claim = await claimApprovalTransaction({ id: req.params.id, approve: true });
        res.status(200).json({ success: true, data: claim });
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Not found' });
        if (err.message === 'ALREADY_PROCESSED') return res.status(400).json({ msg: 'already processed' });
        res.status(500).json({ msg: err.message });
    }
}

exports.reject = async (req, res) => {
    try {
        const reason = req.body.reason || '';
        const claim = await claimApprovalTransaction({ id: req.params.id, approve: false, reason });
        res.status(200).json({ success: true, data: claim });
    } catch (err) {
        if (err.message === 'NOT_FOUND') return res.status(404).json({ msg: 'Not found' });
        if (['ALREADY_PROCESSED', 'REJECT_REASON_REQUIRED'].includes(err.message)) return res.status(400).json({ msg: err.message });
        res.status(500).json({ msg: err.message });
    }
}