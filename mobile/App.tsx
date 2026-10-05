import React, { useEffect } from "react";
import { Alert } from "react-native";
import * as Updates from "expo-updates";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { authService } from "./src/services/authService";
import { catalogService } from "./src/services/catalogService";
import { coachService } from "./src/services/coachService";
import { workoutService } from "./src/services/workoutService";
import { useAuthStore } from "./src/store/authStore";

const DAY_MS = 24 * 60 * 60 * 1000;

// Cada consulta es un viaje de red al backend: los datos se consideran
// frescos 2 min (evita refetch al cambiar de pestaña) y solo se reintenta
// una vez. Las mutaciones siguen refrescando con invalidateQueries.
// gcTime tiene que ser >= maxAge del persister o la caché guardada se
// descarta antes de poder restaurarse.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 2 * 60_000, gcTime: DAY_MS, retry: 1 },
  },
});

// La caché se guarda en el teléfono: al abrir la app o cambiar de sección se
// pinta lo último conocido al instante y se actualiza en segundo plano.
const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "fitcoach_query_cache",
});

// Subir cuando cambie la forma de las respuestas de la API: invalida la
// caché guardada con el formato viejo.
const CACHE_VERSION = "1";

function AppContent() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const userId = useAuthStore((state) => state.user?.id);
  const role = useAuthStore((state) => state.user?.role);

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

  // Avisa de actualizaciones OTA (EAS Update): por defecto expo-updates las
  // descarga en segundo plano y las aplica recién en el siguiente arranque
  // en frío, sin avisar. Acá se revisa al abrir la app y, si hay una nueva,
  // se le pregunta al usuario si quiere aplicarla ya (reinicia la app) o
  // dejarla para después (se aplicará sola la próxima vez que la abra).
  // No corre en desarrollo: expo-updates no tiene servidor de updates ahí.
  useEffect(() => {
    if (__DEV__) return;

    (async () => {
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (!isAvailable) return;

        await Updates.fetchUpdateAsync();
        Alert.alert(
          "Actualización disponible",
          "Hay una nueva versión de FitCoach Pro lista para instalar.",
          [
            { text: "Más tarde", style: "cancel" },
            { text: "Reiniciar ahora", onPress: () => Updates.reloadAsync() },
          ],
        );
      } catch {
        // Sin conexión o falla la revisión: la app sigue funcionando con lo
        // que ya tiene instalado.
      }
    })();
  }, []);

  // Al cerrar sesión se borra la caché (memoria y teléfono) para que otra
  // cuenta en el mismo dispositivo no vea datos de la anterior.
  useEffect(() => {
    return useAuthStore.subscribe((state, prev) => {
      if (prev.isAuthenticated && !state.isAuthenticated) {
        queryClient.clear();
        persister.removeClient();
      }
    });
  }, []);

  // Precarga lo que abre primero cada rol, para que las pestañas no
  // arranquen vacías esperando a la red.
  useEffect(() => {
    if (!userId) return;
    if (role === "coach") {
      queryClient.prefetchQuery({
        queryKey: ["my-clients"],
        queryFn: () => coachService.getMyClients(),
      });
      queryClient.prefetchQuery({
        queryKey: ["exercises"],
        queryFn: () => catalogService.getExercises(),
      });
    } else {
      queryClient.prefetchQuery({
        queryKey: ["active-program"],
        queryFn: () => workoutService.getActiveProgram(),
      });
    }
  }, [userId, role]);

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
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: DAY_MS,
          buster: CACHE_VERSION,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => query.state.status === "success",
          },
        }}
      >
        <AppContent />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
