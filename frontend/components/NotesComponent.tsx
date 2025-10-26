import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
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

interface Note {
  id: string;
  title: string;
  body: string;
  date: string;
  backgroundColor: string;
  category: string;
}

const NOTES_DATA: Note[] = [
  {
    id: "1",
    title: "How to make your personal brand stand out online",
    body: "Focus on authentic content, engage consistently with your audience, and showcase your unique value proposition. Use storytelling to connect emotionally.",
    date: "May 21, 2025",
    backgroundColor: "#fde9ff",
    category: "Personal",
  },
  {
    id: "2",
    title: "Summary of that article on AI and memory",
    body: "The article discusses how AI systems are being developed to mimic human memory processes, including short-term and long-term retention. Key findings include the role of attention mechanisms in memory formation.",
    date: "May 11, 2025",
    backgroundColor: "#fbffe7",
    category: "School",
  },
  {
    id: "3",
    title:
      "Detailed notes from the 10/25 project planning meeting, including all action items and who is responsible for what.",
    body: "Action items: Sarah - complete design mockups by 11/1, John - finalize API integration by 11/5, Team - review security requirements. Next meeting scheduled for 11/8.",
    date: "July 25, 2025",
    backgroundColor: "#ebffe4",
    category: "Work",
  },
  {
    id: "4",
    title:
      "Brainstorming session for the Q4 marketing campaign, covering social media angles, email copy, and potential collaborations.",
    body: "Ideas: Partner with micro-influencers, create behind-the-scenes content, launch user-generated content campaign. Budget allocation: 40% social, 30% email, 30% partnerships.",
    date: "February 5, 2025",
    backgroundColor: "#e5fffc",
    category: "Work",
  },
  {
    id: "5",
    title: "Recipe for Mom's lasagna (with a reminder to get ricotta)",
    body: "Ingredients: lasagna noodles, ricotta cheese, mozzarella, ground beef, marinara sauce, onions, garlic. Bake at 375°F for 45 minutes. Don't forget to buy ricotta!",
    date: "May 21, 2025",
    backgroundColor: "#ffe5e5",
    category: "Personal",
  },
  {
    id: "6",
    title: "Draft for the email to Professor Smith about my project",
    body: "Dear Professor Smith, I wanted to update you on my research progress. I've completed the literature review and am moving forward with the experimental phase. Could we schedule a meeting to discuss next steps?",
    date: "May 21, 2025",
    backgroundColor: "#e7e5ff",
    category: "School",
  },
];

export default function NotesComponent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("School");
  const [notes, setNotes] = useState<Note[]>(NOTES_DATA);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedBody, setEditedBody] = useState("");

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

  const saveEdit = () => {
    if (selectedNote && editedTitle.trim()) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === selectedNote.id
            ? { ...note, title: editedTitle.trim(), body: editedBody.trim() }
            : note
        )
      );
      setSelectedNote({
        ...selectedNote,
        title: editedTitle.trim(),
        body: editedBody.trim(),
      });
      setIsEditing(false);
    }
  };

  const deleteNote = () => {
    if (selectedNote) {
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotes((prevNotes) =>
              prevNotes.filter((note) => note.id !== selectedNote.id)
            );
            closeModal();
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
        {filteredNotes.map((note, index) => {
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
        })}
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
});
