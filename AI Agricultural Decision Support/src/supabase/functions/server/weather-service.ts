export class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Use environment variables for API keys
    this.apiKey = Deno.env.get('WEATHER_API_KEY') || 'demo_key';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Get current weather data optimized for agricultural use
  async getCurrentWeather(location: string) {
    try {
      // If no API key, return simulated data for development
      if (this.apiKey === 'demo_key') {
        return this.getSimulatedWeather(location);
      }

      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        cloudiness: data.clouds.all,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: await this.getUVIndex(data.coord.lat, data.coord.lon),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        timestamp: new Date().toISOString(),
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        },
        // Agricultural specific calculations
        dewPoint: this.calculateDewPoint(data.main.temp, data.main.humidity),
        heatIndex: this.calculateHeatIndex(data.main.temp, data.main.humidity),
        evapotranspiration: this.calculateET0(data),
        soilTemperature: this.estimateSoilTemperature(data.main.temp, data.clouds.all)
      };
    } catch (error) {
      console.log(`Weather service error for ${location}: ${error.message}`);
      return this.getSimulatedWeather(location);
    }
  }

  // Get weather forecast for agricultural planning
  async getForecast(location: string, days: number = 7) {
    try {
      if (this.apiKey === 'demo_key') {
        return this.getSimulatedForecast(location, days);
      }

      const response = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&cnt=${days * 8}` // 8 forecasts per day (3-hour intervals)
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data = await response.json();
      
      const dailyForecasts = this.processForecastData(data.list);
      
      return {
        location: data.city.name,
        country: data.city.country,
        forecasts: dailyForecasts,
        agriculturalAdvice: this.generateAgriculturalAdvice(dailyForecasts),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log(`Forecast service error for ${location}: ${error.message}`);
      return this.getSimulatedForecast(location, days);
    }
  }

  // Calculate agricultural weather indices
  async getAgriculturalIndices(location: string) {
    try {
      const currentWeather = await this.getCurrentWeather(location);
      const forecast = await this.getForecast(location, 14);
      
      return {
        growingDegreeDays: this.calculateGDD(forecast.forecasts),
        chillHours: this.calculateChillHours(forecast.forecasts),
        waterRequirement: this.calculateWaterRequirement(currentWeather, forecast.forecasts),
        pestRisk: this.assessPestRisk(currentWeather, forecast.forecasts),
        diseaseRisk: this.assessDiseaseRisk(currentWeather, forecast.forecasts),
        optimalPlantingWindow: this.determineOptimalPlanting(forecast.forecasts),
        harvestReadiness: this.assessHarvestConditions(currentWeather, forecast.forecasts)
      };
    } catch (error) {
      console.log(`Agricultural indices error: ${error.message}`);
      throw error;
    }
  }

  // Get UV Index data
  private async getUVIndex(lat: number, lon: number): Promise<number> {
    try {
      if (this.apiKey === 'demo_key') {
        return Math.floor(Math.random() * 11) + 1; // Random UV index 1-11
      }

      const response = await fetch(
        `${this.baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return Math.round(data.value);
      }
      return 5; // Default moderate UV
    } catch {
      return 5;
    }
  }

  // Calculate dew point for disease risk assessment
  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  // Calculate heat index for livestock and worker safety
  private calculateHeatIndex(temp: number, humidity: number): number {
    if (temp < 27) return temp; // Heat index only relevant for high temps
    
    const c1 = -8.78469475556;
    const c2 = 1.61139411;
    const c3 = 2.33854883889;
    const c4 = -0.14611605;
    const c5 = -0.012308094;
    const c6 = -0.0164248277778;
    const c7 = 0.002211732;
    const c8 = 0.00072546;
    const c9 = -0.000003582;

    const hi = c1 + (c2 * temp) + (c3 * humidity) + (c4 * temp * humidity) +
               (c5 * temp * temp) + (c6 * humidity * humidity) +
               (c7 * temp * temp * humidity) + (c8 * temp * humidity * humidity) +
               (c9 * temp * temp * humidity * humidity);

    return Math.round(hi);
  }

  // Calculate reference evapotranspiration (ET0) for irrigation planning
  private calculateET0(weatherData: any): number {
    // Simplified Penman-Monteith calculation
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;
    
    // Simplified calculation for demo purposes
    const et0 = 0.0023 * (temp + 17.8) * Math.sqrt(Math.abs(weatherData.main.temp_max - weatherData.main.temp_min || 10)) * 
                (humidity / 100) * (windSpeed * 0.36 + 1);
    
    return Math.max(0, Math.round(et0 * 100) / 100);
  }

  // Estimate soil temperature based on air temperature and cloud cover
  private estimateSoilTemperature(airTemp: number, cloudiness: number): number {
    // Soil temperature is generally more stable than air temperature
    const cloudFactor = 1 - (cloudiness / 100) * 0.2; // Less variation with cloud cover
    const soilTemp = airTemp * 0.9 * cloudFactor + 2; // Soil slightly warmer in general
    return Math.round(soilTemp * 10) / 10;
  }

  // Process forecast data for daily summaries
  private processForecastData(forecastList: any[]): any[] {
    const dailyData = new Map();
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date: date,
          tempMin: item.main.temp,
          tempMax: item.main.temp,
          humidity: [],
          precipitation: 0,
          windSpeed: [],
          description: item.weather[0].description,
          icon: item.weather[0].icon
        });
      }
      
      const day = dailyData.get(date);
      day.tempMin = Math.min(day.tempMin, item.main.temp);
      day.tempMax = Math.max(day.tempMax, item.main.temp);
      day.humidity.push(item.main.humidity);
      day.windSpeed.push(item.wind.speed);
      
      if (item.rain && item.rain['3h']) {
        day.precipitation += item.rain['3h'];
      }
      if (item.snow && item.snow['3h']) {
        day.precipitation += item.snow['3h'];
      }
    });
    
    // Calculate averages and format data
    return Array.from(dailyData.values()).map(day => ({
      ...day,
      tempMin: Math.round(day.tempMin),
      tempMax: Math.round(day.tempMax),
      avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      avgWindSpeed: Math.round((day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length) * 10) / 10,
      precipitation: Math.round(day.precipitation * 10) / 10
    }));
  }

  // Generate agricultural advice based on forecast
  private generateAgriculturalAdvice(forecasts: any[]): string[] {
    const advice = [];
    
    const totalRain = forecasts.reduce((sum, day) => sum + day.precipitation, 0);
    const avgTemp = forecasts.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / forecasts.length;
    const avgHumidity = forecasts.reduce((sum, day) => sum + day.avgHumidity, 0) / forecasts.length;
    
    if (totalRain < 5) {
      advice.push('Consider irrigation planning as low rainfall is expected');
    } else if (totalRain > 50) {
      advice.push('Ensure proper drainage systems are in place due to heavy rainfall forecast');
    }
    
    if (avgTemp > 35) {
      advice.push('High temperatures expected - provide shade for livestock and increase watering frequency');
    } else if (avgTemp < 10) {
      advice.push('Cold temperatures may affect crop growth - consider protective measures');
    }
    
    if (avgHumidity > 80) {
      advice.push('High humidity increases disease risk - monitor crops closely and improve ventilation');
    }
    
    return advice;
  }

  // Calculate Growing Degree Days for crop development tracking
  private calculateGDD(forecasts: any[], baseTemp: number = 10): number {
    return forecasts.reduce((gdd, day) => {
      const avgTemp = (day.tempMax + day.tempMin) / 2;
      return gdd + Math.max(0, avgTemp - baseTemp);
    }, 0);
  }

  // Calculate chill hours for fruit trees
  private calculateChillHours(forecasts: any[]): number {
    return forecasts.reduce((hours, day) => {
      if (day.tempMin >= 0 && day.tempMin <= 7) {
        return hours + 8; // Approximate 8 hours per day in chill range
      }
      return hours;
    }, 0);
  }

  // Calculate water requirement based on weather
  private calculateWaterRequirement(current: any, forecasts: any[]): number {
    const et0 = current.evapotranspiration || 3;
    const rainfall = forecasts.reduce((sum, day) => sum + day.precipitation, 0);
    const grossWaterNeed = et0 * forecasts.length * 1.2; // Crop coefficient applied
    return Math.max(0, grossWaterNeed - rainfall);
  }

  // Assess pest risk based on weather conditions
  private assessPestRisk(current: any, forecasts: any[]): string {
    const avgTemp = forecasts.reduce((sum, day) => sum + (day.tempMax + day.tempMin) / 2, 0) / forecasts.length;
    const avgHumidity = forecasts.reduce((sum, day) => sum + day.avgHumidity, 0) / forecasts.length;
    
    if (avgTemp > 25 && avgTemp < 35 && avgHumidity > 60) {
      return 'High';
    } else if (avgTemp > 20 && avgHumidity > 50) {
      return 'Medium';
    }
    return 'Low';
  }

  // Assess disease risk based on weather conditions
  private assessDiseaseRisk(current: any, forecasts: any[]): string {
    const avgHumidity = forecasts.reduce((sum, day) => sum + day.avgHumidity, 0) / forecasts.length;
    const wetDays = forecasts.filter(day => day.precipitation > 1).length;
    
    if (avgHumidity > 80 || wetDays > forecasts.length / 2) {
      return 'High';
    } else if (avgHumidity > 65 || wetDays > forecasts.length / 4) {
      return 'Medium';
    }
    return 'Low';
  }

  // Determine optimal planting window
  private determineOptimalPlanting(forecasts: any[]): string {
    const suitableDays = forecasts.filter(day => 
      day.tempMin > 5 && day.tempMax < 40 && day.precipitation < 10
    ).length;
    
    if (suitableDays > forecasts.length * 0.8) {
      return 'Excellent';
    } else if (suitableDays > forecasts.length * 0.6) {
      return 'Good';
    } else if (suitableDays > forecasts.length * 0.4) {
      return 'Fair';
    }
    return 'Poor';
  }

  // Assess harvest conditions
  private assessHarvestConditions(current: any, forecasts: any[]): string {
    const dryDays = forecasts.filter(day => day.precipitation < 1).length;
    const avgHumidity = forecasts.reduce((sum, day) => sum + day.avgHumidity, 0) / forecasts.length;
    
    if (dryDays > forecasts.length * 0.8 && avgHumidity < 70) {
      return 'Excellent';
    } else if (dryDays > forecasts.length * 0.6) {
      return 'Good';
    }
    return 'Poor';
  }

  // Fallback simulated weather data for development
  private getSimulatedWeather(location: string) {
    const baseTemp = 25 + Math.random() * 10;
    return {
      location: location,
      country: 'IN',
      temperature: Math.round(baseTemp),
      humidity: Math.round(50 + Math.random() * 40),
      pressure: Math.round(1010 + Math.random() * 20),
      windSpeed: Math.round(Math.random() * 10 * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      cloudiness: Math.round(Math.random() * 100),
      visibility: Math.round((5 + Math.random() * 10) * 10) / 10,
      uvIndex: Math.floor(Math.random() * 11) + 1,
      description: 'partly cloudy',
      icon: '02d',
      timestamp: new Date().toISOString(),
      coordinates: { lat: 19.9975, lon: 73.7898 }, // Nashik coordinates
      dewPoint: Math.round((baseTemp - 10 + Math.random() * 5) * 10) / 10,
      heatIndex: Math.round(baseTemp + Math.random() * 5),
      evapotranspiration: Math.round((2 + Math.random() * 4) * 100) / 100,
      soilTemperature: Math.round((baseTemp - 2 + Math.random() * 4) * 10) / 10
    };
  }

  // Simulated forecast data for development
  private getSimulatedForecast(location: string, days: number) {
    const forecasts = [];
    const baseTemp = 25;
    
    for (let i = 0; i < days; i++) {
      const tempVariation = Math.random() * 10 - 5;
      forecasts.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toDateString(),
        tempMin: Math.round(baseTemp + tempVariation - 3),
        tempMax: Math.round(baseTemp + tempVariation + 7),
        avgHumidity: Math.round(60 + Math.random() * 30),
        avgWindSpeed: Math.round(Math.random() * 15 * 10) / 10,
        precipitation: Math.round(Math.random() * 5 * 10) / 10,
        description: ['sunny', 'partly cloudy', 'cloudy', 'light rain'][Math.floor(Math.random() * 4)],
        icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)]
      });
    }
    
    return {
      location: location,
      country: 'IN',
      forecasts: forecasts,
      agriculturalAdvice: this.generateAgriculturalAdvice(forecasts),
      timestamp: new Date().toISOString()
    };
  }
}