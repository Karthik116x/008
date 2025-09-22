import { projectId, publicAnonKey } from '../../utils/supabase/info';

class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0b8ed02f`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };
  }

  // Generic API call method
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Weather API methods
  async getCurrentWeather(location: string) {
    return this.makeRequest(`/weather/current/${encodeURIComponent(location)}`);
  }

  async getWeatherForecast(location: string, days: number = 7) {
    return this.makeRequest(`/weather/forecast/${encodeURIComponent(location)}?days=${days}`);
  }

  async getAgriculturalIndices(location: string) {
    return this.makeRequest(`/weather/agri-indices/${encodeURIComponent(location)}`);
  }

  // Crop ML API methods
  async getCropRecommendations(farmData: any) {
    return this.makeRequest('/ml/crop-recommendations', {
      method: 'POST',
      body: JSON.stringify(farmData),
    });
  }

  async analyzeCropImage(imageData: string, cropType: string) {
    return this.makeRequest('/ml/crop-diagnosis', {
      method: 'POST',
      body: JSON.stringify({ imageData, cropType }),
    });
  }

  async predictYield(predictionData: any) {
    return this.makeRequest('/ml/yield-prediction', {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
  }

  // IoT API methods
  async submitSensorData(sensorData: any) {
    return this.makeRequest('/iot/sensor-data', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  }

  async getLatestSensorData(farmId: string) {
    return this.makeRequest(`/iot/farm/${farmId}/latest`);
  }

  async getSensorHistory(farmId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest(`/iot/farm/${farmId}/history${query}`);
  }

  // Market API methods
  async getCurrentPrices(crop: string, region?: string) {
    const params = region ? `?region=${encodeURIComponent(region)}` : '';
    return this.makeRequest(`/market/prices/${encodeURIComponent(crop)}${params}`);
  }

  async getMarketTrends(crop: string, timeframe?: string) {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.makeRequest(`/market/trends/${encodeURIComponent(crop)}${params}`);
  }

  async getDemandSupplyAnalysis(crop: string) {
    return this.makeRequest(`/market/demand-supply/${encodeURIComponent(crop)}`);
  }

  // Farm management API methods
  async saveFarmProfile(farmProfile: any) {
    return this.makeRequest('/farm/profile', {
      method: 'POST',
      body: JSON.stringify(farmProfile),
    });
  }

  async getFarmProfile(farmId: string) {
    return this.makeRequest(`/farm/profile/${farmId}`);
  }

  // Notification API methods
  async subscribeToNotifications(subscription: any) {
    return this.makeRequest('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async getUserNotifications(userId: string) {
    return this.makeRequest(`/notifications/${userId}`);
  }

  // Analytics API methods
  async getFarmAnalytics(farmId: string) {
    return this.makeRequest(`/analytics/farm/${farmId}`);
  }

  // Health check
  async checkHealth() {
    return this.makeRequest('/health');
  }

  // Simulate IoT data for development
  async simulateIoTData(farmId: string) {
    return this.makeRequest(`/iot/simulate/${farmId}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();