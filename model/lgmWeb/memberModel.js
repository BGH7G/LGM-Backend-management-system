const {DataTypes} = require('sequelize');
const sequelize = require('../index');

// 成员表 (Members)
const Member = sequelize.define('Member', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    // roleId is added by association
    status: {
        type: DataTypes.ENUM('current', 'alumnus'),
        defaultValue: 'current'
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatarUrl: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    enrollmentYear: {
        type: DataTypes.INTEGER
    },
    graduationYear: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    googleScholarId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linkedinUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// 角色表 (Roles)
const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    displayOrder: {
        type: DataTypes.INTEGER
    }
});

// 专业领域/技能表 (Expertise)
const Expertise = sequelize.define('Expertise', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    }
});

// 关联关系 (Associations)

// Member and Role (多对一)
Member.belongsTo(Role);
Role.hasMany(Member);

// Member and Expertise (多对多)
const MemberExpertise = sequelize.define('MemberExpertise', {
});

Member.belongsToMany(Expertise, { through: MemberExpertise });
Expertise.belongsToMany(Member, { through: MemberExpertise });

module.exports = {
    Member,
    Role,
    Expertise,
    MemberExpertise,
    sequelize
};