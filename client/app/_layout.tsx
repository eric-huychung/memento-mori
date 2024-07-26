import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
//import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import 'react-native-reanimated';

import { useNavigation } from '@react-navigation/native';

// Navigation Type
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


//redux
import { Provider } from 'react-redux';
import store from "../redux/store";

import Colors from '@/constants/Colors';



export type RootStackParamList = {
  '(tabs)': undefined;
  '(modals)/login': undefined;
  '(modals)/onboarding': undefined;
  '(modals)/wall': undefined; // Added wall route type
  '(modals)/setting': { folderId: number };

  // Add other routes here as needed
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;



export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(modals)/onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "mon": require("../assets/fonts/Montserrat-Regular.ttf"),
    "mon-sb": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "mon-b": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {

  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(modals)/onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(modals)/login"
          options={{
            title: 'Log in or sign up',
            headerTitleStyle: {
              fontFamily: 'mon-sb',
            },
            presentation: 'transparentModal',
            headerShown: false, 
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.navigate('(modals)/onboarding')}>
                <Ionicons name="close-outline" size={28} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
            name="(modals)/wall" 
            options={{ 
              title: 'Memento',
              headerShown: true,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back-outline" size={28} />
                </TouchableOpacity>
              ), 
            }} 
        />
        <Stack.Screen 
            name="(modals)/setting" 
            options={{ 
              title: 'Setting',
              headerShown: true,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back-outline" size={28} />
                </TouchableOpacity>
              ), 
            }} 
        />
      </Stack>
    </Provider>
);
}
