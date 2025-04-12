const {User, sequelize} = require('../model/userModel');

module.exports = async function userEditTransaction(req, res) {
    return await sequelize.transaction(async (t) => {
        const userInfo = req.body;
        const userId = req.user.id;
        let avatar;
        if (req.file) {
            const {filename} = req.file;
            avatar = filename
        }
        userInfo.avatar = avatar;
        const user = await User.findByPk(req.user.id, {transaction: t});
        const userData = await user.update(
            userInfo,
            {
                transaction: t
            }
        );
        res.status(201).json({msg: 'The information was updated successfully!', data: userData});
    })
}