const {User, sequelize} = require('../model/userModel');
const {createToken} = require("../util/JWT");

module.exports = async function loginUserTransaction(req,res) {
    return await sequelize.transaction(async (t) => {
        const {email, password} = req.body;
        const user = await User.findOne({
            where: {
                email: email
            },
            transaction: t
        })
        if(!user){
            throw new Error("User does not exist")
        }
        const {dataValues} = user
        const {id, name} = dataValues
        const userInfo = {id,name}
        if (await user.verifyPassword(password)) {
            const loginAt = await user.update({
                lastLogin:new Date()
            })
            const tokens = await createToken(userInfo)
            res.status(200).json({msg: 'Login Successful!', token: tokens});
        } else {
            throw new Error("Password error!")
        }
    })
}