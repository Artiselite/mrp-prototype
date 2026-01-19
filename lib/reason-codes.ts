// Reason codes for production data capture

export const SCRAP_REASON_CODES = [
  "Material Defect",
  "Dimensional Out of Spec",
  "Surface Imperfection",
  "Crack or Fracture",
  "Contamination",
  "Wrong Material",
  "Tooling Damage",
  "Process Error",
  "Other"
] as const

export const REWORK_REASON_CODES = [
  "Dimensional Correction",
  "Surface Treatment",
  "Assembly Error",
  "Finish Correction",
  "Welding Rework",
  "Bending Correction",
  "Coating Rework",
  "Other"
] as const

export const DEFECT_TYPES = [
  "Crack",
  "Warp",
  "Contamination",
  "Finish Issue",
  "Dimensional Defect",
  "Surface Scratch",
  "Discoloration",
  "Porosity",
  "Other"
] as const

export const DEVIATION_TYPES = [
  "Material Substitution",
  "Process Deviation",
  "Tooling Issue",
  "Equipment Malfunction",
  "Specification Change",
  "Quality Exception",
  "Other"
] as const

export type ScrapReasonCode = typeof SCRAP_REASON_CODES[number]
export type ReworkReasonCode = typeof REWORK_REASON_CODES[number]
export type DefectType = typeof DEFECT_TYPES[number]
export type DeviationType = typeof DEVIATION_TYPES[number]
