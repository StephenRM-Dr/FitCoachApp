import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { chatService } from "../../services/chatService";
import { coachService } from "../../services/coachService";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import { Message } from "../../types";

export function ChatScreen() {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const isCoach = user?.role === "coach";
  const [text, setText] = useState("");

  // El coach llega con el alumno elegido en el selector del Dashboard; el
  // asesorado conversa siempre con su único coach (se resuelve en el
  // backend), así que no necesita param.
  const clientIdParam = route.params?.clientId as number | undefined;
  const conversationId = isCoach ? clientIdParam : user?.id;

  const { data: myClients = [] } = useQuery({
    queryKey: ["my-clients"],
    queryFn: () => coachService.getMyClients(),
    enabled: isCoach,
  });

  const { data: myCoach } = useQuery({
    queryKey: ["my-coach"],
    queryFn: () => coachService.getMyCoach(),
    enabled: !isCoach,
  });

  const otherPartyName = isCoach
    ? myClients.find((c) => c.id === conversationId)?.name
    : myCoach?.name;

  useEffect(() => {
    navigation.setOptions({ title: otherPartyName || "Chat" });
  }, [navigation, otherPartyName]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      chatService.getMessages({
        clientId: isCoach ? conversationId : undefined,
      }),
    // Patrón nuevo en esta app: staleTime:0 + refetchInterval fuerzan el
    // polling que simula "tiempo real" sin WebSockets. Se detiene solo al
    // salir de la pantalla y se pausa en segundo plano.
    enabled: !!conversationId,
    staleTime: 0,
    refetchInterval: 4000,
    refetchIntervalInBackground: false,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      chatService.sendMessage({
        clientId: isCoach ? conversationId : undefined,
        body,
      }),
    // Feedback instantáneo para quien envía: se inserta localmente con un id
    // negativo (nunca choca con uno real) y el siguiente poll (≤4s) lo
    // reconcilia con la fila real del servidor — no hace falta invalidar.
    onMutate: (body) => {
      const optimisticId = -Date.now();
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) => [
          {
            id: optimisticId,
            coach_id: 0,
            client_id: conversationId as number,
            sender_id: user!.id,
            body,
            created_at: new Date().toISOString(),
          },
          ...old,
        ],
      );
      return { optimisticId };
    },
    onError: (_err, _body, ctx) => {
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) => old.filter((m) => m.id !== ctx?.optimisticId),
      );
    },
  });

  const handleSend = () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    sendMutation.mutate(body);
  };

  if (isCoach && !conversationId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={Typography.bodySmall}>
          Selecciona un alumno desde el Dashboard para chatear.
        </Text>
      </View>
    );
  }

  if (!isCoach && myCoach === null) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={Typography.bodySmall}>
          Aún no tienes un coach asignado.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        inverted
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isMine = item.sender_id === user?.id;
          return (
            <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
              <View
                style={[
                  styles.bubble,
                  isMine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text
                  style={[
                    Typography.bodySmall,
                    { color: isMine ? Colors.white : Colors.textPrimary },
                  ]}
                >
                  {item.body}
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />

      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
        ]}
      >
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={Colors.textMuted}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Send size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  listContent: {
    padding: Spacing.base,
  },
  bubbleRow: {
    marginBottom: Spacing.md,
    alignItems: "flex-start",
  },
  bubbleRowMine: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  bubbleMine: {
    backgroundColor: Colors.primaryDark,
  },
  bubbleTheirs: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timestamp: {
    ...Typography.caption,
    marginTop: 2,
    marginHorizontal: Spacing.xs,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.bgElevated,
  },
});
