import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Wifi,
  Database,
  Cloud,
  Activity
} from 'lucide-react';
import { apiClient } from './services/api-client';

export function BackendStatus() {
  const [status, setStatus] = useState({
    overall: 'checking',
    services: {},
    lastChecked: null
  });
  const [checking, setChecking] = useState(false);

  const checkBackendHealth = async () => {
    setChecking(true);
    
    try {
      const healthResponse = await apiClient.checkHealth();
      
      setStatus({
        overall: 'healthy',
        services: healthResponse.services || {},
        lastChecked: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Backend health check failed:', error);
      
      setStatus({
        overall: 'error',
        services: {},
        lastChecked: new Date().toISOString(),
        error: error.message
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'active':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'delayed':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'active':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delayed':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>System Status</span>
          </CardTitle>
          <Button
            onClick={checkBackendHealth}
            disabled={checking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {status.overall === 'error' && (
          <Alert className="mb-4 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Backend Connection Error:</strong> {status.error}
              <br />
              <span className="text-sm">The system is running in offline mode with cached data.</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Status */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(status.overall)}
            <div>
              <p className="font-medium text-gray-900">Overall</p>
              <Badge className={getStatusColor(status.overall)}>
                {status.overall === 'checking' ? 'Checking...' : 
                 status.overall === 'healthy' ? 'Healthy' :
                 status.overall === 'error' ? 'Error' : 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* Weather Service */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Cloud className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Weather API</p>
              <Badge className={getStatusColor(status.services.weather)}>
                {status.services.weather || 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* ML Models */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Activity className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">AI Models</p>
              <Badge className={getStatusColor(status.services.ml_models)}>
                {status.services.ml_models || 'Unknown'}
              </Badge>
            </div>
          </div>

          {/* IoT Service */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Wifi className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">IoT Sensors</p>
              <Badge className={getStatusColor(status.services.iot)}>
                {status.services.iot || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>

        {status.lastChecked && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
          </div>
        )}

        {status.overall === 'healthy' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ All systems operational. Real-time agricultural data and AI recommendations are available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}