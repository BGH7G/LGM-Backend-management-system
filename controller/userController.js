const {User} = require('../model/userModel');
const loginUserTransaction = require('../services/userLoginTransaction');
const userEditTransaction = require('../services/userEditTransaction');

exports.register = async (req, res) => {
    try {
        const userInfo = req.body
        const userData = await User.create(userInfo)
        res.status(201).json({msg: 'Registered successfully!', data: userData})
    } catch (err) {
        res.status(500).json({msg: 'Registration failed!', error: err.errors[0].message});
    }
}

exports.login = async (req, res) => {
    try {
        await loginUserTransaction(req, res).catch((err) => {
            res.status(401).json({msg: err.toString()});
        })
    } catch (err) {
        res.status(500).json({msg: 'Server error!!', error: err});
    }
}

exports.edit = async (req, res) => {
    try {
        await userEditTransaction(req,res).catch((err) => {res.status(401).json({msg: err.toString()});});
    } catch (err) {
        res.status(500).json({msg: 'Edit failed!', error: err});
    }
}