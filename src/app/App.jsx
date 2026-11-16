import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RoleNavigator from '../navigation/RoleNavigator';
import { AuthProvider, useAuth } from '../shared/context/AuthContext';
import DevLoginScreen from './screens/DevLoginScreen';

// TODO C1-04: integrar con AuthNavigator/AppNavigator de Gadiel.
// Hoy el cambio entre login y app se hace aquí: sin sesión -> DevLoginScreen,
// con sesión -> RoleNavigator. Cuando AppNavigator decida según useAuth().estaAutenticado,
// debe mostrar AuthNavigator o <RoleNavigator />, y este archivo vuelve a renderizar solo <AppNavigator />.
function RootContent() {
  const { estaAutenticado } = useAuth();
  return estaAutenticado ? <RoleNavigator /> : <DevLoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootContent />
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
