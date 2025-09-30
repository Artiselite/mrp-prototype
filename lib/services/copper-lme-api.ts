import { CopperLMEPrice, MarketData } from '@/lib/types'

// Mock API service for Copper LME pricing
// In production, this would integrate with real LME APIs or financial data providers

export class CopperLMEAPI {
  private static instance: CopperLMEAPI
  private baseUrl = 'https://api.lme.com' // Mock URL
  private apiKey = process.env.LME_API_KEY || 'mock-key'

  static getInstance(): CopperLMEAPI {
    if (!CopperLMEAPI.instance) {
      CopperLMEAPI.instance = new CopperLMEAPI()
    }
    return CopperLMEAPI.instance
  }

  // Mock implementation - replace with real API calls
  async getCurrentCopperPrice(): Promise<CopperLMEPrice> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock data - in production, this would be real API data
    const mockPrice = {
      id: 'lme_copper_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      price: 40000 + (Math.random() - 0.5) * 1000, // Simulate price volatility in RM
      currency: 'MYR',
      source: 'LME',
      timestamp: new Date().toISOString(),
      change24h: (Math.random() - 0.5) * 300,
      changePercent24h: (Math.random() - 0.5) * 4
    }

    // Calculate percentage change
    mockPrice.changePercent24h = (mockPrice.change24h / (mockPrice.price - mockPrice.change24h)) * 100

    return mockPrice
  }

  async getHistoricalPrices(days: number = 30): Promise<CopperLMEPrice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const prices: CopperLMEPrice[] = []
    const basePrice = 40000
    const today = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulate historical price with some volatility
      const volatility = (Math.random() - 0.5) * 0.1 // ±5% daily variation
      const price = basePrice * (1 + volatility * (days - i) / days)
      
      prices.push({
        id: `lme_copper_${date.toISOString().split('T')[0]}`,
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        currency: 'MYR',
        source: 'LME',
        timestamp: date.toISOString(),
        change24h: i === 0 ? (Math.random() - 0.5) * 300 : undefined,
        changePercent24h: i === 0 ? (Math.random() - 0.5) * 4 : undefined
      })
    }

    return prices
  }

  async getMarketData(): Promise<MarketData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))

    const commodities = [
      {
        id: 'copper_lme',
        commodity: 'Copper',
        price: 40000 + (Math.random() - 0.5) * 1000,
        currency: 'MYR',
        unit: 'per metric ton',
        source: 'LME',
        lastUpdated: new Date().toISOString(),
        change24h: (Math.random() - 0.5) * 300,
        changePercent24h: (Math.random() - 0.5) * 4,
        volatility: 0.15,
        trend: Math.random() > 0.5 ? 'Up' : 'Down' as 'Up' | 'Down' | 'Stable'
      },
      {
        id: 'aluminum_lme',
        commodity: 'Aluminum',
        price: 10560 + (Math.random() - 0.5) * 480,
        currency: 'MYR',
        unit: 'per metric ton',
        source: 'LME',
        lastUpdated: new Date().toISOString(),
        change24h: (Math.random() - 0.5) * 50,
        changePercent24h: (Math.random() - 0.5) * 2,
        volatility: 0.08,
        trend: Math.random() > 0.5 ? 'Up' : 'Down' as 'Up' | 'Down' | 'Stable'
      },
      {
        id: 'zinc_lme',
        commodity: 'Zinc',
        price: 13440 + (Math.random() - 0.5) * 720,
        currency: 'MYR',
        unit: 'per metric ton',
        source: 'LME',
        lastUpdated: new Date().toISOString(),
        change24h: (Math.random() - 0.5) * 80,
        changePercent24h: (Math.random() - 0.5) * 3,
        volatility: 0.12,
        trend: Math.random() > 0.5 ? 'Up' : 'Down' as 'Up' | 'Down' | 'Stable'
      }
    ]

    return commodities
  }

  // Calculate price volatility over a period
  calculateVolatility(prices: CopperLMEPrice[]): number {
    if (prices.length < 2) return 0

    const returns = []
    for (let i = 1; i < prices.length; i++) {
      const returnValue = (prices[i].price - prices[i - 1].price) / prices[i - 1].price
      returns.push(returnValue)
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    return Math.sqrt(variance) * Math.sqrt(252) // Annualized volatility
  }

  // Get price alerts for significant changes
  async getPriceAlerts(threshold: number = 0.05): Promise<{
    commodity: string
    currentPrice: number
    changePercent: number
    alert: 'High' | 'Medium' | 'Low'
  }[]> {
    const marketData = await this.getMarketData()
    
    return marketData
      .filter(data => Math.abs(data.changePercent24h) >= threshold * 100)
      .map(data => ({
        commodity: data.commodity,
        currentPrice: data.price,
        changePercent: data.changePercent24h,
        alert: Math.abs(data.changePercent24h) >= 0.1 ? 'High' : 
               Math.abs(data.changePercent24h) >= 0.05 ? 'Medium' : 'Low'
      }))
  }

  // Subscribe to real-time price updates (WebSocket simulation)
  subscribeToPriceUpdates(
    callback: (price: CopperLMEPrice) => void,
    interval: number = 30000 // 30 seconds
  ): () => void {
    const intervalId = setInterval(async () => {
      try {
        const price = await this.getCurrentCopperPrice()
        callback(price)
      } catch (error) {
        console.error('Error fetching copper price:', error)
      }
    }, interval)

    // Return unsubscribe function
    return () => clearInterval(intervalId)
  }
}

// Export singleton instance
export const copperLMEAPI = CopperLMEAPI.getInstance()

// Utility functions for price calculations
export const calculateCopperCost = (weightKg: number, pricePerTon: number): number => {
  return (weightKg / 1000) * pricePerTon
}

export const calculatePriceImpact = (
  baseCost: number,
  copperWeight: number,
  priceChange: number
): number => {
  const copperCostChange = calculateCopperCost(copperWeight, priceChange)
  return (copperCostChange / baseCost) * 100
}

export const formatCurrency = (amount: number, currency: string = 'MYR'): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatPrice = (price: number, unit: string = 'per metric ton'): string => {
  return `RM${price.toLocaleString()} ${unit}`
}
