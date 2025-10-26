import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface NoteCardProps {
  title: string;
  body: string[];
  colorIndex?: number;
}

// Predefined color palettes for note cards
const NOTE_COLORS = {
  background: ["#A85951", "#8B6F47", "#7B5E7B", "#6B7C8B"],
};

export const NoteCard: React.FC<NoteCardProps> = ({
  title,
  body,
  colorIndex = 0,
}) => {
  const backgroundColor =
    NOTE_COLORS.background[colorIndex % NOTE_COLORS.background.length];

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.bodyContainer}>
        {body.map((item, index) => (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bodyText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 11.5,
    padding: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontFamily: "Montserrat_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  bodyContainer: {
    gap: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "#FFFFFFB3",
    marginRight: 6,
    lineHeight: 18,
  },
  bodyText: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    color: "#FFFFFFB3",
    flex: 1,
    lineHeight: 18,
  },
});
