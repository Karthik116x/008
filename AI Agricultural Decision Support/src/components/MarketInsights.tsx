import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  MapPin,
  Calendar,
  Truck,
  AlertCircle,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MarketInsightsProps {
  language: string;
}

export function MarketInsights({ language }: MarketInsightsProps) {
  const [selectedCrop, setSelectedCrop] = useState('tomatoes');
  const [selectedRegion, setSelectedRegion] = useState('maharashtra');
  const [timeframe, setTimeframe] = useState('30days');

  // Mock market data
  const marketData = {
    tomatoes: {
      currentPrice: 45,
      previousPrice: 40,
      change: 12.5,
      unit: '₹/kg',
      demand: 'High',
      supply: 'Medium',
      forecast: 'Rising',
      priceHistory: [
        { date: '1 Jan', price: 38 },
        { date: '8 Jan', price: 42 },
        { date: '15 Jan', price: 40 },
        { date: '22 Jan', price: 44 },
        { date: '29 Jan', price: 45 },
        { date: '5 Feb', price: 48 },
        { date: '12 Feb', price: 46 }
      ],
      regions: [
        { name: 'Nashik', price: 45, change: 12 },
        { name: 'Pune', price: 47, change: 15 },
        { name: 'Mumbai', price: 52, change: 8 },
        { name: 'Aurangabad', price: 43, change: 10 }
      ]
    },
    cotton: {
      currentPrice: 6200,
      previousPrice: 6500,
      change: -4.6,
      unit: '₹/quintal',
      demand: 'Medium',
      supply: 'High',
      forecast: 'Stable',
      priceHistory: [
        { date: '1 Jan', price: 6800 },
        { date: '8 Jan', price: 6600 },
        { date: '15 Jan', price: 6400 },
        { date: '22 Jan', price: 6300 },
        { date: '29 Jan', price: 6200 },
        { date: '5 Feb', price: 6100 },
        { date: '12 Feb', price: 6200 }
      ],
      regions: [
        { name: 'Nashik', price: 6200, change: -5 },
        { name: 'Pune', price: 6150, change: -3 },
        { name: 'Mumbai', price: 6300, change: -2 },
        { name: 'Aurangabad', price: 6100, change: -6 }
      ]
    },
    sugarcane: {
      currentPrice: 3200,
      previousPrice: 2950,
      change: 8.5,
      unit: '₹/quintal',
      demand: 'High',
      supply: 'Low',
      forecast: 'Rising',
      priceHistory: [
        { date: '1 Jan', price: 2800 },
        { date: '8 Jan', price: 2900 },
        { date: '15 Jan', price: 3000 },
        { date: '22 Jan', price: 3100 },
        { date: '29 Jan', price: 3200 },
        { date: '5 Feb', price: 3250 },
        { date: '12 Feb', price: 3200 }
      ],
      regions: [
        { name: 'Nashik', price: 3200, change: 8 },
        { name: 'Pune', price: 3150, change: 7 },
        { name: 'Mumbai', price: 3300, change: 10 },
        { name: 'Aurangabad', price: 3100, change: 6 }
      ]
    }
  };

  const currentData = marketData[selectedCrop];

  const demandSupplyData = [
    { name: 'Demand', value: currentData.demand === 'High' ? 75 : currentData.demand === 'Medium' ? 50 : 25, fill: '#10b981' },
    { name: 'Supply', value: currentData.supply === 'High' ? 75 : currentData.supply === 'Medium' ? 50 : 25, fill: '#f59e0b' }
  ];

  const translations = {
    en: {
      title: 'Market Insights & Pricing',
      subtitle: 'Real-time market data and price trends for informed decisions',
      currentPrice: 'Current Price',
      priceChange: 'Price Change',
      demand: 'Demand',
      supply: 'Supply',
      forecast: 'Forecast',
      priceHistory: 'Price History',
      regionalPrices: 'Regional Prices',
      marketAlerts: 'Market Alerts',
      recommendations: 'Recommendations',
      selectCrop: 'Select Crop',
      selectRegion: 'Select Region',
      timeframe: 'Timeframe'
    },
    hi: {
      title: 'बाजार जानकारी और मूल्य निर्धारण',
      subtitle: 'सूचित निर्णयों के लिए रीयल-टाइम बाजार डेटा और मूल्य रुझान',
      currentPrice: 'वर्तमान मूल्य',
      priceChange: 'मूल्य परिवर्तन',
      demand: 'मांग',
      supply: 'आपूर्ति',
      forecast: 'पूर्वानुमान',
      priceHistory: 'मूल्य इतिहास',
      regionalPrices: 'क्षेत्रीय मूल्य',
      marketAlerts: 'बाजार अलर्ट',
      recommendations: 'सुझाव',
      selectCrop: 'फसल चुनें',
      selectRegion: 'क्षेत्र चुनें',
      timeframe: 'समयसीमा'
    },
    mr: {
      title: 'बाजार माहिती आणि किंमत',
      subtitle: 'माहितीपूर्ण निर्णयांसाठी रिअल-टाइम बाजार डेटा आणि किंमत ट्रेंड',
      currentPrice: 'सध्याची किंमत',
      priceChange: 'किंमत बदल',
      demand: 'मागणी',
      supply: 'पुरवठा',
      forecast: 'अंदाज',
      priceHistory: 'किंमत इतिहास',
      regionalPrices: 'प्रादेशिक किंमती',
      marketAlerts: 'बाजार अलर्ट',
      recommendations: 'शिफारसी',
      selectCrop: 'पीक निवडा',
      selectRegion: 'प्रदेश निवडा',
      timeframe: 'कालावधी'
    }
  };

  const t = translations[language] || translations.en;

  const crops = [
    { value: 'tomatoes', label: 'Tomatoes' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane' }
  ];

  const regions = [
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'gujarat', label: 'Gujarat' }
  ];

  const timeframes = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '90days', label: '90 Days' }
  ];

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.selectCrop}</label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop.value} value={crop.value}>
                      {crop.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t.selectRegion}</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t.timeframe}</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Price Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.currentPrice}</p>
                <p className="text-2xl font-bold">{currentData.currentPrice} {currentData.unit}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.priceChange}</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${currentData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentData.change >= 0 ? '+' : ''}{currentData.change}%
                  </p>
                  {currentData.change >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.demand}</p>
                <Badge 
                  className={`text-sm ${currentData.demand === 'High' ? 'bg-green-100 text-green-800' : 
                    currentData.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                >
                  {currentData.demand}
                </Badge>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.forecast}</p>
                <p className="text-lg font-semibold">{currentData.forecast}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.priceHistory}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData.priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} ${currentData.unit}`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Prices and Demand/Supply */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{t.regionalPrices}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.regions.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{region.name}</p>
                    <p className="text-sm text-gray-600">Regional Market</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{region.price} {currentData.unit}</p>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant={region.change >= 0 ? "default" : "destructive"}
                        className={region.change >= 0 ? "bg-green-100 text-green-800" : ""}
                      >
                        {region.change >= 0 ? '+' : ''}{region.change}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demand vs Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={demandSupplyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demandSupplyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Demand</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Supply</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>{t.marketAlerts}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Price Rising Alert</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Tomato prices have increased by 12% this week. High demand from urban markets and reduced supply due to weather conditions.
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    2 hours ago
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Transportation Update</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    New transportation route opened to Mumbai market. Expected to reduce logistics costs by 8%.
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    1 day ago
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Market Volatility Warning</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    Cotton prices showing high volatility due to international market fluctuations. Monitor closely before harvesting.
                  </p>
                  <p className="text-xs text-yellow-700 mt-2">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    3 days ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>{t.recommendations}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Best Time to Sell</h4>
              <p className="text-sm text-green-800">
                Based on current trends, the optimal selling window for {selectedCrop} is in the next 2-3 weeks when prices are expected to peak.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Market Strategy</h4>
              <p className="text-sm text-blue-800">
                Consider direct selling to urban markets or food processing companies for better margins. Current wholesale margins are favorable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}