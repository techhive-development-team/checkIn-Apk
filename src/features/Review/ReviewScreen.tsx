import React, { useState, useEffect, useContext } from 'react';
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
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../hooks/AuthContext';
import { attendanceRepository } from '../../repositories/attendanceRepository';
import { fileToBase64 } from '../../lib/commonUtil';
import { reviewStyles } from './Review.styles';
// Import icons from react-native-vector-icons or use any icon library you prefer
// import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

interface ReviewScreenProps {
  route: any;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [location, setLocation] = useState('Getting location...');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [actionType, setActionType] = useState<'checkIn' | 'checkOut'>(
    'checkIn',
  );
  const [loading, setLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const imagePath = route?.params?.imagePath;

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    );
    setCurrentDate(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );

    requestLocationPermission();
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
          },
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
      position => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      error => {
        console.log('Geolocation error:', error);
        setLocation('Unable to get location');
        Alert.alert('Error', `Unable to get location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
      },
    );
  };

  const checkActionType = async () => {
    try {
      setIsStatusLoading(true);
      const response = await attendanceRepository.getStatus();

      console.log('Backend Data:', response.data);

      const data = response.data;

      if (data && data.checkInTime && !data.checkOutTime) {
        setActionType('checkOut');
      } else {
        setActionType('checkIn');
      }
    } catch (error) {
      setActionType('checkIn');
    } finally {
      setIsStatusLoading(false);
    }
  };

  const handleRetakePhoto = () => {
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!imagePath || location.includes('Getting')) return;

    setLoading(true);
    try {
      const base64Image = await fileToBase64(imagePath);

      const payload =
        actionType === 'checkIn'
          ? {
              checkInLocation: location,
              checkInPhoto: base64Image,
            }
          : {
              checkOutLocation: location,
              checkOutPhoto: base64Image,
            };

      console.log('Final Payload being sent:', payload);

      await attendanceRepository.createAttendance(payload);

      Alert.alert(
        'Success',
        `Successfully ${
          actionType === 'checkIn' ? 'Checked In' : 'Checked Out'
        }.`,
        [
          {
            text: 'OK',
            onPress: async () => {
              await logout();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={reviewStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      <View style={reviewStyles.header}>
        <Text style={reviewStyles.headerTitle}>Review Attendance</Text>
        <Text style={reviewStyles.headerSubtitle}>
          Confirming your {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
        </Text>
      </View>

      <ScrollView
        style={reviewStyles.scrollView}
        contentContainerStyle={reviewStyles.scrollContent}
      >
        {/* Image Preview Card */}
        <View style={reviewStyles.imageCard}>
          <View style={reviewStyles.imageContainer}>
            {imagePath && (
              <Image
                source={{ uri: imagePath }}
                style={reviewStyles.image}
                resizeMode="cover"
              />
            )}
            <View style={reviewStyles.imageOverlay}>
              <View style={reviewStyles.badge}>
                <Text style={reviewStyles.badgeText}>
                  {actionType === 'checkIn'
                    ? '📍 Check In Photo'
                    : '🚪 Check Out Photo'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={reviewStyles.retakeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={reviewStyles.retakeText}>📷 Retake Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={reviewStyles.infoSection}>
          <View
            style={[
              reviewStyles.infoCard,
              { borderColor: '#6366f1', borderWidth: 1 },
            ]}
          >
            <View style={[reviewStyles.iconCircle, { backgroundColor: '#eef2ff' }]}>
              <Text style={reviewStyles.iconEmoji}>
                {actionType === 'checkIn' ? '🆕' : '🏁'}
              </Text>
            </View>
            <View style={reviewStyles.infoContent}>
              <Text style={reviewStyles.infoLabel}>Action Detected</Text>
              <Text style={[reviewStyles.infoValue, { color: '#6366f1' }]}>
                {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
              </Text>
            </View>
          </View>

          <View style={reviewStyles.infoCard}>
            <View style={reviewStyles.iconCircle}>
              <Text style={reviewStyles.iconEmoji}>📍</Text>
            </View>
            <View style={reviewStyles.infoContent}>
              <Text style={reviewStyles.infoLabel}>Location</Text>
              {location === 'Getting location...' ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={reviewStyles.infoValue}>{location}</Text>
              )}
            </View>
          </View>

          <View style={reviewStyles.infoCard}>
            <View style={reviewStyles.iconCircle}>
              <Text style={reviewStyles.iconEmoji}>🕐</Text>
            </View>
            <View style={reviewStyles.infoContent}>
              <Text style={reviewStyles.infoLabel}>Time</Text>
              <Text style={reviewStyles.infoValue}>{currentTime}</Text>
              <Text style={reviewStyles.infoDate}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            reviewStyles.submitButton,
            (loading || isStatusLoading) && reviewStyles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || isStatusLoading}
        >
          {loading || isStatusLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={reviewStyles.submitButtonText}>
              Confirm {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReviewScreen;