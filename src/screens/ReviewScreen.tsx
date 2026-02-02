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
import { attendanceRepository } from '../repositories/attendanceRepository';
import { fileToBase64 } from '../lib/commonUtil';
import { AuthContext } from '../hooks/AuthContext';
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
      console.log('Error checking status:', error);
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Attendance</Text>
        <Text style={styles.headerSubtitle}>
          Confirming your {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
                <Text style={styles.badgeText}>
                  {actionType === 'checkIn'
                    ? '📍 Check In Photo'
                    : '🚪 Check Out Photo'}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retakeText}>📷 Retake Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View
            style={[
              styles.infoCard,
              { borderColor: '#6366f1', borderWidth: 1 },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#eef2ff' }]}>
              <Text style={styles.iconEmoji}>
                {actionType === 'checkIn' ? '🆕' : '🏁'}
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Action Detected</Text>
              <Text style={[styles.infoValue, { color: '#6366f1' }]}>
                {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>📍</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              {location === 'Getting location...' ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={styles.infoValue}>{location}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🕐</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{currentTime}</Text>
              <Text style={styles.infoDate}>{currentDate}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || isStatusLoading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || isStatusLoading}
        >
          {loading || isStatusLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              Confirm {actionType === 'checkIn' ? 'Check In' : 'Check Out'}
            </Text>
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
