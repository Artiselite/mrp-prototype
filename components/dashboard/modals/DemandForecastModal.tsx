"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, AlertTriangle } from "lucide-react"

interface DemandForecastModalProps {
    open: boolean
    onClose: () => void
}

export default function DemandForecastModal({ open, onClose }: DemandForecastModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full !max-w-[1200px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-blue-800">
                        <TrendingUp className="w-6 h-6" />
                        <span>Q4 Demand Forecast - Detailed Analysis</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-3">AI Prediction Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-medium text-blue-700">Overall Demand Increase:</div>
                                <div className="text-2xl font-bold text-blue-800">+23%</div>
                                <div className="text-blue-600">vs. Q3 2024</div>
                            </div>
                            <div>
                                <div className="font-medium text-blue-700">AI Confidence Level:</div>
                                <div className="text-2xl font-bold text-blue-800">89%</div>
                                <div className="text-blue-600">Based on 12 months data</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Product-Specific Forecasts</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                                <div>
                                    <div className="font-medium text-green-800">Product A - Structural Steel</div>
                                    <div className="text-sm text-green-600">Primary construction material</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-800">+45%</div>
                                    <div className="text-sm text-green-600">Demand increase</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                                <div>
                                    <div className="font-medium text-blue-800">Product B - Welding Equipment</div>
                                    <div className="text-sm text-blue-600">Industrial welding systems</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-800">+18%</div>
                                    <div className="text-sm text-blue-600">Demand increase</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">AI Recommendations</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-800">Immediate Actions (Week 1-2)</div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    • Increase production capacity by 30%<br />
                                    • Pre-order critical materials (6-8 week lead time)<br />
                                    • Schedule overtime for welding lines
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="font-medium text-blue-800">Short-term Planning (Week 3-4)</div>
                                <div className="text-sm text-blue-700 mt-1">
                                    • Adjust inventory levels for high-demand items<br />
                                    • Coordinate with suppliers for increased volumes<br />
                                    • Review workforce capacity and training needs
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                                <div className="font-medium text-green-800">Long-term Strategy (Month 2-3)</div>
                                <div className="text-sm text-green-700 mt-1">
                                    • Evaluate permanent capacity expansion<br />
                                    • Develop supplier partnerships for scalability<br />
                                    • Implement demand forecasting automation
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">Risk Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-red-50 rounded border border-red-200">
                                <div className="text-red-600 font-medium">High Risk</div>
                                <div className="text-sm text-red-600">Material shortages</div>
                                <div className="text-xs text-red-500 mt-1">Probability: 35%</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
                                <div className="text-yellow-600 font-medium">Medium Risk</div>
                                <div className="text-sm text-yellow-600">Capacity constraints</div>
                                <div className="text-xs text-yellow-500 mt-1">Probability: 45%</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                                <div className="text-green-600 font-medium">Low Risk</div>
                                <div className="text-sm text-green-600">Quality issues</div>
                                <div className="text-xs text-green-500 mt-1">Probability: 20%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
