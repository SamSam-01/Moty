import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ title: 'My Movie Rankings' }} />
              <Stack.Screen 
                name="list/[id]" 
                options={{ 
                  headerShown: false,
                  presentation: 'card',
                  animation: 'slide_from_right',
                }} 
              />
            </Stack>
            <StatusBar style="light" />
          </View>
        </TouchableWithoutFeedback>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});