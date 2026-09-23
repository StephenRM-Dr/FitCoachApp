import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import {
  Home,
  Dumbbell,
  TrendingUp,
  Apple,
  UserCircle,
  ClipboardList,
  Users,
} from "lucide-react-native";
import { Colors } from "../theme";

// Auth Screens
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { RegisterScreen } from "../screens/Auth/RegisterScreen";
import { ForcePasswordChangeScreen } from "../screens/Auth/ForcePasswordChangeScreen";

// Client Screens
import { DashboardScreen } from "../screens/Dashboard/DashboardScreen";
import { WorkoutScreen } from "../screens/Workout/WorkoutScreen";
import { ProgressScreen } from "../screens/Progress/ProgressScreen";
import { NutritionScreen } from "../screens/Nutrition/NutritionScreen";
import { ProfileScreen } from "../screens/Profile/ProfileScreen";

// Coach Screens (reuse some + specific ones)
import { PlanningScreen } from "../screens/Planning/PlanningScreen";
import { DiagnosisScreen } from "../screens/Diagnosis/DiagnosisScreen";
import { SessionBuilderScreen } from "../screens/Planning/SessionBuilderScreen";
import { CoachSessionPickerScreen } from "../screens/Workout/CoachSessionPickerScreen";
import { SessionPreviewScreen } from "../screens/Workout/SessionPreviewScreen";

// Profile Screens (shared by both roles)
import { PersonalInfoScreen } from "../screens/Profile/PersonalInfoScreen";
import { SecurityScreen } from "../screens/Profile/SecurityScreen";
import { NotificationsScreen } from "../screens/Profile/NotificationsScreen";
import { AppearanceScreen } from "../screens/Profile/AppearanceScreen";
import { HelpSupportScreen } from "../screens/Profile/HelpSupportScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Opciones de tabs, calculadas con los insets reales del dispositivo para
 * que el tab bar no quede tapado por la barra de gestos/botones de Android
 * (edge-to-edge es obligatorio desde Expo SDK 54, no se puede confiar en
 * que @react-navigation/bottom-tabs lo resuelva solo en todos los builds).
 */
function useTabScreenOptions() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return {
    headerStyle: { backgroundColor: Colors.bg },
    headerTitleStyle: { fontWeight: "700" as const, color: Colors.textPrimary },
    headerTintColor: Colors.textPrimary,
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.textMuted,
    tabBarStyle: {
      backgroundColor: Colors.bg,
      borderTopColor: Colors.border,
      borderTopWidth: 1,
      paddingTop: 8,
      paddingBottom: bottomInset,
      height: 52 + bottomInset,
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" as const },
  };
}

/**
 * Tabs for Asesorado (Client) role.
 * 5 tabs: Home, Entrenar, Progreso, Nutrición, Perfil
 */
function ClientTabs() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          title: "Inicio",
        }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
          ),
          title: "Entrenar",
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TrendingUp color={color} size={size} />
          ),
          title: "Progreso",
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Apple color={color} size={size} />,
          title: "Nutrición",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
          title: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Tabs for Coach role.
 * 5 tabs: Resumen, Planificación, Diagnóstico, Entrenar, Perfil
 */
function CoachTabs() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          title: "Resumen",
        }}
      />
      <Tab.Screen
        name="Planning"
        component={PlanningScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          ),
          title: "Planificación",
        }}
      />
      <Tab.Screen
        name="Clients"
        component={DiagnosisScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          title: "Diagnóstico",
        }}
      />
      <Tab.Screen
        name="Workout"
        component={CoachSessionPickerScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Dumbbell color={color} size={size} />
          ),
          title: "Entrenar",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
          title: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Splash screen shown while restoring session from AsyncStorage.
 */
function SplashScreen() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

/**
 * Root navigator: handles auth flow and role-based tab switching.
 */
export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user?.force_password_change ? (
        <Stack.Screen
          name="ForcePasswordChange"
          component={ForcePasswordChangeScreen}
        />
      ) : (
        <>
          {user?.role === "coach" ? (
            <>
              <Stack.Screen name="Main" component={CoachTabs} />
              <Stack.Screen
                name="SessionBuilder"
                component={SessionBuilderScreen}
                options={{ headerShown: true, title: "Constructor de Sesión" }}
              />
              <Stack.Screen
                name="SessionPreview"
                component={SessionPreviewScreen}
                options={{
                  headerShown: true,
                  title: "Vista Previa de Sesión",
                }}
              />
            </>
          ) : (
            <Stack.Screen name="Main" component={ClientTabs} />
          )}
          <Stack.Screen
            name="PersonalInfo"
            component={PersonalInfoScreen}
            options={{ headerShown: true, title: "Información Personal" }}
          />
          <Stack.Screen
            name="Security"
            component={SecurityScreen}
            options={{ headerShown: true, title: "Seguridad" }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: true, title: "Notificaciones" }}
          />
          <Stack.Screen
            name="Appearance"
            component={AppearanceScreen}
            options={{ headerShown: true, title: "Apariencia" }}
          />
          <Stack.Screen
            name="HelpSupport"
            component={HelpSupportScreen}
            options={{ headerShown: true, title: "Ayuda y Soporte" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bg,
  },
});
