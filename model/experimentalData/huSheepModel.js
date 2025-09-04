const sequelize = require("../index");
const {DataTypes} = require("sequelize");

const HuSheep = sequelize.define("HuSheep", {
    sheep_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    birth_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['male', 'female']
    },
    pregnant: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    notes:{
        type: DataTypes.TEXT
    }
});

const Location = sequelize.define("Location", {
    farm_name :{
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    climate_info:{
        type: DataTypes.TEXT,
    },
    coordinates:{
        type: DataTypes.GEOMETRY('POINT'),
    }
});

const AgeMilestone = sequelize.define("AgeMilestone", {
    age_days:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    milestone_name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.TEXT,
    }
});

const HuSheepIndex = sequelize.define("HuSheepIndex", {
    notes: {
        type: DataTypes.TEXT,
    },
    group: {
        type: DataTypes.STRING,
    },
    rumen_ph: {
        type: DataTypes.FLOAT,
    },
    acetate: {
        type: DataTypes.FLOAT,
    },
    propionate: {
        type: DataTypes.FLOAT,
    },
    isobutyrate: {
        type: DataTypes.FLOAT,
    },
    butyrate: {
        type: DataTypes.FLOAT,
    },
    isovalerate: {
        type: DataTypes.FLOAT,
    },
    valerate: {
        type: DataTypes.FLOAT,
    },
    total_vfas: {  // Changed from Total_VFAs
        type: DataTypes.FLOAT,
    },
    bw: {  // Changed from BW
        type: DataTypes.FLOAT,
    },
    weight_gain: {  // Changed from Weight_gain
        type: DataTypes.FLOAT,
    },
    rumen_wet_weight: {  // Changed from Rumen_Wet_Weight
        type: DataTypes.FLOAT,
    },
    rumen_dry_weight: {  // Changed from Rumen_Dry_Weight
        type: DataTypes.FLOAT,
    },
    rumen_volume: {  // Changed from Rumen_Volume
        type: DataTypes.FLOAT,
    },
    rumen_relative_weight: {  // Changed from Rumen_Relative_Weight
        type: DataTypes.FLOAT,
    },
    rumen_volume_proportion: {  // Changed from Rumen_Volume_Proportion
        type: DataTypes.FLOAT,
    },
    papilla_length: {  // Changed from Papilla_Length
        type: DataTypes.FLOAT,
    },
    papilla_width: {  // Changed from Papilla_Width
        type: DataTypes.FLOAT,
    },
    papilla_surface_area: {  // Changed from Papilla_Surface_Area
        type: DataTypes.FLOAT,
    },
    papilla_count: {  // Changed from Papilla_Count
        type: DataTypes.FLOAT,
    },
    absorptive_surface_area: {  // Changed from Absorptive_Surface_Area
        type: DataTypes.FLOAT,
    },
    dorsal_sac_thickness: {  // Changed from Dorsal_Sac_Thickness
        type: DataTypes.FLOAT,
    },
    ventral_sac_thickness: {  // Changed from ventral_Sac_thickne (also fixed typo)
        type: DataTypes.FLOAT,
    }
});

HuSheep.belongsTo(Location);
Location.hasMany(HuSheep);

HuSheepIndex.belongsTo(HuSheep);
HuSheepIndex.belongsTo(AgeMilestone);
HuSheep.hasMany(HuSheepIndex);
AgeMilestone.hasMany(HuSheepIndex);

module.exports = {
    sequelize,
    HuSheep,
    HuSheepIndex,
    AgeMilestone,
    Location,
}