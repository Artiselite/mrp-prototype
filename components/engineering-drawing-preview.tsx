"use client"

import { useMemo } from "react"

interface DrawingDimensions {
  length: number
  width: number
  height: number
  weight: number
}

interface EngineeringDrawingPreviewProps {
  drawingNumber: string
  title: string
  revision: string
  drawnBy: string
  checkedBy: string
  approvedBy: string
  date: string
  dimensions?: DrawingDimensions
  materials: string[]
  specifications: string
  tolerances?: string
  surfaceFinish?: string
  weldingSpecs?: string
  scale?: string
}

function detectDrawingType(title: string, description?: string): "i-beam" | "column" | "bus-duct" | "generic" {
  const t = (title + " " + (description || "")).toLowerCase()
  if (t.includes("i-beam") || t.includes("beam assembly")) return "i-beam"
  if (t.includes("column")) return "column"
  if (t.includes("bus duct") || t.includes("busduct")) return "bus-duct"
  return "generic"
}

// Dimension line with arrows and text
function DimLine({ x1, y1, x2, y2, label, offset = 0, side = "bottom" }: {
  x1: number; y1: number; x2: number; y2: number
  label: string; offset?: number; side?: "bottom" | "top" | "left" | "right"
}) {
  const isHorizontal = Math.abs(y1 - y2) < 2
  let lx1 = x1, ly1 = y1, lx2 = x2, ly2 = y2
  let textX: number, textY: number, textAnchor = "middle", textRotate = 0

  if (isHorizontal) {
    const off = side === "top" ? -offset : offset
    ly1 = y1 + off; ly2 = y2 + off
    textX = (lx1 + lx2) / 2
    textY = ly1 - 4
  } else {
    const off = side === "left" ? -offset : offset
    lx1 = x1 + off; lx2 = x2 + off
    textX = lx1 - 4
    textY = (ly1 + ly2) / 2
    textRotate = -90
  }

  return (
    <g className="dimension-line">
      {/* Extension lines */}
      {isHorizontal ? (
        <>
          <line x1={x1} y1={y1} x2={x1} y2={ly1 + (side === "top" ? 4 : -4)} stroke="#333" strokeWidth={0.3} strokeDasharray="1,1" />
          <line x1={x2} y1={y2} x2={x2} y2={ly2 + (side === "top" ? 4 : -4)} stroke="#333" strokeWidth={0.3} strokeDasharray="1,1" />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1} x2={lx1 + (side === "left" ? 4 : -4)} y2={y1} stroke="#333" strokeWidth={0.3} strokeDasharray="1,1" />
          <line x1={x2} y1={y2} x2={lx2 + (side === "left" ? 4 : -4)} y2={y2} stroke="#333" strokeWidth={0.3} strokeDasharray="1,1" />
        </>
      )}
      {/* Dimension line */}
      <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#333" strokeWidth={0.4} markerStart="url(#arrowStart)" markerEnd="url(#arrowEnd)" />
      {/* Label */}
      <text
        x={textX} y={textY}
        textAnchor={textAnchor}
        fontSize={3.5}
        fill="#333"
        fontFamily="monospace"
        transform={textRotate ? `rotate(${textRotate}, ${textX}, ${textY})` : undefined}
      >
        {label}
      </text>
    </g>
  )
}

// Title block
function TitleBlock({ x, y, width, height, drawing }: {
  x: number; y: number; width: number; height: number
  drawing: EngineeringDrawingPreviewProps
}) {
  const rowH = height / 5
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="white" stroke="#000" strokeWidth={0.6} />
      {/* Company row */}
      <rect x={x} y={y} width={width} height={rowH} fill="#1a365d" />
      <text x={x + width / 2} y={y + rowH * 0.7} textAnchor="middle" fontSize={3.5} fill="white" fontWeight="bold" fontFamily="sans-serif">
        MRP ENGINEERING SOLUTIONS SDN BHD
      </text>
      {/* Title row */}
      <line x1={x} y1={y + rowH} x2={x + width} y2={y + rowH} stroke="#000" strokeWidth={0.3} />
      <text x={x + 2} y={y + rowH + 3} fontSize={2.2} fill="#666" fontFamily="sans-serif">TITLE</text>
      <text x={x + 2} y={y + rowH + 6.5} fontSize={3} fill="#000" fontWeight="bold" fontFamily="sans-serif">
        {drawing.title.length > 35 ? drawing.title.substring(0, 35) + "..." : drawing.title}
      </text>
      {/* Info row */}
      <line x1={x} y1={y + rowH * 2} x2={x + width} y2={y + rowH * 2} stroke="#000" strokeWidth={0.3} />
      <g>
        {/* Drawn by */}
        <text x={x + 2} y={y + rowH * 2 + 3} fontSize={1.8} fill="#666">DRAWN</text>
        <text x={x + 2} y={y + rowH * 2 + 6} fontSize={2.2} fill="#000">{drawing.drawnBy}</text>
        {/* Checked by */}
        <line x1={x + width * 0.33} y1={y + rowH * 2} x2={x + width * 0.33} y2={y + rowH * 3} stroke="#000" strokeWidth={0.3} />
        <text x={x + width * 0.33 + 2} y={y + rowH * 2 + 3} fontSize={1.8} fill="#666">CHECKED</text>
        <text x={x + width * 0.33 + 2} y={y + rowH * 2 + 6} fontSize={2.2} fill="#000">{drawing.checkedBy}</text>
        {/* Approved by */}
        <line x1={x + width * 0.66} y1={y + rowH * 2} x2={x + width * 0.66} y2={y + rowH * 3} stroke="#000" strokeWidth={0.3} />
        <text x={x + width * 0.66 + 2} y={y + rowH * 2 + 3} fontSize={1.8} fill="#666">APPROVED</text>
        <text x={x + width * 0.66 + 2} y={y + rowH * 2 + 6} fontSize={2.2} fill="#000">{drawing.approvedBy}</text>
      </g>
      {/* DWG number row */}
      <line x1={x} y1={y + rowH * 3} x2={x + width} y2={y + rowH * 3} stroke="#000" strokeWidth={0.3} />
      <text x={x + 2} y={y + rowH * 3 + 3} fontSize={1.8} fill="#666">DWG NO.</text>
      <text x={x + 2} y={y + rowH * 3 + 6.5} fontSize={3} fill="#000" fontWeight="bold" fontFamily="monospace">{drawing.drawingNumber}</text>
      <line x1={x + width * 0.5} y1={y + rowH * 3} x2={x + width * 0.5} y2={y + rowH * 4} stroke="#000" strokeWidth={0.3} />
      <text x={x + width * 0.5 + 2} y={y + rowH * 3 + 3} fontSize={1.8} fill="#666">REV</text>
      <text x={x + width * 0.5 + 2} y={y + rowH * 3 + 6.5} fontSize={3} fill="#000" fontWeight="bold">{drawing.revision}</text>
      <line x1={x + width * 0.7} y1={y + rowH * 3} x2={x + width * 0.7} y2={y + rowH * 4} stroke="#000" strokeWidth={0.3} />
      <text x={x + width * 0.7 + 2} y={y + rowH * 3 + 3} fontSize={1.8} fill="#666">SCALE</text>
      <text x={x + width * 0.7 + 2} y={y + rowH * 3 + 6.5} fontSize={2.5} fill="#000">{drawing.scale || "NTS"}</text>
      {/* Date / material row */}
      <line x1={x} y1={y + rowH * 4} x2={x + width} y2={y + rowH * 4} stroke="#000" strokeWidth={0.3} />
      <text x={x + 2} y={y + rowH * 4 + 3} fontSize={1.8} fill="#666">DATE</text>
      <text x={x + 2} y={y + rowH * 4 + 6} fontSize={2.2} fill="#000">{drawing.date}</text>
      <line x1={x + width * 0.33} y1={y + rowH * 4} x2={x + width * 0.33} y2={y + height} stroke="#000" strokeWidth={0.3} />
      <text x={x + width * 0.33 + 2} y={y + rowH * 4 + 3} fontSize={1.8} fill="#666">MATERIAL</text>
      <text x={x + width * 0.33 + 2} y={y + rowH * 4 + 6} fontSize={2} fill="#000">
        {drawing.materials[0] ? (drawing.materials[0].length > 25 ? drawing.materials[0].substring(0, 25) + "..." : drawing.materials[0]) : "See specs"}
      </text>
      <line x1={x + width * 0.75} y1={y + rowH * 4} x2={x + width * 0.75} y2={y + height} stroke="#000" strokeWidth={0.3} />
      <text x={x + width * 0.75 + 2} y={y + rowH * 4 + 3} fontSize={1.8} fill="#666">WEIGHT</text>
      <text x={x + width * 0.75 + 2} y={y + rowH * 4 + 6} fontSize={2.2} fill="#000">{drawing.dimensions?.weight ? `${drawing.dimensions.weight} lbs` : "N/A"}</text>
    </g>
  )
}

function IBeamDrawing({ dims, specs }: { dims: DrawingDimensions; specs: string }) {
  // Front view (cross-section) of I-Beam
  const cx = 55, cy = 65
  const flangeW = 28, flangeH = 3, webH = 24, webW = 3

  // Side view
  const sx = 135, sy = 50
  const sideLen = 60

  return (
    <g>
      {/* View labels */}
      <text x={cx} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">SECTION A-A</text>
      <text x={sx + sideLen / 2} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">ELEVATION VIEW</text>

      {/* === Front view: I-Beam cross section === */}
      <g>
        {/* Top flange */}
        <rect x={cx - flangeW / 2} y={cy - webH / 2 - flangeH} width={flangeW} height={flangeH} fill="#e8e8e8" stroke="#000" strokeWidth={0.5} />
        {/* Web */}
        <rect x={cx - webW / 2} y={cy - webH / 2} width={webW} height={webH} fill="#e8e8e8" stroke="#000" strokeWidth={0.5} />
        {/* Bottom flange */}
        <rect x={cx - flangeW / 2} y={cy + webH / 2} width={flangeW} height={flangeH} fill="#e8e8e8" stroke="#000" strokeWidth={0.5} />
        {/* Fillet curves */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * webW / 2} cy={cy + dy * webH / 2} r={1.5} fill="none" stroke="#000" strokeWidth={0.3} />
        ))}
        {/* Center mark */}
        <line x1={cx - 2} y1={cy} x2={cx + 2} y2={cy} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="1,0.5" />
        <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 2} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="1,0.5" />
        {/* Dimension: flange width */}
        <DimLine x1={cx - flangeW / 2} y1={cy + webH / 2 + flangeH} x2={cx + flangeW / 2} y2={cy + webH / 2 + flangeH} label={`${dims.width}"`} offset={12} side="bottom" />
        {/* Dimension: total height */}
        <DimLine x1={cx + flangeW / 2} y1={cy - webH / 2 - flangeH} x2={cx + flangeW / 2} y2={cy + webH / 2 + flangeH} label={`${dims.height}"`} offset={10} side="right" />
        {/* Hatch pattern on web */}
        {Array.from({ length: 8 }, (_, i) => {
          const yOff = cy - webH / 2 + 3 + i * 2.5
          return <line key={i} x1={cx - webW / 2 + 0.3} y1={yOff} x2={cx + webW / 2 - 0.3} y2={yOff + 1.5} stroke="#999" strokeWidth={0.15} />
        })}
      </g>

      {/* === Side view: Beam elevation === */}
      <g>
        {/* Beam outline */}
        <rect x={sx} y={sy} width={sideLen} height={webH + flangeH * 2} fill="#f0f0f0" stroke="#000" strokeWidth={0.5} />
        {/* Top flange line */}
        <line x1={sx} y1={sy + flangeH} x2={sx + sideLen} y2={sy + flangeH} stroke="#000" strokeWidth={0.3} />
        {/* Bottom flange line */}
        <line x1={sx} y1={sy + flangeH + webH} x2={sx + sideLen} y2={sy + flangeH + webH} stroke="#000" strokeWidth={0.3} />
        {/* Section cut indicator A-A */}
        <line x1={sx + sideLen * 0.4} y1={sy - 6} x2={sx + sideLen * 0.4} y2={sy + webH + flangeH * 2 + 6} stroke="#0066cc" strokeWidth={0.4} strokeDasharray="2,1" />
        <text x={sx + sideLen * 0.4 - 3} y={sy - 7} fontSize={3} fill="#0066cc" fontWeight="bold">A</text>
        <text x={sx + sideLen * 0.4 - 3} y={sy + webH + flangeH * 2 + 10} fontSize={3} fill="#0066cc" fontWeight="bold">A</text>
        {/* Stiffener plates */}
        {[0.15, 0.5, 0.85].map((pos, i) => (
          <line key={i} x1={sx + sideLen * pos} y1={sy + flangeH} x2={sx + sideLen * pos} y2={sy + flangeH + webH} stroke="#000" strokeWidth={0.3} strokeDasharray="0.5,0.5" />
        ))}
        {/* Bolt holes on flanges */}
        {[0.08, 0.92].map((pos, i) => (
          <g key={i}>
            <circle cx={sx + sideLen * pos} cy={sy + flangeH / 2} r={1} fill="none" stroke="#000" strokeWidth={0.3} />
            <circle cx={sx + sideLen * pos} cy={sy + flangeH + webH + flangeH / 2} r={1} fill="none" stroke="#000" strokeWidth={0.3} />
          </g>
        ))}
        {/* Dimension: length */}
        <DimLine x1={sx} y1={sy + webH + flangeH * 2} x2={sx + sideLen} y2={sy + webH + flangeH * 2} label={`${dims.length}"`} offset={12} side="bottom" />
        {/* Centerline */}
        <line x1={sx - 3} y1={sy + (webH + flangeH * 2) / 2} x2={sx + sideLen + 3} y2={sy + (webH + flangeH * 2) / 2} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="3,1,0.5,1" />
      </g>

      {/* Notes */}
      <text x={8} y={115} fontSize={2.2} fill="#333" fontFamily="sans-serif">NOTES:</text>
      <text x={8} y={119} fontSize={2} fill="#555">1. ALL DIMENSIONS IN INCHES UNLESS OTHERWISE NOTED</text>
      <text x={8} y={122.5} fontSize={2} fill="#555">2. {specs.substring(0, 60)}</text>
      <text x={8} y={126} fontSize={2} fill="#555">3. SURFACE FINISH PER SPECIFICATION</text>
    </g>
  )
}

function ColumnDrawing({ dims, specs }: { dims: DrawingDimensions; specs: string }) {
  const cx = 55, cy = 65
  const flangeW = 30, flangeH = 3.5, webH = 26, webW = 3.5

  // Side/elevation view
  const sx = 130, sy = 42
  const colHeight = 55

  return (
    <g>
      <text x={cx} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">SECTION B-B</text>
      <text x={sx + 12} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">ELEVATION</text>

      {/* === Cross section === */}
      <g>
        <rect x={cx - flangeW / 2} y={cy - webH / 2 - flangeH} width={flangeW} height={flangeH} fill="#e0e0e0" stroke="#000" strokeWidth={0.5} />
        <rect x={cx - webW / 2} y={cy - webH / 2} width={webW} height={webH} fill="#e0e0e0" stroke="#000" strokeWidth={0.5} />
        <rect x={cx - flangeW / 2} y={cy + webH / 2} width={flangeW} height={flangeH} fill="#e0e0e0" stroke="#000" strokeWidth={0.5} />
        {/* Fillets */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * webW / 2} cy={cy + dy * webH / 2} r={2} fill="none" stroke="#000" strokeWidth={0.3} />
        ))}
        {/* Center marks */}
        <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="1,0.5" />
        <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="1,0.5" />
        {/* Dimensions */}
        <DimLine x1={cx - flangeW / 2} y1={cy + webH / 2 + flangeH} x2={cx + flangeW / 2} y2={cy + webH / 2 + flangeH} label={`${dims.width}"`} offset={12} side="bottom" />
        <DimLine x1={cx + flangeW / 2} y1={cy - webH / 2 - flangeH} x2={cx + flangeW / 2} y2={cy + webH / 2 + flangeH} label={`${dims.height}"`} offset={10} side="right" />
      </g>

      {/* === Elevation: Column === */}
      <g>
        {/* Column outline */}
        <rect x={sx} y={sy} width={24} height={colHeight} fill="#f0f0f0" stroke="#000" strokeWidth={0.5} />
        {/* Base plate */}
        <rect x={sx - 5} y={sy + colHeight} width={34} height={3} fill="#d0d0d0" stroke="#000" strokeWidth={0.5} />
        {/* Cap plate */}
        <rect x={sx - 3} y={sy - 2.5} width={30} height={2.5} fill="#d0d0d0" stroke="#000" strokeWidth={0.5} />
        {/* Web line */}
        <line x1={sx + 12} y1={sy} x2={sx + 12} y2={sy + colHeight} stroke="#000" strokeWidth={0.2} strokeDasharray="2,1" />
        {/* Anchor bolts */}
        {[0.25, 0.75].map((pos, i) => (
          <g key={i}>
            <line x1={sx + 24 * pos} y1={sy + colHeight + 3} x2={sx + 24 * pos} y2={sy + colHeight + 8} stroke="#000" strokeWidth={0.4} />
            <line x1={sx + 24 * pos - 2} y1={sy + colHeight + 8} x2={sx + 24 * pos + 2} y2={sy + colHeight + 8} stroke="#000" strokeWidth={0.4} />
          </g>
        ))}
        {/* Section cut B-B */}
        <line x1={sx - 4} y1={sy + colHeight * 0.45} x2={sx + 28} y2={sy + colHeight * 0.45} stroke="#0066cc" strokeWidth={0.4} strokeDasharray="2,1" />
        <text x={sx - 7} y={sy + colHeight * 0.45 + 1} fontSize={3} fill="#0066cc" fontWeight="bold">B</text>
        <text x={sx + 30} y={sy + colHeight * 0.45 + 1} fontSize={3} fill="#0066cc" fontWeight="bold">B</text>
        {/* Height dimension */}
        <DimLine x1={sx + 24} y1={sy} x2={sx + 24} y2={sy + colHeight} label={`${dims.length}"`} offset={14} side="right" />
      </g>

      {/* Notes */}
      <text x={8} y={115} fontSize={2.2} fill="#333" fontFamily="sans-serif">NOTES:</text>
      <text x={8} y={119} fontSize={2} fill="#555">1. ALL DIMENSIONS IN INCHES UNLESS OTHERWISE NOTED</text>
      <text x={8} y={122.5} fontSize={2} fill="#555">2. {specs.substring(0, 60)}</text>
      <text x={8} y={126} fontSize={2} fill="#555">3. BASE PLATE TO BE LEVELED AND GROUTED</text>
    </g>
  )
}

function BusDuctDrawing({ dims, specs }: { dims: DrawingDimensions; specs: string }) {
  // Cross-section view
  const cx = 55, cy = 60
  const casingW = 24, casingH = 32
  const conductorW = 3, conductorGap = 5

  // Side/length view
  const sx = 120, sy = 48
  const ductLen = 65

  return (
    <g>
      <text x={cx} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">SECTION C-C</text>
      <text x={sx + ductLen / 2} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">SIDE VIEW</text>

      {/* === Cross section === */}
      <g>
        {/* Outer casing */}
        <rect x={cx - casingW / 2} y={cy - casingH / 2} width={casingW} height={casingH} fill="#f5f5f5" stroke="#000" strokeWidth={0.6} rx={1} />
        {/* Inner insulation */}
        <rect x={cx - casingW / 2 + 1.5} y={cy - casingH / 2 + 1.5} width={casingW - 3} height={casingH - 3} fill="#fff8e1" stroke="#ff9800" strokeWidth={0.3} strokeDasharray="1,0.5" rx={0.5} />
        {/* Conductors (3-phase + neutral) */}
        {[-1.5, -0.5, 0.5, 1.5].map((pos, i) => {
          const color = i === 3 ? "#4caf50" : "#d32f2f"
          const label = i === 3 ? "N" : `L${i + 1}`
          return (
            <g key={i}>
              <rect x={cx - conductorW / 2} y={cy - casingH / 2 + 4 + i * conductorGap} width={conductorW} height={2} fill={color} stroke="#000" strokeWidth={0.3} opacity={0.8} rx={0.3} />
              <text x={cx + conductorW / 2 + 2} y={cy - casingH / 2 + 5.5 + i * conductorGap} fontSize={2} fill="#333">{label}</text>
            </g>
          )
        })}
        {/* Insulation between conductors */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={cx - conductorW / 2 - 0.5} y={cy - casingH / 2 + 6 + i * conductorGap} width={conductorW + 1} height={conductorGap - 2} fill="#fff8e1" stroke="none" opacity={0.5} />
        ))}
        {/* Dimensions */}
        <DimLine x1={cx - casingW / 2} y1={cy + casingH / 2} x2={cx + casingW / 2} y2={cy + casingH / 2} label={`${dims.width}"`} offset={10} side="bottom" />
        <DimLine x1={cx + casingW / 2} y1={cy - casingH / 2} x2={cx + casingW / 2} y2={cy + casingH / 2} label={`${dims.height}"`} offset={12} side="right" />
      </g>

      {/* === Side view === */}
      <g>
        {/* Duct body */}
        <rect x={sx} y={sy} width={ductLen} height={20} fill="#f0f0f0" stroke="#000" strokeWidth={0.5} rx={0.5} />
        {/* Top/bottom lines showing casing */}
        <line x1={sx} y1={sy + 1.5} x2={sx + ductLen} y2={sy + 1.5} stroke="#999" strokeWidth={0.2} />
        <line x1={sx} y1={sy + 18.5} x2={sx + ductLen} y2={sy + 18.5} stroke="#999" strokeWidth={0.2} />
        {/* Internal conductors (visible as lines) */}
        {[5, 8, 11, 14].map((yOff, i) => (
          <line key={i} x1={sx + 2} y1={sy + yOff} x2={sx + ductLen - 2} y2={sy + yOff} stroke={i === 3 ? "#4caf50" : "#d32f2f"} strokeWidth={0.4} />
        ))}
        {/* Joint flanges */}
        {[0, 0.5, 1].map((pos, i) => (
          <g key={i}>
            <rect x={sx + ductLen * pos - 1} y={sy - 1.5} width={2} height={23} fill="#ccc" stroke="#000" strokeWidth={0.3} />
            {/* Bolts */}
            <circle cx={sx + ductLen * pos} cy={sy + 2} r={0.8} fill="#666" stroke="#000" strokeWidth={0.2} />
            <circle cx={sx + ductLen * pos} cy={sy + 18} r={0.8} fill="#666" stroke="#000" strokeWidth={0.2} />
          </g>
        ))}
        {/* Section cut C-C */}
        <line x1={sx + ductLen * 0.25} y1={sy - 6} x2={sx + ductLen * 0.25} y2={sy + 26} stroke="#0066cc" strokeWidth={0.4} strokeDasharray="2,1" />
        <text x={sx + ductLen * 0.25 - 4} y={sy - 7} fontSize={3} fill="#0066cc" fontWeight="bold">C</text>
        <text x={sx + ductLen * 0.25 - 4} y={sy + 29} fontSize={3} fill="#0066cc" fontWeight="bold">C</text>
        {/* Length dimension */}
        <DimLine x1={sx} y1={sy + 20} x2={sx + ductLen} y2={sy + 20} label={`${dims.length}"`} offset={12} side="bottom" />
        {/* Mounting brackets */}
        {[0.2, 0.8].map((pos, i) => (
          <g key={i}>
            <rect x={sx + ductLen * pos - 2} y={sy + 20} width={4} height={3} fill="#999" stroke="#000" strokeWidth={0.3} />
            <line x1={sx + ductLen * pos} y1={sy + 23} x2={sx + ductLen * pos} y2={sy + 26} stroke="#000" strokeWidth={0.3} />
          </g>
        ))}
      </g>

      {/* Notes */}
      <text x={8} y={108} fontSize={2.2} fill="#333" fontFamily="sans-serif">NOTES:</text>
      <text x={8} y={112} fontSize={2} fill="#555">1. ALL DIMENSIONS IN INCHES UNLESS OTHERWISE NOTED</text>
      <text x={8} y={115.5} fontSize={2} fill="#555">2. 400A RATED, UL LISTED, NEMA 3R, IP54 PROTECTION</text>
      <text x={8} y={119} fontSize={2} fill="#555">3. COPPER/ALUMINUM CONDUCTORS PER SPECIFICATION</text>
      <text x={8} y={122.5} fontSize={2} fill="#555">4. ALL JOINTS TO BE TORQUED PER MANUFACTURER SPECS</text>
    </g>
  )
}

function GenericDrawing({ dims, title, specs }: { dims: DrawingDimensions; title: string; specs: string }) {
  const cx = 90, cy = 60

  return (
    <g>
      <text x={cx} y={38} textAnchor="middle" fontSize={3} fill="#666" fontStyle="italic">GENERAL ARRANGEMENT</text>
      {/* Generic box representation */}
      <g>
        {/* 3D-ish box */}
        <polygon points={`${cx - 30},${cy - 10} ${cx + 30},${cy - 10} ${cx + 30},${cy + 15} ${cx - 30},${cy + 15}`} fill="#f0f0f0" stroke="#000" strokeWidth={0.5} />
        <polygon points={`${cx - 30},${cy - 10} ${cx - 20},${cy - 20} ${cx + 40},${cy - 20} ${cx + 30},${cy - 10}`} fill="#e0e0e0" stroke="#000" strokeWidth={0.5} />
        <polygon points={`${cx + 30},${cy - 10} ${cx + 40},${cy - 20} ${cx + 40},${cy + 5} ${cx + 30},${cy + 15}`} fill="#d8d8d8" stroke="#000" strokeWidth={0.5} />
        {/* Center lines */}
        <line x1={cx - 35} y1={cy + 2.5} x2={cx + 35} y2={cy + 2.5} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="3,1,0.5,1" />
        <line x1={cx} y1={cy - 15} x2={cx} y2={cy + 20} stroke="#0066cc" strokeWidth={0.2} strokeDasharray="3,1,0.5,1" />
        {/* Dimensions */}
        <DimLine x1={cx - 30} y1={cy + 15} x2={cx + 30} y2={cy + 15} label={`${dims.length}"`} offset={12} side="bottom" />
        <DimLine x1={cx + 30} y1={cy - 10} x2={cx + 30} y2={cy + 15} label={`${dims.height}"`} offset={14} side="right" />
        {/* Top dimension */}
        <DimLine x1={cx + 30} y1={cy - 10} x2={cx + 40} y2={cy - 20} label={`${dims.width}"`} offset={0} side="top" />
      </g>
      {/* Label */}
      <text x={cx} y={cy + 3} textAnchor="middle" fontSize={2.5} fill="#666">{title.substring(0, 30)}</text>

      {/* Notes */}
      <text x={8} y={108} fontSize={2.2} fill="#333" fontFamily="sans-serif">NOTES:</text>
      <text x={8} y={112} fontSize={2} fill="#555">1. ALL DIMENSIONS IN INCHES UNLESS OTHERWISE NOTED</text>
      <text x={8} y={115.5} fontSize={2} fill="#555">2. {specs.substring(0, 65)}</text>
      <text x={8} y={119} fontSize={2} fill="#555">3. SEE SPECIFICATIONS FOR MATERIAL AND FINISH REQUIREMENTS</text>
    </g>
  )
}

export default function EngineeringDrawingPreview(props: EngineeringDrawingPreviewProps) {
  const drawingType = useMemo(() => detectDrawingType(props.title), [props.title])
  const dims = props.dimensions || { length: 100, width: 10, height: 10, weight: 0 }

  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
      <svg
        viewBox="0 0 210 148.5"
        className="w-full h-auto"
        style={{ minHeight: "400px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Defs for arrow markers */}
        <defs>
          <marker id="arrowEnd" viewBox="0 0 6 6" refX="5" refY="3" markerWidth={4} markerHeight={4} orient="auto-start-reverse">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="#333" />
          </marker>
          <marker id="arrowStart" viewBox="0 0 6 6" refX="1" refY="3" markerWidth={4} markerHeight={4} orient="auto-start-reverse">
            <path d="M 6 0 L 0 3 L 6 6 z" fill="#333" />
          </marker>
        </defs>

        {/* Drawing border */}
        <rect x={2} y={2} width={206} height={144.5} fill="white" stroke="#000" strokeWidth={0.8} />
        <rect x={5} y={5} width={200} height={138.5} fill="white" stroke="#000" strokeWidth={0.4} />

        {/* Drawing content based on type */}
        {drawingType === "i-beam" && <IBeamDrawing dims={dims} specs={props.specifications} />}
        {drawingType === "column" && <ColumnDrawing dims={dims} specs={props.specifications} />}
        {drawingType === "bus-duct" && <BusDuctDrawing dims={dims} specs={props.specifications} />}
        {drawingType === "generic" && <GenericDrawing dims={dims} title={props.title} specs={props.specifications} />}

        {/* Title Block */}
        <TitleBlock x={110} y={130} width={95} height={12} drawing={props} />

        {/* Tolerance block (top-right) */}
        <g>
          <rect x={160} y={7} width={42} height={14} fill="white" stroke="#000" strokeWidth={0.3} />
          <text x={181} y={11} textAnchor="middle" fontSize={2} fill="#666" fontWeight="bold">TOLERANCES</text>
          <text x={162} y={14.5} fontSize={1.8} fill="#333">UNLESS NOTED:</text>
          <text x={162} y={17.5} fontSize={1.8} fill="#333">{props.tolerances || "±1/16\""}</text>
        </g>

        {/* Third angle projection symbol */}
        <g transform="translate(150, 135)">
          <circle cx={0} cy={0} r={3} fill="none" stroke="#000" strokeWidth={0.3} />
          <circle cx={0} cy={0} r={1.5} fill="none" stroke="#000" strokeWidth={0.3} />
          <line x1={-3} y1={0} x2={3} y2={0} stroke="#000" strokeWidth={0.3} />
          <line x1={0} y1={-3} x2={0} y2={3} stroke="#000" strokeWidth={0.3} />
        </g>
      </svg>
    </div>
  )
}
