import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';

interface MabiCheerleaderProps {
  visible?: boolean;
  message?: string;
  lottieSource?: string | AnimationObject | { uri: string };
}

export const MabiCheerleader: React.FC<MabiCheerleaderProps> = ({
  visible = false,
  message = '¡Muy bien!',
  lottieSource,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.4);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.badge,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {lottieSource ? (
          <LottieView
            source={lottieSource}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        ) : (
          <Text style={styles.mascotEmoji}>🦎✨</Text>
        )}
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 24,
    zIndex: 100,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#4CAF50',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    gap: 10,
  },
  lottie: {
    width: 48,
    height: 48,
  },
  mascotEmoji: {
    fontSize: 28,
  },
  text: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
  },
});

export default MabiCheerleader;
