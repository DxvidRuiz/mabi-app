import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppSelector } from '../store/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Terrario'>;

export const TerrarioScreen: React.FC<Props> = ({ navigation }) => {
  const { coins, difficulty } = useAppSelector((state) => state.game);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦎 Terrario de Mabi (Hub)</Text>
      <Text style={styles.subtitle}>
        🦟 Mosquimonedas: {coins} | Dificultad: {difficulty}
      </Text>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('LenguaCazadora')}
        >
          <Text style={styles.buttonText}>🎯 Lengua Cazadora</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SimonDice')}
        >
          <Text style={styles.buttonText}>🎨 Simón Dice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Escondite')}
        >
          <Text style={styles.buttonText}>🌿 El Escondite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#388E3C',
    marginBottom: 32,
  },
  menu: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TerrarioScreen;
