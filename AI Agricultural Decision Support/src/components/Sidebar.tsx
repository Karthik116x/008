import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  LayoutDashboard, 
  Mic, 
  Camera, 
  Database, 
  TrendingUp, 
  Settings as SettingsIcon,
  User,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  translations: any;
  userProfile: any;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  translations,
  userProfile 
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: translations.dashboard },
    { id: 'voice', icon: Mic, label: translations.voice },
    { id: 'diagnosis', icon: Camera, label: translations.diagnosis },
    { id: 'data', icon: Database, label: translations.data },
    { id: 'market', icon: TrendingUp, label: translations.market },
    { id: 'settings', icon: SettingsIcon, label: translations.settings },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-0
      `}>
        <div className="p-6">
          {/* User Profile Card */}
          <Card className="p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{userProfile.name}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{userProfile.location}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>Farm Size: {userProfile.farmSize}</p>
              <p>Crops: {userProfile.crops.join(', ')}</p>
            </div>
          </Card>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">System Status</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Weather Data</span>
                <span className="text-green-600">●</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Sensors</span>
                <span className="text-green-600">●</span>
              </div>
              <div className="flex justify-between">
                <span>Market Data</span>
                <span className="text-green-600">●</span>
              </div>
              <div className="flex justify-between">
                <span>AI Models</span>
                <span className="text-green-600">●</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}