const {User} = require('../model/userModel');
const {performLoginTransaction} = require('../services/userLoginTransaction');
const userEditTransaction = require('../services/userEditTransaction');
const sequelize = require('../model/index');
const { consumeActivationCode } = require('../services/activationCodeService');

exports.register = async (req, res) => {
    try {
        const { activationCode, ...payload } = req.body || {};
        if (!activationCode) {
            return res.status(400).json({ msg: 'Activation code is required' });
        }

        let userData;
        await sequelize.transaction(async (t) => {
            const userInfo = { ...payload, role: 'user' };
            userData = await User.create(userInfo, { transaction: t });
            await consumeActivationCode(activationCode, userData.id, t);
        });

        const data = userData.toJSON ? userData.toJSON() : userData;
        if (data.password) delete data.password;
        res.status(201).json({msg: 'Registered successfully!', data })
    } catch (err) {
        const status = err.statusCode || 500;
        const errorMsg = err.message || (err.errors && err.errors[0] && err.errors[0].message) || 'Registration failed';
        res.status(status).json({msg: 'Registration failed!', error: errorMsg});
    }
}

exports.login = async (req, res) => {
    try {
        const loginData = req.body;
        const data = await performLoginTransaction(loginData);
        res.status(200).json({msg: 'Login Successful!', data: data});
    } catch (err) {
        console.error("Login Error:", err);
        if (err.statusCode === 401 || err.message.startsWith("Authentication failed")) {
            res.status(401).json({msg: 'Invalid email or password.'});
        } else if (err.name && err.name.includes('Sequelize')) {
            res.status(500).json({msg: 'Database error during login.'});
        } else {
            res.status(500).json({msg: 'An unexpected server error occurred.'});
        }
    }
};

exports.edit = async (req, res) => {
    try {
        const userInfo = req.body;
        const avatarInfo = req.file
        const userId = req.user.id;
        const data = await userEditTransaction(userId, userInfo,avatarInfo)
        res.status(200).json({msg: 'Edited successfully!', data: data});
    } catch (err) {
        res.status(500).json({msg: 'Edit failed!', error: err});
    }
}