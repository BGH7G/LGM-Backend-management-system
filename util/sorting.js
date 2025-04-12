const sampleCtl = require('../model/sampleModel')
const {Buyer} = require("../model/sampleModel");

async function f(r, res) {
    const pageNumber = parseInt(r.query.page) || 1
    const pageSize = parseInt(r.query.pageSize) || 10
    const offsets = (pageNumber - 1) * pageSize
    try{
        const {count, row} = await sampleCtl.findAndCountAll({
            limit: pageSize,
            offset: offsets,
        })
        const totalPages = Math.ceil(count / pageSize);
        res.status(200).json({
            data: row,
            total : count,
            pageNumber : pageNumber,
            pageSize : pageSize,
            totalPages : totalPages
        })
    }catch(err){
        res.status(500).json({
            msg: "服务器内部错误",
            error: "Internal Server Error"
        });
    }
}