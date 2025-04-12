const {sequelize, Sample, Buyer, Tag} = require('../model/sampleModel')

module.exports = async function updateSampleWithAssociations(data, sampleId) {
    return await sequelize.transaction(async (t) => {
        const sample = await Sample.findByPk(sampleId, {transaction: t})
        // 更新逻辑 先主后从
        if (!sample) {
            throw new Error('No sample was found')
        }
        let buyer;
        if (data.buyer) {
            [buyer] = await Buyer.findOrCreate({
                where: {name: data.buyer.name},
                defaults: data.buyer,
                transaction: t,
            });
            await sample.setBuyer(buyer,{transaction: t});
        }
        if (data.sample){
            await sample.update(data.sample, {transaction: t});
        }
        if (data.tags){
            const findOrCreateResults  = await Promise.all(
                data.tags.map(
                    tag =>
                        Tag.findOrCreate({
                            where: {name: tag.name},
                            defaults: tag,
                            transaction: t
                        })
                )
            );
            const tagInstances = findOrCreateResults.map(([tagInstance]) => tagInstance);

            await sample.setTags(tagInstances, {transaction: t});
        }
        return await Sample.findByPk(sampleId,{
            include:[Buyer,Tag],
            transaction: t
        });
    });
}