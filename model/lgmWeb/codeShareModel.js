const { DataTypes } = require('sequelize');
const sequelize = require('../index');

// 代码分享主表 (code_share)
const CodeShare = sequelize.define('CodeShare', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '文件名'
    },
    authorName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '作者姓名'
    },
    language: {
        type: DataTypes.ENUM('R', 'Python', 'Shell', 'Other'),
        allowNull: false,
        comment: '代码语言'
    },
    omicsType: {
        type: DataTypes.ENUM('转录组', '宏基因组', '代谢组', '16S', '宏转录组', '蛋白组', '其他'),
        allowNull: false,
        comment: '组学类型'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '代码描述'
    },
    filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '文件存储路径'
    },
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: '文件大小（字节）'
    },
    downloadCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '下载次数'
    },
    status: {
        type: DataTypes.ENUM('normal', 'deleted'),
        allowNull: false,
        defaultValue: 'normal',
        comment: '状态标识'
    }
}, {
    indexes: [
        { fields: ['language'] },
        { fields: ['omicsType'] },
        { fields: ['authorName'] },
        { fields: ['createdAt'] },
        { fields: ['downloadCount'] }
    ]
});

// 代码效果图表 (code_preview_image)
const CodePreviewImage = sequelize.define('CodePreviewImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codeShareId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '代码ID（外键）'
    },
    imagePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '图片存储路径'
    },
    imageFileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '图片文件名'
    },
    imageSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
        comment: '图片大小（字节）'
    },
    imageType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '图片类型（jpg/png/gif/svg等）'
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序序号'
    },
    isCover: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否为封面图'
    },
    status: {
        type: DataTypes.ENUM('normal', 'deleted'),
        allowNull: false,
        defaultValue: 'normal',
        comment: '状态标识'
    }
}, {
    indexes: [
        { fields: ['codeShareId'] },
        { fields: ['sortOrder'] },
        { fields: ['isCover'] }
    ]
});

// 代码内容表 (code_content)
const CodeContent = sequelize.define('CodeContent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codeShareId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        comment: '代码ID（外键，一对一关系）'
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        comment: '代码文本内容'
    }
}, {
    indexes: [
        { fields: ['codeShareId'], unique: true }
    ]
});

// 下载日志表 (code_download_log)
const CodeDownloadLog = sequelize.define('CodeDownloadLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codeShareId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '代码ID（外键）'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '用户ID'
    },
    userName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '用户名'
    },
    downloadedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '下载时间'
    }
}, {
    indexes: [
        { fields: ['codeShareId'] },
        { fields: ['userId'] },
        { fields: ['downloadedAt'] }
    ]
});

// 关联关系 (Associations)

// CodeShare 和 CodePreviewImage (一对多)
CodeShare.hasMany(CodePreviewImage, { 
    foreignKey: 'codeShareId', 
    onDelete: 'CASCADE',
    as: 'previewImages'
});
CodePreviewImage.belongsTo(CodeShare, { 
    foreignKey: 'codeShareId' 
});

// CodeShare 和 CodeContent (一对一)
CodeShare.hasOne(CodeContent, { 
    foreignKey: 'codeShareId', 
    onDelete: 'CASCADE',
    as: 'codeContent'
});
CodeContent.belongsTo(CodeShare, { 
    foreignKey: 'codeShareId' 
});

// CodeShare 和 CodeDownloadLog (一对多)
CodeShare.hasMany(CodeDownloadLog, { 
    foreignKey: 'codeShareId', 
    onDelete: 'CASCADE',
    as: 'downloadLogs'
});
CodeDownloadLog.belongsTo(CodeShare, { 
    foreignKey: 'codeShareId' 
});

module.exports = {
    CodeShare,
    CodePreviewImage,
    CodeContent,
    CodeDownloadLog,
    sequelize
};
