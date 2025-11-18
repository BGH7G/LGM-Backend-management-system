const { CodeShare, CodePreviewImage, CodeContent, CodeDownloadLog, sequelize } = require('../../model/lgmWeb/codeShareModel');
const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// 获取所有代码分享（支持分页、排序、筛选）
const getAllCodeShares = async ({ page, pageSize, sortBy, sortOrder, language, omicsType, authorName, status }) => {
    const t = await sequelize.transaction();
    try {
        const offset = (page - 1) * pageSize;

        // 基础查询条件
        const where = {};
        if (status) where.status = status;
        if (language) where.language = language;
        if (omicsType) where.omicsType = omicsType;
        if (authorName) where.authorName = { [sequelize.Sequelize.Op.like]: `%${authorName}%` };

        const result = await CodeShare.findAndCountAll({
            where,
            limit: pageSize,
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: CodePreviewImage,
                    as: 'previewImages',
                    where: { status: 'normal' },
                    required: false,
                    order: [['sortOrder', 'ASC']]
                }
            ],
            transaction: t
        });

        await t.commit();
        return {
            totalItems: result.count,
            items: result.rows,
            totalPages: Math.ceil(result.count / pageSize),
            currentPage: page
        };
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

// 获取单个代码分享详情（含代码内容和预览图）
const getCodeShareById = async (id) => {
    return await CodeShare.findByPk(id, {
        include: [
            {
                model: CodePreviewImage,
                as: 'previewImages',
                where: { status: 'normal' },
                required: false,
                order: [['sortOrder', 'ASC']]
            },
            {
                model: CodeContent,
                as: 'codeContent'
            }
        ]
    });
};

// 创建代码分享
const createCodeShare = async (data, codeFile, imageFiles) => {
    const t = await sequelize.transaction();
    try {
        const { fileName, authorName, language, omicsType, description, content } = data;

        console.log('=== createCodeShare Service Debug ===');
        console.log('codeFile received:', codeFile);
        console.log('imageFiles count:', imageFiles?.length || 0);

        // 创建主记录
        const payload = {
            fileName,
            authorName,
            language,
            omicsType,
            description,
            filePath: codeFile ? `${BASE_URL}/public/images/Code/${codeFile.filename}` : '',
            fileSize: codeFile ? codeFile.size : 0,
            status: 'normal'
        };

        console.log('Payload to save:', payload);

        const codeShare = await CodeShare.create(payload, { transaction: t });

        // 创建代码内容记录
        if (content) {
            await CodeContent.create({
                codeShareId: codeShare.id,
                content
            }, { transaction: t });
        }

        // 创建预览图记录
        if (imageFiles && imageFiles.length > 0) {
            const imageRecords = imageFiles.map((file, index) => ({
                codeShareId: codeShare.id,
                imagePath: `${BASE_URL}/public/images/Code/${file.filename}`,
                imageFileName: file.originalname,
                imageSize: file.size,
                imageType: file.mimetype.split('/')[1],
                sortOrder: index + 1,
                isCover: index === 0, // 第一张图为封面
                status: 'normal'
            }));
            await CodePreviewImage.bulkCreate(imageRecords, { transaction: t });
        }

        await t.commit();
        return codeShare;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// 更新代码分享
const updateCodeShare = async (id, data, newCodeFile, newImageFiles) => {
    const t = await sequelize.transaction();
    try {
        const codeShare = await CodeShare.findByPk(id, { transaction: t });
        if (!codeShare) throw new Error('Code share not found');

        const { fileName, authorName, language, omicsType, description, content } = data;

        // 更新主记录
        const updatePayload = { fileName, authorName, language, omicsType, description };
        if (newCodeFile) {
            updatePayload.filePath = `${BASE_URL}/public/images/Code/${newCodeFile.filename}`;
            updatePayload.fileSize = newCodeFile.size;
        }

        await codeShare.update(updatePayload, { transaction: t });

        // 更新代码内容
        if (content !== undefined) {
            const existingContent = await CodeContent.findOne({
                where: { codeShareId: id },
                transaction: t
            });
            if (existingContent) {
                await existingContent.update({ content }, { transaction: t });
            } else {
                await CodeContent.create({ codeShareId: id, content }, { transaction: t });
            }
        }

        // 添加新预览图
        if (newImageFiles && newImageFiles.length > 0) {
            const existingImages = await CodePreviewImage.findAll({
                where: { codeShareId: id, status: 'normal' },
                transaction: t
            });
            const maxOrder = existingImages.length > 0 
                ? Math.max(...existingImages.map(img => img.sortOrder)) 
                : 0;

            const imageRecords = newImageFiles.map((file, index) => ({
                codeShareId: id,
                imagePath: `${BASE_URL}/public/images/Code/${file.filename}`,
                imageFileName: file.originalname,
                imageSize: file.size,
                imageType: file.mimetype.split('/')[1],
                sortOrder: maxOrder + index + 1,
                isCover: existingImages.length === 0 && index === 0,
                status: 'normal'
            }));
            await CodePreviewImage.bulkCreate(imageRecords, { transaction: t });
        }

        await t.commit();
        return codeShare;
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

// 删除代码分享（软删除）
const deleteCodeShare = async (id) => {
    const codeShare = await CodeShare.findByPk(id);
    if (!codeShare) throw new Error('Code share not found');
    return await codeShare.update({ status: 'deleted' });
};

// 删除预览图
const deletePreviewImage = async (imageId) => {
    const image = await CodePreviewImage.findByPk(imageId);
    if (!image) throw new Error('Preview image not found');
    return await image.update({ status: 'deleted' });
};

// 设置封面图
const setCoverImage = async (codeShareId, imageId) => {
    const t = await sequelize.transaction();
    try {
        // 取消当前封面
        await CodePreviewImage.update(
            { isCover: false },
            { where: { codeShareId, status: 'normal' }, transaction: t }
        );

        // 设置新封面
        const image = await CodePreviewImage.findByPk(imageId, { transaction: t });
        if (!image || image.codeShareId !== codeShareId) {
            throw new Error('Invalid image for this code share');
        }
        await image.update({ isCover: true }, { transaction: t });

        await t.commit();
        return image;
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

// 记录下载并增加下载次数
const recordDownload = async (codeShareId, userId, userName) => {
    const t = await sequelize.transaction();
    try {
        // 记录下载日志
        await CodeDownloadLog.create({
            codeShareId,
            userId,
            userName,
            downloadedAt: new Date()
        }, { transaction: t });

        // 增加下载次数
        await CodeShare.increment(
            { downloadCount: 1 },
            { where: { id: codeShareId }, transaction: t }
        );

        await t.commit();
    } catch (e) {
        await t.rollback();
        throw e;
    }
};

// 获取下载日志
const getDownloadLogs = async (codeShareId, page, pageSize) => {
    const offset = (page - 1) * pageSize;
    const result = await CodeDownloadLog.findAndCountAll({
        where: { codeShareId },
        limit: pageSize,
        offset,
        order: [['downloadedAt', 'DESC']]
    });

    return {
        totalItems: result.count,
        items: result.rows,
        totalPages: Math.ceil(result.count / pageSize),
        currentPage: page
    };
};

// 获取语言列表（用于筛选）
const getLanguages = async () => {
    return ['R', 'Python', 'Shell', 'Other'];
};

// 获取组学类型列表（用于筛选）
const getOmicsTypes = async () => {
    return ['转录组', '宏基因组', '代谢组', '16S', '宏转录组', '蛋白组', '其他'];
};

module.exports = {
    getAllCodeShares,
    getCodeShareById,
    createCodeShare,
    updateCodeShare,
    deleteCodeShare,
    deletePreviewImage,
    setCoverImage,
    recordDownload,
    getDownloadLogs,
    getLanguages,
    getOmicsTypes
};
