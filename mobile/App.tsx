import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { authService } from "./src/services/authService";
import { useAuthStore } from "./src/store/authStore";

// Cada consulta es un viaje de red al backend: los datos se consideran
// frescos 30 s (evita refetch al volver a una pestaña) y solo se reintenta
// una vez. Las mutaciones siguen refrescando con invalidateQueries.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppContent() {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    (async () => {
      await restoreSession();
      // El usuario guardado en el dispositivo puede estar desactualizado
      // (p. ej. cambió la versión de los términos): se refresca una vez.
      const { token, isAuthenticated, setAuth } = useAuthStore.getState();
      if (!isAuthenticated || !token) return;
      try {
        await setAuth(await authService.me(), token);
      } catch {
        // Sin conexión: se sigue con el usuario guardado.
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
