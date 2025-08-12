import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// GPS Location Hook
export const useLocation = (options: LocationOptions = {}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };
          
          setLocation(locationData);
          setLoading(false);
          resolve(locationData);
        },
        (error) => {
          const errorMessage = {
            1: 'Permission denied - Location access was denied',
            2: 'Position unavailable - Location information is unavailable',
            3: 'Timeout - Location request timed out'
          }[error.code] || 'Unknown location error';
          
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
          ...options
        }
      );
    });
  }, [options]);

  const watchLocation = useCallback((callback: (location: LocationData) => void) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        };
        
        setLocation(locationData);
        callback(locationData);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  const calculateDistance = useCallback((
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchLocation,
    calculateDistance
  };
};

// Calendar Integration Hook
export const useCalendar = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if calendar integration is available
    setIsSupported(!!window.navigator.userAgent.match(/iPhone|iPad|iPod|Android/));
  }, []);

  const addToCalendar = useCallback((event: {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    url?: string;
  }) => {
    const { title, description, location, startDate, endDate, url } = event;
    
    // Format dates for calendar URL
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: description || '',
      location: location || '',
      sf: 'true',
      output: 'xml'
    });

    if (url) {
      params.append('website', url);
    }

    // Create calendar link
    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    
    // For mobile devices, try to open native calendar
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // iOS calendar URL scheme
      const iosUrl = `calshow:${Math.floor(startDate.getTime() / 1000)}`;
      window.location.href = iosUrl;
      
      // Fallback to web calendar
      setTimeout(() => {
        window.open(calendarUrl, '_blank');
      }, 500);
    } else if (/Android/.test(navigator.userAgent)) {
      // Android calendar intent
      const androidUrl = `intent://calendar/#Intent;scheme=content;package=com.android.calendar;end`;
      window.location.href = androidUrl;
      
      // Fallback to web calendar
      setTimeout(() => {
        window.open(calendarUrl, '_blank');
      }, 500);
    } else {
      // Desktop - open web calendar
      window.open(calendarUrl, '_blank');
    }
  }, []);

  const createICSFile = useCallback((event: {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    url?: string;
  }) => {
    const { title, description, location, startDate, endDate, url } = event;
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MTKCX//Event//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description}` : '',
      location ? `LOCATION:${location}` : '',
      url ? `URL:${url}` : '',
      `DTSTAMP:${formatDate(new Date())}`,
      `UID:${Date.now()}@mtkcx.com`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url_obj = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url_obj;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url_obj);
  }, []);

  return {
    isSupported,
    addToCalendar,
    createICSFile
  };
};

// Contact Integration Hook
export const useContacts = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if contact integration is available
    setIsSupported(!!window.navigator.userAgent.match(/iPhone|iPad|iPod|Android/));
  }, []);

  const addContact = useCallback((contact: {
    firstName: string;
    lastName?: string;
    phone?: string;
    email?: string;
    company?: string;
    website?: string;
    address?: string;
  }) => {
    const { firstName, lastName, phone, email, company, website, address } = contact;
    
    // Create vCard format
    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${firstName}${lastName ? ` ${lastName}` : ''}`,
      `N:${lastName || ''};${firstName};;;`,
      phone ? `TEL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      company ? `ORG:${company}` : '',
      website ? `URL:${website}` : '',
      address ? `ADR:;;${address};;;;` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${firstName}_${lastName || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, []);

  const saveBusinessContact = useCallback(() => {
    addContact({
      firstName: 'MTKCX',
      lastName: 'Auto Detailing',
      phone: '+1-555-MTKCX-01',
      email: 'info@mtkcx.com',
      company: 'MTKCX Professional Auto Detailing',
      website: 'https://mtkcx.com',
      address: 'Professional Auto Detailing Services'
    });
  }, [addContact]);

  return {
    isSupported,
    addContact,
    saveBusinessContact
  };
};

// Voice Commands Hook
export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
      setIsSupported(true);
    }
  }, []);

  const startListening = useCallback((
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ) => {
    if (!recognition || isListening) return;

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      const error = event.error;
      onError?.(error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const processVoiceCommand = useCallback((transcript: string) => {
    const command = transcript.toLowerCase().trim();
    
    // Define voice commands
    const commands = {
      'go home': () => window.location.href = '/mobile',
      'show products': () => window.location.href = '/mobile?tab=products',
      'open cart': () => window.dispatchEvent(new CustomEvent('open-cart')),
      'search for': (query: string) => {
        const searchTerm = query.replace('search for', '').trim();
        window.dispatchEvent(new CustomEvent('voice-search', { detail: { query: searchTerm } }));
      },
      'call support': () => window.location.href = 'tel:+1-555-MTKCX-01',
      'get directions': () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(() => {}, () => {});
        }
      }
    };

    // Find matching command
    for (const [commandPhrase, action] of Object.entries(commands)) {
      if (command.includes(commandPhrase)) {
        if (typeof action === 'function') {
          if (commandPhrase === 'search for') {
            (action as (query: string) => void)(command);
          } else {
            (action as () => void)();
          }
        }
        return true;
      }
    }
    
    return false;
  }, []);

  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
    processVoiceCommand
  };
};

// Biometric Authentication Hook
export const useBiometrics = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check for Web Authentication API support
    const checkSupport = async () => {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        setIsSupported(true);
        
        // Check if biometric authenticators are available
        try {
          const available = await (navigator.credentials as any).get({
            publicKey: {
              challenge: new Uint8Array(32),
              allowCredentials: [],
              userVerification: 'preferred'
            }
          });
          setIsAvailable(!!available);
        } catch (error) {
          // Biometrics may not be set up
          setIsAvailable(false);
        }
      }
    };

    checkSupport();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000
        }
      } as any);

      return !!credential;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [isSupported]);

  const register = useCallback(async (userId: string): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('Biometric registration not supported');
    }

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: 'MTKCX Auto Detailing',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userId,
            displayName: 'User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      } as any);

      return !!credential;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isAvailable,
    authenticate,
    register
  };
};