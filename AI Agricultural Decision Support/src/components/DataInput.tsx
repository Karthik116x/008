import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MapPin, 
  Calendar, 
  Droplets, 
  Thermometer,
  Save,
  MapIcon,
  Loader2,
  CheckCircle,
  Database,
  Satellite
} from 'lucide-react';

interface DataInputProps {
  language: string;
  userProfile: any;
  setUserProfile: (profile: any) => void;
}

export function DataInput({ language, userProfile, setUserProfile }: DataInputProps) {
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    farmSize: '',
    soilType: '',
    irrigationType: '',
    previousCrops: '',
    farmingExperience: '',
    waterSource: '',
    equipment: '',
    notes: ''
  });
  const [locationData, setLocationData] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Initialize form with existing profile data
    setFormData({
      farmName: userProfile.farmName || '',
      location: userProfile.location || '',
      farmSize: userProfile.farmSize || '',
      soilType: userProfile.soilType || '',
      irrigationType: userProfile.irrigationType || '',
      previousCrops: userProfile.crops ? userProfile.crops.join(', ') : '',
      farmingExperience: userProfile.experience || '',
      waterSource: userProfile.waterSource || '',
      equipment: userProfile.equipment || '',
      notes: userProfile.notes || ''
    });
  }, [userProfile]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mock location data (in real app, would use reverse geocoding API)
          const mockLocationData = {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            district: 'Nashik',
            state: 'Maharashtra',
            pincode: '422003',
            address: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`
          };
          
          setLocationData(mockLocationData);
          setFormData(prev => ({
            ...prev,
            location: `${mockLocationData.district}, ${mockLocationData.state}`
          }));
          setGettingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setGettingLocation(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updatedProfile = {
      ...userProfile,
      farmName: formData.farmName,
      location: formData.location,
      farmSize: formData.farmSize,
      soilType: formData.soilType,
      irrigationType: formData.irrigationType,
      crops: formData.previousCrops.split(',').map(crop => crop.trim()).filter(crop => crop),
      experience: formData.farmingExperience,
      waterSource: formData.waterSource,
      equipment: formData.equipment,
      notes: formData.notes,
      locationData: locationData
    };
    
    setUserProfile(updatedProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const translations = {
    en: {
      title: 'Farm Data Management',
      subtitle: 'Update your farm information for better AI recommendations',
      basicInfo: 'Basic Information',
      farmName: 'Farm Name',
      location: 'Location',
      farmSize: 'Farm Size (acres)',
      getCurrentLoc: 'Get Current Location',
      agricultural: 'Agricultural Details',
      soilType: 'Soil Type',
      irrigation: 'Irrigation Type',
      previousCrops: 'Previous Crops (comma separated)',
      experience: 'Farming Experience (years)',
      waterSource: 'Water Source',
      equipment: 'Available Equipment',
      notes: 'Additional Notes',
      save: 'Save Information',
      saved: 'Information saved successfully!'
    },
    hi: {
      title: 'खेत डेटा प्रबंधन',
      subtitle: 'बेहतर AI सुझावों के लिए अपनी खेत की जानकारी अपडेट करें',
      basicInfo: 'बुनियादी जानकारी',
      farmName: 'खेत का नाम',
      location: 'स्थान',
      farmSize: 'खेत का आकार (एकड़)',
      getCurrentLoc: 'वर्तमान स्थान प्राप्त करें',
      agricultural: 'कृषि विवरण',
      soilType: 'मिट्टी का प्रकार',
      irrigation: 'सिंचाई का प्रकार',
      previousCrops: 'पिछली फसलें (कॉमा से अलग करें)',
      experience: 'खेती का अनुभव (वर्ष)',
      waterSource: 'पानी का स्रोत',
      equipment: 'उपलब्ध उपकरण',
      notes: 'अतिरिक्त टिप्पणियां',
      save: 'जानकारी सेव करें',
      saved: 'जानकारी सफलतापूर्वक सेव हुई!'
    },
    mr: {
      title: 'शेत डेटा व्यवस्थापन',
      subtitle: 'चांगल्या AI शिफारशींसाठी तुमच्या शेताची माहिती अपडेट करा',
      basicInfo: 'मूलभूत माहिती',
      farmName: 'शेताचे नाव',
      location: 'स्थान',
      farmSize: 'शेताचा आकार (एकर)',
      getCurrentLoc: 'सध्याचे स्थान मिळवा',
      agricultural: 'कृषी तपशील',
      soilType: 'मातीचा प्रकार',
      irrigation: 'सिंचनाचा प्रकार',
      previousCrops: 'मागील पिके (स्वल्पविरामाने वेगळे करा)',
      experience: 'शेतीचा अनुभव (वर्षे)',
      waterSource: 'पाण्याचा स्रोत',
      equipment: 'उपलब्ध उपकरणे',
      notes: 'अतिरिक्त टिप्पण्या',
      save: 'माहिती जतन करा',
      saved: 'माहिती यशस्वीपणे जतन झाली!'
    }
  };

  const t = translations[language] || translations.en;

  const soilTypes = [
    'Clay', 'Sandy', 'Loamy', 'Silt', 'Clayey Loam', 'Sandy Loam', 'Black Cotton', 'Red Soil', 'Alluvial'
  ];

  const irrigationTypes = [
    'Drip Irrigation', 'Sprinkler', 'Flood Irrigation', 'Furrow', 'Manual Watering', 'Rain-fed'
  ];

  const waterSources = [
    'Borewell', 'Canal', 'River', 'Pond', 'Rainwater Harvesting', 'Government Supply'
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-green-600" />
            <span>{t.title}</span>
          </CardTitle>
          <p className="text-gray-600">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{t.basicInfo}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="farmName">{t.farmName}</Label>
                <Input
                  id="farmName"
                  value={formData.farmName}
                  onChange={(e) => handleInputChange('farmName', e.target.value)}
                  placeholder="Green Valley Farm"
                />
              </div>

              <div>
                <Label htmlFor="location">{t.location}</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="farmSize">{t.farmSize}</Label>
                <Input
                  id="farmSize"
                  value={formData.farmSize}
                  onChange={(e) => handleInputChange('farmSize', e.target.value)}
                  placeholder="2.5"
                  type="number"
                  step="0.1"
                />
              </div>
            </div>

            {locationData && (
              <Card className="mt-4 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Satellite className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">GPS Location Data</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Coordinates:</span>
                      <p className="font-mono">{locationData.latitude}, {locationData.longitude}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Address:</span>
                      <p>{locationData.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Agricultural Details */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
              <Droplets className="h-5 w-5" />
              <span>{t.agricultural}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="soilType">{t.soilType}</Label>
                <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="irrigation">{t.irrigation}</Label>
                <Select value={formData.irrigationType} onValueChange={(value) => handleInputChange('irrigationType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select irrigation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {irrigationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">{t.experience}</Label>
                <Input
                  id="experience"
                  value={formData.farmingExperience}
                  onChange={(e) => handleInputChange('farmingExperience', e.target.value)}
                  placeholder="5"
                  type="number"
                />
              </div>

              <div>
                <Label htmlFor="waterSource">{t.waterSource}</Label>
                <Select value={formData.waterSource} onValueChange={(value) => handleInputChange('waterSource', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select water source" />
                  </SelectTrigger>
                  <SelectContent>
                    {waterSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="previousCrops">{t.previousCrops}</Label>
              <Input
                id="previousCrops"
                value={formData.previousCrops}
                onChange={(e) => handleInputChange('previousCrops', e.target.value)}
                placeholder="Tomatoes, Cotton, Wheat"
              />
              {formData.previousCrops && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.previousCrops.split(',').map((crop, index) => (
                    <Badge key={index} variant="secondary">
                      {crop.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Label htmlFor="equipment">{t.equipment}</Label>
              <Input
                id="equipment"
                value={formData.equipment}
                onChange={(e) => handleInputChange('equipment', e.target.value)}
                placeholder="Tractor, Sprayer, Cultivator"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about your farm..."
                rows={3}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full md:w-auto" size="lg">
            <Save className="mr-2 h-4 w-4" />
            {t.save}
          </Button>
        </CardContent>
      </Card>

      {/* Data Sources Info */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Weather API</p>
                <p className="text-sm text-green-700">Live data</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Soil Sensors</p>
                <p className="text-sm text-green-700">Real-time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Satellite Data</p>
                <p className="text-sm text-green-700">Daily updates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">Market Prices</p>
                <p className="text-sm text-green-700">Updated hourly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}