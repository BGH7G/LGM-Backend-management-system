const { User, sequelize } = require('../model/userModel');
const { createToken } = require("../util/JWT");

/**
 * 用户登录
 * @param loginData - 用户登录数据
 * @returns {Promise<Object>} - Tokens 等数据
 */
async function performLoginTransaction(loginData) {
    return await sequelize.transaction(async (t) => {
        const { email, password } = loginData;

        const user = await User.findOne({
            where: { email: email },
            transaction: t,
        });

        if (!user) {
            const error = new Error("Authentication failed: User not found");
            error.statusCode = 401;
            throw error;
        }

        const isPasswordValid = await user.verifyPassword(password);
        if (!isPasswordValid) {
            const error = new Error("Authentication failed: Incorrect password");
            error.statusCode = 401;
            throw error;
        }

        const results = await user.update({
            lastLogin: new Date()
        }, { transaction: t });

        const { id, name, role } = user.dataValues;
        const userInfo = { id, name, role };

        const tokens = await createToken(userInfo);

        return {
            tokens,
            userInfo : results.toJSON()
        }
    });
}

module.exports = { performLoginTransaction };
