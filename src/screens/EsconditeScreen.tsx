import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const EsconditeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 El Escondite</Text>
      <Text style={styles.subtitle}>Minijuego 3 - En construcción</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#33691E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#3E2723',
  },
});

export default EsconditeScreen;
