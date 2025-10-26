import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  FeBlend,
  FeFlood,
  FeGaussianBlur,
  Filter,
  G,
} from "react-native-svg";
import { useComprehensiveContext } from "@/hooks/useComprehensiveContext";
import { useUpdateMission, useDeleteMission } from "@/hooks/useMissions";
import type { Mission } from "@/types/api";

interface Note {
  id: string;
  title: string;
  body: string;
  date: string;
  backgroundColor: string;
  category: string;
}

const HARDCODED_USER_ID = "ac22a45c-fb5b-4027-9e41-36d6b9abaebb";

// Color palette for notes
const noteColors = [
  "#fde9ff",
  "#fbffe7",
  "#ebffe4",
  "#e5fffc",
  "#ffe5e5",
  "#e7e5ff",
  "#ffeee5",
  "#e5f4ff",
];

export default function NotesComponent() {
  const userId = HARDCODED_USER_ID;

  // Fetch comprehensive context
  const {
    data: context,
    isLoading,
    error,
    refetch,
  } = useComprehensiveContext(userId);
  const { mutateAsync: updateMission } = useUpdateMission();
  const { mutateAsync: deleteMission } = useDeleteMission();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");

  // Extract note-type missions from context
  const noteMissions = useMemo(() => {
    if (!context?.all_missions) return [];
    return context.all_missions.filter((m: Mission) => m.type === "note");
  }, [context]);

  // Convert missions to notes format
  const notes = useMemo(() => {
    return noteMissions.map((mission: Mission, index: number) => {
      // Category name from context's categories or default
      let categoryName = "Personal";
      if (mission.category_id && context?.categories) {
        const category = context.categories.find(
          (c: any) => c.id === mission.category_id
        );
        if (category) {
          categoryName = category.name;
        }
      }

      return {
        id: mission.id,
        title: mission.title,
        body: mission.body || "",
        date: mission.created_at
          ? new Date(mission.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "No date",
        backgroundColor: noteColors[index % noteColors.length],
        category: categoryName,
      };
    });
  }, [noteMissions, context]);

  // Debug logging
  useEffect(() => {
    console.log("=== NotesComponent Debug ===");
    console.log("User ID:", userId);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
    console.log("Note Missions Count:", noteMissions.length);
    console.log("Notes:", notes);
  }, [userId, isLoading, error, noteMissions, notes]);

  const categories = [
    { name: "Personal", backgroundColor: "#fceced" },
    { name: "Work", backgroundColor: "#e1f5ff" },
    { name: "School", backgroundColor: "#e1ffe6" },
  ];

  const filteredNotes =
    selectedCategory === "All"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditedTitle(note.title);
    setEditedBody(note.body);
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedNote(null);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (selectedNote && editedTitle.trim()) {
      try {
        await updateMission({
          id: selectedNote.id,
          data: {
            title: editedTitle.trim(),
            body: editedBody.trim(),
          },
        });
        // Update local state
        setSelectedNote({
          ...selectedNote,
          title: editedTitle.trim(),
          body: editedBody.trim(),
        });
        setIsEditing(false);
        // Refetch to update the list
        refetch();
      } catch (error) {
        console.error("Failed to update note:", error);
        Alert.alert("Error", "Failed to update note. Please try again.");
      }
    }
  };

  const deleteNote = () => {
    if (selectedNote) {
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMission(selectedNote.id);
              closeModal();
              // Refetch to update the list
              refetch();
            } catch (error) {
              console.error("Failed to delete note:", error);
              Alert.alert("Error", "Failed to delete note. Please try again.");
            }
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Blur Circles */}
      <View style={styles.blurCircle1}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 701 701"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            <Filter
              id="filter0_f_1_47"
              x="0"
              y="0"
              width="701"
              height="701"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <FeFlood floodOpacity="0" result="BackgroundImageFix" />
              <FeBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <FeGaussianBlur
                stdDeviation="85.5"
                result="effect1_foregroundBlur_1_47"
              />
            </Filter>
          </Defs>
          <G filter="url(#filter0_f_1_47)">
            <Circle
              cx="350.5"
              cy="350.5"
              r="179.5"
              fill="#FBC6E6"
              fillOpacity="0.08"
            />
          </G>
        </Svg>
      </View>

      <View style={styles.blurCircle2}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 701 701"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            <Filter
              id="filter0_f_1_47_2"
              x="0"
              y="0"
              width="701"
              height="701"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <FeFlood floodOpacity="0" result="BackgroundImageFix" />
              <FeBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <FeGaussianBlur
                stdDeviation="85.5"
                result="effect1_foregroundBlur_1_47"
              />
            </Filter>
          </Defs>
          <G filter="url(#filter0_f_1_47_2)">
            <Circle
              cx="350.5"
              cy="350.5"
              r="179.5"
              fill="#FBC6E6"
              fillOpacity="0.08"
            />
          </G>
        </Svg>
      </View>

      {/* Header */}
      <Text style={styles.header}>Notes</Text>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            onPress={() => setSelectedCategory(category.name)}
            style={[
              styles.filterPill,
              {
                backgroundColor: category.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category.name && styles.filterTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes Grid */}
      <ScrollView
        style={styles.notesScrollView}
        contentContainerStyle={styles.notesContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Loading notes...</Text>
          </View>
        ) : filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tell Neuri to create a note via voice!
            </Text>
          </View>
        ) : (
          filteredNotes.map((note, index) => {
            // Staggered layout: left column for even indices, right for odd
            const isLeft = index % 2 === 0;
            const marginTop = index < 2 ? 0 : 10;

            return (
              <TouchableOpacity
                key={note.id}
                onPress={() => openNote(note)}
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: note.backgroundColor,
                    marginTop,
                    width: index === 2 ? "100%" : "48%",
                    alignSelf: isLeft ? "flex-start" : "flex-end",
                  },
                ]}
              >
                <Text style={styles.noteTitle} numberOfLines={3}>
                  {note.title}
                </Text>
                <Text style={styles.noteDate}>{note.date}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Note Detail/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.modalActions}>
                {isEditing ? (
                  <TouchableOpacity
                    onPress={saveEdit}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={deleteNote}
                      style={[styles.actionButton, styles.deleteButton]}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Note Content */}
            <ScrollView
              style={styles.modalBodyScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedNote && (
                <>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          categories.find(
                            (c) => c.name === selectedNote.category
                          )?.backgroundColor || "#e0e0e0",
                      },
                    ]}
                  >
                    <Text style={styles.categoryBadgeText}>
                      {selectedNote.category}
                    </Text>
                  </View>

                  {isEditing ? (
                    <>
                      <Text style={styles.fieldLabel}>Title</Text>
                      <TextInput
                        style={styles.editInputTitle}
                        value={editedTitle}
                        onChangeText={setEditedTitle}
                        multiline
                        placeholder="Note title"
                      />
                      <Text style={styles.fieldLabel}>Body</Text>
                      <TextInput
                        style={styles.editInputBody}
                        value={editedBody}
                        onChangeText={setEditedBody}
                        multiline
                        placeholder="Note content"
                        autoFocus
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>
                        {selectedNote.title}
                      </Text>
                      <Text style={styles.modalBodyText}>
                        {selectedNote.body}
                      </Text>
                    </>
                  )}

                  <Text style={styles.modalDate}>{selectedNote.date}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#262135",
    overflow: "hidden",
  },
  blurCircle1: {
    position: "absolute",
    left: "-25%",
    top: "-12%",
    width: "92%",
    aspectRatio: 1,
    opacity: 0.5,
  },
  blurCircle2: {
    position: "absolute",
    left: "7%",
    bottom: "20%",
    width: "92%",
    aspectRatio: 1,
    opacity: 0.5,
  },
  header: {
    marginTop: 55,
    marginHorizontal: 28,
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 36,
    lineHeight: 38.88,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 28,
    marginBottom: 20,
  },
  filterPill: {
    height: 21,
    paddingHorizontal: 21,
    paddingVertical: 4,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  filterText: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 12,
    lineHeight: 12.96,
    color: "#000000",
    textAlign: "center",
  },
  filterTextActive: {
    fontFamily: "MontserratAlternates_600SemiBold",
  },
  notesScrollView: {
    flex: 1,
    paddingHorizontal: 28,
  },
  notesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 100,
  },
  noteCard: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 20,
    gap: 10,
  },
  noteTitle: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 16,
    lineHeight: 17.28,
    color: "#000300",
  },
  noteDate: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 14,
    lineHeight: 15.12,
    color: "rgba(0, 3, 0, 0.48)",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(38, 33, 53, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 24,
    color: "#262135",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#262135",
  },
  actionButtonText: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  deleteButton: {
    backgroundColor: "#FF4444",
  },
  deleteButtonText: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  modalBodyScroll: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 12,
    color: "#000000",
  },
  modalTitle: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 20,
    lineHeight: 26,
    color: "#000300",
    marginBottom: 12,
  },
  modalBodyText: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 16,
    lineHeight: 22,
    color: "#000300",
    marginBottom: 16,
  },
  modalDate: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 14,
    color: "rgba(0, 3, 0, 0.48)",
    marginTop: 8,
  },
  fieldLabel: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 14,
    color: "#262135",
    marginBottom: 6,
    marginTop: 8,
  },
  editInputTitle: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 18,
    lineHeight: 24,
    color: "#000300",
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#262135",
    borderRadius: 10,
    minHeight: 50,
    textAlignVertical: "top",
  },
  editInputBody: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 16,
    lineHeight: 22,
    color: "#000300",
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#262135",
    borderRadius: 10,
    minHeight: 150,
    textAlignVertical: "top",
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 14,
    color: "#C7C7C7",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: "MontserratAlternates_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: "MontserratAlternates_400Regular",
    fontSize: 14,
    color: "#C7C7C7",
    textAlign: "center",
    lineHeight: 20,
  },
});
