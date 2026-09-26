import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Colors, Spacing, Typography } from "../../theme";
import { LEGAL_DOCUMENTS, LegalDocId } from "../../legal/documents";
import { LEGAL_VERSION, LEGAL_LAST_UPDATED } from "../../config/business";

type LegalRoute = RouteProp<{ Legal: { doc: LegalDocId } }, "Legal">;

export function LegalScreen() {
  const { params } = useRoute<LegalRoute>();
  const document = LEGAL_DOCUMENTS[params?.doc ?? "privacy"];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={Typography.h4} accessibilityRole="header">
        {document.title}
      </Text>
      <Text style={[Typography.caption, { marginBottom: Spacing.sm }]}>
        Versión {LEGAL_VERSION} · Última actualización: {LEGAL_LAST_UPDATED}
      </Text>

      {document.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={Typography.h5} accessibilityRole="header">
            {section.heading}
          </Text>
          {section.body.map((paragraph, index) => (
            <Text key={index} style={Typography.body}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing["3xl"],
    gap: Spacing.md,
  },
  section: { gap: Spacing.sm, marginTop: Spacing.md },
});
