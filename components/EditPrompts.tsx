import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface Prompt {
  id?: string;
  question: string;
  answer: string;
}

interface EditPromptsProps {
  availablePrompts: string[];
  currentPrompts: Prompt[];
  onSave: (prompts: Prompt[]) => void;
  onClose: () => void;
  visible: boolean;
}

export function EditPrompts({
  availablePrompts,
  currentPrompts,
  onSave,
  onClose,
  visible,
}: EditPromptsProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [prompts, setPrompts] = useState<Prompt[]>(
    currentPrompts.length > 0 ? [...currentPrompts] : []
  );
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const handleAddPrompt = () => {
    if (prompts.length < 3) {
      setPrompts([...prompts, { question: "", answer: "" }]);
      setOpenDropdown(prompts.length);
    }
  };

  const handleSelectPrompt = (index: number, question: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { id: newPrompts[index]?.id, question, answer: newPrompts[index]?.answer || "" };
    setPrompts(newPrompts);
    setOpenDropdown(null);
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { ...newPrompts[index], answer };
    setPrompts(newPrompts);
  };

  const handleRemovePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validPrompts = prompts.filter((p) => p.question && p.answer.trim());
    onSave(validPrompts);
    onClose();
  };

  const usedQuestions = prompts.map((p) => p.question).filter(Boolean);
  const availableOptions = availablePrompts.filter(
    (q) => !usedQuestions.includes(q)
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + webTopInset,
            paddingBottom: Math.max(insets.bottom, webBottomInset),
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.headerAction}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Get to know me</Text>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
            <Text style={styles.headerActionBold}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Choose 1-3 prompts to help people get to know you better
          </Text>

          {prompts.map((prompt, index) => (
            <View key={index} style={styles.promptBlock}>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() =>
                  setOpenDropdown(openDropdown === index ? null : index)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !prompt.question && styles.dropdownPlaceholder,
                  ]}
                >
                  {prompt.question || "Select a prompt..."}
                </Text>
                <Ionicons
                  name={
                    openDropdown === index ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#737373"
                />
              </TouchableOpacity>

              {openDropdown === index && (
                <View style={styles.dropdownList}>
                  {availableOptions.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>
                      No more prompts available
                    </Text>
                  ) : (
                    availableOptions.map((option, optIndex) => (
                      <TouchableOpacity
                        key={optIndex}
                        style={[
                          styles.dropdownOption,
                          optIndex < availableOptions.length - 1 &&
                            styles.dropdownOptionBorder,
                        ]}
                        onPress={() => handleSelectPrompt(index, option)}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {prompt.question !== "" && (
                <TextInput
                  style={styles.answerInput}
                  value={prompt.answer}
                  onChangeText={(text) => handleAnswerChange(index, text)}
                  placeholder="Your answer..."
                  placeholderTextColor="#a3a3a3"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}

              <TouchableOpacity
                onPress={() => handleRemovePrompt(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeText}>Remove prompt</Text>
              </TouchableOpacity>
            </View>
          ))}

          {prompts.length < 3 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPrompt}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>
                + Add prompt ({prompts.length}/3)
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#171717",
  },
  headerAction: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#171717",
  },
  headerActionBold: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#171717",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#737373",
    lineHeight: 22,
  },
  promptBlock: {
    gap: 12,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  dropdownText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#a3a3a3",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    maxHeight: 240,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
  },
  dropdownOptionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
  },
  dropdownEmpty: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
    paddingVertical: 14,
  },
  answerInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    minHeight: 100,
    lineHeight: 22,
  },
  removeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
  },
});
