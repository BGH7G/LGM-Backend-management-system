const {
    huSheepPostTransaction,
    ageMilestonePostTransaction,
    huSheepIndexPostTransaction
} = require('../../services/huSheepPostTransaction');
const {huSheepGetTransaction} = require('../../services/huSheepGetTransaction');
const {huSheepGetAllTransaction} = require('../../services/huSheepGetAllTransaction');
const {
    huSheepUpdateTransaction,
    huSheepIndexUpdateTransaction,
    locationUpdateTransaction,
    ageMilestoneUpdateTransaction
} = require('../../services/huSheepUpdateTransaction');
const {
    huSheepDeleteTransaction,
    deleteSheepIndexDeleteTransaction,
    deleteLocationDeleteTransaction,
    batchDeleteSheepTransaction,
    deleteAgeMilestoneTransaction
} = require('../../services/huSheepDeleteTransaction');

exports.getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortBy = req.query.sortBy || 'id';
        const sortOrder = (req.query.sortOrder || 'ASC').toUpperCase();

        if (page < 1 || pageSize < 1) {
            return res.status(400).json({
                success: false,
                msg: '无效的分页参数'
            });
        }

        if (!['ASC', 'DESC'].includes(sortOrder)) {
            return res.status(400).json({
                success: false,
                msg: '排序方式必须是ASC或DESC'
            });
        }

        const filters = {};

        if (req.query.gender) {
            filters.gender = req.query.gender;
        }
        if (req.query.pregnant !== undefined) {
            filters.pregnant = req.query.pregnant === 'true';
        }
        // 日期范围搜索
        if (req.query.fromDate && req.query.toDate) {
            filters.birth_date = {
                [Op.between]: [req.query.fromDate, req.query.toDate]
            };
        } else if (req.query.fromDate) {
            filters.birth_date = {
                [Op.gte]: req.query.fromDate
            };
        } else if (req.query.toDate) {
            filters.birth_date = {
                [Op.lte]: req.query.toDate
            };
        }
        // 编号搜索
        if (req.query.sheepNumber) {
            filters.sheep_number = {
                [Op.like]: `%${req.query.sheepNumber}%`
            };
        }

        const result = await huSheepGetAllTransaction({
            page,
            pageSize,
            sortBy,
            sortOrder,
            filters
        });
        res.status(200).json({
            success: true,
            msg: 'successfully!',
            ...result
        });

    } catch (err) {
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.getSheep = async (req, res) => {
    try {
        const sheepId = req.params.id;
        const data = await huSheepGetTransaction(sheepId);
        res.status(201).json({msg: 'successfully!', data: data});
    } catch (err) {
        res.status(500).json({msg: err.name, err: err});
    }
}

exports.sheepInfoPost = async (req, res) => {
    try {
        await huSheepPostTransaction(req.body)
        res.status(201).json({msg: 'data update successfully!'});
    } catch (err) {
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.ageInfoPost = async (req, res) => {
    try {
        await ageMilestonePostTransaction(req.body)
        res.status(201).json({msg: 'ageMilestone update successfully!'});
    } catch (err) {
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.indexInfoPost = async (req, res) => {
    try {
        await huSheepIndexPostTransaction(req.body)
        res.status(201).json({msg: 'ageMilestone update successfully!'});
    } catch (err) {
        if (err.message === 'The Age milestone was not found') {
            res.status(404).json({
                error: err.message
            });
        } else {
            res.status(500).json({msg: 'Server error!', err: err});
        }
    }
}

exports.sheepUpdate = async (req, res) => {
    try {
        const sheepId = parseInt(req.params.id);

        if (!sheepId || isNaN(sheepId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid sheep ID'
            });
        }
        const {
            sheep_number,
            birth_date,
            gender,
            pregnant,
            notes,
            location
        } = req.body;

        const sheepData = {};

        if (sheep_number !== undefined) sheepData.sheep_number = sheep_number;
        if (birth_date !== undefined) sheepData.birth_date = birth_date;
        if (gender !== undefined) sheepData.gender = gender;
        if (pregnant !== undefined) sheepData.pregnant = pregnant;
        if (notes !== undefined) sheepData.notes = notes;

        const options = {};

        if (location) {
            options.updateLocation = true;
            options.locationData = location;
        }

        const updatedSheep = await huSheepUpdateTransaction(sheepId, sheepData, options);

        res.status(200).json({
            success: true,
            msg: 'Sheep information updated successfully',
            data: updatedSheep
        });

    } catch (err) {
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.sheepIndexUpdate = async (req, res) => {
    try {
        const indexId = parseInt(req.params.id);

        if (!indexId || isNaN(indexId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid index ID'
            })
        }

        const {
            AgeMilestoneId,
            HuSheepId,
            notes,
            group,
            rumen_ph,
            acetate,
            propionate,
            butyrate,
            total_vfas,
            bw,
            weight_gain,
            rumen_wet_weight,
            rumen_dry_weight,
            rumen_volume,
            rumen_relative_weight,
            papilla_length,
            papilla_width,
            papilla_surface_area,
            papilla_count,
            absorptive_surface_area
        } = req.body;

        const indexData = {}
        if (notes !== undefined) indexData.notes = notes;
        if (group !== undefined) indexData.group = group;
        if (rumen_ph !== undefined) indexData.rumen_ph = rumen_ph;
        if (acetate !== undefined) indexData.acetate = acetate;
        if (propionate !== undefined) indexData.propionate = propionate;
        if (butyrate !== undefined) indexData.butyrate = butyrate;
        if (total_vfas !== undefined) indexData.total_vfas = total_vfas;
        if (bw !== undefined) indexData.bw = bw;
        if (weight_gain !== undefined) indexData.weight_gain = weight_gain;
        if (rumen_wet_weight !== undefined) indexData.rumen_wet_weight = rumen_wet_weight;
        if (rumen_dry_weight !== undefined) indexData.rumen_dry_weight = rumen_dry_weight;
        if (rumen_volume !== undefined) indexData.rumen_volume = rumen_volume;
        if (rumen_relative_weight !== undefined) indexData.rumen_relative_weight = rumen_relative_weight;
        if (papilla_length !== undefined) indexData.papilla_length = papilla_length;
        if (papilla_width !== undefined) indexData.papilla_width = papilla_width;
        if (papilla_surface_area !== undefined) indexData.papilla_surface_area = papilla_surface_area;
        if (papilla_count !== undefined) indexData.papilla_count = papilla_count;
        if (absorptive_surface_area !== undefined) indexData.absorptive_surface_area = absorptive_surface_area;

        const options = {}

        if (AgeMilestoneId !== undefined) {
            options.updateMilestone = true;
            options.milestoneId = AgeMilestoneId;
            options.updateHuSheep = true;
            options.HuSheepId = HuSheepId;
        }

        const updatedIndex = await huSheepIndexUpdateTransaction(indexId, indexData, options);

        res.status(200).json({
            success: true,
            msg: 'Sheep indicator data updated successfully',
            data: updatedIndex
        });

    } catch (err) {
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.locationUpdate = async (req, res) => {
    try {
        const locationId = parseInt(req.params.id);

        if (!locationId || isNaN(locationId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid Location ID'
            })
        }

        const {
            farm_name,
            address,
            region,
            climate_info,
            coordinates
        } = req.body

        const locationData = {};

        if (farm_name !== undefined) locationData.farm_name = farm_name;
        if (address !== undefined) locationData.address = address;
        if (region !== undefined) locationData.region = region;
        if (climate_info !== undefined) locationData.climate_info = climate_info;
        if (coordinates !== undefined) locationData.coordinates = coordinates;

        const updatedLocation = await locationUpdateTransaction(locationId, locationData);

        res.status(200).json({
            success: true,
            msg: 'Location information updated successfully',
            data: updatedLocation
        });
    } catch (err) {
        if (err.message === 'Location not found.') {
            res.status(400).json({msg: err.message, err: err});
        }
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.ageMilestoneUpdate = async (req, res) => {
    try {
        const ageMilestoneId = parseInt(req.params.id);

        if (!ageMilestoneId || isNaN(ageMilestoneId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid ageMilestone ID'
            })
        }

        const {
            age_days,
            milestone_name,
            description
        } = req.body;

        const ageMilestoneData = {}

        if (age_days !== undefined) ageMilestoneData.age_days = age_days;
        if (milestone_name !== undefined) ageMilestoneData.milestone_name = milestone_name;
        if (description !== undefined) ageMilestoneData.description = description;

        const updatedAgeMilestone = await ageMilestoneUpdateTransaction(ageMilestoneId, ageMilestoneData);

        res.status(200).json({
            success: true,
            msg: 'Location information updated successfully',
            data: updatedAgeMilestone
        });
    } catch (err) {
        if (err.message === 'No ageMilestone found.') {
            res.status(404).json({msg: err.message, err: err});
        }
        res.status(500).json({msg: 'Server error!', err: err});
    }
}

exports.sheepDelete = async (req, res) => {
    const sheepId = parseInt(req.params.id);
    try {
        if (!sheepId || isNaN(sheepId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid sheep ID'
            });
        }
        //  将来自 URL 的字符串信息转换为一个布尔值 (true/false)
        /*
            只有当 req.query.deleteIndexes 的值 完全等于 字符串 'true' 时，比较结果才是 true，此时 deleteIndexes 变量才会被赋值为 true
            在所有其他情况下 (例如，req.query.deleteIndexes 是 "false"、是 undefined、是空字符串 ""、或者是任何其他字符串)，
            这个比较的结果都是 false，此时 deleteIndexes 变量会被赋值为 false
         */
        const deleteIndexes = req.query.deleteIndexes === 'true';

        const result = await huSheepDeleteTransaction(sheepId, {deleteIndexes})
        res.status(200).json({
            success: true,
            msg: result.message,
            data: result.deleteSheepInfo
        });
    } catch (err) {
        // Gemini 生成的 错误处理模板代码
        // --- 改进的错误处理 ---
        // 1. 在服务器端记录详细错误日志 (非常重要!)
        console.error(`[ERROR] Failed to delete sheep ID ${req.params.id}:`, err); // 记录原始错误和堆栈跟踪
        let statusCode = 500; // 默认服务器错误
        let clientMessage = 'An unexpected error occurred while deleting the sheep.'; // 默认给客户端的消息
        // 2. 区分特定错误（来自 huSheepDeleteTransaction 抛出的错误）
        if (err.message === "No sheep was found with no transaction") {
            statusCode = 404; // Not Found
            clientMessage = 'Sheep with the specified ID was not found.';
        } else if (err.message === "The sheep has associated data !") {
            statusCode = 409; // Conflict (或 400 Bad Request)
            clientMessage = 'Cannot delete sheep because it has associated index data. Set the deleteIndexes query parameter to true to delete associated data as well.';
        }
        // 可选：检查 Sequelize 特定的错误类型 (如果需要更细粒度的处理)
        // else if (err instanceof Sequelize.ValidationError) {
        //     statusCode = 400;
        //     clientMessage = `Validation error: ${err.errors.map(e => e.message).join(', ')}`;
        // } else if (err instanceof Sequelize.ForeignKeyConstraintError) {
        //      statusCode = 409; // Conflict due to foreign key
        //      clientMessage = 'Cannot delete this sheep due to related records in other tables.';
        // }
        // ... 其他 Sequelize 或数据库错误可以保持 500
        // 3. 发送标准化的、安全的错误响应给客户端
        res.status(statusCode).json({
            success: false,
            msg: clientMessage
            // 不再发送原始的 err 对象
            // 在开发环境中可以考虑发送 err.message (但仍需谨慎)
            // err_msg_dev: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

exports.batchSheepDelete = async (req, res) => {
    const sheepIdsInput = req.body.sheepId;
    if (!Array.isArray(sheepIdsInput)) {
        return res.status(400).json({success: false, msg: 'Invalid input: sheepIds must be an array.'});
    }
    if (sheepIdsInput.length === 0) {
        return res.status(400).json({success: false, msg: 'Invalid input: sheepIds array cannot be empty.'});
    }
    const sheepIds = sheepIdsInput.map(id => parseInt(id));
    if (sheepIds.some(id => isNaN(id))) {
        const invalidEntry = sheepIdsInput[sheepIds.findIndex(id => isNaN(id))];
        return res.status(400).json({
            success: false,
            msg: `Invalid input: All sheepIds must be valid numbers. Found: '${invalidEntry}'`
        });
    }
    try {
        const deleteIndexes = req.query.deleteIndexes === 'true';

        const results = await batchDeleteSheepTransaction(sheepIds, {deleteIndexes})

        if (results.failed.length > 0 && results.success.length === 0) {
            // 如果所有请求的 ID 都失败了
            const firstError = results.failed[0].error; // 获取第一个失败的原因
            let statusCode = 400; // 默认为 Bad Request (e.g., all not found)
            if (firstError.includes('associated data')) {
                statusCode = 409; // Conflict
            } else if (firstError.includes('No sheep found')) {
                // 如果你想为“全部未找到”返回 404
                // 注意：如果混合了 "not found" 和 "associated data"，这里只会根据第一个错误判断
                const allNotFound = results.failed.every(f => f.error.includes('No sheep found'));
                if (allNotFound) statusCode = 404; // Not Found
            }
            res.status(statusCode).json({
                success: false,
                msg: `Batch delete failed for all requested IDs. ${results.message}`, // 使用事务返回的总结信息
                data: results.failed // 返回详细的失败列表
            });
        } else if (results.failed.length > 0) {
            // 部分成功，部分失败
            // 使用 200 OK 或 207 Multi-Status。200 更常见，将成功/失败信息放在 body 中。
            res.status(200).json({ // 或者 res.status(207)
                success: true, // 操作已执行，但有部分失败
                msg: results.message, // "Batch delete partially completed..."
                data: results.failed // 返回成功和失败的详细列表
            });
        } else {
            // 全部成功
            res.status(200).json({
                success: true,
                msg: results.message, // "Successfully deleted..."
                data: results // 返回成功的 ID 列表
            });
        }
    } catch (err) {
        console.error(`[ERROR] Unexpected error during batch sheep deletion for IDs [${sheepIds.join(', ')}]:`, err); // 详细日志记录
        // 可以在这里检查 err 的类型来返回更具体的服务器错误码，例如：
        // if (err instanceof Sequelize.ConnectionError) { ... return 503 ... }
        // if (err instanceof Sequelize.TimeoutError) { ... return 504 ... }
        // 默认返回 500 Internal Server Error
        res.status(500).json({
            success: false,
            msg: 'An unexpected server error occurred during the batch deletion process.'
            // 不要在生产环境中向客户端发送 err.message 或 err.stack
        });
    }
}

exports.sheepIndexDelete = async (req, res) => {
    const indexId = parseInt(req.params.id);
    try{

        if (!indexId || isNaN(indexId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid or missing sheepIndex ID provided.'
            });
        }

        const result = await deleteSheepIndexDeleteTransaction(indexId);

        res.status(200).json({
            success: true,
            msg: result.message,
            data: result.deleteIndexInfo
        });

    }catch (err){
        console.error(`[ERROR] Failed to delete sheep index with ID ${indexId || req.params.id}:`, err); // 记录详细错误日志

        if (err.message && err.message.includes("No sheepIndex was found")) {
            return res.status(404).json({ // 404 Not Found 状态码
                success: false,
                msg: `Sheep index with ID ${indexId} not found.`
            });
        }
        return res.status(500).json({
            success: false,
            // 不要在生产环境中直接暴露 err.message 给客户端，可能包含敏感信息
            msg: 'An unexpected error occurred on the server while attempting to delete the sheep index.'
        });
    }
}

exports.locationDelete = async (req, res) => {
    // 将变量声明再 try...catch...外
    // 并将数据初始化
    let locationID;
    let transferToLocationId = null;
    let force = false;
    try{
        locationID = parseInt(req.params.id);
        const transferParam = req.query.transferToLocationId;
        if (transferParam) {
            transferToLocationId = parseInt(transferParam);
            if (isNaN(transferToLocationId)) {
                // 如果提供了 transferToLocationId 但不是有效数字，则视为错误
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid transferToLocationId provided. It must be a number.'
                });
            }
        }
        force = req.query.force === 'true';

        if (!locationID || isNaN(locationID)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid or missing Location ID provided.'
            });
        }

        const result = await deleteLocationDeleteTransaction(locationID, { force,transferToLocationId });

        res.status(200).json({
            success: true,
            msg: result.message,
            data: result.deletedLocationInfo
        });
    }catch (err){
        // 首先记录详细错误日志，包含相关参数
        console.error(`[ERROR] Failed operation for Location ID ${locationID} (TransferTo: ${transferToLocationId}, Force: ${force}):`, err);
        const errorMessage = err.message || ''; // 获取错误消息，处理可能没有 message 的情况
        if (errorMessage.includes("No Location was found")) {
            // 区分是要删除的 Location 找不到，还是目标 Location 找不到
            if (errorMessage.includes(`ID ${transferToLocationId}`)) { // 目标 Location 未找到
                return res.status(400).json({ // 400 Bad Request，因为提供的转移目标无效
                    success: false,
                    msg: `The specified target location (ID: ${transferToLocationId}) for transferring sheep does not exist.`
                });
            } else { // 要删除的 Location 未找到
                return res.status(404).json({ // 404 Not Found
                    success: false,
                    msg: `Location with ID ${locationID} not found.`
                });
            }
        } else if (errorMessage.includes("associated sheep, please remove them first")) {
            return res.status(409).json({
                success: false,
                msg: errorMessage
            });
        }
        else {
            return res.status(500).json({
                success: false,
                msg: 'An unexpected error occurred on the server while attempting to process the location deletion.'
            });
        }
    }
}

exports.ageMilestoneDelete = async (req, res) => {
    let ageMilestoneId;
    let transferToAgeMilestoneId = null;
    let force = false;
    try{
        ageMilestoneId = parseInt(req.params.id);
        const transferParam = req.query.transferToAgeMilestoneId;
        if (transferParam) {
            transferToAgeMilestoneId = parseInt(transferParam);
            if (isNaN(transferToAgeMilestoneId)) {
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid transferToAgeMilestoneId provided. It must be a positive number.'
                });
            }
        }
        force = req.query.force === 'true';

        if (!ageMilestoneId || isNaN(ageMilestoneId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid or missing AgeMilestone ID provided. It must be a positive number.'
            });
        }

        const result = await deleteAgeMilestoneTransaction(ageMilestoneId, { force,transferToAgeMilestoneId });

        res.status(200).json({
            success: true,
            msg: `Successfully processed AgeMilestone ID ${ageMilestoneId}.`,
            data: result.deletedAgeMilestoneInfo
        });
    }catch (err){
        console.error(`[ERROR] Failed operation for AgeMilestone ID ${ageMilestoneId} (TransferTo: ${transferToAgeMilestoneId}, Force: ${force}):`, err);
        const errorMessage = err.message || '';
        if (errorMessage.includes(`No ageMilestone was found with ID ${ageMilestoneId}`)) {
            return res.status(404).json({
                success: false,
                msg: `AgeMilestone with ID ${ageMilestoneId} not found.`
            });
        }
        if (transferToAgeMilestoneId && errorMessage.includes(`found with ID ${transferToAgeMilestoneId}`)) {

            return res.status(400).json({
                success: false,
                msg: `The specified target AgeMilestone (ID: ${transferToAgeMilestoneId}) for transferring associations does not exist.`
            });
        }
        if (errorMessage.includes("associated sheep, please remove them first") || errorMessage.includes("associated sheepIndex, please remove them first")) {
            return res.status(409).json({
                success: false,
                msg: `Cannot delete AgeMilestone ID ${ageMilestoneId} because it has associated Sheep or SheepIndex records. Please provide a valid 'transferToAgeMilestoneId' to move these associations or set 'force=true' to remove the associations.`
            });
        }
        return res.status(500).json({
            success: false,
            msg: 'An unexpected error occurred on the server while processing the age milestone deletion.'
        });
    }
}
