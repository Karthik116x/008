import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  MessageCircle, 
  Bot,
  User,
  Play,
  Pause
} from 'lucide-react';

interface VoiceAssistantProps {
  language: string;
}

export function VoiceAssistant({ language }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: language === 'hi' 
        ? 'नमस्ते! मैं आपका स्मार्ट फार्म असिस्टेंट हूं। आप मुझसे अपनी फसल के बारे में कोई भी सवाल पूछ सकते हैं।'
        : language === 'mr'
        ? 'नमस्कार! मी तुमचा स्मार्ट फार्म असिस्टंट आहे. तुम्ही मला तुमच्या पिकांबद्दल कोणताही प्रश्न विचारू शकता.'
        : 'Hello! I\'m your Smart Farm Assistant. You can ask me anything about your crops, weather, or farming advice.',
      timestamp: new Date()
    }
  ]);
  const [availableVoices, setAvailableVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Set language based on user preference
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserMessage(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        setAvailableVoices(voices);
      };

      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text) => {
    if (synthRef.current && !isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select appropriate voice based on language
      const voice = availableVoices.find(v => 
        language === 'hi' ? v.lang.includes('hi') :
        language === 'mr' ? v.lang.includes('mr') :
        v.lang.includes('en')
      ) || availableVoices[0];
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleUserMessage = (text) => {
    const newMessage = {
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(text, language);
      const botMessage = {
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak the response
      speakText(response);
    }, 1000);
  };

  const generateAIResponse = (userText, lang) => {
    const lowerText = userText.toLowerCase();
    
    if (lang === 'hi') {
      if (lowerText.includes('टमाटर') || lowerText.includes('tomato')) {
        return 'टमाटर के लिए अभी अच्छा समय है। मिट्टी का pH 6.0-7.0 होना चाहिए। 15-30 मार्च में बुआई करें। अनुमानित उत्पादन 25 टन प्रति एकड़ और लाभ ₹85,000 प्रति एकड़ हो सकता है।';
      }
      if (lowerText.includes('मौसम') || lowerText.includes('weather')) {
        return 'आज का तापमान 28°C है, नमी 65% है। अगले 7 दिनों में 12mm बारिश की संभावना है। फसल के लिए अच्छी स्थिति है।';
      }
      if (lowerText.includes('कपास') || lowerText.includes('cotton')) {
        return 'कपास की खेती के लिए मिट्टी में नाइट्रोजन की मात्रा अच्छी है। 1-15 अप्रैल में बुआई करें। अनुमानित उत्पादन 18 क्विंटल प्रति एकड़।';
      }
      return 'मैं आपकी मदद करने के लिए यहाँ हूँ। कृपया अपना प्रश्न और स्पष्ट रूप से पूछें।';
    }
    
    if (lang === 'mr') {
      if (lowerText.includes('टोमाटो') || lowerText.includes('tomato')) {
        return 'टोमाटोसाठी आता चांगला वेळ आहे. मातीचा pH 6.0-7.0 असावा. 15-30 मार्चमध्ये पेरणी करा. अनुमानित उत्पादन 25 टन प्रति एकर आणि नफा ₹85,000 प्रति एकर होऊ शकतो.';
      }
      if (lowerText.includes('हवामान') || lowerText.includes('weather')) {
        return 'आजचे तापमान 28°C आहे, आर्द्रता 65% आहे. पुढील 7 दिवसांत 12mm पाऊस होण्याची शक्यता आहे. पिकासाठी चांगली परिस्थिती आहे.';
      }
      return 'मी तुमची मदत करण्यासाठी येथे आहे. कृपया तुमचा प्रश्न अधिक स्पष्टपणे विचारा.';
    }
    
    // English responses
    if (lowerText.includes('tomato')) {
      return 'Great choice! Tomatoes are highly recommended for your farm right now. Soil pH should be 6.0-7.0. Plant between March 15-30. Expected yield: 25 tons/acre with profit margin of ₹85,000/acre.';
    }
    if (lowerText.includes('weather')) {
      return 'Current temperature is 28°C with 65% humidity. Expected rainfall in next 7 days: 12mm. Conditions are favorable for crop growth.';
    }
    if (lowerText.includes('cotton')) {
      return 'Cotton cultivation looks promising. Soil nitrogen levels are adequate. Plant between April 1-15. Expected yield: 18 quintals/acre with good market demand.';
    }
    if (lowerText.includes('soil')) {
      return 'Your soil analysis shows pH 6.8, which is excellent. Nitrogen levels at 78%, phosphorus at 65%, and potassium at 72%. Organic matter content is 3.2% - very good for crop growth.';
    }
    if (lowerText.includes('market') || lowerText.includes('price')) {
      return 'Current market prices: Tomatoes ₹45/kg (+12%), Cotton ₹6200/quintal (-5%), Sugarcane ₹3200/quintal (+8%). Tomato prices are rising due to high demand.';
    }
    
    return 'I\'m here to help you with farming advice. You can ask me about crop recommendations, weather conditions, soil health, market prices, or any farming-related questions.';
  };

  const quickQuestions = language === 'hi' ? [
    'टमाटर की खेती के बारे में बताएं',
    'आज का मौसम कैसा है?',
    'मिट्टी की जांच कैसी है?',
    'बाजार भाव क्या है?'
  ] : language === 'mr' ? [
    'टोमाटोची शेती कशी करावी?',
    'आजचे हवामान कसे आहे?',
    'मातीची तपासणी कशी आहे?',
    'बाजारभाव काय आहे?'
  ] : [
    'Tell me about tomato farming',
    'What\'s the weather like today?',
    'How is my soil health?',
    'What are the current market prices?'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-green-600" />
            <span>Voice Assistant</span>
            <Badge variant="secondary">
              {language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'English'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              onClick={isListening ? stopListening : startListening}
              size="lg"
              className={`rounded-full h-16 w-16 ${
                isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            
            <Button
              onClick={isSpeaking ? stopSpeaking : () => {}}
              size="lg"
              variant="outline"
              className={`rounded-full h-16 w-16 ${isSpeaking ? 'animate-pulse' : ''}`}
              disabled={!isSpeaking}
            >
              {isSpeaking ? <Pause className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
            </Button>
          </div>

          <div className="text-center mb-6">
            {isListening ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  {language === 'hi' ? 'सुन रहा हूँ...' : language === 'mr' ? 'ऐकत आहे...' : 'Listening...'}
                </p>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                {language === 'hi' 
                  ? 'माइक बटन दबाकर बोलना शुरू करें' 
                  : language === 'mr' 
                  ? 'माइक बटण दाबून बोलणे सुरू करा'
                  : 'Press the mic button to start speaking'}
              </p>
            )}
          </div>

          {/* Quick Questions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {language === 'hi' ? 'त्वरित प्रश्न:' : language === 'mr' ? 'त्वरित प्रश्न:' : 'Quick Questions:'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto py-2"
                  onClick={() => handleUserMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>
              {language === 'hi' ? 'बातचीत का इतिहास' : language === 'mr' ? 'संभाषणाचा इतिहास' : 'Conversation History'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-green-600" />}
                    {message.type === 'user' && <User className="h-4 w-4 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.type === 'bot' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => speakText(message.text)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}