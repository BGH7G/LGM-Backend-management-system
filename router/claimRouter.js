const express = require("express");
const router = express.Router();
const {verifyToken} = require('../util/JWT');
const authorize = require('../util/authorize');
const claimController = require('../controller/claimController');

// 普通用户：创建、查看自己的报账单
// 管理员：查看全部、审批（通过/驳回）、删除
router
    // 列表：用户看到自己的，管理员看到全部
    .get('/', verifyToken(true), claimController.list)
    // 详情：用户只能看自己的
    .get('/:id', verifyToken(true), claimController.detail)
    // 创建：普通 user 提交报账申请，status 默认为 pending
    .post('/', verifyToken(true), authorize('user','admin'), claimController.create)
    // 更新：仅申请人在 pending 状态下可修改
    .put('/:id', verifyToken(true), authorize('user', 'admin'), claimController.update)
    // 删除：仅管理员可删 pending 状态下user可以删除自己的账单
    .delete('/:id', verifyToken(true), authorize('user','admin'), claimController.remove)
    // 审批：管理员通过 / 驳回
    .post('/:id/approve', verifyToken(true), authorize('admin'), claimController.approve)
    .post('/:id/reject', verifyToken(true), authorize('admin'), claimController.reject);

module.exports = router;