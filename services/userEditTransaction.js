const {User, sequelize} = require('../model/userModel');

const BASE_URL = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

module.exports = async function userEditTransaction(userId, userInfo, avatarInfo) {
    let avatar;
    return await sequelize.transaction(async (t) => {
        if (avatarInfo) {
            const filename = avatarInfo.filename;

            // 构建完整的URL路径
            avatar = `${BASE_URL}/public/images/${filename}`;
        }

        userInfo.avatar = avatar;

        const user = await User.findByPk(userId, {transaction: t});
        return await user.update(
            userInfo,
            {
                transaction: t
            }
        );
    });
}