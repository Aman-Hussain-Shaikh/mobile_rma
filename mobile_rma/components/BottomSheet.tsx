import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

// Define types for the bottom sheet props
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
  // Animated values for the bottom sheet and blur overlay
  const translateY = useSharedValue(height);
  const blurIntensity = useSharedValue(0);

  // Animation configuration
  const animationConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  };

  // Update animations when isOpen changes
  useEffect(() => {
    translateY.value = withTiming(
      isOpen ? 0 : height,
      animationConfig
    );
    blurIntensity.value = withTiming(
      isOpen ? 1 : 0,
      animationConfig
    );
  }, [isOpen]);

  // Animated styles for the bottom sheet
  const bottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Animated styles for blur overlay
  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(blurIntensity.value, [0, 1], [0, 1]),
  }));

  return (
    <>
      {/* Blur Overlay */}
      {isOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        >
          <Animated.View style={[styles.overlay, blurStyle]}>
            <BlurView intensity={50} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Pressable>
      )}

      {/* Bottom Sheet Content */}
      <Animated.View style={[styles.bottomSheet, bottomSheetStyle]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1F486B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#9DFE01',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
});

export default BottomSheet;