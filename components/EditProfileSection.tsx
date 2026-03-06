import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface EditProfileSectionProps {
  title: string;
  type: "multi-select" | "single-select" | "text";
  options?: string[];
  currentValue: string | string[];
  onSave: (value: string | string[]) => void;
  onClose: () => void;
  maxSelections?: number;
  note?: string;
  visible: boolean;
  allowOther?: boolean;
}

export function EditProfileSection({
  title,
  type,
  options = [],
  currentValue,
  onSave,
  onClose,
  maxSelections,
  note,
  visible,
  allowOther = false,
}: EditProfileSectionProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const optionsSet = new Set(options);
  const initialValues = Array.isArray(currentValue) ? currentValue : [currentValue];
  const initialPredefined = initialValues.filter((v) => optionsSet.has(v));
  const initialCustom = allowOther
    ? initialValues.filter((v) => v && !optionsSet.has(v))
    : [];

  const [selectedValues, setSelectedValues] = useState<string[]>(initialPredefined);
  const [customEntries, setCustomEntries] = useState<string[]>(
    initialCustom.length > 0 ? initialCustom : []
  );
  const [textValue, setTextValue] = useState<string>(
    typeof currentValue === "string" ? currentValue : ""
  );

  const totalSelected = selectedValues.length + customEntries.filter((v) => v.trim()).length;

  const handleToggle = (value: string) => {
    if (type === "single-select") {
      setSelectedValues([value]);
    } else {
      if (selectedValues.includes(value)) {
        setSelectedValues(selectedValues.filter((v) => v !== value));
      } else {
        if (maxSelections && totalSelected >= maxSelections) {
          return;
        }
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  const handleAddOther = () => {
    if (maxSelections && totalSelected >= maxSelections) return;
    setCustomEntries([...customEntries, ""]);
  };

  const handleCustomChange = (index: number, text: string) => {
    const updated = [...customEntries];
    updated[index] = text;
    setCustomEntries(updated);
  };

  const handleRemoveCustom = (index: number) => {
    setCustomEntries(customEntries.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (type === "text") {
      onSave(textValue);
    } else if (type === "single-select") {
      onSave(selectedValues[0] || "");
    } else {
      const validCustom = customEntries.filter((v) => v.trim());
      onSave([...selectedValues, ...validCustom]);
    }
    onClose();
  };

  const isDisabled =
    (type === "text" && !textValue.trim()) ||
    (type !== "text" && totalSelected === 0);

  const renderOption = ({ item }: { item: string }) => {
    const isSelected = selectedValues.includes(item);
    const isOptionDisabled =
      !isSelected &&
      type === "multi-select" &&
      !!maxSelections &&
      totalSelected >= maxSelections;

    return (
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && styles.optionSelected,
          isOptionDisabled && styles.optionDisabled,
        ]}
        onPress={() => handleToggle(item)}
        disabled={isOptionDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            isOptionDisabled && styles.optionTextDisabled,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + webTopInset },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
            testID="edit-close"
          >
            <Ionicons name="close" size={22} color="#171717" />
          </TouchableOpacity>
        </View>

        {type === "text" ? (
          <View style={styles.textContainer}>
            <TextInput
              style={styles.textInput}
              value={textValue}
              onChangeText={setTextValue}
              placeholder="Enter value..."
              placeholderTextColor="#a3a3a3"
              autoFocus
            />
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={renderOption}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              <>
                {allowOther && type === "multi-select" && (
                  <View style={styles.otherSection}>
                    {customEntries.map((entry, index) => (
                      <View key={`custom-${index}`} style={styles.customEntryRow}>
                        <TextInput
                          style={styles.customInput}
                          value={entry}
                          onChangeText={(text) => handleCustomChange(index, text)}
                          placeholder="Type your own..."
                          placeholderTextColor="#a3a3a3"
                          autoFocus={entry === ""}
                        />
                        <TouchableOpacity
                          onPress={() => handleRemoveCustom(index)}
                          style={styles.removeCustomButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close-circle" size={20} color="#a3a3a3" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[
                        styles.addOtherButton,
                        !!(maxSelections && totalSelected >= maxSelections) && styles.optionDisabled,
                      ]}
                      onPress={handleAddOther}
                      disabled={!!(maxSelections && totalSelected >= maxSelections)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={18} color="#171717" style={{ marginRight: 6 }} />
                      <Text style={styles.addOtherText}>Other</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {note && <Text style={styles.note}>{note}</Text>}
                {type === "multi-select" && maxSelections && (
                  <Text style={styles.counter}>
                    {totalSelected} / {maxSelections} selected
                  </Text>
                )}
              </>
            }
          />
        )}

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, webBottomInset) + 12 },
          ]}
        >
          <TouchableOpacity
            style={[styles.saveButton, isDisabled && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isDisabled}
            activeOpacity={0.8}
            testID="edit-save"
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F7",
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
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#171717",
    flex: 1,
  },
  closeButton: {
    padding: 6,
    marginRight: -6,
  },
  listContent: {
    padding: 20,
    gap: 8,
  },
  option: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
  },
  optionTextSelected: {
    color: "#ffffff",
  },
  optionTextDisabled: {
    color: "#737373",
  },
  textContainer: {
    padding: 20,
  },
  textInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  otherSection: {
    marginTop: 8,
    gap: 8,
  },
  customEntryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#171717",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#171717",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  removeCustomButton: {
    padding: 4,
  },
  addOtherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderStyle: "dashed",
  },
  addOtherText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#171717",
  },
  note: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
  counter: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
  },
  saveButton: {
    backgroundColor: "#171717",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#fafafa",
  },
});
