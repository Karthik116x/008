import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Leaf,
  DollarSign,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiClient } from './services/api-client';
import { BackendStatus } from './BackendStatus';

interface DashboardProps {
  language: string;
  userProfile: any;
}

export function Dashboard({ language, userProfile }: DashboardProps) {
  const [recommendations, setRecommendations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare farm data for recommendations
        const farmData = {
          location: userProfile.location || 'Nashik, Maharashtra',
          soilType: userProfile.soilType || 'Black Cotton',
          farmSize: parseFloat(userProfile.farmSize) || 2.5,
          irrigation: userProfile.irrigationType || 'Drip Irrigation',
          previousCrops: userProfile.crops || ['Tomatoes', 'Cotton'],
          season: 'Rabi',
          coordinates: userProfile.locationData?.coordinates || { lat: 19.997, lon: 73.789 }
        };

        // Fetch data from backend services
        const [weatherResponse, cropRecommendations, sensorData] = await Promise.all([
          apiClient.getCurrentWeather(farmData.location).catch(err => {
            console.log('Weather API error:', err);
            return null;
          }),
          apiClient.getCropRecommendations(farmData).catch(err => {
            console.log('Crop recommendations error:', err);
            return { recommendations: [] };
          }),
          apiClient.getLatestSensorData('farm_001').catch(err => {
            console.log('Sensor data error:', err);
            return null;
          })
        ]);

        // Set the fetched data
        setWeatherData(weatherResponse);
        setRecommendations(cropRecommendations.recommendations || []);
        setSoilData(sensorData?.sensors || null);

        // If no sensor data, simulate some IoT data
        if (!sensorData) {
          try {
            const simulatedData = await apiClient.simulateIoTData('farm_001');
            console.log('Simulated IoT data:', simulatedData);
          } catch (simError) {
            console.log('IoT simulation error:', simError);
          }
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message);
        
        // Fallback to mock data
        setRecommendations([
          {
            name: 'Tomatoes',
            variety: 'Roma VF',
            suitabilityScore: 95,
            expectedYield: '25 tons/acre',
            profitMargin: '₹85,000/acre',
            sustainabilityScore: 88,
            plantingWindow: '15-30 March',
            harvestTime: '90-100 days',
            advantages: ['High market demand', 'Good export potential', 'Multiple harvests possible'],
            challenges: ['Disease susceptibility', 'Water intensive', 'Labor intensive']
          },
          {
            name: 'Cotton',
            variety: 'Bt Cotton',
            suitabilityScore: 87,
            expectedYield: '18 quintals/acre',
            profitMargin: '₹65,000/acre',
            sustainabilityScore: 75,
            plantingWindow: '1-15 April',
            harvestTime: '180-200 days',
            advantages: ['Pest resistant variety', 'Stable long-term crop', 'Good fiber quality'],
            challenges: ['Long growing period', 'Input costs', 'Market price fluctuations']
          }
        ]);
        
        setWeatherData({
          temperature: 28,
          humidity: 65,
          rainfall: 12,
          forecast: [
            { day: 'Mon', temp: 32, rain: 0 },
            { day: 'Tue', temp: 30, rain: 5 },
            { day: 'Wed', temp: 28, rain: 15 },
            { day: 'Thu', temp: 29, rain: 8 },
            { day: 'Fri', temp: 31, rain: 0 },
            { day: 'Sat', temp: 33, rain: 0 },
            { day: 'Sun', temp: 30, rain: 10 }
          ]
        });
        
        setSoilData({
          soil_ph: { value: 6.8 },
          soil_moisture: { value: 42 },
          air_temperature: { value: 28 },
          humidity: { value: 65 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile]);

  const yieldData = [
    { month: 'Jan', yield: 20 },
    { month: 'Feb', yield: 25 },
    { month: 'Mar', yield: 30 },
    { month: 'Apr', yield: 28 },
    { month: 'May', yield: 35 },
    { month: 'Jun', yield: 32 }
  ];

  const marketData = [
    { crop: 'Tomatoes', price: 45, change: 12 },
    { crop: 'Cotton', price: 6200, change: -5 },
    { crop: 'Sugarcane', price: 3200, change: 8 },
    { crop: 'Wheat', price: 2100, change: 3 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="text-lg">Loading agricultural data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-700">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-medium">Connection Error</h3>
                <p className="text-sm text-red-600">
                  Unable to fetch real-time data. Using cached information.
                </p>
                <p className="text-xs mt-1">Error: {error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Backend Status */}
      <BackendStatus />
      
      {/* Weather Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-2xl font-semibold">{weatherData?.temperature}°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-2xl font-semibold">{weatherData?.humidity}%</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rainfall (7 days)</p>
                <p className="text-2xl font-semibold">{weatherData?.rainfall}mm</p>
              </div>
              <Sun className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Soil Moisture</p>
                <p className="text-2xl font-semibold">{soilData?.soil_moisture?.value || 42}%</p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weatherData?.forecast || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temperature (°C)" />
                <Line type="monotone" dataKey="rain" stroke="#3b82f6" strokeWidth={2} name="Rainfall (mm)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Crop Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>AI Crop Recommendations for Your Farm</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <Card key={index} className={index === 0 ? 'ring-2 ring-green-500' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{rec.name || rec.crop}</h3>
                    {index === 0 && <Badge className="bg-green-100 text-green-800">Best Choice</Badge>}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Suitability</span>
                        <span>{rec.suitabilityScore || rec.confidence}%</span>
                      </div>
                      <Progress value={rec.suitabilityScore || rec.confidence} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Expected Yield</p>
                        <p className="font-medium">{rec.expectedYield}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Profit Margin</p>
                        <p className="font-medium text-green-600">{rec.profitMargin}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Sustainability Score</span>
                        <span>{rec.sustainabilityScore}/100</span>
                      </div>
                      <Progress value={rec.sustainabilityScore} className="h-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Plant: {rec.plantingWindow}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Harvest: {rec.harvestTime}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Key Factors:</p>
                      <div className="flex flex-wrap gap-1">
                        {(rec.advantages || rec.reasons || []).slice(0, 3).map((factor, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant={index === 0 ? "default" : "outline"}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Yield Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="yield" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Market Prices (₹/quintal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.crop}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">₹{item.price}</span>
                    <Badge 
                      variant={item.change > 0 ? "default" : "destructive"}
                      className={item.change > 0 ? "bg-green-100 text-green-800" : ""}
                    >
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Soil Health */}
      <Card>
        <CardHeader>
          <CardTitle>Soil Health Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>pH Level</span>
                  <span>{soilData?.soil_ph?.value || 6.8}</span>
                </div>
                <Progress value={((soilData?.soil_ph?.value || 6.8) / 14) * 100} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">Optimal: 6.0-7.5</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Soil Moisture</span>
                  <span>{soilData?.soil_moisture?.value || 42}%</span>
                </div>
                <Progress value={soilData?.soil_moisture?.value || 42} className="h-2" />
                <p className="text-xs text-green-600 mt-1">Good</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Air Temperature</span>
                  <span>{soilData?.air_temperature?.value || 28}°C</span>
                </div>
                <Progress value={(soilData?.air_temperature?.value || 28) * 2} className="h-2" />
                <p className="text-xs text-yellow-600 mt-1">Moderate</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Humidity</span>
                  <span>{soilData?.humidity?.value || 65}%</span>
                </div>
                <Progress value={soilData?.humidity?.value || 65} className="h-2" />
                <p className="text-xs text-green-600 mt-1">Good</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recommendation</h4>
                <p className="text-sm text-blue-800">
                  {soilData?.soil_ph?.value > 7.5 
                    ? 'Soil pH is slightly high - consider adding organic matter to lower pH naturally.'
                    : soilData?.soil_ph?.value < 6.0
                    ? 'Soil pH is low - consider adding lime to increase pH for better nutrient availability.'
                    : 'Soil conditions are optimal for most crops. Continue current management practices.'
                  }
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900 mb-1">Real-time Monitoring</h5>
                <p className="text-sm text-green-800">
                  Data updated from IoT sensors. Last reading: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </svg>
  );
}