import * as kv from './kv_store.ts'

export class MarketService {
  
  // Get current market prices for crops
  async getCurrentPrices(crop: string, region: string = 'all') {
    try {
      console.log(`Fetching market prices for ${crop} in ${region}`);
      
      // Check cache first
      const cacheKey = `market:prices:${crop}:${region}`;
      const cachedData = await kv.get(cacheKey);
      
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        return cachedData;
      }

      // Fetch fresh market data
      const priceData = await this.fetchMarketPrices(crop, region);
      
      // Cache the data
      await kv.set(cacheKey, priceData, { ttl: 1800 }); // 30 minutes cache
      
      return priceData;

    } catch (error) {
      console.log(`Market price fetch error: ${error.message}`);
      return this.getFallbackPriceData(crop, region);
    }
  }

  // Get market trends and analysis
  async getMarketTrends(crop: string, timeframe: string = '30days') {
    try {
      console.log(`Analyzing market trends for ${crop} over ${timeframe}`);
      
      // Get historical price data
      const historicalData = await this.getHistoricalPrices(crop, timeframe);
      
      // Analyze trends
      const trendAnalysis = this.analyzePriceTrends(historicalData);
      
      // Get demand-supply indicators
      const demandSupply = await this.getDemandSupplyIndicators(crop);
      
      // Generate price forecast
      const forecast = this.generatePriceForecast(historicalData, demandSupply);
      
      return {
        crop: crop,
        timeframe: timeframe,
        currentPrice: trendAnalysis.currentPrice,
        priceChange: trendAnalysis.priceChange,
        trend: trendAnalysis.trend,
        volatility: trendAnalysis.volatility,
        historicalData: historicalData,
        demandSupply: demandSupply,
        forecast: forecast,
        marketInsights: this.generateMarketInsights(crop, trendAnalysis, demandSupply),
        recommendations: this.generateMarketRecommendations(crop, trendAnalysis, forecast),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.log(`Market trends analysis error: ${error.message}`);
      throw error;
    }
  }

  // Get demand-supply analysis
  async getDemandSupplyAnalysis(crop: string) {
    try {
      console.log(`Analyzing demand-supply for ${crop}`);
      
      // Get production data
      const productionData = await this.getProductionData(crop);
      
      // Get consumption/demand data
      const demandData = await this.getDemandData(crop);
      
      // Calculate supply-demand balance
      const balance = this.calculateSupplyDemandBalance(productionData, demandData);
      
      // Get inventory levels
      const inventory = await this.getInventoryLevels(crop);
      
      // Analyze import-export impact
      const tradeImpact = await this.getTradeImpact(crop);
      
      return {
        crop: crop,
        supply: {
          production: productionData.current,
          expectedHarvest: productionData.forecast,
          inventory: inventory,
          imports: tradeImpact.imports
        },
        demand: {
          domestic: demandData.domestic,
          industrial: demandData.industrial,
          export: tradeImpact.exports,
          total: demandData.total
        },
        balance: balance,
        priceImpact: this.assessPriceImpact(balance),
        seasonalFactors: this.getSeasonalFactors(crop),
        recommendations: this.generateSupplyDemandRecommendations(balance),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.log(`Demand-supply analysis error: ${error.message}`);
      throw error;
    }
  }

  // Get crop-specific market intelligence
  async getMarketIntelligence(crop: string) {
    try {
      const [prices, trends, demandSupply] = await Promise.all([
        this.getCurrentPrices(crop),
        this.getMarketTrends(crop),
        this.getDemandSupplyAnalysis(crop)
      ]);

      // Get competitor analysis
      const competitors = this.getCompetitorAnalysis(crop);
      
      // Get quality premiums
      const qualityFactors = this.getQualityPremiums(crop);
      
      // Get logistical considerations
      const logistics = this.getLogisticalFactors(crop);

      return {
        crop: crop,
        overview: {
          currentPrice: prices.currentPrice,
          trend: trends.trend,
          demandLevel: demandSupply.balance.demandLevel,
          supplyLevel: demandSupply.balance.supplyLevel
        },
        opportunities: this.identifyMarketOpportunities(prices, trends, demandSupply),
        risks: this.identifyMarketRisks(trends, demandSupply),
        qualityFactors: qualityFactors,
        logistics: logistics,
        competitors: competitors,
        strategicInsights: this.generateStrategicInsights(crop, trends, demandSupply),
        actionableRecommendations: this.generateActionableRecommendations(crop, prices, trends),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.log(`Market intelligence error: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private async fetchMarketPrices(crop: string, region: string) {
    // Simulate API call to market data providers
    // In real implementation, this would call APIs like:
    // - National Sample Survey Office (NSSO)
    // - Agricultural Marketing Division data
    // - State Agricultural Marketing Boards
    // - Private market data providers

    const basePrice = this.getBasePriceForCrop(crop);
    const regionalMultiplier = this.getRegionalMultiplier(region);
    const marketVolatility = this.getCurrentMarketVolatility(crop);
    
    const currentPrice = basePrice * regionalMultiplier * (1 + marketVolatility);
    const previousPrice = basePrice * regionalMultiplier;
    
    return {
      crop: crop,
      region: region,
      currentPrice: Math.round(currentPrice),
      previousPrice: Math.round(previousPrice),
      change: Math.round(((currentPrice - previousPrice) / previousPrice) * 100 * 10) / 10,
      unit: this.getPriceUnit(crop),
      marketCenters: this.getRegionalMarketCenters(crop, region),
      lastUpdated: new Date().toISOString(),
      source: 'Agricultural Marketing Intelligence',
      reliability: 'high'
    };
  }

  private async getHistoricalPrices(crop: string, timeframe: string) {
    const days = this.getTimeframeDays(timeframe);
    const basePrice = this.getBasePriceForCrop(crop);
    const historicalData = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price variations
      const seasonalFactor = this.getSeasonalPriceFactor(crop, date);
      const volatilityFactor = 1 + (Math.random() - 0.5) * 0.2; // ±10% random variation
      const trendFactor = 1 + (i / days) * 0.1; // Slight upward trend
      
      const price = basePrice * seasonalFactor * volatilityFactor * trendFactor;
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        volume: this.generateTradeVolume(crop),
        marketActivity: this.assessMarketActivity(price, basePrice)
      });
    }
    
    return historicalData;
  }

  private analyzePriceTrends(historicalData: any[]) {
    if (historicalData.length < 2) {
      return { trend: 'insufficient_data', volatility: 0, priceChange: 0 };
    }

    const prices = historicalData.map(d => d.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[0];
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    // Calculate volatility (standard deviation)
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean * 100; // Coefficient of variation
    
    // Determine trend
    let trend = 'stable';
    if (priceChange > 5) trend = 'bullish';
    else if (priceChange < -5) trend = 'bearish';
    else if (volatility > 15) trend = 'volatile';
    
    return {
      currentPrice: currentPrice,
      previousPrice: previousPrice,
      priceChange: Math.round(priceChange * 10) / 10,
      trend: trend,
      volatility: Math.round(volatility * 10) / 10,
      mean: Math.round(mean),
      support: Math.min(...prices),
      resistance: Math.max(...prices)
    };
  }

  private async getDemandSupplyIndicators(crop: string) {
    return {
      demandLevel: this.calculateDemandLevel(crop),
      supplyLevel: this.calculateSupplyLevel(crop),
      inventoryTurnover: this.calculateInventoryTurnover(crop),
      seasonalDemand: this.getSeasonalDemandPattern(crop),
      priceElasticity: this.getPriceElasticity(crop),
      substituteCrops: this.getSubstituteCrops(crop)
    };
  }

  private generatePriceForecast(historicalData: any[], demandSupply: any) {
    const recentPrices = historicalData.slice(-7).map(d => d.price); // Last 7 days
    const avgRecentPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    
    // Simple forecast based on trend and demand-supply
    const trendFactor = this.calculateTrendFactor(recentPrices);
    const demandSupplyFactor = this.getDemandSupplyFactor(demandSupply);
    
    const forecastDays = [7, 14, 30];
    const forecasts = forecastDays.map(days => {
      const forecastPrice = avgRecentPrice * trendFactor * demandSupplyFactor * (1 + Math.random() * 0.1);
      return {
        period: `${days} days`,
        price: Math.round(forecastPrice),
        confidence: this.calculateForecastConfidence(days),
        factors: this.getForecastFactors(days)
      };
    });
    
    return {
      forecasts: forecasts,
      methodology: 'Trend analysis with demand-supply adjustment',
      confidence: 'moderate',
      lastUpdated: new Date().toISOString()
    };
  }

  private generateMarketInsights(crop: string, trendAnalysis: any, demandSupply: any): string[] {
    const insights = [];
    
    if (trendAnalysis.trend === 'bullish') {
      insights.push(`${crop} prices showing strong upward momentum with ${trendAnalysis.priceChange}% increase`);
    } else if (trendAnalysis.trend === 'bearish') {
      insights.push(`${crop} prices under pressure with ${Math.abs(trendAnalysis.priceChange)}% decline`);
    } else if (trendAnalysis.trend === 'volatile') {
      insights.push(`${crop} market experiencing high volatility - exercise caution`);
    }
    
    if (demandSupply.demandLevel === 'high' && demandSupply.supplyLevel === 'low') {
      insights.push('Strong demand with limited supply supporting higher prices');
    } else if (demandSupply.demandLevel === 'low' && demandSupply.supplyLevel === 'high') {
      insights.push('Oversupply situation may pressure prices downward');
    }
    
    if (trendAnalysis.volatility > 20) {
      insights.push('High price volatility suggests market uncertainty - consider price risk management');
    }
    
    return insights;
  }

  private generateMarketRecommendations(crop: string, trendAnalysis: any, forecast: any): string[] {
    const recommendations = [];
    
    if (trendAnalysis.trend === 'bullish') {
      recommendations.push('Consider holding inventory for better prices');
      recommendations.push('Good time to market surplus produce');
    } else if (trendAnalysis.trend === 'bearish') {
      recommendations.push('Consider quick sales to avoid further price decline');
      recommendations.push('Focus on cost reduction strategies');
    }
    
    if (forecast.forecasts[0].confidence > 70) {
      recommendations.push(`Price forecast indicates ${forecast.forecasts[0].price} in next week - plan accordingly`);
    }
    
    if (trendAnalysis.volatility > 15) {
      recommendations.push('Consider forward contracts to hedge price risk');
    }
    
    return recommendations;
  }

  private getProductionData(crop: string) {
    return {
      current: this.getCurrentProduction(crop),
      forecast: this.getForecastProduction(crop),
      areaUnderCultivation: this.getAreaUnderCultivation(crop),
      yield: this.getAverageYield(crop),
      quality: this.getQualityDistribution(crop)
    };
  }

  private getDemandData(crop: string) {
    const domesticDemand = this.getDomesticDemand(crop);
    const industrialDemand = this.getIndustrialDemand(crop);
    
    return {
      domestic: domesticDemand,
      industrial: industrialDemand,
      total: domesticDemand + industrialDemand,
      growth: this.getDemandGrowthRate(crop)
    };
  }

  private calculateSupplyDemandBalance(production: any, demand: any) {
    const supplyRatio = production.current / demand.total;
    
    let balanceStatus = 'balanced';
    if (supplyRatio > 1.1) balanceStatus = 'surplus';
    else if (supplyRatio < 0.9) balanceStatus = 'deficit';
    
    return {
      supplyRatio: Math.round(supplyRatio * 100) / 100,
      status: balanceStatus,
      surplus: Math.max(0, production.current - demand.total),
      deficit: Math.max(0, demand.total - production.current),
      demandLevel: demand.total > production.current * 1.1 ? 'high' : demand.total < production.current * 0.9 ? 'low' : 'moderate',
      supplyLevel: production.current > demand.total * 1.1 ? 'high' : production.current < demand.total * 0.9 ? 'low' : 'adequate'
    };
  }

  private isCacheValid(timestamp: string): boolean {
    const cacheTime = new Date(timestamp).getTime();
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    return (now - cacheTime) < maxAge;
  }

  private getFallbackPriceData(crop: string, region: string) {
    const basePrice = this.getBasePriceForCrop(crop);
    
    return {
      crop: crop,
      region: region,
      currentPrice: basePrice,
      previousPrice: basePrice * 0.95,
      change: 5.0,
      unit: this.getPriceUnit(crop),
      lastUpdated: new Date().toISOString(),
      source: 'fallback_data',
      reliability: 'estimated'
    };
  }

  // Utility methods for market calculations

  private getBasePriceForCrop(crop: string): number {
    const basePrices = {
      tomatoes: 45,      // ₹ per kg
      cotton: 6200,      // ₹ per quintal
      sugarcane: 3200,   // ₹ per quintal
      wheat: 2100,       // ₹ per quintal
      rice: 2800,        // ₹ per quintal
      onion: 35,         // ₹ per kg
      potato: 25,        // ₹ per kg
      soybean: 4500,     // ₹ per quintal
      maize: 1900        // ₹ per quintal
    };
    
    return basePrices[crop] || 100;
  }

  private getRegionalMultiplier(region: string): number {
    const multipliers = {
      'maharashtra': 1.0,
      'punjab': 1.05,
      'karnataka': 0.95,
      'gujarat': 1.02,
      'rajasthan': 0.98,
      'haryana': 1.03,
      'all': 1.0
    };
    
    return multipliers[region.toLowerCase()] || 1.0;
  }

  private getCurrentMarketVolatility(crop: string): number {
    // Simulate market volatility (±5% to ±15%)
    const volatilityRanges = {
      tomatoes: 0.15,    // High volatility
      cotton: 0.08,      // Moderate volatility
      sugarcane: 0.05,   // Low volatility
      wheat: 0.06,       // Low volatility
      rice: 0.07         // Low volatility
    };
    
    const maxVolatility = volatilityRanges[crop] || 0.1;
    return (Math.random() - 0.5) * 2 * maxVolatility;
  }

  private getPriceUnit(crop: string): string {
    const units = {
      tomatoes: '₹/kg',
      cotton: '₹/quintal',
      sugarcane: '₹/quintal',
      wheat: '₹/quintal',
      rice: '₹/quintal',
      onion: '₹/kg',
      potato: '₹/kg'
    };
    
    return units[crop] || '₹/kg';
  }

  private getRegionalMarketCenters(crop: string, region: string) {
    const centers = {
      tomatoes: ['Nashik', 'Pune', 'Mumbai', 'Bangalore'],
      cotton: ['Nagpur', 'Akola', 'Yavatmal', 'Aurangabad'],
      sugarcane: ['Kolhapur', 'Sangli', 'Ahmednagar', 'Pune']
    };
    
    return centers[crop] || ['Local Market'];
  }

  private getTimeframeDays(timeframe: string): number {
    const timeframes = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
      '6months': 180,
      '1year': 365
    };
    
    return timeframes[timeframe] || 30;
  }

  private getSeasonalPriceFactor(crop: string, date: Date): number {
    const month = date.getMonth() + 1; // 1-12
    
    // Seasonal price patterns (simplified)
    const seasonalPatterns = {
      tomatoes: {
        1: 1.2, 2: 1.3, 3: 1.1, 4: 0.9, 5: 0.8, 6: 0.9,
        7: 1.0, 8: 1.1, 9: 1.2, 10: 1.3, 11: 1.4, 12: 1.3
      },
      cotton: {
        1: 1.1, 2: 1.0, 3: 0.9, 4: 0.9, 5: 0.9, 6: 0.9,
        7: 0.9, 8: 0.9, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.1
      }
    };
    
    const pattern = seasonalPatterns[crop];
    return pattern ? pattern[month] : 1.0;
  }

  private generateTradeVolume(crop: string): number {
    const baseVolumes = {
      tomatoes: 50000,   // kg
      cotton: 10000,     // quintals
      sugarcane: 20000   // quintals
    };
    
    const baseVolume = baseVolumes[crop] || 25000;
    return Math.round(baseVolume * (0.8 + Math.random() * 0.4)); // ±20% variation
  }

  private assessMarketActivity(currentPrice: number, basePrice: number): string {
    const ratio = currentPrice / basePrice;
    
    if (ratio > 1.1) return 'high';
    if (ratio < 0.9) return 'low';
    return 'moderate';
  }

  private calculateDemandLevel(crop: string): string {
    // Simulate demand assessment
    const demands = ['low', 'moderate', 'high'];
    return demands[Math.floor(Math.random() * demands.length)];
  }

  private calculateSupplyLevel(crop: string): string {
    // Simulate supply assessment
    const supplies = ['low', 'adequate', 'high'];
    return supplies[Math.floor(Math.random() * supplies.length)];
  }

  private calculateInventoryTurnover(crop: string): number {
    // Days of inventory coverage
    return 15 + Math.random() * 20; // 15-35 days
  }

  private getSeasonalDemandPattern(crop: string): any {
    return {
      peak: 'October-January',
      low: 'May-July',
      pattern: 'Winter festival season drives higher consumption'
    };
  }

  private getPriceElasticity(crop: string): number {
    // Price elasticity of demand (absolute value)
    const elasticities = {
      tomatoes: 0.8,     // Relatively inelastic
      cotton: 1.2,       // Elastic
      sugarcane: 0.6     // Inelastic
    };
    
    return elasticities[crop] || 1.0;
  }

  private getSubstituteCrops(crop: string): string[] {
    const substitutes = {
      tomatoes: ['capsicum', 'cucumber', 'other vegetables'],
      cotton: ['synthetic fibers', 'other cash crops'],
      sugarcane: ['sugar beet', 'corn for ethanol']
    };
    
    return substitutes[crop] || [];
  }

  private calculateTrendFactor(recentPrices: number[]): number {
    if (recentPrices.length < 2) return 1.0;
    
    const firstPrice = recentPrices[0];
    const lastPrice = recentPrices[recentPrices.length - 1];
    
    return lastPrice / firstPrice;
  }

  private getDemandSupplyFactor(demandSupply: any): number {
    if (demandSupply.demandLevel === 'high' && demandSupply.supplyLevel === 'low') return 1.1;
    if (demandSupply.demandLevel === 'low' && demandSupply.supplyLevel === 'high') return 0.9;
    return 1.0;
  }

  private calculateForecastConfidence(days: number): number {
    // Confidence decreases with forecast horizon
    return Math.max(50, 90 - days * 1.5);
  }

  private getForecastFactors(days: number): string[] {
    const factors = ['weather patterns', 'seasonal demand', 'supply chain dynamics'];
    
    if (days > 14) {
      factors.push('policy changes', 'international market trends');
    }
    
    return factors;
  }

  // Additional helper methods for comprehensive market intelligence

  private getCurrentProduction(crop: string): number {
    const productions = {
      tomatoes: 1200000,  // tons
      cotton: 350000,     // bales
      sugarcane: 4000000  // tons
    };
    
    return productions[crop] || 500000;
  }

  private getForecastProduction(crop: string): number {
    const current = this.getCurrentProduction(crop);
    return current * (0.95 + Math.random() * 0.1); // ±5% variation
  }

  private getAreaUnderCultivation(crop: string): number {
    const areas = {
      tomatoes: 50000,    // hectares
      cotton: 120000,     // hectares
      sugarcane: 80000    // hectares
    };
    
    return areas[crop] || 40000;
  }

  private getAverageYield(crop: string): number {
    const yields = {
      tomatoes: 24,       // tons/hectare
      cotton: 2.9,        // bales/hectare
      sugarcane: 50       // tons/hectare
    };
    
    return yields[crop] || 20;
  }

  private getQualityDistribution(crop: string): any {
    return {
      premium: 25,        // percentage
      standard: 65,       // percentage
      substandard: 10     // percentage
    };
  }

  private getDomesticDemand(crop: string): number {
    const demands = {
      tomatoes: 1100000,  // tons
      cotton: 320000,     // bales
      sugarcane: 3800000  // tons
    };
    
    return demands[crop] || 450000;
  }

  private getIndustrialDemand(crop: string): number {
    const industrialDemands = {
      tomatoes: 200000,   // tons (processing)
      cotton: 280000,     // bales (textiles)
      sugarcane: 3600000  // tons (sugar mills)
    };
    
    return industrialDemands[crop] || 100000;
  }

  private getDemandGrowthRate(crop: string): number {
    // Annual growth rate percentage
    const growthRates = {
      tomatoes: 3.5,
      cotton: 2.1,
      sugarcane: 1.8
    };
    
    return growthRates[crop] || 2.5;
  }

  private async getInventoryLevels(crop: string): Promise<any> {
    return {
      farmGate: Math.round(Math.random() * 50000),      // tons at farm level
      wholesale: Math.round(Math.random() * 30000),     // tons at wholesale markets
      retail: Math.round(Math.random() * 10000),        // tons at retail level
      processing: Math.round(Math.random() * 20000)     // tons at processing units
    };
  }

  private async getTradeImpact(crop: string): Promise<any> {
    return {
      imports: {
        volume: Math.round(Math.random() * 10000),
        value: Math.round(Math.random() * 100000000), // in rupees
        countries: ['China', 'USA', 'Brazil']
      },
      exports: {
        volume: Math.round(Math.random() * 15000),
        value: Math.round(Math.random() * 150000000), // in rupees
        countries: ['Bangladesh', 'Nepal', 'UAE']
      }
    };
  }

  private assessPriceImpact(balance: any): string {
    if (balance.status === 'surplus') return 'downward_pressure';
    if (balance.status === 'deficit') return 'upward_pressure';
    return 'neutral';
  }

  private getSeasonalFactors(crop: string): any {
    return {
      plantingSeason: this.getPlantingSeason(crop),
      harvestSeason: this.getHarvestSeason(crop),
      peakConsumption: this.getPeakConsumptionPeriod(crop),
      weatherDependency: this.getWeatherDependency(crop)
    };
  }

  private generateSupplyDemandRecommendations(balance: any): string[] {
    const recommendations = [];
    
    if (balance.status === 'surplus') {
      recommendations.push('Explore export opportunities');
      recommendations.push('Consider value-added processing');
      recommendations.push('Focus on quality premiums');
    } else if (balance.status === 'deficit') {
      recommendations.push('Increase production capacity');
      recommendations.push('Improve yield through better practices');
      recommendations.push('Consider premium pricing strategies');
    } else {
      recommendations.push('Maintain current production levels');
      recommendations.push('Focus on cost optimization');
    }
    
    return recommendations;
  }

  private getCompetitorAnalysis(crop: string): any {
    return {
      majorProducers: ['Maharashtra', 'Karnataka', 'Andhra Pradesh'],
      marketShare: { maharashtra: 35, karnataka: 25, others: 40 },
      competitiveAdvantages: ['Climate', 'Technology', 'Infrastructure'],
      threats: ['New varieties', 'Climate change', 'Policy changes']
    };
  }

  private getQualityPremiums(crop: string): any {
    return {
      organic: '20-30% premium',
      certified: '10-15% premium',
      export_quality: '15-25% premium',
      processing_grade: '5-10% discount'
    };
  }

  private getLogisticalFactors(crop: string): any {
    return {
      storageCapacity: 'adequate',
      transportCosts: 'moderate',
      packagingRequirements: 'standard',
      shelfLife: this.getShelfLife(crop),
      coldChainNeed: this.getColdChainRequirement(crop)
    };
  }

  private identifyMarketOpportunities(prices: any, trends: any, demandSupply: any): string[] {
    const opportunities = [];
    
    if (trends.trend === 'bullish') {
      opportunities.push('Strong price momentum - good selling opportunity');
    }
    
    if (demandSupply.balance.status === 'deficit') {
      opportunities.push('Supply shortage creates premium pricing opportunity');
    }
    
    if (prices.change > 10) {
      opportunities.push('Significant price increase indicates strong market conditions');
    }
    
    return opportunities;
  }

  private identifyMarketRisks(trends: any, demandSupply: any): string[] {
    const risks = [];
    
    if (trends.volatility > 15) {
      risks.push('High price volatility increases market uncertainty');
    }
    
    if (trends.trend === 'bearish') {
      risks.push('Declining price trend may continue');
    }
    
    if (demandSupply.balance.status === 'surplus') {
      risks.push('Oversupply situation may pressure prices downward');
    }
    
    return risks;
  }

  private generateStrategicInsights(crop: string, trends: any, demandSupply: any): string[] {
    const insights = [];
    
    insights.push(`Market fundamentals for ${crop} show ${demandSupply.balance.status} conditions`);
    insights.push(`Price trend is ${trends.trend} with ${trends.volatility}% volatility`);
    
    if (trends.priceChange > 5) {
      insights.push('Strong price momentum suggests favorable market conditions');
    }
    
    return insights;
  }

  private generateActionableRecommendations(crop: string, prices: any, trends: any): string[] {
    const recommendations = [];
    
    if (trends.trend === 'bullish') {
      recommendations.push('Hold inventory for better prices if storage capacity allows');
      recommendations.push('Increase marketing efforts to capitalize on strong demand');
    }
    
    if (prices.change > 10) {
      recommendations.push('Consider forward sales to lock in current high prices');
    }
    
    if (trends.volatility > 15) {
      recommendations.push('Use price risk management tools like futures/options');
    }
    
    return recommendations;
  }

  // Utility methods for crop-specific data

  private getPlantingSeason(crop: string): string {
    const seasons = {
      tomatoes: 'June-July (Kharif), November-December (Rabi)',
      cotton: 'April-May (Kharif)',
      sugarcane: 'October-March'
    };
    
    return seasons[crop] || 'Varies by region';
  }

  private getHarvestSeason(crop: string): string {
    const seasons = {
      tomatoes: 'September-November (Kharif), February-April (Rabi)',
      cotton: 'October-January',
      sugarcane: 'November-April'
    };
    
    return seasons[crop] || 'Varies by region';
  }

  private getPeakConsumptionPeriod(crop: string): string {
    const periods = {
      tomatoes: 'October-February (Festival season)',
      cotton: 'Year-round (Textile industry)',
      sugarcane: 'October-March (Sugar season)'
    };
    
    return periods[crop] || 'Year-round';
  }

  private getWeatherDependency(crop: string): string {
    const dependencies = {
      tomatoes: 'High - sensitive to temperature and rainfall',
      cotton: 'Moderate - drought tolerant but needs timely rainfall',
      sugarcane: 'High - water intensive crop'
    };
    
    return dependencies[crop] || 'Moderate';
  }

  private getShelfLife(crop: string): string {
    const shelfLives = {
      tomatoes: '7-14 days',
      cotton: '1-2 years (with proper storage)',
      sugarcane: '2-3 days (fresh), months (processed)'
    };
    
    return shelfLives[crop] || '1-2 weeks';
  }

  private getColdChainRequirement(crop: string): string {
    const requirements = {
      tomatoes: 'Essential for quality preservation',
      cotton: 'Not required',
      sugarcane: 'Not required for short distances'
    };
    
    return requirements[crop] || 'Recommended';
  }
}