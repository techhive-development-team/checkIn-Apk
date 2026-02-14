import React, { useRef, useState } from 'react';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { StyleSheet, View, TouchableOpacity, Text, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../../hooks/AuthContext';
import { cameraStyles } from './Camera.styles';

type RootStackParamList = {
  Login: undefined;
  Camera: undefined;
  Review: {
    imagePath: string;
  };
};

interface CameraScreenProps {
  navigation: any;
}

type CameraNavProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

function CameraScreen({ navigation }: CameraScreenProps) {
  const navigateTo = useNavigation<CameraNavProp>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const device = useCameraDevice(facing);
  const { logout } = useContext(AuthContext);

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
    <View style={cameraStyles.permissionContainer}>
      <Icon name="camera-outline" size={80} color="#666" />
      <Text style={cameraStyles.permissionTitle}>Camera Permission Required</Text>
      <Text style={cameraStyles.permissionText}>
        We need access to your camera to take photos
      </Text>
      <TouchableOpacity style={cameraStyles.permissionButton} onPress={requestPermission}>
        <Text style={cameraStyles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  if (device == null) return (
    <View style={cameraStyles.permissionContainer}>
      <Icon name="alert-circle-outline" size={80} color="#666" />
      <Text style={cameraStyles.permissionTitle}>No Camera Found</Text>
      <Text style={cameraStyles.permissionText}>
        Unable to detect a camera device
      </Text>
    </View>
  );

  return (
    <View style={cameraStyles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={cameraStyles.topControls}>
        <TouchableOpacity style={cameraStyles.iconButton} onPress={toggleFlash}>
          <Icon name={getFlashIcon()} size={28} color="#fff" />
        </TouchableOpacity>

        <View style={cameraStyles.topSpacer} />
        <TouchableOpacity style={cameraStyles.logoutButton} onPress={logout}>
          <Icon name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={cameraStyles.iconButton} onPress={toggleCamera}>
          <Icon name="camera-reverse-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={cameraStyles.bottomControls}>
        <View style={cameraStyles.captureContainer}>

          <TouchableOpacity
            style={cameraStyles.captureButton}
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <View style={cameraStyles.captureButtonInner} />
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

export default CameraScreen;