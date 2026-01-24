import React, { useRef, useState } from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { StyleSheet, View, TouchableOpacity, Text, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

interface CameraScreenProps {
  navigation: any;
}

function CameraScreen({ navigation }: CameraScreenProps) {
  const navigateTo = useNavigation();
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const device = useCameraDevice(facing);

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePhoto({
        flash: flash,
      });
      if (photo) {
        console.log('Photo captured:', photo);
        // Navigate to ReviewScreen with the photo path
        navigateTo.navigate('Review', {
          imagePath: `file://${photo.path}`,
        });
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    }
  };

  const toggleCamera = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    if (flash === 'off') return 'flash-off';
    if (flash === 'on') return 'flash';
    return 'flash-outline';
  };

  if (!hasPermission) return (
    <View style={styles.permissionContainer}>
      <Icon name="camera-outline" size={80} color="#666" />
      <Text style={styles.permissionTitle}>Camera Permission Required</Text>
      <Text style={styles.permissionText}>
        We need access to your camera to take photos
      </Text>
      <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  if (device == null) return (
    <View style={styles.permissionContainer}>
      <Icon name="alert-circle-outline" size={80} color="#666" />
      <Text style={styles.permissionTitle}>No Camera Found</Text>
      <Text style={styles.permissionText}>
        Unable to detect a camera device
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
          <Icon name={getFlashIcon()} size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.topSpacer} />

        <TouchableOpacity style={styles.iconButton} onPress={toggleCamera}>
          <Icon name="camera-reverse-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <View style={styles.captureContainer}>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topSpacer: {
    flex: 1,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  captureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default CameraScreen;