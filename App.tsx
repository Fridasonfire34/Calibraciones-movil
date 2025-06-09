import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import InicioScreen from './src/screens/InicioScreen';
import FlexScreen from './src/screens/FlexScreen';
import VernScreen from './src/screens/VernScreen';
import CalibrarFScreen from './src/screens/CalibrarFScreen';
import TransportadorScreen from './src/screens/TransportadorScreen';
import Vernier6Screen from './src/screens/Vernier6Screen';
import Vernier12Screen from './src/screens/Vernier12Screen';
import CalibrarV6Screen from './src/screens/CalibrarV6Screen';
import CalibrarV12Screen from './src/screens/Vernier12Screen'

type RootStackParamList = {
  Login: undefined;
  Inicio: undefined;
  FlexScreen: { nomina: string };
  VernScreen: { nomina: string };
  Vernier6Screen: { nomina: string };
  TransportadorScreen: { nomina: string };
  CalibrarFScreen: { nomina: string, equipo: string };
  Vernier12Screen: { nomina: string, equipo: string };
  CalibrarV6Screen: { nomina: string, equipo: string };
  CalibrarV12Screen: { nomina: string, equipo: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Inicio"
          component={InicioScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FlexScreen"
          component={FlexScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VernScreen"
          component={VernScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TransportadorScreen"
          component={TransportadorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalibrarFScreen"
          component={CalibrarFScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Vernier6Screen"
          component={Vernier6Screen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Vernier12Screen"
          component={Vernier12Screen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalibrarV6Screen"
          component={CalibrarV6Screen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalibrarV12Screen"
          component={CalibrarV12Screen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
