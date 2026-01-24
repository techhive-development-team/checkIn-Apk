import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../hooks/client';

interface ReviewScreenProps {
  route: any;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [location, setLocation] = useState<string>('Getting location...');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [actionType, setActionType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [loading, setLoading] = useState(false);
  const imagePath = route?.params?.imagePath;

  useEffect(() => {
    // Get current time
    const now = new Date();
    setCurrentTime(now.toLocaleString());

    // Request location permission and get location
    requestLocationPermission();

    // Determine action type from API or previous state
    checkActionType();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLocation('Location permission denied');
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
      setLocation('Unable to get location');
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        console.log('Geolocation error:', error);
        setLocation('Unable to get location');
        Alert.alert('Error', `Unable to get location: ${error.message}`);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000,
        forceRequestLocation: true,
      }
    );
  };

  const checkActionType = async () => {
    try {
      const response = await client.exec('/api/attendance/status');
      setActionType(response.lastAction === 'checkIn' ? 'checkOut' : 'checkIn');
    } catch (error) {
      console.log('Error checking status:', error);
      setActionType('checkIn');
    }
  };

  const handleRetakePhoto = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const [lat, lon] = location.split(',').map(l => l.trim());
      
      const submitData = {
        image: imagePath,
        latitude: lat,
        longitude: lon,
        timestamp: currentTime,
        action: actionType,
      };

      const response = await client.exec('/api/attendance/submit', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });

      if (response.success) {
        // Logout and go to login page
        await AsyncStorage.removeItem('token');
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      } else {
        Alert.alert('Error', 'Failed to submit attendance');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while submitting');
      console.log('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16 }}>
        {/* Captured Image */}
        {imagePath && (
          <Image
            source={{ uri: imagePath }}
            style={{
              width: '100%',
              height: 400,
              borderRadius: 8,
              marginBottom: 20,
            }}
          />
        )}

        {/* Location and Time */}
        <View style={{ marginBottom: 20, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, marginBottom: 8, color: '#333' }}>
            <Text style={{ fontWeight: 'bold' }}>Location:</Text> {location}
          </Text>
          <Text style={{ fontSize: 14, color: '#333' }}>
            <Text style={{ fontWeight: 'bold' }}>Time:</Text> {currentTime}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          style={{
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
              {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Retake Photo Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleRetakePhoto}
          style={{
            backgroundColor: '#ccc',
            padding: 16,
            borderRadius: 8,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#333', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
            Retake Photo
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ReviewScreen;