const {Member, Role, Expertise, sequelize} = require('../../model/lgmWeb/memberModel');

// 创建成员
const createMember = async (memberData) => {
    const t = await sequelize.transaction();
    try {
        const {roleId, expertiseIds, ...restData} = memberData;
        const member = await Member.create(restData, {transaction: t});

        if (roleId) {
            const role = await Role.findByPk(roleId, {transaction: t});
            if (role) await member.setRole(role, {transaction: t});
        }

        if (expertiseIds && expertiseIds.length > 0) {
            const expertises = await Expertise.findAll({where: {id: expertiseIds}, transaction: t});
            await member.setExpertises(expertises, {transaction: t});
        }

        await t.commit();
        return member;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// 获取所有成员（分页）
const getAllMembers = async ({page, pageSize, sortBy, sortOrder}) => {
    const offset = (page - 1) * pageSize;
    const result = await Member.findAndCountAll({
        limit: pageSize,
        offset: offset,
        order: [[sortBy, sortOrder]],
        include: [
            {model: Role},
            {model: Expertise, through: {attributes: []}} // 不包含中间表信息
        ]
    });
    return {
        totalItems: result.count,
        items: result.rows,
        totalPages: Math.ceil(result.count / pageSize),
        currentPage: page
    };
};

// 更新成员
const updateMember = async (id, memberData) => {
    const t = await sequelize.transaction();
    try {
        const member = await Member.findByPk(id, {transaction: t});
        if (!member) throw new Error('Member not found');

        const {roleId, expertiseIds, ...restData} = memberData;

        await member.update(restData, {transaction: t});

        if (roleId) {
            const role = await Role.findByPk(roleId, {transaction: t});
            if (role) await member.setRole(role, {transaction: t});
        }

        if (expertiseIds) { // 允许传入空数组来清空关联
            const expertises = await Expertise.findAll({where: {id: expertiseIds}, transaction: t});
            await member.setExpertises(expertises, {transaction: t});
        }

        await t.commit();
        return member;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// 删除成员
const deleteMember = async (id) => {
    const member = await Member.findByPk(id);
    if (!member) throw new Error('Member not found');
    return await member.destroy();
};

// 创建角色
const createRole = async (roleData) => {
    return await Role.create(roleData);
};

// 创建专业领域/技能
const createExpertise = async (expertiseData) => {
    return await Expertise.create(expertiseData);
};

// 更新角色
const updateRole = async (id, roleData) => {
    const role = await Role.findByPk(id);
    if (!role) throw new Error('Role not found');
    return await role.update(roleData);
};

// 删除角色
const deleteRole = async (id) => {
    const role = await Role.findByPk(id);
    if (!role) throw new Error('Role not found');
    return await role.destroy();
};

// 更新专业领域/技能
const updateExpertise = async (id, expertiseData) => {
    const expertise = await Expertise.findByPk(id);
    if (!expertise) throw new Error('Expertise not found');
    return await expertise.update(expertiseData);
};

// 删除专业领域/技能
const deleteExpertise = async (id) => {
    const expertise = await Expertise.findByPk(id);
    if (!expertise) throw new Error('Expertise not found');
    return await expertise.destroy();
};

// 获取所有角色
const getRoles = async () => {
    return await Role.findAll({ order: [['displayOrder', 'ASC']] });
};

// 获取所有专业领域/技能
const getExpertises = async () => {
    return await Expertise.findAll({ order: [['name', 'ASC']] });
};

module.exports = {
    createMember,
    getAllMembers,
    updateMember,
    deleteMember,
    createRole,
    createExpertise,
    updateRole,
    deleteRole,
    updateExpertise,
    deleteExpertise,
    getRoles,
    getExpertises
};
