const albumGetTransaction = require('../services/albumGetTransaction')
const albumCreateTransaction = require('../services/albumCreateTransaction')
const albumDeleteTransaction = require('../services/albumdeleteTransaction')
const albumUpdateTransaction = require('../services/albumUpdateTransaction')

exports.get = async (req,res)=>{
    const { page=1, size=10 } = req.query;
    try{
        const result = await albumGetTransaction.getAllAlbums(page,size);
        res.json(result);
    }catch(err){ res.status(500).json({message:err.message}); }
}

exports.getOne = async (req,res)=>{
    try{
        const album = await albumGetTransaction.getAlbumById(req.params.id);
        res.status(200).json(album);
    }catch(err){ res.status(404).json({message:err.message}); }
}

exports.post = async (req,res)=>{
    try{
        let albumData = req.body
        albumData.cover = req.file.filename
        const newAlbum = await albumCreateTransaction(albumData);
        res.status(201).json(newAlbum);
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

exports.delete = async (req,res) =>{
    const { id } = req.params;
    try{
        const result = await albumDeleteTransaction(id);
        res.status(200).json({ message: 'Album deleted successfully', ...result });
    }catch(err){
        res.status(400).json({message:err.message});
    }
}

exports.edit = async (req, res) => {
    const { id } = req.params;
    try {
        let updateData = { ...req.body };
        if (req.file) {
            updateData.cover = req.file.path;
        }

        const result = await albumUpdateTransaction(id, updateData);
        res.status(200).json({ message: 'Album updated successfully', ...result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}