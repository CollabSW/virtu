import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TeacherHomeScreen from '../app/screens/TeacherHomeScreen';
import LogoutButton from '../shared/components/LogoutButton';

const Stack = createNativeStackNavigator();

// Stack exclusivo del docente: aquí solo se registran pantallas de docente.
export default function TeacherNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <Stack.Screen
        name="TeacherHome"
        component={TeacherHomeScreen}
        options={{ title: 'Inicio' }}
      />
    </Stack.Navigator>
  );
}
