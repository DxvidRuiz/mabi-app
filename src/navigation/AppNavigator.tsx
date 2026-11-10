import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TerrarioScreen from '../screens/TerrarioScreen';
import LenguaCazadoraScreen from '../screens/LenguaCazadoraScreen';
import SimonDiceScreen from '../screens/SimonDiceScreen';
import EsconditeScreen from '../screens/EsconditeScreen';

export type RootStackParamList = {
  Terrario: undefined;
  LenguaCazadora: undefined;
  SimonDice: undefined;
  Escondite: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Terrario"
      screenOptions={{
        headerShown: true,
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="Terrario"
        component={TerrarioScreen}
        options={{ title: 'El Terrario de Mabi' }}
      />
      <Stack.Screen
        name="LenguaCazadora"
        component={LenguaCazadoraScreen}
        options={{ title: 'Lengua Cazadora' }}
      />
      <Stack.Screen
        name="SimonDice"
        component={SimonDiceScreen}
        options={{ title: 'Simón Dice' }}
      />
      <Stack.Screen
        name="Escondite"
        component={EsconditeScreen}
        options={{ title: 'El Escondite' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
