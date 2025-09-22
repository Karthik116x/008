import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.ts'

// Import service modules
import { WeatherService } from './weather-service.ts'
import { CropMLService } from './crop-ml-service.ts'
import { IoTService } from './iot-service.ts'
import { MarketService } from './market-service.ts'
import { NotificationService } from './notification-service.ts'

const app = new Hono()

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// CORS configuration for agricultural data access
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Logging middleware
app.use('*', logger(console.log))

// Initialize services
const weatherService = new WeatherService()
const cropMLService = new CropMLService()
const iotService = new IoTService()
const marketService = new MarketService()
const notificationService = new NotificationService()

// Health check endpoint
app.get('/make-server-0b8ed02f/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      weather: 'active',
      ml_models: 'active',
      iot: 'active',
      market: 'active',
      notifications: 'active'
    }
  })
})

// ============= WEATHER DATA ENDPOINTS =============

// Get current weather data for a location
app.get('/make-server-0b8ed02f/weather/current/:location', async (c) => {
  try {
    const location = c.req.param('location')
    const weatherData = await weatherService.getCurrentWeather(location)
    
    // Store in KV for caching
    await kv.set(`weather:current:${location}`, weatherData, { ttl: 3600 }) // 1 hour cache
    
    return c.json(weatherData)
  } catch (error) {
    console.log(`Weather API error: ${error.message}`)
    return c.json({ error: 'Failed to fetch weather data' }, 500)
  }
})

// Get weather forecast for farming planning
app.get('/make-server-0b8ed02f/weather/forecast/:location', async (c) => {
  try {
    const location = c.req.param('location')
    const days = c.req.query('days') || '7'
    
    const forecast = await weatherService.getForecast(location, parseInt(days))
    await kv.set(`weather:forecast:${location}:${days}`, forecast, { ttl: 7200 }) // 2 hour cache
    
    return c.json(forecast)
  } catch (error) {
    console.log(`Weather forecast error: ${error.message}`)
    return c.json({ error: 'Failed to fetch weather forecast' }, 500)
  }
})

// Get agricultural weather indices (growing degree days, etc.)
app.get('/make-server-0b8ed02f/weather/agri-indices/:location', async (c) => {
  try {
    const location = c.req.param('location')
    const indices = await weatherService.getAgriculturalIndices(location)
    
    return c.json(indices)
  } catch (error) {
    console.log(`Agricultural indices error: ${error.message}`)
    return c.json({ error: 'Failed to calculate agricultural indices' }, 500)
  }
})

// ============= CROP ML ENDPOINTS =============

// Get AI crop recommendations
app.post('/make-server-0b8ed02f/ml/crop-recommendations', async (c) => {
  try {
    const farmData = await c.req.json()
    const recommendations = await cropMLService.getCropRecommendations(farmData)
    
    // Store recommendations for user
    if (farmData.userId) {
      await kv.set(`recommendations:${farmData.userId}`, recommendations, { ttl: 86400 }) // 24 hour cache
    }
    
    return c.json(recommendations)
  } catch (error) {
    console.log(`Crop recommendation ML error: ${error.message}`)
    return c.json({ error: 'Failed to generate crop recommendations' }, 500)
  }
})

// Analyze crop image for disease detection
app.post('/make-server-0b8ed02f/ml/crop-diagnosis', async (c) => {
  try {
    const { imageData, cropType } = await c.req.json()
    const diagnosis = await cropMLService.analyzeCropImage(imageData, cropType)
    
    return c.json(diagnosis)
  } catch (error) {
    console.log(`Crop diagnosis error: ${error.message}`)
    return c.json({ error: 'Failed to analyze crop image' }, 500)
  }
})

// Get yield prediction based on historical and current data
app.post('/make-server-0b8ed02f/ml/yield-prediction', async (c) => {
  try {
    const predictionData = await c.req.json()
    const prediction = await cropMLService.predictYield(predictionData)
    
    return c.json(prediction)
  } catch (error) {
    console.log(`Yield prediction error: ${error.message}`)
    return c.json({ error: 'Failed to predict yield' }, 500)
  }
})

// ============= IOT SENSOR ENDPOINTS =============

// Receive IoT sensor data
app.post('/make-server-0b8ed02f/iot/sensor-data', async (c) => {
  try {
    const sensorData = await c.req.json()
    const result = await iotService.processSensorData(sensorData)
    
    // Trigger alerts if necessary
    if (result.alerts && result.alerts.length > 0) {
      await notificationService.sendAlerts(result.alerts)
    }
    
    return c.json({ status: 'success', processed: result })
  } catch (error) {
    console.log(`IoT sensor data processing error: ${error.message}`)
    return c.json({ error: 'Failed to process sensor data' }, 500)
  }
})

// Get latest sensor readings for a farm
app.get('/make-server-0b8ed02f/iot/farm/:farmId/latest', async (c) => {
  try {
    const farmId = c.req.param('farmId')
    const sensorData = await iotService.getLatestSensorData(farmId)
    
    return c.json(sensorData)
  } catch (error) {
    console.log(`IoT sensor data retrieval error: ${error.message}`)
    return c.json({ error: 'Failed to retrieve sensor data' }, 500)
  }
})

// Get historical sensor data for analytics
app.get('/make-server-0b8ed02f/iot/farm/:farmId/history', async (c) => {
  try {
    const farmId = c.req.param('farmId')
    const startDate = c.req.query('start')
    const endDate = c.req.query('end')
    
    const historyData = await iotService.getSensorHistory(farmId, startDate, endDate)
    
    return c.json(historyData)
  } catch (error) {
    console.log(`IoT sensor history error: ${error.message}`)
    return c.json({ error: 'Failed to retrieve sensor history' }, 500)
  }
})

// ============= MARKET DATA ENDPOINTS =============

// Get current market prices
app.get('/make-server-0b8ed02f/market/prices/:crop', async (c) => {
  try {
    const crop = c.req.param('crop')
    const region = c.req.query('region') || 'all'
    
    const prices = await marketService.getCurrentPrices(crop, region)
    await kv.set(`market:prices:${crop}:${region}`, prices, { ttl: 1800 }) // 30 min cache
    
    return c.json(prices)
  } catch (error) {
    console.log(`Market price error: ${error.message}`)
    return c.json({ error: 'Failed to fetch market prices' }, 500)
  }
})

// Get market trends and analysis
app.get('/make-server-0b8ed02f/market/trends/:crop', async (c) => {
  try {
    const crop = c.req.param('crop')
    const timeframe = c.req.query('timeframe') || '30days'
    
    const trends = await marketService.getMarketTrends(crop, timeframe)
    
    return c.json(trends)
  } catch (error) {
    console.log(`Market trends error: ${error.message}`)
    return c.json({ error: 'Failed to analyze market trends' }, 500)
  }
})

// Get demand-supply analysis
app.get('/make-server-0b8ed02f/market/demand-supply/:crop', async (c) => {
  try {
    const crop = c.req.param('crop')
    const analysis = await marketService.getDemandSupplyAnalysis(crop)
    
    return c.json(analysis)
  } catch (error) {
    console.log(`Demand-supply analysis error: ${error.message}`)
    return c.json({ error: 'Failed to analyze demand-supply' }, 500)
  }
})

// ============= USER & FARM MANAGEMENT =============

// Save farm profile
app.post('/make-server-0b8ed02f/farm/profile', async (c) => {
  try {
    const farmProfile = await c.req.json()
    const farmId = farmProfile.id || `farm_${Date.now()}`
    
    await kv.set(`farm:profile:${farmId}`, farmProfile)
    
    return c.json({ status: 'success', farmId })
  } catch (error) {
    console.log(`Farm profile save error: ${error.message}`)
    return c.json({ error: 'Failed to save farm profile' }, 500)
  }
})

// Get farm profile
app.get('/make-server-0b8ed02f/farm/profile/:farmId', async (c) => {
  try {
    const farmId = c.req.param('farmId')
    const profile = await kv.get(`farm:profile:${farmId}`)
    
    if (!profile) {
      return c.json({ error: 'Farm profile not found' }, 404)
    }
    
    return c.json(profile)
  } catch (error) {
    console.log(`Farm profile retrieval error: ${error.message}`)
    return c.json({ error: 'Failed to retrieve farm profile' }, 500)
  }
})

// ============= NOTIFICATION ENDPOINTS =============

// Subscribe to notifications
app.post('/make-server-0b8ed02f/notifications/subscribe', async (c) => {
  try {
    const subscription = await c.req.json()
    await notificationService.subscribe(subscription)
    
    return c.json({ status: 'subscribed' })
  } catch (error) {
    console.log(`Notification subscription error: ${error.message}`)
    return c.json({ error: 'Failed to subscribe to notifications' }, 500)
  }
})

// Get user notifications
app.get('/make-server-0b8ed02f/notifications/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const notifications = await notificationService.getUserNotifications(userId)
    
    return c.json(notifications)
  } catch (error) {
    console.log(`Notification retrieval error: ${error.message}`)
    return c.json({ error: 'Failed to retrieve notifications' }, 500)
  }
})

// ============= IOT SIMULATION ENDPOINT =============

// Simulate IoT data for development
app.post('/make-server-0b8ed02f/iot/simulate/:farmId', async (c) => {
  try {
    const farmId = c.req.param('farmId')
    const simulatedData = await iotService.simulateIoTData(farmId)
    
    return c.json(simulatedData)
  } catch (error) {
    console.log(`IoT simulation error: ${error.message}`)
    return c.json({ error: 'Failed to simulate IoT data' }, 500)
  }
})

// ============= ANALYTICS ENDPOINTS =============

// Get comprehensive farm analytics
app.get('/make-server-0b8ed02f/analytics/farm/:farmId', async (c) => {
  try {
    const farmId = c.req.param('farmId')
    
    // Gather data from multiple sources
    const [sensorData, weatherData, recommendations, marketData] = await Promise.all([
      iotService.getLatestSensorData(farmId),
      kv.get(`weather:current:${farmId}`),
      kv.get(`recommendations:${farmId}`),
      kv.get(`market:prices:all:all`)
    ])
    
    const analytics = {
      farmHealth: {
        soilCondition: sensorData?.soil || 'unknown',
        weatherStatus: weatherData?.condition || 'unknown',
        cropRecommendations: recommendations?.length || 0,
        marketOpportunities: marketData?.opportunities || 0
      },
      alerts: [],
      recommendations: recommendations || [],
      lastUpdated: new Date().toISOString()
    }
    
    return c.json(analytics)
  } catch (error) {
    console.log(`Analytics error: ${error.message}`)
    return c.json({ error: 'Failed to generate analytics' }, 500)
  }
})

console.log('🌱 Smart Farm Assistant Server starting...')
console.log('📊 Services: Weather, ML Models, IoT, Market Data, Notifications')
console.log('🚀 Ready for agricultural data processing!')

Deno.serve(app.fetch)