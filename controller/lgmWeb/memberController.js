const memberService = require('../../services/lgmWeb/memberTransaction');

const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// 创建新成员
exports.create = async (req, res) => {
    try {
        req.body.avatarUrl = `${BASE_URL}/public/images/${req.file ? req.file.filename : undefined}` ;
        console.log(req.body)
        const member = await memberService.createMember(req.body);
        res.status(201).json({ success: true, msg: 'Member created successfully!', data: member });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to create member.', error: error.message });
    }
};

// 获取成员列表（分页）
exports.getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 30;
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = (req.query.sortOrder || 'ASC').toUpperCase();

        if (page < 1 || pageSize < 1 || !['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({ success: false, msg: 'Invalid pagination or sorting parameters.' });
        }

        const result = await memberService.getAllMembers({ page, pageSize, sortBy, sortOrder });
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to retrieve members.', error: error.message });
    }
};

// 更新成员信息
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await memberService.updateMember(id, req.body);
        res.status(200).json({ success: true, msg: `Member ${id} updated successfully!`, data: member });
    } catch (error) {
        if (error.message === 'Member not found') {
            return res.status(404).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: 'Failed to update member.', error: error.message });
    }
};

// 删除成员
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await memberService.deleteMember(id);
        res.status(204).end(); // No content
    } catch (error) {
        if (error.message === 'Member not found') {
            return res.status(404).json({ success: false, msg: error.message });
        }
        res.status(500).json({ success: false, msg: 'Failed to delete member.', error: error.message });
    }
};

// 创建角色
exports.createRole = async (req, res) => {
    try {
        const role = await memberService.createRole(req.body);
        console.log(role)
        res.status(201).json({ success: true, msg: 'Role created successfully!', data: role });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to create role.', error: error.message });
    }
};

// 创建专业领域/技能
exports.createExpertise = async (req, res) => {
    try {
        const expertise = await memberService.createExpertise(req.body);
        res.status(201).json({ success: true, msg: 'Expertise created successfully!', data: expertise });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to create expertise.', error: error.message });
    }
};

// 更新角色
exports.updateRole = async (req, res) => {
    try {
        const role = await memberService.updateRole(req.params.id, req.body);
        res.status(200).json({ success: true, msg: 'Role updated!', data: role });
    } catch (error) {
        if (error.message === 'Role not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to update role.', error: error.message });
    }
};

// 删除角色
exports.deleteRole = async (req, res) => {
    try {
        await memberService.deleteRole(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Role not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to delete role.', error: error.message });
    }
};

// 更新专业领域/技能
exports.updateExpertise = async (req, res) => {
    try {
        const exp = await memberService.updateExpertise(req.params.id, req.body);
        res.status(200).json({ success: true, msg: 'Expertise updated!', data: exp });
    } catch (error) {
        if (error.message === 'Expertise not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to update expertise.', error: error.message });
    }
};

// 删除专业领域/技能
exports.deleteExpertise = async (req, res) => {
    try {
        await memberService.deleteExpertise(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Expertise not found') return res.status(404).json({ success: false, msg: error.message });
        res.status(500).json({ success: false, msg: 'Failed to delete expertise.', error: error.message });
    }
};

// 获取所有角色
exports.getRoles = async (req, res) => {
    try {
        const roles = await memberService.getRoles();
        res.status(200).json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to get roles.', error: error.message });
    }
};

// 获取所有专业领域/技能
exports.getExpertises = async (req, res) => {
    try {
        const exps = await memberService.getExpertises();
        res.status(200).json({ success: true, data: exps });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Failed to get expertises.', error: error.message });
    }
};