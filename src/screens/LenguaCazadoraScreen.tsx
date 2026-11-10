import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MabiCheerleader from '../components/MabiCheerleader';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addCoins, useAppDispatch, useAppSelector } from '../store/store';

type Props = NativeStackScreenProps<RootStackParamList, 'LenguaCazadora'>;

interface BugOption {
  id: number;
  number: number;
  emoji: string;
  color: string;
  angleDeg: number;
}

const TARGET_NUMBER = 3;

const BUGS: BugOption[] = [
  { id: 0, number: 1, emoji: '🐞', color: '#FFCDD2', angleDeg: -24 },
  { id: 1, number: 2, emoji: '🐝', color: '#FFF9C4', angleDeg: 0 },
  { id: 2, number: 3, emoji: '🦋', color: '#B3E5FC', angleDeg: 24 },
];

/**
 * Estructura preparada con expo-av para reproducir un sonido corto al acertar.
 * Para activarlo:
 * 1. Instala expo-av (`npx expo install expo-av`)
 * 2. Coloca tu archivo de audio en `src/assets/sounds/acierto.mp3`
 * 3. Descomenta el bloque dentro del try.
 */
async function playSuccessSound(): Promise<void> {
  try {
    // const { Audio } = require('expo-av');
    // const { sound } = await Audio.Sound.createAsync(
    //   require('../assets/sounds/acierto.mp3')
    // );
    // await sound.playAsync();
    // sound.setOnPlaybackStatusUpdate((status: { didJustFinish?: boolean }) => {
    //   if (status.didJustFinish) {
    //     sound.unloadAsync();
    //   }
    // });
  } catch (error) {
    console.warn('Error al reproducir sonido de acierto:', error);
  }
}

export const LenguaCazadoraScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const coins = useAppSelector((state) => state.game.coins);

  const [hasWon, setHasWon] = useState(false);
  const [feedback, setFeedback] = useState<string>('¡Toca el insecto correcto!');

  // Animación de flotación para los 3 insectos
  const floatAnims = useRef(BUGS.map(() => new Animated.Value(0))).current;
  // Escala para desaparecer el insecto atrapado
  const bugScaleAnims = useRef(BUGS.map(() => new Animated.Value(1))).current;
  // Sacudida suave cuando toca un insecto incorrecto
  const bugShakeAnims = useRef(BUGS.map(() => new Animated.Value(0))).current;

  // Animación de la lengua de Mabi
  const tongueScaleY = useRef(new Animated.Value(0)).current;
  const tongueAngle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = floatAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1300 + index * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1300 + index * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [floatAnims]);

  const handleBugPress = (bug: BugOption) => {
    if (hasWon) {
      return;
    }

    if (bug.number === TARGET_NUMBER) {
      setHasWon(true);
      setFeedback('¡Excelente! Ganaste +3 Mosquimonedas 🦟');

      // 1. Reproducir efecto de sonido corto (estructura expo-av)
      void playSuccessSound();

      // 2. Actualizar estado global en Redux sumando 3 Mosquimonedas
      dispatch(addCoins(3));

      // 3. Simular acción de acierto (lengua cazadora atrapando el insecto)
      tongueAngle.setValue(bug.angleDeg);
      Animated.sequence([
        Animated.timing(tongueScaleY, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(bugScaleAnims[bug.id], {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(tongueScaleY, {
            toValue: 0,
            duration: 180,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      setFeedback(`¡Casi! Ese es el ${bug.number}, busca el ${TARGET_NUMBER}.`);
      Animated.sequence([
        Animated.timing(bugShakeAnims[bug.id], {
          toValue: 8,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(bugShakeAnims[bug.id], {
          toValue: -8,
          duration: 55,
          useNativeDriver: true,
        }),
        Animated.timing(bugShakeAnims[bug.id], {
          toValue: 0,
          duration: 55,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const tongueRotation = tongueAngle.interpolate({
    inputRange: [-30, 30],
    outputRange: ['-30deg', '30deg'],
  });

  return (
    <View style={styles.container}>
      {/* Instrucción superior del reto */}
      <View style={styles.headerSection}>
        <View style={styles.coinsPill}>
          <Text style={styles.coinsText}>🦟 Mosquimonedas: {coins}</Text>
        </View>

        <View style={styles.challengeBanner}>
          <Text style={styles.challengeText}>¡Atrapa el número {TARGET_NUMBER}!</Text>
        </View>
      </View>

      {/* Escenario superior con insectos flotantes */}
      <View style={styles.skyStage}>
        <Text style={styles.cloudsDecoration}>☁️       ⛅       ☁️</Text>

        <View style={styles.bugsRow}>
          {BUGS.map((bug, index) => {
            const translateY = floatAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 10],
            });

            return (
              <Animated.View
                key={bug.id}
                style={{
                  transform: [
                    { translateY },
                    { translateX: bugShakeAnims[index] },
                    { scale: bugScaleAnims[index] },
                  ],
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={hasWon}
                  style={[styles.bugCard, { backgroundColor: bug.color }]}
                  onPress={() => handleBugPress(bug)}
                >
                  <Text style={styles.bugEmoji}>{bug.emoji}</Text>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberLabel}>{bug.number}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Zona inferior: Mabi, mensaje de estado y botón de retorno al Terrario */}
      <View style={styles.footerSection}>
        <Text style={styles.feedbackText}>{feedback}</Text>

        <View style={styles.mabiContainer}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tongue,
              {
                transform: [
                  { rotate: tongueRotation },
                  { scaleY: tongueScaleY },
                ],
              },
            ]}
          />
          <View style={styles.mabiCircle}>
            <Text style={styles.mabiEmoji}>{hasWon ? '🦎😋' : '🦎'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.navigate('Terrario')}
        >
          <Text style={styles.returnButtonText}>⬅️ Volver al Terrario</Text>
        </TouchableOpacity>
      </View>

      {/* Animación superpuesta de celebración */}
      <MabiCheerleader
        visible={hasWon}
        message="¡Atrapa exitosa! +3 Mosquimonedas 🦟"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1F5FE',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    gap: 10,
  },
  coinsPill: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  coinsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E65100',
  },
  challengeBanner: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#29B6F6',
    alignItems: 'center',
    elevation: 3,
  },
  challengeText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#01579B',
  },
  skyStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloudsDecoration: {
    fontSize: 38,
    marginBottom: 24,
  },
  bugsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  bugCard: {
    width: 94,
    height: 110,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  bugEmoji: {
    fontSize: 38,
    marginBottom: 6,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#263238',
  },
  numberLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#263238',
  },
  footerSection: {
    alignItems: 'center',
    gap: 14,
  },
  feedbackText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
  },
  mabiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  tongue: {
    position: 'absolute',
    bottom: 60,
    width: 12,
    height: 175,
    backgroundColor: '#FF4081',
    borderRadius: 6,
  },
  mabiCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#C8E6C9',
    borderWidth: 4,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mabiEmoji: {
    fontSize: 42,
  },
  returnButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    elevation: 3,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default LenguaCazadoraScreen;
