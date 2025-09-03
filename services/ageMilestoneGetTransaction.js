const { sequelize, AgeMilestone, HuSheepIndex, HuSheep } = require("../model/experimentalData/huSheepModel");

/**
 * 获取单个 AgeMilestone 及其关联指标数据
 * @param {number} milestoneId - 里程碑 ID
 * @returns {Promise<Object>} - 里程碑及其指标信息
 */
async function ageMilestoneGetTransaction(milestoneId) {
  return await sequelize.transaction(async (t) => {
    // 1. 获取里程碑本身
    const milestone = await AgeMilestone.findByPk(milestoneId, { transaction: t });
    if (!milestone) {
      throw new Error(`No ageMilestone was found with ID ${milestoneId}`);
    }

    // 2. 获取所有关联指标（包括羊信息）
    const indexes = await HuSheepIndex.findAll({
      where: { AgeMilestoneId: milestoneId },
      include: [
        {
          model: HuSheep,
          attributes: [
            "id",
            "sheep_number",
            "birth_date",
            "gender",
            "pregnant",
          ],
        },
      ],
      transaction: t,
    });

    return {
      milestone: {
        id: milestone.id,
        age_days: milestone.age_days,
        milestone_name: milestone.milestone_name,
        description: milestone.description,
        createdAt: milestone.createdAt,
        updatedAt: milestone.updatedAt,
      },
      indexData: indexes.map((idx) => ({
        id: idx.id,
        HuSheep: idx.HuSheep, // 基础羊信息
        notes: idx.notes,
        group: idx.group,
        rumen_ph: idx.rumen_ph,
        acetate: idx.acetate,
        propionate: idx.propionate,
        butyrate: idx.butyrate,
        total_vfas: idx.total_vfas,
        bw: idx.bw,
        weight_gain: idx.weight_gain,
        rumen_wet_weight: idx.rumen_wet_weight,
        rumen_dry_weight: idx.rumen_dry_weight,
        rumen_volume: idx.rumen_volume,
        rumen_relative_weight: idx.rumen_relative_weight,
        papilla_length: idx.papilla_length,
        papilla_width: idx.papilla_width,
        papilla_surface_area: idx.papilla_surface_area,
        papilla_count: idx.papilla_count,
        absorptive_surface_area: idx.absorptive_surface_area,
        createdAt: idx.createdAt,
        updatedAt: idx.updatedAt,
      })),
    };
  });
}

module.exports = {
  ageMilestoneGetTransaction,
};