import * as kv from './kv_store.ts'

export class NotificationService {
  
  // Subscribe user to notifications
  async subscribe(subscription: any) {
    try {
      const {
        userId,
        farmId,
        notificationTypes,
        channels,
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

  // Send weather alerts
  async sendWeatherAlert(farmId: string, weatherAlert: any) {
    try {
      console.log(`Sending weather alert for farm ${farmId}`);
      
      const notification = {
        id: `weather_${Date.now()}`,
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
        channels: ['push', 'sms'],
        timestamp: new Date().toISOString(),
        status: 'pending',
        read: false
      };

      return {
        farmId: farmId,
        alertType: weatherAlert.type,
        notification: notification
      };

    } catch (error) {
      console.log(`Weather alert error: ${error.message}`);
      throw error;
    }
  }

  // Send price alerts
  async sendPriceAlert(crop: string, priceData: any) {
    try {
      console.log(`Sending price alert for ${crop}`);
      
      const notification = {
        id: `price_${Date.now()}`,
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
        timestamp: new Date().toISOString(),
        status: 'pending',
        read: false
      };

      return {
        crop: crop,
        priceChange: priceData.changePercent,
        notification: notification
      };

    } catch (error) {
      console.log(`Price alert error: ${error.message}`);
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

      return {
        alertType: alert.type,
        processed: true,
        notification: alertNotification
      };

    } catch (error) {
      console.log(`Process alert error: ${error.message}`);
      throw error;
    }
  }

  private groupNotificationsByType(notifications: any[]) {
    return notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});
  }
}