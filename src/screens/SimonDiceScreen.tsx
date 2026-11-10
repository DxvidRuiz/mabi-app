import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MabiCheerleader from '../components/MabiCheerleader';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addCoins, useAppDispatch, useAppSelector } from '../store/store';

type Props = NativeStackScreenProps<RootStackParamList, 'SimonDice'>;

export type LeafColorId = 'red' | 'blue' | 'yellow' | 'green';

interface LeafOption {
  id: LeafColorId;
  label: string;
  baseColor: string;
  activeColor: string;
  borderColor: string;
}

const LEAVES: LeafOption[] = [
  {
    id: 'red',
    label: 'Rojo',
    baseColor: '#EF5350',
    activeColor: '#FFCDD2',
    borderColor: '#B71C1C',
  },
  {
    id: 'blue',
    label: 'Azul',
    baseColor: '#42A5F5',
    activeColor: '#BBDEFB',
    borderColor: '#0D47A1',
  },
  {
    id: 'yellow',
    label: 'Amarillo',
    baseColor: '#FFEE58',
    activeColor: '#FFFDE7',
    borderColor: '#F57F17',
  },
  {
    id: 'green',
    label: 'Verde',
    baseColor: '#66BB6A',
    activeColor: '#C8E6C9',
    borderColor: '#1B5E20',
  },
];

const SEQUENCE_LENGTH = 3;
const REWARD_COINS = 4;

type MascotMood = 'watching' | 'showing' | 'happy' | 'confused';

/**
 * Estructura preparada con expo-av para reproducir un tono musical por cada color
 * o un efecto de sonido al acertar/equivocarse.
 */
async function playLeafTone(_colorId: LeafColorId | 'success' | 'error'): Promise<void> {
  try {
    // Ejemplo listo para activar con expo-av:
    // const { Audio } = require('expo-av');
    // const soundMap = {
    //   red: require('../assets/sounds/tono_rojo.mp3'),
    //   blue: require('../assets/sounds/tono_azul.mp3'),
    //   yellow: require('../assets/sounds/tono_amarillo.mp3'),
    //   green: require('../assets/sounds/tono_verde.mp3'),
    //   success: require('../assets/sounds/acierto.mp3'),
    //   error: require('../assets/sounds/confuso.mp3'),
    // };
    // const { sound } = await Audio.Sound.createAsync(soundMap[_colorId]);
    // await sound.playAsync();
    // sound.setOnPlaybackStatusUpdate((status: { didJustFinish?: boolean }) => {
    //   if (status.didJustFinish) {
    //     sound.unloadAsync();
    //   }
    // });
  } catch (error) {
    console.warn('Error al reproducir tono en Simón Dice:', error);
  }
}

function generateRandomSequence(length: number): LeafColorId[] {
  const ids: LeafColorId[] = ['red', 'blue', 'yellow', 'green'];
  return Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * ids.length);
    return ids[randomIndex];
  });
}

export const SimonDiceScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const coins = useAppSelector((state) => state.game.coins);

  const [sequence, setSequence] = useState<LeafColorId[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [activeLeaf, setActiveLeaf] = useState<LeafColorId | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [mascotMood, setMascotMood] = useState<MascotMood>('showing');
  const [statusMessage, setStatusMessage] = useState<string>(
    '¡Observa las hojas que ilumina Mabi!'
  );

  // Animación de Mabi en la parte superior (celebración o confusión)
  const mabiScale = useRef(new Animated.Value(1)).current;
  const mabiRotate = useRef(new Animated.Value(0)).current;

  // Escalas individuales para cada una de las 4 hojas
  const leafScales = useRef<Record<LeafColorId, Animated.Value>>({
    red: new Animated.Value(1),
    blue: new Animated.Value(1),
    yellow: new Animated.Value(1),
    green: new Animated.Value(1),
  }).current;

  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const pulseLeaf = useCallback(
    (colorId: LeafColorId) => {
      setActiveLeaf(colorId);
      void playLeafTone(colorId);

      Animated.sequence([
        Animated.timing(leafScales[colorId], {
          toValue: 1.12,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(leafScales[colorId], {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const offTimer = setTimeout(() => {
        setActiveLeaf(null);
      }, 360);
      timersRef.current.push(offTimer);
    },
    [leafScales]
  );

  const animateMabiCelebration = useCallback(() => {
    Animated.sequence([
      Animated.spring(mabiScale, {
        toValue: 1.25,
        friction: 3,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(mabiScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mabiScale]);

  const animateMabiConfusion = useCallback(() => {
    Animated.sequence([
      Animated.timing(mabiRotate, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(mabiRotate, {
        toValue: -1,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(mabiRotate, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.timing(mabiRotate, {
        toValue: 0,
        duration: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mabiRotate]);

  const playSequence = useCallback(
    (seqToPlay: LeafColorId[]) => {
      clearAllTimers();
      setIsPlayingSequence(true);
      setUserStep(0);
      setMascotMood('showing');
      setStatusMessage('👀 ¡Mira con atención la secuencia!');

      seqToPlay.forEach((colorId, index) => {
        const stepTimer = setTimeout(() => {
          pulseLeaf(colorId);
        }, 650 + index * 750);
        timersRef.current.push(stepTimer);
      });

      const finishTimer = setTimeout(() => {
        setIsPlayingSequence(false);
        setMascotMood('watching');
        setStatusMessage('👆 ¡Tu turno! Toca las hojas en el mismo orden');
      }, 650 + seqToPlay.length * 750);
      timersRef.current.push(finishTimer);
    },
    [clearAllTimers, pulseLeaf]
  );

  const startNewRound = useCallback(() => {
    const newSeq = generateRandomSequence(SEQUENCE_LENGTH);
    setSequence(newSeq);
    setHasWon(false);
    playSequence(newSeq);
  }, [playSequence]);

  useEffect(() => {
    startNewRound();
    return () => clearAllTimers();
  }, [startNewRound, clearAllTimers]);

  const handleLeafPress = (colorId: LeafColorId) => {
    if (isPlayingSequence || hasWon) {
      return;
    }

    pulseLeaf(colorId);

    const expectedColor = sequence[userStep];
    if (colorId === expectedColor) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      if (nextStep === sequence.length) {
        // ¡Completó toda la secuencia con éxito!
        setHasWon(true);
        setMascotMood('happy');
        setStatusMessage(`¡Bravo! Ganaste +${REWARD_COINS} Mosquimonedas 🦟`);
        void playLeafTone('success');
        animateMabiCelebration();
        dispatch(addCoins(REWARD_COINS));
      } else {
        setMascotMood('happy');
        setStatusMessage(`¡Bien! (${nextStep}/${sequence.length}) ¡Sigue así!`);
      }
    } else {
      // Se equivocó en el orden: Mabi se confunde y repite la secuencia
      setMascotMood('confused');
      setStatusMessage('🤔 ¡Uy! Orden incorrecto. ¡Mira de nuevo!');
      void playLeafTone('error');
      animateMabiConfusion();
      setIsPlayingSequence(true);

      const retryTimer = setTimeout(() => {
        playSequence(sequence);
      }, 1300);
      timersRef.current.push(retryTimer);
    }
  };

  const mabiRotationDeg = mabiRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-16deg', '16deg'],
  });

  const getMascotEmoji = () => {
    switch (mascotMood) {
      case 'happy':
        return '🦎🎉';
      case 'confused':
        return '🦎🤔';
      case 'showing':
        return '🦎✨';
      default:
        return '🦎👀';
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabecera: Monedas y Mascota Animadora (Mabi) */}
      <View style={styles.headerSection}>
        <View style={styles.topBar}>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              Paso: {userStep}/{SEQUENCE_LENGTH}
            </Text>
          </View>
          <View style={styles.coinsBadge}>
            <Text style={styles.coinsText}>🦟 Mosquimonedas: {coins}</Text>
          </View>
        </View>

        <View style={styles.mabiStageCard}>
          <Animated.View
            style={[
              styles.mabiAvatar,
              {
                transform: [
                  { scale: mabiScale },
                  { rotate: mabiRotationDeg },
                ],
              },
            ]}
          >
            <Text style={styles.mabiEmoji}>{getMascotEmoji()}</Text>
          </Animated.View>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      </View>

      {/* Cuadrícula 2x2 de 4 Hojas de Colores Interactivas */}
      <View style={styles.gridContainer}>
        {LEAVES.map((leaf) => {
          const isLit = activeLeaf === leaf.id;
          return (
            <Animated.View
              key={leaf.id}
              style={[
                styles.leafWrapper,
                { transform: [{ scale: leafScales[leaf.id] }] },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isPlayingSequence || hasWon}
                style={[
                  styles.leafButton,
                  {
                    backgroundColor: isLit ? leaf.activeColor : leaf.baseColor,
                    borderColor: isLit ? '#FFFFFF' : leaf.borderColor,
                  },
                ]}
                onPress={() => handleLeafPress(leaf.id)}
              >
                <Text style={styles.leafIcon}>🍃</Text>
                <Text style={styles.leafLabel}>{leaf.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Controles Inferiores: Repetir secuencia y Volver al Terrario */}
      <View style={styles.footerSection}>
        {!hasWon && (
          <TouchableOpacity
            disabled={isPlayingSequence}
            style={[
              styles.repeatButton,
              isPlayingSequence && styles.buttonDisabled,
            ]}
            onPress={() => playSequence(sequence)}
          >
            <Text style={styles.repeatButtonText}>🔄 Ver secuencia otra vez</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.returnButton,
            hasWon && styles.returnButtonHighlighted,
          ]}
          onPress={() => navigation.navigate('Terrario')}
        >
          <Text style={styles.returnButtonText}>
            {hasWon
              ? '🏡 ¡Genial! Volver al Terrario'
              : '⬅️ Volver al Terrario'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Celebración superpuesta al completar la secuencia */}
      <MabiCheerleader
        visible={hasWon}
        message={`¡Memoria de Camaleón! +${REWARD_COINS} Mosquimonedas 🦟`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerSection: {
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D47A1',
  },
  coinsBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  coinsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E65100',
  },
  mabiStageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#64B5F6',
    elevation: 3,
    gap: 8,
  },
  mabiAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#E8F5E9',
    borderWidth: 3,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mabiEmoji: {
    fontSize: 38,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1565C0',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
    rowGap: 18,
    marginVertical: 8,
  },
  leafWrapper: {
    width: '47%',
    aspectRatio: 1.05,
  },
  leafButton: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leafIcon: {
    fontSize: 44,
    marginBottom: 6,
  },
  leafLabel: {
    fontSize: 20,
    fontWeight: '900',
    color: '#263238',
  },
  footerSection: {
    alignItems: 'center',
    gap: 10,
  },
  repeatButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  repeatButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  returnButton: {
    backgroundColor: '#546E7A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    elevation: 3,
  },
  returnButtonHighlighted: {
    backgroundColor: '#4CAF50',
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});

export default SimonDiceScreen;
