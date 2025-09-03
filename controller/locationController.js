const {locationGetAllTransaction} = require('../services/locationGetAllTransaction')

exports.get = async function (req,res){
    try{
        const data = await locationGetAllTransaction();
        res.status(200).json({
            success: true,
            msg: 'successfully!',
            data
        });
    }catch (e){
        res.status(500).json({err:e})
    }
}