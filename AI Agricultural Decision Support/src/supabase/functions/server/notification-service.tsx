import * as kv from './kv_store.ts'

export class NotificationService {
  
  // Subscribe user to notifications
  async subscribe(subscription: any) {
    try {
      const {
        userId,
        farmId,
        notificationTypes,
        channels, // email, sms, push
        preferences
      } = subscription;

      const subscriptionData = {
        userId: userId,
        farmId: farmId,
        notificationTypes: notificationTypes || ['price_alerts', 'weather_warnings', 'crop_recommendations'],
        channels: channels || ['push'],
        preferences: {
          frequency: preferences?.frequency || 'immediate',
          quietHours: preferences?.quietHours || { start: '22:00', end: '06:00' },
          language: preferences?.language || 'en',
          timezone: preferences?.timezone || 'Asia/Kolkata'
        },
        isActive: true,
        subscribedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Store subscription
      await kv.set(`notifications:subscription:${userId}`, subscriptionData);
      
      // Add to notification queues for different types
      for (const type of subscriptionData.notificationTypes) {
        const queueKey = `notifications:queue:${type}`;
        const subscribers = await kv.get(queueKey) || [];
        
        if (!subscribers.includes(userId)) {
          subscribers.push(userId);
          await kv.set(queueKey, subscribers);
        }
      }

      console.log(`User ${userId} subscribed to notifications`);
      return { status: 'subscribed', userId: userId };

    } catch (error) {
      console.log(`Notification subscription error: ${error.message}`);
      throw error;
    }
  }

  // Send alerts to subscribed users
  async sendAlerts(alerts: any[]) {
    try {
      console.log(`Sending ${alerts.length} alerts`);
      
      const results = [];
      
      for (const alert of alerts) {
        const result = await this.processAlert(alert);
        results.push(result);
      }

      return {
        totalAlerts: alerts.length,
        processed: results.length,
        results: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.log(`Alert sending error: ${error.message}`);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string) {
    try {
      const notifications = await kv.get(`notifications:user:${userId}`) || [];
      
      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Mark as delivered
      for (const notification of notifications) {
        if (notification.status === 'pending') {
          notification.status = 'delivered';
          notification.deliveredAt = new Date().toISOString();
        }
      }
      
      // Update stored notifications
      await kv.set(`notifications:user:${userId}`, notifications);
      
      return {
        userId: userId,
        notifications: notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.log(`Get user notifications error: ${error.message}`);
      throw error;
    }
  }

  // Send scheduled notifications (weather, market updates, etc.)
  async sendScheduledNotifications() {
    try {
      console.log('Processing scheduled notifications');
      
      const notificationTypes = ['weather_updates', 'market_updates', 'crop_reminders'];
      const results = [];
      
      for (const type of notificationTypes) {
        const result = await this.processScheduledNotificationType(type);
        results.push(result);
      }

      return {
        processedTypes: notificationTypes.length,
        results: results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.log(`Scheduled notifications error: ${error.message}`);
      throw error;
    }
  }

  // Send personalized crop recommendations
  async sendCropRecommendations(userId: string, recommendations: any[]) {
    try {
      const subscription = await kv.get(`notifications:subscription:${userId}`);
      
      if (!subscription || !subscription.isActive || !subscription.notificationTypes.includes('crop_recommendations')) {
        return { status: 'not_subscribed' };
      }

      const notification = {
        id: `crop_rec_${Date.now()}`,
        userId: userId,
        type: 'crop_recommendations',
        title: 'New Crop Recommendations Available',
        message: `We have ${recommendations.length} new crop recommendations based on your farm data`,
        data: {
          recommendations: recommendations.slice(0, 3), // Top 3 recommendations
          totalCount: recommendations.length
        },
        priority: 'normal',
        channels: subscription.channels,
        timestamp: new Date().toISOString(),
        status: 'pending',
        read: false
      };

      await this.storeAndDeliverNotification(userId, notification);
      
      return { status: 'sent', notificationId: notification.id };

    } catch (error) {
      console.log(`Crop recommendations notification error: ${error.message}`);
      throw error;
    }
  }

  // Send weather alerts
  async sendWeatherAlert(farmId: string, weatherAlert: any) {
    try {
      console.log(`Sending weather alert for farm ${farmId}`);
      
      // Get users subscribed to this farm
      const subscribedUsers = await this.getUsersForFarm(farmId, 'weather_warnings');
      
      const results = [];
      
      for (const userId of subscribedUsers) {
        const notification = {
          id: `weather_${Date.now()}_${userId}`,
          userId: userId,
          farmId: farmId,
          type: 'weather_warnings',
          title: `Weather Alert: ${weatherAlert.type}`,
          message: weatherAlert.message,
          data: {
            alertType: weatherAlert.type,
            severity: weatherAlert.severity,
            actionRequired: weatherAlert.actionRequired,
            validUntil: weatherAlert.validUntil
          },
          priority: weatherAlert.severity === 'severe' ? 'high' : 'normal',
          channels: ['push', 'sms'], // Weather alerts use multiple channels
          timestamp: new Date().toISOString(),
          status: 'pending',
          read: false
        };

        const result = await this.storeAndDeliverNotification(userId, notification);
        results.push({ userId, result });
      }

      return {
        farmId: farmId,
        alertType: weatherAlert.type,
        usersNotified: results.length,
        results: results
      };

    } catch (error) {
      console.log(`Weather alert error: ${error.message}`);
      throw error;
    }
  }

  // Send market price alerts
  async sendPriceAlert(crop: string, priceData: any) {
    try {
      console.log(`Sending price alert for ${crop}`);
      
      // Get users interested in this crop
      const interestedUsers = await this.getUsersForCrop(crop, 'price_alerts');
      
      const results = [];
      
      for (const userId of interestedUsers) {
        const subscription = await kv.get(`notifications:subscription:${userId}`);
        
        // Check if price change meets user's threshold
        const threshold = subscription?.preferences?.priceChangeThreshold || 5; // 5% default
        
        if (Math.abs(priceData.changePercent) >= threshold) {
          const notification = {
            id: `price_${Date.now()}_${userId}`,
            userId: userId,
            type: 'price_alerts',
            title: `Price Alert: ${crop}`,
            message: `${crop} price ${priceData.changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceData.changePercent)}% to ${priceData.currentPrice}`,
            data: {
              crop: crop,
              currentPrice: priceData.currentPrice,
              previousPrice: priceData.previousPrice,
              changePercent: priceData.changePercent,
              marketTrend: priceData.trend
            },
            priority: Math.abs(priceData.changePercent) > 10 ? 'high' : 'normal',
            channels: subscription.channels,
            timestamp: new Date().toISOString(),
            status: 'pending',
            read: false
          };

          const result = await this.storeAndDeliverNotification(userId, notification);
          results.push({ userId, result });
        }
      }

      return {
        crop: crop,
        priceChange: priceData.changePercent,
        usersNotified: results.length,
        results: results
      };

    } catch (error) {
      console.log(`Price alert error: ${error.message}`);
      throw error;
    }
  }

  // Send IoT sensor alerts
  async sendSensorAlert(farmId: string, sensorAlert: any) {
    try {
      console.log(`Sending sensor alert for farm ${farmId}`);
      
      const subscribedUsers = await this.getUsersForFarm(farmId, 'sensor_alerts');
      
      const results = [];
      
      for (const userId of subscribedUsers) {
        const notification = {
          id: `sensor_${Date.now()}_${userId}`,
          userId: userId,
          farmId: farmId,
          type: 'sensor_alerts',
          title: `Sensor Alert: ${sensorAlert.sensorType}`,
          message: sensorAlert.message,
          data: {
            sensorType: sensorAlert.sensorType,
            sensorId: sensorAlert.sensorId,
            value: sensorAlert.value,
            threshold: sensorAlert.threshold,
            actionRequired: sensorAlert.actionRequired
          },
          priority: sensorAlert.severity === 'critical' ? 'high' : 'normal',
          channels: ['push'],
          timestamp: new Date().toISOString(),
          status: 'pending',
          read: false
        };

        const result = await this.storeAndDeliverNotification(userId, notification);
        results.push({ userId, result });
      }

      return {
        farmId: farmId,
        sensorType: sensorAlert.sensorType,
        usersNotified: results.length,
        results: results
      };

    } catch (error) {
      console.log(`Sensor alert error: ${error.message}`);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(userId: string, notificationId: string) {
    try {
      const notifications = await kv.get(`notifications:user:${userId}`) || [];
      
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        
        await kv.set(`notifications:user:${userId}`, notifications);
        
        return { status: 'marked_as_read', notificationId: notificationId };
      }
      
      return { status: 'notification_not_found' };

    } catch (error) {
      console.log(`Mark as read error: ${error.message}`);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId?: string) {
    try {
      if (userId) {
        // User-specific stats
        const notifications = await kv.get(`notifications:user:${userId}`) || [];
        
        return {
          userId: userId,
          totalNotifications: notifications.length,
          unreadCount: notifications.filter(n => !n.read).length,
          byType: this.groupNotificationsByType(notifications),
          recentActivity: notifications.slice(0, 5),
          lastNotification: notifications[0]?.timestamp
        };
      } else {
        // System-wide stats
        const stats = await kv.get('notifications:system:stats') || {
          totalSent: 0,
          byType: {},
          byDay: {}
        };
        
        return {
          systemStats: stats,
          timestamp: new Date().toISOString()
        };
      }

    } catch (error) {
      console.log(`Notification stats error: ${error.message}`);
      throw error;
    }
  }

  // Private helper methods

  private async processAlert(alert: any) {
    try {
      const alertNotification = {
        type: 'system_alert',
        title: `Alert: ${alert.type}`,
        message: alert.message,
        severity: alert.severity,
        actionRequired: alert.action,
        timestamp: new Date().toISOString()
      };

      // Determine affected users based on alert type
      const affectedUsers = await this.getAffectedUsers(alert);
      
      const results = [];
      for (const userId of affectedUsers) {
        const result = await this.sendNotificationToUser(userId, alertNotification);
        results.push({ userId, result });
      }

      return {
        alertType: alert.type,
        usersNotified: results.length,
        results: results
      };

    } catch (error) {
      console.log(`Process alert error: ${error.message}`);
      throw error;
    }
  }

  private async processScheduledNotificationType(type: string) {
    try {
      const content = await this.generateScheduledContent(type);
      const subscribers = await kv.get(`notifications:queue:${type}`) || [];
      
      const results = [];
      
      for (const userId of subscribers) {
        const subscription = await kv.get(`notifications:subscription:${userId}`);
        
        if (subscription && subscription.isActive && this.shouldSendScheduledNotification(subscription, type)) {
          const notification = {
            id: `scheduled_${type}_${Date.now()}_${userId}`,
            userId: userId,
            type: type,
            title: content.title,
            message: content.message,
            data: content.data,
            priority: 'normal',
            channels: subscription.channels,
            timestamp: new Date().toISOString(),
            status: 'pending',
            read: false
          };

          const result = await this.storeAndDeliverNotification(userId, notification);
          results.push({ userId, result });
        }
      }

      return {
        type: type,
        subscribersNotified: results.length,
        results: results
      };

    } catch (error) {
      console.log(`Process scheduled notification type error: ${error.message}`);
      throw error;
    }
  }

  private async generateScheduledContent(type: string) {
    const contentGenerators = {
      weather_updates: () => ({
        title: 'Daily Weather Update',
        message: 'Check today\'s weather forecast and agricultural advice',
        data: { weatherSummary: 'Partly cloudy, good for field work' }
      }),
      market_updates: () => ({
        title: 'Market Price Update',
        message: 'Latest crop prices and market trends available',
        data: { marketSummary: 'Tomato prices trending upward' }
      }),
      crop_reminders: () => ({
        title: 'Crop Care Reminder',
        message: 'Time for scheduled farm activities',
        data: { activities: ['Irrigation check', 'Pest monitoring'] }
      })
    };

    const generator = contentGenerators[type];
    return generator ? generator() : {
      title: 'Farm Update',
      message: 'New update available',
      data: {}
    };
  }

  private shouldSendScheduledNotification(subscription: any, type: string): boolean {
    // Check quiet hours
    const now = new Date();
    const currentHour = now.getHours();
    const quietStart = parseInt(subscription.preferences.quietHours.start.split(':')[0]);
    const quietEnd = parseInt(subscription.preferences.quietHours.end.split(':')[0]);
    
    if (currentHour >= quietStart || currentHour <= quietEnd) {
      return false; // In quiet hours
    }

    // Check frequency preferences
    const frequency = subscription.preferences.frequency;
    if (frequency === 'never') return false;
    if (frequency === 'weekly' && now.getDay() !== 1) return false; // Only Monday for weekly
    
    return true;
  }

  private async storeAndDeliverNotification(userId: string, notification: any) {
    try {
      // Store notification for user
      const userNotifications = await kv.get(`notifications:user:${userId}`) || [];
      userNotifications.unshift(notification); // Add to beginning (newest first)
      
      // Keep only last 100 notifications per user
      if (userNotifications.length > 100) {
        userNotifications.splice(100);
      }
      
      await kv.set(`notifications:user:${userId}`, userNotifications);
      
      // Simulate delivery to different channels
      const deliveryResults = await this.deliverToChannels(notification);
      
      // Update system stats
      await this.updateSystemStats(notification);
      
      return {
        stored: true,
        delivered: deliveryResults,
        notificationId: notification.id
      };

    } catch (error) {
      console.log(`Store and deliver notification error: ${error.message}`);
      throw error;
    }
  }

  private async deliverToChannels(notification: any) {
    const results = {};
    
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'push':
            results.push = await this.sendPushNotification(notification);
            break;
          case 'email':
            results.email = await this.sendEmailNotification(notification);
            break;
          case 'sms':
            results.sms = await this.sendSMSNotification(notification);
            break;
        }
      } catch (error) {
        results[channel] = { status: 'failed', error: error.message };
      }
    }
    
    return results;
  }

  private async sendPushNotification(notification: any) {
    // Simulate push notification
    console.log(`Sending push notification: ${notification.title}`);
    return { status: 'sent', channel: 'push', timestamp: new Date().toISOString() };
  }

  private async sendEmailNotification(notification: any) {
    // Simulate email notification
    console.log(`Sending email notification: ${notification.title}`);
    return { status: 'sent', channel: 'email', timestamp: new Date().toISOString() };
  }

  private async sendSMSNotification(notification: any) {
    // Simulate SMS notification
    console.log(`Sending SMS notification: ${notification.title}`);
    return { status: 'sent', channel: 'sms', timestamp: new Date().toISOString() };
  }

  private async updateSystemStats(notification: any) {
    try {
      const stats = await kv.get('notifications:system:stats') || {
        totalSent: 0,
        byType: {},
        byDay: {}
      };
      
      stats.totalSent += 1;
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      const today = new Date().toISOString().split('T')[0];
      stats.byDay[today] = (stats.byDay[today] || 0) + 1;
      
      await kv.set('notifications:system:stats', stats);
      
    } catch (error) {
      console.log(`Update system stats error: ${error.message}`);
    }
  }

  private async getUsersForFarm(farmId: string, notificationType: string): Promise<string[]> {
    // In a real implementation, this would query the database for users associated with the farm
    // For now, simulate with stored data
    const farmUsers = await kv.get(`farm:users:${farmId}`) || [];
    
    const subscribedUsers = [];
    for (const userId of farmUsers) {
      const subscription = await kv.get(`notifications:subscription:${userId}`);
      if (subscription && subscription.isActive && subscription.notificationTypes.includes(notificationType)) {
        subscribedUsers.push(userId);
      }
    }
    
    return subscribedUsers;
  }

  private async getUsersForCrop(crop: string, notificationType: string): Promise<string[]> {
    // Get users who have this crop in their farm profile
    const cropUsers = await kv.get(`crop:users:${crop}`) || [];
    
    const subscribedUsers = [];
    for (const userId of cropUsers) {
      const subscription = await kv.get(`notifications:subscription:${userId}`);
      if (subscription && subscription.isActive && subscription.notificationTypes.includes(notificationType)) {
        subscribedUsers.push(userId);
      }
    }
    
    return subscribedUsers;
  }

  private async getAffectedUsers(alert: any): Promise<string[]> {
    // Determine users affected by the alert based on its type and scope
    switch (alert.type) {
      case 'system_maintenance':
        return await this.getAllActiveUsers();
      case 'farm_specific':
        return await this.getUsersForFarm(alert.farmId, 'system_alerts');
      case 'crop_specific':
        return await this.getUsersForCrop(alert.crop, 'system_alerts');
      default:
        return [];
    }
  }

  private async getAllActiveUsers(): Promise<string[]> {
    // Get all users with active subscriptions
    const allUsers = await kv.get('notifications:all_users') || [];
    
    const activeUsers = [];
    for (const userId of allUsers) {
      const subscription = await kv.get(`notifications:subscription:${userId}`);
      if (subscription && subscription.isActive) {
        activeUsers.push(userId);
      }
    }
    
    return activeUsers;
  }

  private async sendNotificationToUser(userId: string, notification: any) {
    const userNotification = {
      ...notification,
      id: `alert_${Date.now()}_${userId}`,
      userId: userId,
      status: 'pending',
      read: false
    };
    
    return await this.storeAndDeliverNotification(userId, userNotification);
  }

  private groupNotificationsByType(notifications: any[]) {
    return notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});
  }
}