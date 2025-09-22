import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { VoiceAssistant } from './components/VoiceAssistant';
import { CropDiagnosis } from './components/CropDiagnosis';
import { DataInput } from './components/DataInput';
import { MarketInsights } from './components/MarketInsights';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/ui/button';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [userProfile, setUserProfile] = useState({
    name: 'Raj Kumar',
    location: 'Nashik, Maharashtra',
    farmSize: '2.5 acres',
    crops: ['Tomatoes', 'Cotton', 'Sugarcane']
  });

  // Simulate PWA offline functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // PWA service worker would be registered here
      console.log('PWA functionality enabled');
    }
  }, []);

  const translations = {
    en: {
      title: 'Smart Farm Assistant',
      dashboard: 'Dashboard',
      voice: 'Voice Assistant',
      diagnosis: 'Crop Diagnosis',
      data: 'Farm Data',
      market: 'Market Insights',
      settings: 'Settings'
    },
    hi: {
      title: 'स्मार्ट फार्म असिस्टेंट',
      dashboard: 'डैशबोर्ड',
      voice: 'वॉयस असिस्टेंट',
      diagnosis: 'फसल निदान',
      data: 'खेत डेटा',
      market: 'बाजार जानकारी',
      settings: 'सेटिंग्स'
    },
    mr: {
      title: 'स्मार्ट फार्म असिस्टंट',
      dashboard: 'डॅशबोर्ड',
      voice: 'व्हॉइस असिस्टंट',
      diagnosis: 'पीक निदान',
      data: 'शेत डेटा',
      market: 'बाजार माहिती',
      settings: 'सेटिंग्ज'
    }
  };

  const t = translations[language] || translations.en;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} userProfile={userProfile} />;
      case 'voice':
        return <VoiceAssistant language={language} />;
      case 'diagnosis':
        return <CropDiagnosis language={language} />;
      case 'data':
        return <DataInput language={language} userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'market':
        return <MarketInsights language={language} />;
      case 'settings':
        return <Settings language={language} setLanguage={setLanguage} />;
      default:
        return <Dashboard language={language} userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          size="sm"
          variant="outline"
          className="bg-white"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        translations={t}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:ml-0 ml-12">
              <h1 className="text-2xl font-semibold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {userProfile.location} • {userProfile.farmSize}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* Offline Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>PWA Ready</span>
        </div>
      </div>
    </div>
  );
}