const {sequelize, HuSheep, HuSheepIndex, AgeMilestone, Location} = require("../model/experimentalData/huSheepModel");

/**
 * Reusable helper for paginated response
 */
async function paginate(baseQueryFn, {page=1, pageSize=10, sortBy='id', sortOrder='ASC'}){
    const offset = (page-1)*pageSize;
    return sequelize.transaction(async (t)=>{
        const {count,totalPages,data} = await baseQueryFn({offset,pageSize,sortBy,sortOrder,transaction:t});
        return {
            data,
            pagination:{
                totalItems:count,
                totalPages,
                currentPage:page,
                pageSize,
                hasNextPage:page< totalPages,
                hasPrevPage:page>1
            }
        }
    });
}

async function getLocationsOnly(options) {
    return paginate(async ({offset,pageSize,sortBy,sortOrder,transaction})=>{
        const count = await HuSheep.count({transaction});
        const totalPages = Math.ceil(count/pageSize);
        const data = await HuSheep.findAll({
            attributes:['id','LocationId'],
            include:[{
                model: Location,
                attributes:['id','farm_name','address','region','climate_info','coordinates','createdAt','updatedAt']
            }],
            order:[[sortBy,sortOrder]],
            limit:pageSize,
            offset,
            transaction
        });
        return {count,totalPages,data};
    },options);
}

async function getLatestIndexesOnly(options){
    return paginate(async ({offset,pageSize,sortBy,sortOrder,transaction})=>{
        const count = await HuSheep.count({transaction});
        const totalPages = Math.ceil(count/pageSize);
        const sheepList = await HuSheep.findAll({
            attributes:['id','sheep_number'],
            order:[[sortBy,sortOrder]],
            limit:pageSize,
            offset,
            transaction
        });
        const data = await Promise.all(sheepList.map(async sheep=>{
            const latestIndex = await HuSheepIndex.findOne({
                where:{HuSheepId:sheep.id},
                include:[{
                    model: AgeMilestone,
                    attributes:['id','age_days','milestone_name','description']
                }],
                order:[['createdAt','DESC']],
                transaction
            });
            return {
                id:sheep.id,
                sheep_number:sheep.sheep_number,
                latestIndex: latestIndex? latestIndex.toJSON():null
            }
        }));
        return {count,totalPages,data};
    },options);
}

async function getAgeMilestonesOnly(options){
    return paginate(async ({offset,pageSize,sortBy,sortOrder,transaction})=>{
        const count = await AgeMilestone.count({transaction});
        const totalPages = Math.ceil(count/pageSize);
        const data = await AgeMilestone.findAll({
            order:[[sortBy,sortOrder]],
            limit:pageSize,
            offset,
            transaction
        });
        return {count,totalPages,data};
    },options);
}

module.exports = {getLocationsOnly,getLatestIndexesOnly,getAgeMilestonesOnly};
