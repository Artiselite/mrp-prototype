'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  Activity
} from 'lucide-react'
import { copperLMEAPI, formatCurrency, formatPrice } from '@/lib/services/copper-lme-api'
import { MarketData, CopperLMEPrice } from '@/lib/types'

export default function MarketDataDashboard() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [copperPrices, setCopperPrices] = useState<CopperLMEPrice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceAlerts, setPriceAlerts] = useState<any[]>([])

  const fetchMarketData = async () => {
    setIsLoading(true)
    try {
      const [market, prices, alerts] = await Promise.all([
        copperLMEAPI.getMarketData(),
        copperLMEAPI.getHistoricalPrices(7), // Last 7 days
        copperLMEAPI.getPriceAlerts(0.05) // 5% threshold
      ])
      
      setMarketData(market)
      setCopperPrices(prices)
      setPriceAlerts(alerts)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    
    // Set up real-time updates every 30 seconds
    const unsubscribe = copperLMEAPI.subscribeToPriceUpdates((price) => {
      setCopperPrices(prev => [price, ...prev.slice(0, 6)]) // Keep last 7 prices
    }, 30000)

    return () => unsubscribe()
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'Down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Up':
        return 'text-green-600'
      case 'Down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getVolatilityColor = (volatility: number) => {
    if (volatility < 0.05) return 'bg-green-100 text-green-800'
    if (volatility < 0.10) return 'bg-yellow-100 text-yellow-800'
    if (volatility < 0.15) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getAlertColor = (alert: string) => {
    switch (alert) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Data Dashboard</h2>
          <p className="text-gray-600">Real-time commodity prices and market analysis</p>
        </div>
        <Button onClick={fetchMarketData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Price Alerts */}
      {priceAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Price Alerts ({priceAlerts.length})</div>
            <div className="space-y-1">
              {priceAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">
                    {alert.commodity}: {formatPrice(alert.currentPrice)}
                  </span>
                  <Badge className={getAlertColor(alert.alert)}>
                    {alert.changePercent > 0 ? '+' : ''}{alert.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Market Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketData.map((commodity) => (
          <Card key={commodity.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{commodity.commodity}</CardTitle>
                {getTrendIcon(commodity.trend)}
              </div>
              <CardDescription>
                {commodity.source} • {commodity.unit}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                {formatPrice(commodity.price, commodity.unit)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">24h Change</p>
                  <p className={`font-medium ${getTrendColor(commodity.trend)}`}>
                    {commodity.change24h > 0 ? '+' : ''}{formatCurrency(commodity.change24h)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Change %</p>
                  <p className={`font-medium ${getTrendColor(commodity.trend)}`}>
                    {commodity.changePercent24h > 0 ? '+' : ''}{commodity.changePercent24h.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Volatility</span>
                <Badge className={getVolatilityColor(commodity.volatility)}>
                  {(commodity.volatility * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="text-xs text-gray-500">
                Last updated: {new Date(commodity.lastUpdated).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Copper Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Copper LME Price Trend (7 Days)
          </CardTitle>
          <CardDescription>
            Historical copper prices and volatility analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {copperPrices.length > 0 ? (
            <div className="space-y-4">
              {/* Simple price chart representation */}
              <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
                {copperPrices.map((price, index) => {
                  const maxPrice = Math.max(...copperPrices.map(p => p.price))
                  const minPrice = Math.min(...copperPrices.map(p => p.price))
                  const height = ((price.price - minPrice) / (maxPrice - minPrice)) * 100
                  
                  return (
                    <div key={price.id} className="flex flex-col items-center">
                      <div 
                        className="bg-blue-500 w-4 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(price.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Price statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Current Price</p>
                  <p className="font-semibold">{formatPrice(copperPrices[0]?.price || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">7-Day High</p>
                  <p className="font-semibold">{formatPrice(Math.max(...copperPrices.map(p => p.price)))}</p>
                </div>
                <div>
                  <p className="text-gray-600">7-Day Low</p>
                  <p className="font-semibold">{formatPrice(Math.min(...copperPrices.map(p => p.price)))}</p>
                </div>
                <div>
                  <p className="text-gray-600">Volatility</p>
                  <p className="font-semibold">
                    {copperLMEAPI.calculateVolatility(copperPrices).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading price data...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>
            Analysis and recommendations based on current market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Copper Market</h4>
                <p className="text-sm text-blue-700">
                  Copper prices are showing moderate volatility. Consider implementing 
                  price hedging strategies for long-term projects.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Risk Management</h4>
                <p className="text-sm text-green-700">
                  Current market conditions suggest implementing fixed-price contracts 
                  with suppliers to mitigate price volatility risks.
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Last Updated:</strong> {lastUpdated?.toLocaleString()}
              </p>
              <p>
                <strong>Data Source:</strong> London Metal Exchange (LME) via API integration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
