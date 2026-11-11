import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StudentHomeScreen from '../app/screens/StudentHomeScreen';
import LogoutButton from '../shared/components/LogoutButton';

const Stack = createNativeStackNavigator();

// Stack exclusivo del estudiante: aquí solo se registran pantallas de estudiante.
export default function StudentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <Stack.Screen
        name="StudentHome"
        component={StudentHomeScreen}
        options={{ title: 'Inicio' }}
      />
    </Stack.Navigator>
  );
}
