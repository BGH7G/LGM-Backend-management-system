const {sequelize, Sample, Buyer, Tag} = require('../model/sampleModel')
/**
 * 上传样品
 * @param {Object} data - 样品信息
 * @returns {Promise<Object>} - 上传结果
 */
module.exports = async function createSampleWithAssociations(data) {
    return await sequelize.transaction(async (t) => {
        const [buyer] = await Buyer.findOrCreate({
            where: {
                name: data.buyer.name
            },
            // 如果where没有找到数据那么将 defaults 里的数据写入
            defaults: data.buyer,
            transaction: t
        });
        const sample = await Sample.create(data.sample, {transaction: t});

        await sample.setBuyer(buyer, {transaction: t});
        if (data.tags && data.tags.length > 0) {
            const tagInstance = await Promise.all(
                data.tags.map(tag =>
                    Tag.findOrCreate({
                        where: {name: tag.name},
                        defaults: tag,
                        transaction: t
                    }).then(([tag]) => tag).catch(error => {
                        console.error(error)
                    })
                )
            );
            await sample.addTags(tagInstance, {transaction: t});
        }
        return sample;
    });
}