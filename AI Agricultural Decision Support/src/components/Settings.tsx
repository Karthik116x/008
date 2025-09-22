import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Shield, 
  Download,
  Smartphone,
  Wifi,
  WifiOff,
  CheckCircle
} from 'lucide-react';

interface SettingsProps {
  language: string;
  setLanguage: (language: string) => void;
}

export function Settings({ language, setLanguage }: SettingsProps) {
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    weatherWarnings: true,
    cropRecommendations: true,
    marketUpdates: false,
    systemAlerts: true
  });
  const [offlineMode, setOfflineMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend/local storage
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const downloadOfflineData = () => {
    // Simulate downloading offline data
    alert('Offline data download started. You will be notified when complete.');
  };

  const translations = {
    en: {
      title: 'Settings',
      subtitle: 'Customize your Smart Farm Assistant experience',
      language: 'Language',
      notifications: 'Notifications',
      offline: 'Offline Mode',
      privacy: 'Privacy & Data',
      about: 'About',
      priceAlerts: 'Price Alerts',
      weatherWarnings: 'Weather Warnings',
      cropRecommendations: 'Crop Recommendations',
      marketUpdates: 'Market Updates',
      systemAlerts: 'System Alerts',
      enableOffline: 'Enable Offline Mode',
      downloadData: 'Download Offline Data',
      save: 'Save Settings',
      saved: 'Settings saved successfully!'
    },
    hi: {
      title: 'सेटिंग्स',
      subtitle: 'अपने स्मार्ट फार्म असिस्टेंट अनुभव को अनुकूलित करें',
      language: 'भाषा',
      notifications: 'सूचनाएं',
      offline: 'ऑफलाइन मोड',
      privacy: 'गोपनीयता और डेटा',
      about: 'के बारे में',
      priceAlerts: 'मूल्य अलर्ट',
      weatherWarnings: 'मौसम चेतावनी',
      cropRecommendations: 'फसल सुझाव',
      marketUpdates: 'बाजार अपडेट',
      systemAlerts: 'सिस्टम अलर्ट',
      enableOffline: 'ऑफलाइन मोड सक्षम करें',
      downloadData: 'ऑफलाइन डेटा डाउनलोड करें',
      save: 'सेटिंग्स सेव करें',
      saved: 'सेटिंग्स सफलतापूर्वक सेव हुईं!'
    },
    mr: {
      title: 'सेटिंग्ज',
      subtitle: 'तुमचा स्मार्ट फार्म असिस्टंट अनुभव सानुकूलित करा',
      language: 'भाषा',
      notifications: 'सूचना',
      offline: 'ऑफलाइन मोड',
      privacy: 'गोपनीयता आणि डेटा',
      about: 'बद्दल',
      priceAlerts: 'किंमत अलर्ट',
      weatherWarnings: 'हवामान चेतावणी',
      cropRecommendations: 'पीक शिफारसी',
      marketUpdates: 'बाजार अपडेट',
      systemAlerts: 'सिस्टम अलर्ट',
      enableOffline: 'ऑफलाइन मोड सक्षम करा',
      downloadData: 'ऑफलाइन डेटा डाउनलोड करा',
      save: 'सेटिंग्ज जतन करा',
      saved: 'सेटिंग्ज यशस्वीपणे जतन झाल्या!'
    }
  };

  const t = translations[language] || translations.en;

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { value: 'mr', label: 'मराठी', flag: '🇮🇳' }
  ];

  return (
    <div className="space-y-6">
      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {t.saved}
          </AlertDescription>
        </Alert>
      )}

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>{t.language}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language-select">Select Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600">
              Voice assistant and all content will be displayed in the selected language.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <span>{t.notifications}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="price-alerts">{t.priceAlerts}</Label>
                <p className="text-sm text-gray-600">Get notified when crop prices change significantly</p>
              </div>
              <Switch
                id="price-alerts"
                checked={notifications.priceAlerts}
                onCheckedChange={(value) => handleNotificationChange('priceAlerts', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weather-warnings">{t.weatherWarnings}</Label>
                <p className="text-sm text-gray-600">Receive alerts for severe weather conditions</p>
              </div>
              <Switch
                id="weather-warnings"
                checked={notifications.weatherWarnings}
                onCheckedChange={(value) => handleNotificationChange('weatherWarnings', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="crop-recommendations">{t.cropRecommendations}</Label>
                <p className="text-sm text-gray-600">Get AI-powered crop suggestions</p>
              </div>
              <Switch
                id="crop-recommendations"
                checked={notifications.cropRecommendations}
                onCheckedChange={(value) => handleNotificationChange('cropRecommendations', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="market-updates">{t.marketUpdates}</Label>
                <p className="text-sm text-gray-600">Daily market price updates</p>
              </div>
              <Switch
                id="market-updates"
                checked={notifications.marketUpdates}
                onCheckedChange={(value) => handleNotificationChange('marketUpdates', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system-alerts">{t.systemAlerts}</Label>
                <p className="text-sm text-gray-600">Important system and maintenance notifications</p>
              </div>
              <Switch
                id="system-alerts"
                checked={notifications.systemAlerts}
                onCheckedChange={(value) => handleNotificationChange('systemAlerts', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {offlineMode ? <WifiOff className="h-5 w-5 text-gray-600" /> : <Wifi className="h-5 w-5 text-green-600" />}
            <span>{t.offline}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-mode">{t.enableOffline}</Label>
                <p className="text-sm text-gray-600">Access basic features without internet connection</p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
            </div>

            {offlineMode && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Offline Data</h4>
                  <Badge variant="secondary">2.3 MB</Badge>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Download essential data for offline access including weather forecasts, soil data, and crop recommendations.
                </p>
                <Button onClick={downloadOfflineData} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {t.downloadData}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>{t.privacy}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Data Usage</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Weather Data</span>
                  <span>Updated daily</span>
                </div>
                <div className="flex justify-between">
                  <span>Soil Analysis</span>
                  <span>Stored locally</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Prices</span>
                  <span>Real-time</span>
                </div>
                <div className="flex justify-between">
                  <span>Farm Profile</span>
                  <span>Encrypted</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Your farm data is encrypted and stored securely. We never share personal information with third parties without your consent.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-gray-600" />
            <span>{t.about}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">App Version</h4>
                <p className="text-sm text-gray-600">Smart Farm Assistant v2.1.0</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                <p className="text-sm text-gray-600">September 22, 2025</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">AI Model</h4>
                <p className="text-sm text-gray-600">CropAI v3.2 - Trained on 10M+ data points</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
                <p className="text-sm text-gray-600">Weather API, ISRO Bhuvan, Market Intelligence</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">PWA Ready</Badge>
              <Badge variant="secondary">Offline Capable</Badge>
              <Badge variant="secondary">Multi-language</Badge>
              <Badge variant="secondary">Voice Enabled</Badge>
              <Badge variant="secondary">AI Powered</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          {t.save}
        </Button>
      </div>
    </div>
  );
}