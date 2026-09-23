import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Mail, HelpCircle } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";

const FAQ = [
  {
    q: "¿Cómo cambio de coach?",
    a: "Por ahora la asignación de coach la gestiona tu entrenador desde su panel. Contáctalo directamente para cualquier cambio.",
  },
  {
    q: "¿Cómo registro una serie de mi entrenamiento?",
    a: "Entra a la pestaña Entrenar, selecciona la sesión del día, escribe el peso y las repeticiones de cada serie y presiona Registrar Entrenamiento.",
  },
  {
    q: "¿Olvidé mi contraseña, qué hago?",
    a: "En la pantalla de inicio de sesión toca '¿Olvidaste tu contraseña?' e ingresa tu correo. Te enviaremos una contraseña temporal.",
  },
];

export function HelpSupportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={[Typography.h5, { marginBottom: Spacing.md }]}>
          Preguntas Frecuentes
        </Text>
        {FAQ.map((item, index) => (
          <View
            key={index}
            style={[
              styles.faqItem,
              index < FAQ.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              },
            ]}
          >
            <View style={styles.faqHeader}>
              <HelpCircle size={16} color={Colors.info} />
              <Text style={[Typography.body, { fontWeight: "600", flex: 1 }]}>
                {item.q}
              </Text>
            </View>
            <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>
              {item.a}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => Linking.openURL("mailto:soporte@fitcoach.app")}
      >
        <View style={styles.iconBox}>
          <Mail size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.body, { fontWeight: "600" }]}>
            Contactar Soporte
          </Text>
          <Text style={Typography.caption}>soporte@fitcoach.app</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  faqItem: { paddingVertical: Spacing.md },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
});
