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
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../hooks/client';
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
  const [actionType, setActionType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [loading, setLoading] = useState(false);
  const imagePath = route?.params?.imagePath;

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }));
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));

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
      const [lat, lon] = location.split(',').map((l) => l.trim());
      const submitData = {
        image: imagePath,
        latitude: lat,
        longitude: lon,
        timestamp: currentTime,
        action: actionType,
      };

      // const response = await client.exec('/api/attendance/submit', {
      //   method: 'POST',
      //   body: JSON.stringify(submitData),
      // // });

      // if (response.success) {
      //   await AsyncStorage.removeItem('token');
      //   navigation.reset({
      //     index: 0,
      //     routes: [{ name: 'LoginScreen' }],
      //   });
      // } else {
      //   Alert.alert('Error', 'Failed to submit attendance');
      // }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while submitting');
      console.log('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Attendance</Text>
        <Text style={styles.headerSubtitle}>Please confirm your details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview Card */}
        <View style={styles.imageCard}>
          <View style={styles.imageContainer}>
            {imagePath && (
              <Image
                source={{ uri: imagePath }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <View style={styles.imageOverlay}>
              <View style={styles.badge}>
                {/* Replace with Icon component: <Icon name="camera" size={14} color="#fff" /> */}
                <Text style={styles.badgeIcon}>📷</Text>
                <Text style={styles.badgeText}>Preview</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetakePhoto}
            activeOpacity={0.7}
          >
            {/* Replace with Icon component: <Icon name="camera" size={18} color="#6366f1" /> */}
            <Text style={styles.retakeIcon}>📷</Text>
            <Text style={styles.retakeText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {/* Location Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              {/* Replace with Icon component: <Icon name="map-pin" size={20} color="#6366f1" /> */}
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              {location === 'Getting location...' ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#6366f1" />
                  <Text style={styles.loadingText}>Getting location...</Text>
                </View>
              ) : (
                <Text style={styles.infoValue}>{location}</Text>
              )}
            </View>
          </View>

          {/* Time Card */}
          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              {/* Replace with Icon component: <Icon name="clock" size={20} color="#6366f1" /> */}
              <Text style={styles.iconEmoji}>🕐</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{currentTime}</Text>
              <Text style={styles.infoDate}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Action Type Toggle */}
        <View style={styles.toggleSection}>
          <Text style={styles.toggleLabel}>Action Type</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                actionType === 'checkIn' && styles.toggleButtonActive,
              ]}
              onPress={() => setActionType('checkIn')}
              activeOpacity={0.7}
            >
              {/* Replace with Icon component: <Icon name="check-circle" size={20} color={...} /> */}
              <Text style={styles.toggleIcon}>
                {actionType === 'checkIn' ? '✓' : '○'}
              </Text>
              <Text
                style={[
                  styles.toggleButtonText,
                  actionType === 'checkIn' && styles.toggleButtonTextActive,
                ]}
              >
                Check In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                actionType === 'checkOut' && styles.toggleButtonActive,
              ]}
              onPress={() => setActionType('checkOut')}
              activeOpacity={0.7}
            >
              {/* Replace with Icon component: <Icon name="log-out" size={20} color={...} /> */}
              <Text style={styles.toggleIcon}>
                {actionType === 'checkOut' ? '→' : '○'}
              </Text>
              <Text
                style={[
                  styles.toggleButtonText,
                  actionType === 'checkOut' && styles.toggleButtonTextActive,
                ]}
              >
                Check Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>
                Confirm {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
              </Text>
              {/* Replace with Icon component: <Icon name="check-circle" size={20} color="#fff" /> */}
              <Text style={styles.submitIcon}>✓</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#e2e8f0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
  },
  retakeIcon: {
    fontSize: 18,
  },
  retakeText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  infoDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  toggleSection: {
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
  },
  toggleIcon: {
    fontSize: 20,
    color: '#64748b',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  submitIcon: {
    fontSize: 20,
    color: '#fff',
  },
});

export default ReviewScreen;