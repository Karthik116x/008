import * as kv from './kv_store.ts'

export class IoTService {
  
  // Process incoming IoT sensor data
  async processSensorData(sensorData: any) {
    try {
      console.log('Processing IoT sensor data:', sensorData);
      
      const {
        farmId,
        sensorId,
        sensorType,
        location,
        timestamp,
        readings
      } = sensorData;

      // Validate and normalize sensor data
      const normalizedData = this.normalizeSensorData(sensorData);
      
      // Store sensor data with timestamp
      const dataKey = `iot:${farmId}:${sensorId}:${timestamp}`;
      await kv.set(dataKey, normalizedData, { ttl: 2592000 }); // 30 days retention
      
      // Update latest readings
      const latestKey = `iot:latest:${farmId}:${sensorType}`;
      await kv.set(latestKey, normalizedData);
      
      // Analyze for anomalies and alerts
      const alerts = await this.analyzeForAlerts(farmId, sensorType, normalizedData);
      
      // Calculate derived metrics
      const metrics = this.calculateDerivedMetrics(normalizedData, sensorType);
      
      // Store aggregated daily data
      await this.updateDailyAggregates(farmId, sensorType, normalizedData);
      
      return {
        status: 'processed',
        dataKey: dataKey,
        alerts: alerts,
        metrics: metrics,
        recommendations: this.generateRecommendations(sensorType, normalizedData, alerts)
      };

    } catch (error) {
      console.log(`IoT data processing error: ${error.message}`);
      throw error;
    }
  }

  // Get latest sensor readings for a farm
  async getLatestSensorData(farmId: string) {
    try {
      const sensorTypes = ['soil_moisture', 'soil_temperature', 'soil_ph', 'air_temperature', 'humidity', 'light_intensity'];
      const latestData = {};

      for (const sensorType of sensorTypes) {
        const key = `iot:latest:${farmId}:${sensorType}`;
        const data = await kv.get(key);
        if (data) {
          latestData[sensorType] = data;
        }
      }

      // Calculate farm health score
      const healthScore = this.calculateFarmHealthScore(latestData);
      
      // Generate summary insights
      const insights = this.generateFarmInsights(latestData);

      return {
        farmId: farmId,
        sensors: latestData,
        healthScore: healthScore,
        insights: insights,
        lastUpdated: new Date().toISOString(),
        sensorStatus: this.checkSensorStatus(latestData)
      };

    } catch (error) {
      console.log(`Latest sensor data retrieval error: ${error.message}`);
      throw error;
    }
  }

  // Get historical sensor data for analytics
  async getSensorHistory(farmId: string, startDate?: string, endDate?: string) {
    try {
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate ? new Date(endDate) : new Date();
      
      // Get daily aggregated data
      const dailyData = await this.getDailyAggregates(farmId, start, end);
      
      // Calculate trends and patterns
      const trends = this.analyzeTrends(dailyData);
      
      // Generate historical insights
      const insights = this.generateHistoricalInsights(dailyData, trends);

      return {
        farmId: farmId,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        dailyData: dailyData,
        trends: trends,
        insights: insights,
        recommendations: this.generateHistoricalRecommendations(trends)
      };

    } catch (error) {
      console.log(`Sensor history retrieval error: ${error.message}`);
      throw error;
    }
  }

  // Simulate IoT sensor data for development/testing
  async simulateIoTData(farmId: string) {
    try {
      const sensorTypes = [
        {
          type: 'soil_moisture',
          unit: '%',
          range: [20, 80],
          optimal: [40, 60]
        },
        {
          type: 'soil_temperature',
          unit: '°C',
          range: [15, 35],
          optimal: [20, 30]
        },
        {
          type: 'soil_ph',
          unit: 'pH',
          range: [5.5, 8.0],
          optimal: [6.0, 7.5]
        },
        {
          type: 'air_temperature',
          unit: '°C',
          range: [10, 45],
          optimal: [20, 35]
        },
        {
          type: 'humidity',
          unit: '%',
          range: [30, 90],
          optimal: [50, 70]
        },
        {
          type: 'light_intensity',
          unit: 'lux',
          range: [10000, 80000],
          optimal: [30000, 60000]
        }
      ];

      const simulatedData = [];

      for (const sensor of sensorTypes) {
        const value = this.generateRealisticSensorValue(sensor);
        
        const sensorData = {
          farmId: farmId,
          sensorId: `sensor_${sensor.type}_001`,
          sensorType: sensor.type,
          location: {
            zone: 'field_a',
            coordinates: { lat: 19.997, lon: 73.789 }
          },
          timestamp: new Date().toISOString(),
          readings: {
            value: value,
            unit: sensor.unit,
            quality: 'good',
            batteryLevel: 85 + Math.random() * 10
          }
        };

        const result = await this.processSensorData(sensorData);
        simulatedData.push({
          sensor: sensor.type,
          data: sensorData,
          result: result
        });
      }

      return {
        farmId: farmId,
        simulatedSensors: simulatedData.length,
        data: simulatedData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.log(`IoT simulation error: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private normalizeSensorData(sensorData: any) {
    return {
      farmId: sensorData.farmId,
      sensorId: sensorData.sensorId,
      sensorType: sensorData.sensorType,
      location: sensorData.location,
      timestamp: sensorData.timestamp,
      value: sensorData.readings.value,
      unit: sensorData.readings.unit,
      quality: sensorData.readings.quality || 'unknown',
      batteryLevel: sensorData.readings.batteryLevel || null,
      processed: new Date().toISOString()
    };
  }

  private async analyzeForAlerts(farmId: string, sensorType: string, data: any) {
    const alerts = [];
    
    // Define alert thresholds for different sensor types
    const thresholds = {
      soil_moisture: { critical_low: 15, warning_low: 25, warning_high: 75, critical_high: 85 },
      soil_temperature: { critical_low: 10, warning_low: 15, warning_high: 32, critical_high: 40 },
      soil_ph: { critical_low: 5.0, warning_low: 5.5, warning_high: 7.8, critical_high: 8.5 },
      air_temperature: { critical_low: 5, warning_low: 10, warning_high: 38, critical_high: 45 },
      humidity: { critical_low: 25, warning_low: 35, warning_high: 80, critical_high: 90 },
      light_intensity: { critical_low: 5000, warning_low: 15000, warning_high: 70000, critical_high: 90000 }
    };

    const threshold = thresholds[sensorType];
    if (!threshold) return alerts;

    const value = data.value;

    if (value <= threshold.critical_low) {
      alerts.push({
        type: 'critical',
        severity: 'high',
        message: `${sensorType} critically low: ${value} ${data.unit}`,
        action: this.getActionForAlert(sensorType, 'critical_low'),
        timestamp: new Date().toISOString()
      });
    } else if (value <= threshold.warning_low) {
      alerts.push({
        type: 'warning',
        severity: 'medium',
        message: `${sensorType} below optimal: ${value} ${data.unit}`,
        action: this.getActionForAlert(sensorType, 'warning_low'),
        timestamp: new Date().toISOString()
      });
    } else if (value >= threshold.critical_high) {
      alerts.push({
        type: 'critical',
        severity: 'high',
        message: `${sensorType} critically high: ${value} ${data.unit}`,
        action: this.getActionForAlert(sensorType, 'critical_high'),
        timestamp: new Date().toISOString()
      });
    } else if (value >= threshold.warning_high) {
      alerts.push({
        type: 'warning',
        severity: 'medium',
        message: `${sensorType} above optimal: ${value} ${data.unit}`,
        action: this.getActionForAlert(sensorType, 'warning_high'),
        timestamp: new Date().toISOString()
      });
    }

    // Battery level alerts
    if (data.batteryLevel && data.batteryLevel < 20) {
      alerts.push({
        type: 'maintenance',
        severity: 'low',
        message: `Low battery on ${data.sensorId}: ${data.batteryLevel}%`,
        action: 'Replace or recharge sensor battery',
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  private getActionForAlert(sensorType: string, alertType: string): string {
    const actions = {
      soil_moisture: {
        critical_low: 'Immediate irrigation required',
        warning_low: 'Schedule irrigation within 24 hours',
        warning_high: 'Check drainage, reduce irrigation',
        critical_high: 'Stop irrigation, improve drainage immediately'
      },
      soil_temperature: {
        critical_low: 'Protect crops from cold, consider heating',
        warning_low: 'Monitor for cold stress',
        warning_high: 'Increase shade, mulching recommended',
        critical_high: 'Emergency cooling required'
      },
      soil_ph: {
        critical_low: 'Apply lime to increase pH',
        warning_low: 'Consider pH adjustment',
        warning_high: 'Apply sulfur or organic matter',
        critical_high: 'Immediate pH correction needed'
      },
      air_temperature: {
        critical_low: 'Frost protection measures needed',
        warning_low: 'Monitor for cold damage',
        warning_high: 'Provide shade, increase ventilation',
        critical_high: 'Emergency cooling and shade required'
      },
      humidity: {
        critical_low: 'Increase irrigation, misting',
        warning_low: 'Monitor plant stress',
        warning_high: 'Improve ventilation',
        critical_high: 'Prevent fungal diseases, reduce moisture'
      },
      light_intensity: {
        critical_low: 'Supplement with artificial lighting',
        warning_low: 'Monitor for reduced photosynthesis',
        warning_high: 'Provide shade during peak hours',
        critical_high: 'Immediate shade protection required'
      }
    };

    return actions[sensorType]?.[alertType] || 'Monitor and take appropriate action';
  }

  private calculateDerivedMetrics(data: any, sensorType: string) {
    const metrics = {};

    switch (sensorType) {
      case 'soil_moisture':
        metrics.waterStress = this.calculateWaterStress(data.value);
        metrics.irrigationNeed = this.calculateIrrigationNeed(data.value);
        break;
      case 'soil_temperature':
        metrics.rootZoneCondition = this.assessRootZoneCondition(data.value);
        break;
      case 'soil_ph':
        metrics.nutrientAvailability = this.assessNutrientAvailability(data.value);
        break;
      case 'air_temperature':
        metrics.heatStress = this.calculateHeatStress(data.value);
        break;
      case 'humidity':
        metrics.diseaseRisk = this.assessDiseaseRisk(data.value);
        break;
      case 'light_intensity':
        metrics.photosynthesisEfficiency = this.calculatePhotosynthesisEfficiency(data.value);
        break;
    }

    return metrics;
  }

  private async updateDailyAggregates(farmId: string, sensorType: string, data: any) {
    const today = new Date().toISOString().split('T')[0];
    const aggregateKey = `iot:daily:${farmId}:${sensorType}:${today}`;
    
    // Get existing aggregate or create new one
    let aggregate = await kv.get(aggregateKey) || {
      date: today,
      farmId: farmId,
      sensorType: sensorType,
      count: 0,
      sum: 0,
      min: data.value,
      max: data.value,
      values: []
    };

    // Update aggregate
    aggregate.count += 1;
    aggregate.sum += data.value;
    aggregate.min = Math.min(aggregate.min, data.value);
    aggregate.max = Math.max(aggregate.max, data.value);
    aggregate.values.push({ timestamp: data.timestamp, value: data.value });
    aggregate.average = aggregate.sum / aggregate.count;
    aggregate.lastUpdated = new Date().toISOString();

    // Store updated aggregate
    await kv.set(aggregateKey, aggregate, { ttl: 2592000 }); // 30 days
  }

  private calculateFarmHealthScore(sensorData: any): number {
    let score = 100;
    let validSensors = 0;

    Object.keys(sensorData).forEach(sensorType => {
      const data = sensorData[sensorType];
      if (!data || !data.value) return;

      validSensors++;
      const optimalRanges = {
        soil_moisture: [40, 60],
        soil_temperature: [20, 30],
        soil_ph: [6.0, 7.5],
        air_temperature: [20, 35],
        humidity: [50, 70],
        light_intensity: [30000, 60000]
      };

      const range = optimalRanges[sensorType];
      if (range) {
        if (data.value < range[0] || data.value > range[1]) {
          const deviation = Math.abs(data.value - (range[0] + range[1]) / 2) / ((range[1] - range[0]) / 2);
          score -= Math.min(20, deviation * 10);
        }
      }
    });

    return validSensors > 0 ? Math.max(0, Math.round(score)) : 0;
  }

  private generateFarmInsights(sensorData: any): string[] {
    const insights = [];

    if (sensorData.soil_moisture && sensorData.soil_moisture.value < 30) {
      insights.push('Soil moisture is low - consider irrigation within 24 hours');
    }

    if (sensorData.soil_ph && (sensorData.soil_ph.value < 6.0 || sensorData.soil_ph.value > 7.5)) {
      insights.push('Soil pH is outside optimal range - consider soil amendment');
    }

    if (sensorData.air_temperature && sensorData.air_temperature.value > 35) {
      insights.push('High air temperature detected - provide shade and increase ventilation');
    }

    if (sensorData.humidity && sensorData.humidity.value > 80) {
      insights.push('High humidity increases disease risk - improve air circulation');
    }

    if (insights.length === 0) {
      insights.push('All sensor readings are within optimal ranges');
    }

    return insights;
  }

  private checkSensorStatus(sensorData: any) {
    const status = {};
    const sensorTypes = ['soil_moisture', 'soil_temperature', 'soil_ph', 'air_temperature', 'humidity', 'light_intensity'];
    
    sensorTypes.forEach(type => {
      if (sensorData[type]) {
        const lastUpdate = new Date(sensorData[type].timestamp);
        const hoursAgo = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        status[type] = {
          status: hoursAgo < 2 ? 'online' : hoursAgo < 24 ? 'delayed' : 'offline',
          lastSeen: lastUpdate.toISOString(),
          batteryLevel: sensorData[type].batteryLevel
        };
      } else {
        status[type] = { status: 'no_data', lastSeen: null, batteryLevel: null };
      }
    });

    return status;
  }

  private async getDailyAggregates(farmId: string, startDate: Date, endDate: Date) {
    const aggregates = [];
    const sensorTypes = ['soil_moisture', 'soil_temperature', 'soil_ph', 'air_temperature', 'humidity', 'light_intensity'];
    
    // Generate daily aggregates (simulated for development)
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      for (const sensorType of sensorTypes) {
        const key = `iot:daily:${farmId}:${sensorType}:${dateStr}`;
        let aggregate = await kv.get(key);
        
        if (!aggregate) {
          // Generate simulated aggregate data
          aggregate = this.generateSimulatedDailyAggregate(farmId, sensorType, dateStr);
        }
        
        aggregates.push(aggregate);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return aggregates;
  }

  private generateSimulatedDailyAggregate(farmId: string, sensorType: string, date: string) {
    const baseValues = {
      soil_moisture: 45,
      soil_temperature: 25,
      soil_ph: 6.8,
      air_temperature: 28,
      humidity: 65,
      light_intensity: 45000
    };

    const baseValue = baseValues[sensorType] || 50;
    const variation = baseValue * 0.1;
    
    const min = baseValue - variation + Math.random() * variation;
    const max = baseValue + variation - Math.random() * variation;
    const average = (min + max) / 2;

    return {
      date: date,
      farmId: farmId,
      sensorType: sensorType,
      count: 24, // Hourly readings
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      average: Math.round(average * 100) / 100,
      lastUpdated: new Date().toISOString()
    };
  }

  private analyzeTrends(dailyData: any[]) {
    const trends = {};
    
    // Group by sensor type
    const bySensorType = dailyData.reduce((acc, item) => {
      if (!acc[item.sensorType]) acc[item.sensorType] = [];
      acc[item.sensorType].push(item);
      return acc;
    }, {});

    Object.keys(bySensorType).forEach(sensorType => {
      const data = bySensorType[sensorType].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (data.length > 1) {
        const firstValue = data[0].average;
        const lastValue = data[data.length - 1].average;
        const trend = lastValue > firstValue ? 'increasing' : lastValue < firstValue ? 'decreasing' : 'stable';
        const changePercent = Math.round(((lastValue - firstValue) / firstValue) * 100);
        
        trends[sensorType] = {
          trend: trend,
          changePercent: changePercent,
          currentValue: lastValue,
          previousValue: firstValue
        };
      }
    });

    return trends;
  }

  private generateHistoricalInsights(dailyData: any[], trends: any): string[] {
    const insights = [];

    Object.keys(trends).forEach(sensorType => {
      const trend = trends[sensorType];
      
      if (Math.abs(trend.changePercent) > 10) {
        insights.push(`${sensorType} has ${trend.trend} by ${Math.abs(trend.changePercent)}% over the period`);
      }
    });

    if (insights.length === 0) {
      insights.push('Sensor readings have been stable over the analyzed period');
    }

    return insights;
  }

  private generateHistoricalRecommendations(trends: any): string[] {
    const recommendations = [];

    if (trends.soil_moisture && trends.soil_moisture.trend === 'decreasing') {
      recommendations.push('Consider adjusting irrigation schedule due to declining soil moisture trend');
    }

    if (trends.soil_ph && Math.abs(trends.soil_ph.changePercent) > 5) {
      recommendations.push('Monitor soil pH changes and consider soil amendment if needed');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current management practices based on stable sensor trends');
    }

    return recommendations;
  }

  private generateRecommendations(sensorType: string, data: any, alerts: any[]): string[] {
    const recommendations = [];

    if (alerts.length > 0) {
      alerts.forEach(alert => {
        if (alert.action) {
          recommendations.push(alert.action);
        }
      });
    } else {
      // General recommendations based on sensor readings
      switch (sensorType) {
        case 'soil_moisture':
          if (data.value > 60) {
            recommendations.push('Soil moisture is adequate - maintain current irrigation schedule');
          }
          break;
        case 'soil_ph':
          if (data.value >= 6.0 && data.value <= 7.5) {
            recommendations.push('Soil pH is optimal for most crops');
          }
          break;
      }
    }

    return recommendations;
  }

  // Utility methods for derived metrics
  private calculateWaterStress(moistureLevel: number): string {
    if (moistureLevel < 20) return 'severe';
    if (moistureLevel < 30) return 'moderate';
    if (moistureLevel < 40) return 'mild';
    return 'none';
  }

  private calculateIrrigationNeed(moistureLevel: number): string {
    if (moistureLevel < 25) return 'immediate';
    if (moistureLevel < 35) return 'within_24h';
    if (moistureLevel < 45) return 'within_48h';
    return 'not_needed';
  }

  private assessRootZoneCondition(temperature: number): string {
    if (temperature < 15) return 'cold_stress';
    if (temperature > 30) return 'heat_stress';
    return 'optimal';
  }

  private assessNutrientAvailability(ph: number): string {
    if (ph < 5.5 || ph > 8.0) return 'poor';
    if (ph < 6.0 || ph > 7.5) return 'moderate';
    return 'good';
  }

  private calculateHeatStress(temperature: number): string {
    if (temperature > 40) return 'severe';
    if (temperature > 35) return 'moderate';
    if (temperature > 30) return 'mild';
    return 'none';
  }

  private assessDiseaseRisk(humidity: number): string {
    if (humidity > 85) return 'high';
    if (humidity > 75) return 'moderate';
    return 'low';
  }

  private calculatePhotosynthesisEfficiency(lightIntensity: number): string {
    if (lightIntensity < 20000) return 'low';
    if (lightIntensity > 70000) return 'excessive';
    return 'optimal';
  }

  private generateRealisticSensorValue(sensor: any): number {
    const { range, optimal } = sensor;
    
    // Generate values mostly within optimal range, sometimes outside
    const useOptimal = Math.random() < 0.8; // 80% chance to be in optimal range
    
    if (useOptimal) {
      return optimal[0] + Math.random() * (optimal[1] - optimal[0]);
    } else {
      return range[0] + Math.random() * (range[1] - range[0]);
    }
  }
}