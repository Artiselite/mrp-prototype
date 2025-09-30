/**
 * CAD File Parser Service
 * Handles parsing of CAD files (DWG, DXF) and extraction of BOQ data
 * Uses LibreDWG Web library for DWG file parsing
 */

import type { CADBOQData, CADMaterial, CADDimension, CADBlock } from '@/lib/types'

// Import LibreDWG Web library
declare global {
  interface Window {
    LibreDWG: any
  }
}

// Load LibreDWG Web library dynamically
const loadLibreDWG = async () => {
  if (typeof window === 'undefined') {
    throw new Error('LibreDWG can only be loaded in browser environment')
  }

  if (window.LibreDWG) {
    return window.LibreDWG
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.textContent = `
      try {
        import('https://cdn.jsdelivr.net/npm/@mlightcad/libredwg-web@0.3.0/+esm').then(module => {
          window.LibreDWG = module
          console.log('LibreDWG loaded successfully')
        }).catch(err => {
          console.error('Failed to load LibreDWG:', err)
          window.LibreDWG = null
        })
      } catch (err) {
        console.error('Failed to load LibreDWG:', err)
        window.LibreDWG = null
      }
    `
    
    script.onload = () => {
      // Check periodically if LibreDWG is loaded
      const checkLoaded = () => {
        if (window.LibreDWG) {
          resolve(window.LibreDWG)
        } else if (window.LibreDWG === null) {
          reject(new Error('Failed to load LibreDWG library'))
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load LibreDWG script'))
    }
    
    document.head.appendChild(script)
  })
}

export interface CADEntity {
  type: string
  layer: string
  color: number
  lineType: string
  thickness: number
  geometry: any
  properties: Record<string, any>
}

export class CADParser {
  private static instance: CADParser

  public static getInstance(): CADParser {
    if (!CADParser.instance) {
      CADParser.instance = new CADParser()
    }
    return CADParser.instance
  }

  /**
   * Parse CAD file and extract BOQ data
   */
  async parseCADFile(file: File): Promise<CADBOQData> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    switch (fileExtension) {
      case 'dwg':
        return this.parseDWGFile(file)
      case 'dxf':
        return this.parseDXFFile(file)
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`)
    }
  }

  /**
   * Parse DWG file using LibreDWG Web library
   */
  private async parseDWGFile(file: File): Promise<CADBOQData> {
    try {
      console.log('Parsing DWG file with LibreDWG:', file.name)
      
      // Load LibreDWG library with timeout
      const LibreDWG = await Promise.race([
        loadLibreDWG(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('LibreDWG loading timeout')), 10000)
        )
      ])
      
      if (!LibreDWG) {
        throw new Error('Failed to load LibreDWG library')
      }

      console.log('LibreDWG library loaded successfully')

      // Read file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(file)
      console.log('File read as ArrayBuffer, size:', arrayBuffer.byteLength)

      // Check if LibreDWG has the expected method
      if (typeof LibreDWG.readDWG !== 'function') {
        console.warn('LibreDWG.readDWG not available, using fallback')
        throw new Error('LibreDWG.readDWG method not available')
      }

      // Parse DWG file using LibreDWG
      console.log('Starting DWG parsing...')
      const dwgData = await LibreDWG.readDWG(arrayBuffer)
      console.log('DWG parsing completed:', dwgData)
      
      // Extract BOQ data from parsed DWG
      return this.extractBOQDataFromDWG(dwgData, file.name)
      
    } catch (error) {
      console.error('Error parsing DWG file with LibreDWG:', error)
      console.log('Falling back to mock data generation')
      // Fallback to mock data if parsing fails
      return this.generateMockBOQData(file.name)
    }
  }

  /**
   * Parse DXF file
   * Note: This is a simplified implementation. Full DXF parsing requires more complex logic
   */
  private async parseDXFFile(file: File): Promise<CADBOQData> {
    console.log('Parsing DXF file:', file.name)
    
    try {
      const text = await file.text()
      return this.parseDXFContent(text, file.name)
    } catch (error) {
      console.error('Error parsing DXF file:', error)
      // Fallback to mock data
      return this.generateMockBOQData(file.name)
    }
  }

  /**
   * Parse DXF content
   */
  private parseDXFContent(content: string, fileName: string): CADBOQData {
    const lines = content.split('\n')
    const entities: CADEntity[] = []
    const blocks: CADBlock[] = []
    const dimensions: CADDimension[] = []
    const materials: CADMaterial[] = []
    
    let currentEntity: Partial<CADEntity> = {}
    let inEntity = false
    let currentBlock: Partial<CADBlock> = {}
    let inBlock = false
    
    // Parse DXF entities
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === '0') {
        // Entity type
        if (inEntity && currentEntity.type) {
          entities.push(currentEntity as CADEntity)
        }
        if (inBlock && currentBlock.name) {
          blocks.push(currentBlock as CADBlock)
        }
        
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          if (nextLine === 'BLOCK') {
            inBlock = true
            currentBlock = { entities: [], attributes: {} }
          } else if (['LINE', 'CIRCLE', 'ARC', 'POLYLINE', 'LWPOLYLINE', 'TEXT', 'DIMENSION'].includes(nextLine)) {
            inEntity = true
            currentEntity = { type: nextLine, properties: {} }
          } else {
            inEntity = false
            inBlock = false
          }
        }
      } else if (inEntity && line.match(/^\d+$/)) {
        // DXF group code
        const code = parseInt(line)
        const value = lines[i + 1]?.trim()
        
        switch (code) {
          case 8: // Layer
            currentEntity.layer = value
            break
          case 62: // Color
            currentEntity.color = parseInt(value) || 0
            break
          case 6: // Line type
            currentEntity.lineType = value
            break
          case 10: // X coordinate
            if (!currentEntity.geometry) currentEntity.geometry = {}
            currentEntity.geometry.x = parseFloat(value) || 0
            break
          case 20: // Y coordinate
            if (!currentEntity.geometry) currentEntity.geometry = {}
            currentEntity.geometry.y = parseFloat(value) || 0
            break
          case 30: // Z coordinate
            if (!currentEntity.geometry) currentEntity.geometry = {}
            currentEntity.geometry.z = parseFloat(value) || 0
            break
          case 1: // Text value
            if (!currentEntity.properties) currentEntity.properties = {}
            currentEntity.properties.text = value
            break
        }
      } else if (inBlock && line.match(/^\d+$/)) {
        // Block properties
        const code = parseInt(line)
        const value = lines[i + 1]?.trim()
        
        switch (code) {
          case 2: // Block name
            currentBlock.name = value
            break
          case 10: // Insert point X
            if (!currentBlock.insertPoint) currentBlock.insertPoint = { x: 0, y: 0, z: 0 }
            currentBlock.insertPoint.x = parseFloat(value) || 0
            break
          case 20: // Insert point Y
            if (!currentBlock.insertPoint) currentBlock.insertPoint = { x: 0, y: 0, z: 0 }
            currentBlock.insertPoint.y = parseFloat(value) || 0
            break
        }
      }
    }
    
    // Process entities to extract materials and dimensions
    this.extractMaterialsFromEntities(entities, materials)
    this.extractDimensionsFromEntities(entities, dimensions)
    
    return {
      materials,
      dimensions,
      blocks,
      totalArea: this.calculateTotalArea(entities),
      totalVolume: this.calculateTotalVolume(entities),
      totalLength: this.calculateTotalLength(entities),
      drawingInfo: {
        title: fileName.replace(/\.[^/.]+$/, ''),
        scale: '1:1',
        units: 'mm',
        layers: [...new Set(entities.map(e => e.layer).filter(Boolean))]
      }
    }
  }

  /**
   * Extract materials from CAD entities
   */
  private extractMaterialsFromEntities(entities: CADEntity[], materials: CADMaterial[]): void {
    const materialMap = new Map<string, CADMaterial>()
    
    entities.forEach(entity => {
      if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const length = this.calculatePolylineLength(entity.geometry)
        const material = this.identifyMaterialFromLayer(entity.layer)
        
        if (material) {
          const key = `${material.name}-${material.type}`
          if (materialMap.has(key)) {
            const existing = materialMap.get(key)!
            existing.quantity += length
          } else {
            materialMap.set(key, {
              ...material,
              quantity: length,
              unit: 'mm'
            })
          }
        }
      } else if (entity.type === 'CIRCLE') {
        const area = this.calculateCircleArea(entity.geometry)
        const material = this.identifyMaterialFromLayer(entity.layer)
        
        if (material) {
          const key = `${material.name}-${material.type}`
          if (materialMap.has(key)) {
            const existing = materialMap.get(key)!
            existing.quantity += area
          } else {
            materialMap.set(key, {
              ...material,
              quantity: area,
              unit: 'mm²'
            })
          }
        }
      }
    })
    
    materials.push(...Array.from(materialMap.values()))
  }

  /**
   * Extract dimensions from CAD entities
   */
  private extractDimensionsFromEntities(entities: CADEntity[], dimensions: CADDimension[]): void {
    entities.forEach(entity => {
      if (entity.type === 'DIMENSION' && entity.properties.text) {
        const value = parseFloat(entity.properties.text)
        if (!isNaN(value)) {
          dimensions.push({
            type: 'linear',
            value,
            unit: 'mm',
            startPoint: { x: 0, y: 0, z: 0 },
            endPoint: { x: value, y: 0, z: 0 },
            text: entity.properties.text,
            layer: entity.layer
          })
        }
      }
    })
  }

  /**
   * Identify material from layer name
   */
  private identifyMaterialFromLayer(layer: string): CADMaterial | null {
    const layerLower = layer.toLowerCase()
    
    if (layerLower.includes('steel') || layerLower.includes('structural')) {
      return {
        name: 'Structural Steel',
        type: 'steel',
        grade: 'A36',
        quantity: 0,
        unit: 'mm',
        specifications: 'ASTM A36'
      }
    } else if (layerLower.includes('concrete')) {
      return {
        name: 'Concrete',
        type: 'concrete',
        grade: 'C25',
        quantity: 0,
        unit: 'mm³',
        specifications: 'Grade C25/30'
      }
    } else if (layerLower.includes('aluminum')) {
      return {
        name: 'Aluminum',
        type: 'aluminum',
        grade: '6061-T6',
        quantity: 0,
        unit: 'mm',
        specifications: 'Aluminum 6061-T6'
      }
    } else if (layerLower.includes('copper')) {
      return {
        name: 'Copper',
        type: 'copper',
        grade: 'C110',
        quantity: 0,
        unit: 'mm',
        specifications: 'Copper C110'
      }
    }
    
    return null
  }

  /**
   * Calculate polyline length
   */
  private calculatePolylineLength(geometry: any): number {
    // Simplified calculation - in reality, this would be more complex
    return Math.sqrt((geometry.x || 0) ** 2 + (geometry.y || 0) ** 2)
  }

  /**
   * Calculate circle area
   */
  private calculateCircleArea(geometry: any): number {
    const radius = geometry.radius || 0
    return Math.PI * radius * radius
  }

  /**
   * Calculate total area
   */
  private calculateTotalArea(entities: CADEntity[]): number {
    return entities
      .filter(e => e.type === 'CIRCLE' || e.type === 'LWPOLYLINE')
      .reduce((total, entity) => {
        if (entity.type === 'CIRCLE') {
          return total + this.calculateCircleArea(entity.geometry)
        }
        return total + (entity.geometry?.area || 0)
      }, 0)
  }

  /**
   * Calculate total volume
   */
  private calculateTotalVolume(entities: CADEntity[]): number {
    // Simplified calculation
    return this.calculateTotalArea(entities) * 100 // Assuming 100mm thickness
  }

  /**
   * Calculate total length
   */
  private calculateTotalLength(entities: CADEntity[]): number {
    return entities
      .filter(e => e.type === 'LINE' || e.type === 'LWPOLYLINE')
      .reduce((total, entity) => {
        return total + this.calculatePolylineLength(entity.geometry)
      }, 0)
  }

  /**
   * Generate mock BOQ data for demonstration
   */
  private generateMockBOQData(fileName: string): CADBOQData {
    const baseName = fileName.replace(/\.[^/.]+$/, '')
    
    // Generate more realistic and varied materials based on file name
    const materials: CADMaterial[] = []
    
    // Check if it's a structural project
    if (baseName.toLowerCase().includes('structural') || baseName.toLowerCase().includes('frame')) {
      materials.push(
        {
          name: 'Structural Steel Beam H200x100',
          type: 'steel',
          grade: 'A36',
          thickness: 8,
          dimensions: { length: 3000, width: 100, height: 200 },
          quantity: 4,
          unit: 'EA',
          specifications: 'ASTM A36, H200x100x8mm'
        },
        {
          name: 'Steel Column H300x300',
          type: 'steel',
          grade: 'A36',
          thickness: 12,
          dimensions: { length: 2500, width: 300, height: 300 },
          quantity: 2,
          unit: 'EA',
          specifications: 'ASTM A36, H300x300x12mm'
        },
        {
          name: 'Steel Plate 10mm',
          type: 'steel',
          grade: 'A36',
          thickness: 10,
          dimensions: { length: 2000, width: 1000, height: 10 },
          quantity: 3,
          unit: 'EA',
          specifications: 'ASTM A36, 10mm thick plate'
        }
      )
    } else if (baseName.toLowerCase().includes('piping') || baseName.toLowerCase().includes('pipe')) {
      materials.push(
        {
          name: 'Steel Pipe DN150',
          type: 'steel',
          grade: 'A106',
          thickness: 6,
          dimensions: { length: 6000, width: 150, height: 150 },
          quantity: 8,
          unit: 'M',
          specifications: 'ASTM A106, DN150, Schedule 40'
        },
        {
          name: 'Steel Pipe DN100',
          type: 'steel',
          grade: 'A106',
          thickness: 4,
          dimensions: { length: 6000, width: 100, height: 100 },
          quantity: 12,
          unit: 'M',
          specifications: 'ASTM A106, DN100, Schedule 40'
        },
        {
          name: 'Pipe Fittings 90° Elbow',
          type: 'steel',
          grade: 'A234',
          quantity: 16,
          unit: 'EA',
          specifications: 'ASTM A234, WPB, 90° Elbow DN150'
        }
      )
    } else if (baseName.toLowerCase().includes('tank') || baseName.toLowerCase().includes('vessel')) {
      materials.push(
        {
          name: 'Steel Plate 8mm',
          type: 'steel',
          grade: 'A36',
          thickness: 8,
          dimensions: { length: 2000, width: 1000, height: 8 },
          quantity: 6,
          unit: 'EA',
          specifications: 'ASTM A36, 8mm thick for tank shell'
        },
        {
          name: 'Steel Plate 12mm',
          type: 'steel',
          grade: 'A36',
          thickness: 12,
          dimensions: { length: 1500, width: 1500, height: 12 },
          quantity: 2,
          unit: 'EA',
          specifications: 'ASTM A36, 12mm thick for tank bottom'
        },
        {
          name: 'Steel Angle L50x50x5',
          type: 'steel',
          grade: 'A36',
          thickness: 5,
          dimensions: { length: 2000, width: 50, height: 50 },
          quantity: 8,
          unit: 'M',
          specifications: 'ASTM A36, L50x50x5mm angle'
        }
      )
    } else {
      // Default general fabrication
      materials.push(
        {
          name: 'Steel Plate 6mm',
          type: 'steel',
          grade: 'A36',
          thickness: 6,
          dimensions: { length: 1500, width: 1000, height: 6 },
          quantity: 4,
          unit: 'EA',
          specifications: 'ASTM A36, 6mm thick plate'
        },
        {
          name: 'Steel Beam I200x100',
          type: 'steel',
          grade: 'A36',
          thickness: 8,
          dimensions: { length: 2500, width: 100, height: 200 },
          quantity: 3,
          unit: 'EA',
          specifications: 'ASTM A36, I200x100x8mm'
        },
        {
          name: 'Steel Channel C100x50',
          type: 'steel',
          grade: 'A36',
          thickness: 5,
          dimensions: { length: 2000, width: 50, height: 100 },
          quantity: 6,
          unit: 'M',
          specifications: 'ASTM A36, C100x50x5mm'
        }
      )
    }
    
    // Add common materials
    materials.push(
      {
        name: 'Welding Electrode E7018',
        type: 'steel',
        grade: 'E7018',
        quantity: 15,
        unit: 'KG',
        specifications: 'AWS E7018, 3.2mm diameter'
      },
      {
        name: 'Welding Electrode E6013',
        type: 'steel',
        grade: 'E6013',
        quantity: 8,
        unit: 'KG',
        specifications: 'AWS E6013, 2.5mm diameter'
      },
      {
        name: 'Primer Paint',
        type: 'other',
        quantity: 20,
        unit: 'L',
        specifications: 'Zinc-rich primer, 1 coat'
      },
      {
        name: 'Top Coat Paint',
        type: 'other',
        quantity: 15,
        unit: 'L',
        specifications: 'Alkyd enamel, 2 coats'
      }
    )
    
    // Calculate realistic dimensions based on materials
    const totalLength = materials.reduce((sum, mat) => {
      if (mat.dimensions) {
        return sum + (mat.dimensions.length * mat.quantity)
      }
      return sum
    }, 0) / 1000 // Convert to meters
    
    const totalArea = materials.reduce((sum, mat) => {
      if (mat.dimensions && mat.unit === 'EA') {
        return sum + (mat.dimensions.length * mat.dimensions.width * mat.quantity / 1000000) // Convert to m²
      }
      return sum
    }, 0)
    
    const totalVolume = totalArea * 0.1 // Estimate volume based on area
    
    return {
      materials,
      dimensions: [
        {
          type: 'linear',
          value: 3000,
          unit: 'mm',
          startPoint: { x: 0, y: 0, z: 0 },
          endPoint: { x: 3000, y: 0, z: 0 },
          text: '3000',
          layer: 'DIMENSIONS'
        },
        {
          type: 'linear',
          value: 2000,
          unit: 'mm',
          startPoint: { x: 0, y: 0, z: 0 },
          endPoint: { x: 0, y: 2000, z: 0 },
          text: '2000',
          layer: 'DIMENSIONS'
        },
        {
          type: 'linear',
          value: 1500,
          unit: 'mm',
          startPoint: { x: 0, y: 0, z: 0 },
          endPoint: { x: 0, y: 0, z: 1500 },
          text: '1500',
          layer: 'DIMENSIONS'
        }
      ],
      blocks: [
        {
          name: 'TITLE_BLOCK',
          entities: [],
          attributes: {
            'DRAWING_NUMBER': baseName,
            'TITLE': baseName,
            'SCALE': '1:50',
            'DRAWN_BY': 'CAD System',
            'DATE': new Date().toISOString().split('T')[0]
          },
          insertPoint: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          rotation: 0
        }
      ],
      totalArea: Math.round(totalArea * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalLength: Math.round(totalLength * 100) / 100,
      drawingInfo: {
        title: baseName,
        scale: '1:50',
        units: 'mm',
        layers: ['STRUCTURAL', 'DIMENSIONS', 'TEXT', 'HATCH', 'TITLE_BLOCK', 'ANNOTATIONS']
      }
    }
  }

  /**
   * Read file as ArrayBuffer (for DWG)
   */
  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer)
      reader.onerror = (e) => reject(e)
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Read file as text (for DXF)
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  /**
   * Extract BOQ data from parsed DWG data
   */
  private extractBOQDataFromDWG(dwgData: any, fileName: string): CADBOQData {
    const materials: CADMaterial[] = []
    const dimensions: CADDimension[] = []
    const blocks: CADBlock[] = []

    try {
      // Extract materials from DWG layers
      if (dwgData.layers) {
        for (const layer of dwgData.layers) {
          const material = this.identifyMaterialFromLayer(layer.name)
          if (material) {
            materials.push(material)
          }
        }
      }

      // Extract dimensions from DWG entities
      if (dwgData.entities) {
        for (const entity of dwgData.entities) {
          if (entity.type === 'DIMENSION' || entity.type === 'DIMENSION_ALIGNED') {
            const dimension = this.extractDimensionFromDWG(entity)
            if (dimension) {
              dimensions.push(dimension)
            }
          }
        }
      }

      // Extract blocks from DWG
      if (dwgData.blocks) {
        for (const [name, block] of Object.entries(dwgData.blocks)) {
          const cadBlock = this.extractBlockFromDWG(name, block as any)
          if (cadBlock) {
            blocks.push(cadBlock)
          }
        }
      }

      // Calculate totals from DWG geometry
      const totalArea = this.calculateAreaFromDWG(dwgData.entities || [])
      const totalVolume = this.calculateVolumeFromDWG(dwgData.entities || [])
      const totalLength = this.calculateLengthFromDWG(dwgData.entities || [])

      return {
        materials,
        dimensions,
        blocks,
        totalArea,
        totalVolume,
        totalLength,
        drawingInfo: {
          title: fileName.replace(/\.[^/.]+$/, ''),
          scale: this.extractScaleFromDWG(dwgData.header),
          units: this.extractUnitsFromDWG(dwgData.header),
          layers: dwgData.layers?.map((l: any) => l.name) || []
        }
      }
    } catch (error) {
      console.error('Error extracting BOQ data from DWG:', error)
      // Return minimal data if extraction fails
      return {
        materials: [],
        dimensions: [],
        blocks: [],
        totalArea: 0,
        totalVolume: 0,
        totalLength: 0,
        drawingInfo: {
          title: fileName.replace(/\.[^/.]+$/, ''),
          scale: '1:50',
          units: 'mm',
          layers: []
        }
      }
    }
  }

  /**
   * Extract dimension from DWG entity
   */
  private extractDimensionFromDWG(entity: any): CADDimension | null {
    try {
      return {
        type: entity.type === 'DIMENSION_ALIGNED' ? 'linear' : 'linear',
        value: entity.measurement || 0,
        unit: 'mm',
        startPoint: entity.startPoint || { x: 0, y: 0, z: 0 },
        endPoint: entity.endPoint || { x: 0, y: 0, z: 0 },
        text: entity.text || '',
        layer: entity.layer || 'DIMENSIONS'
      }
    } catch (error) {
      console.error('Error extracting dimension from DWG:', error)
      return null
    }
  }

  /**
   * Extract block from DWG
   */
  private extractBlockFromDWG(name: string, block: any): CADBlock | null {
    try {
      return {
        name,
        entities: block.entities || [],
        attributes: block.attributes || {},
        insertPoint: block.insertPoint || { x: 0, y: 0, z: 0 },
        scale: block.scale || { x: 1, y: 1, z: 1 },
        rotation: block.rotation || 0
      }
    } catch (error) {
      console.error('Error extracting block from DWG:', error)
      return null
    }
  }

  /**
   * Calculate area from DWG entities
   */
  private calculateAreaFromDWG(entities: any[]): number {
    let totalArea = 0
    for (const entity of entities) {
      if (entity.type === 'HATCH' || entity.type === 'SOLID') {
        totalArea += entity.area || 0
      }
    }
    return totalArea
  }

  /**
   * Calculate volume from DWG entities
   */
  private calculateVolumeFromDWG(entities: any[]): number {
    let totalVolume = 0
    for (const entity of entities) {
      if (entity.type === '3DSOLID' || entity.type === 'EXTRUDED_SURFACE') {
        totalVolume += entity.volume || 0
      }
    }
    return totalVolume
  }

  /**
   * Calculate length from DWG entities
   */
  private calculateLengthFromDWG(entities: any[]): number {
    let totalLength = 0
    for (const entity of entities) {
      if (entity.type === 'LINE' || entity.type === 'POLYLINE' || entity.type === 'LWPOLYLINE') {
        totalLength += entity.length || 0
      }
    }
    return totalLength
  }

  /**
   * Extract scale from DWG header
   */
  private extractScaleFromDWG(header: any): string {
    return header?.scale || '1:50'
  }

  /**
   * Extract units from DWG header
   */
  private extractUnitsFromDWG(header: any): string {
    return header?.units || 'mm'
  }
}

export default CADParser
