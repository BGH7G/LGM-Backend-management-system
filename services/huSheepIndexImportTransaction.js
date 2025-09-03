const XLSX = require('xlsx');
const { sequelize, HuSheep, HuSheepIndex, AgeMilestone } = require('../model/experimentalData/huSheepModel');

// Map various possible column headers to our canonical field names
const aliasMap = new Map([
  ['sheep_number', 'sheep_number'],
  ['sheep number', 'sheep_number'],
  ['sheep id', 'sheep_number'],
  ['sheep_id', 'sheep_number'],
  ['husheepid', 'HuSheepId'],

  ['age_days', 'age_days'],
  ['age days', 'age_days'],
  ['agedays', 'age_days'],
  ['milestone', 'age_days'],

  ['group', 'group'],
  ['rumen_ph', 'rumen_ph'],
  ['rumen ph', 'rumen_ph'],
  ['acetate', 'acetate'],
  ['propionate', 'propionate'],
  ['isobutyrate', 'isobutyrate'],
  ['butyrate', 'butyrate'],
  ['isovalerate', 'isovalerate'],
  ['valerate', 'valerate'],

  ['total_vfas', 'total_vfas'],
  ['total vfas', 'total_vfas'],
  ['total_vfas(g/l)', 'total_vfas'],
  ['total_vfas(mmol/l)', 'total_vfas'],
  ['total_vfas_mmol', 'total_vfas'],
  ['total_vfas_mmol_l', 'total_vfas'],
  ['total_vfas_mmol/l', 'total_vfas'],
  ['total_vfas_mmolL', 'total_vfas'],
  ['total_vfas_mmolperL', 'total_vfas'],
  ['total_vfas_mmol_per_l', 'total_vfas'],
  ['total_vfas_mmol_per_L', 'total_vfas'],
  ['total_vfas_old', 'total_vfas'],
  ['total_vfas(old)', 'total_vfas'],
  ['total_vfas_new', 'total_vfas'],
  ['total_vfas(new)', 'total_vfas'],
  ['total_vfas(%)', 'total_vfas'],
  ['total_vfas(ml/l)', 'total_vfas'],
  ['total_vfas(mg/l)', 'total_vfas'],
  ['total_vfas_mg_l', 'total_vfas'],
  ['total_vfas_mg/L', 'total_vfas'],
  ['total_vfas_mg_per_l', 'total_vfas'],
  ['total_vfas_mg_per_L', 'total_vfas'],
  ['total_vfas_sum', 'total_vfas'],
  ['total_vfas_total', 'total_vfas'],
  ['Total_VFAs', 'total_vfas'],

  ['bw', 'bw'],
  ['BW', 'bw'],

  ['weight_gain', 'weight_gain'],
  ['weight gain', 'weight_gain'],
  ['Weight_gain', 'weight_gain'],

  ['rumen_wet_weight', 'rumen_wet_weight'],
  ['rumen wet weight', 'rumen_wet_weight'],
  ['Rumen_Wet_Weight', 'rumen_wet_weight'],

  ['rumen_dry_weight', 'rumen_dry_weight'],
  ['rumen dry weight', 'rumen_dry_weight'],
  ['Rumen_Dry_Weight', 'rumen_dry_weight'],

  ['rumen_volume', 'rumen_volume'],
  ['rumen volume', 'rumen_volume'],
  ['Rumen_Volume', 'rumen_volume'],

  ['rumen_relative_weight', 'rumen_relative_weight'],
  ['rumen relative weight', 'rumen_relative_weight'],
  ['Rumen_Relative_Weight', 'rumen_relative_weight'],

  ['rumen_volume_proportion', 'rumen_volume_proportion'],
  ['rumen volume proportion', 'rumen_volume_proportion'],
  ['Rumen_Volume_Proportion', 'rumen_volume_proportion'],

  ['papilla_length', 'papilla_length'],
  ['papilla length', 'papilla_length'],
  ['Papilla_Length', 'papilla_length'],

  ['papilla_width', 'papilla_width'],
  ['papilla width', 'papilla_width'],
  ['Papilla_Width', 'papilla_width'],

  ['papilla_surface_area', 'papilla_surface_area'],
  ['papilla surface area', 'papilla_surface_area'],
  ['Papilla_Surface_Area', 'papilla_surface_area'],

  ['papilla_count', 'papilla_count'],
  ['papilla count', 'papilla_count'],
  ['Papilla_Count', 'papilla_count'],

  ['absorptive_surface_area', 'absorptive_surface_area'],
  ['absorptive surface area', 'absorptive_surface_area'],
  ['Absorptive_Surface_Area', 'absorptive_surface_area'],

  ['dorsal_sac_thickness', 'dorsal_sac_thickness'],
  ['dorsal sac thickness', 'dorsal_sac_thickness'],
  ['Dorsal_Sac_Thickness', 'dorsal_sac_thickness'],

  ['ventral_sac_thickness', 'ventral_sac_thickness'],
  ['ventral sac thickness', 'ventral_sac_thickness'],
  ['ventral_Sac_thickne', 'ventral_sac_thickness'],

  ['notes', 'notes']
]);

const numericFields = [
  'rumen_ph',
  'acetate',
  'propionate',
  'isobutyrate',
  'butyrate',
  'isovalerate',
  'valerate',
  'total_vfas',
  'bw',
  'weight_gain',
  'rumen_wet_weight',
  'rumen_dry_weight',
  'rumen_volume',
  'rumen_relative_weight',
  'rumen_volume_proportion',
  'papilla_length',
  'papilla_width',
  'papilla_surface_area',
  'papilla_count',
  'absorptive_surface_area',
  'dorsal_sac_thickness',
  'ventral_sac_thickness'
];

function normalizeRow(row) {
  const norm = {};
  for (const [key, value] of Object.entries(row)) {
    const k = String(key).trim();
    const lk = k.toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ');
    const canonical = aliasMap.get(lk) || aliasMap.get(k) || k; // fallback to original
    norm[canonical] = value;
  }
  return norm;
}

function toNumberOrNull(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function huSheepIndexImportTransaction(buffer, options = {}) {
  const { sheetName = null, dryRun = false } = options;

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const name = sheetName || workbook.SheetNames[0];
  if (!name) throw new Error('No worksheet found in uploaded file');
  const worksheet = workbook.Sheets[name];
  if (!worksheet) throw new Error(`Worksheet ${name} not found`);

  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  const summary = { created: 0, updated: 0, skipped: 0, errors: [] };

  const t = await sequelize.transaction();
  try {
    for (let i = 0; i < rows.length; i++) {
      const excelRowNumber = i + 2; // assuming row 1 is header
      const raw = rows[i];
      const r = normalizeRow(raw);

      try {
        // Identify sheep
        let sheep = null;
        if (r.HuSheepId) {
          sheep = await HuSheep.findByPk(r.HuSheepId, { transaction: t });
        } else if (r.sheep_number) {
          sheep = await HuSheep.findOne({ where: { sheep_number: String(r.sheep_number) }, transaction: t });
        }
        if (!sheep) {
          summary.skipped++;
          summary.errors.push({ row: excelRowNumber, error: 'Sheep not found. Provide existing sheep_number or HuSheepId.' });
          continue;
        }

        // Identify age milestone
        const ageDaysRaw = r.age_days ?? r.milestone ?? r.AgeMilestoneId; // prefer age_days
        const ageDays = Number(ageDaysRaw);
        if (!Number.isFinite(ageDays)) {
          summary.skipped++;
          summary.errors.push({ row: excelRowNumber, error: 'Invalid or missing age_days/milestone.' });
          continue;
        }
        const [milestone] = await AgeMilestone.findOrCreate({
          where: { age_days: ageDays },
          defaults: { age_days: ageDays, milestone_name: `Day ${ageDays}` },
          transaction: t
        });

        // Build index data
        const indexData = {};
        if (r.group !== undefined && r.group !== null) indexData.group = String(r.group);
        if (r.notes !== undefined && r.notes !== null) indexData.notes = String(r.notes);
        for (const f of numericFields) {
          if (r[f] !== undefined) {
            const n = toNumberOrNull(r[f]);
            if (n !== null) indexData[f] = n; // ignore non-numeric silently
          }
        }

        // Upsert by (HuSheepId, AgeMilestoneId)
        const existing = await HuSheepIndex.findOne({
          where: { HuSheepId: sheep.id, AgeMilestoneId: milestone.id },
          transaction: t
        });

        if (dryRun) {
          // do nothing, just validate
        } else if (existing) {
          await existing.update(indexData, { transaction: t });
          summary.updated++;
        } else {
          await HuSheepIndex.create({ ...indexData, HuSheepId: sheep.id, AgeMilestoneId: milestone.id }, { transaction: t });
          summary.created++;
        }
      } catch (rowErr) {
        summary.skipped++;
        summary.errors.push({ row: excelRowNumber, error: rowErr.message || String(rowErr) });
      }
    }

    if (dryRun) {
      await t.rollback();
    } else {
      await t.commit();
    }

    return summary;
  } catch (e) {
    await t.rollback();
    throw e;
  }
}

module.exports = { huSheepIndexImportTransaction };
