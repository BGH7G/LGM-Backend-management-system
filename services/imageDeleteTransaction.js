const {sequelize, Image, Category} = require('../model/imageModel');

module.exports = async function imageDeleteTransaction(req) {
    return sequelize.transaction(async (t) => {
        const id = req.params.id;
        const category = req.body.name;

        if (category) {
            await Category.destroy({
                where: { name: category },
                transaction: t
            });
        }

        if (!id) {
            throw new Error('No ID obtained!');
        }

        const deletedCount = await Image.destroy({
            where: { id },
            transaction: t
        });

        if (deletedCount === 0) {
            throw new Error('Image not found!');
        }

        return deletedCount;
    });
}
