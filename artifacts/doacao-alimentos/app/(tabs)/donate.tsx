import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FoodCategory, FoodUnit, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: { id: FoodCategory; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: "cereais", label: "Cereais e Grãos", icon: "box" },
  { id: "enlatados", label: "Enlatados", icon: "layers" },
  { id: "bebidas", label: "Bebidas", icon: "droplet" },
  { id: "massas", label: "Massas", icon: "package" },
  { id: "laticinios", label: "Laticínios", icon: "coffee" },
  { id: "outros", label: "Outros", icon: "gift" },
];

const UNITS: { id: FoodUnit; label: string }[] = [
  { id: "kg", label: "kg" },
  { id: "unidades", label: "unidades" },
  { id: "litros", label: "litros" },
  { id: "caixas", label: "caixas" },
  { id: "pacotes", label: "pacotes" },
];

export default function DonateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addDonation } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FoodCategory>("cereais");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<FoodUnit>("unidades");
  const [expiryDate, setExpiryDate] = useState("");
  const [location, setLocation] = useState(user?.address || "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (user?.role !== "doador") {
    return (
      <View style={[styles.restricted, { backgroundColor: colors.background, paddingTop: topPad + 20 }]}>
        <Feather name="lock" size={40} color={colors.mutedForeground} />
        <Text style={[styles.restrictedTitle, { color: colors.foreground }]}>
          Área exclusiva para doadores
        </Text>
        <Text style={[styles.restrictedDesc, { color: colors.mutedForeground }]}>
          Esta funcionalidade está disponível apenas para perfis de doador.
        </Text>
      </View>
    );
  }

  function formatExpiryInput(text: string) {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  }

  function parseDateToISO(br: string): string {
    const parts = br.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return br;
  }

  const isValid = title.trim() && quantity.trim() && expiryDate.length >= 10 && location.trim();

  async function handleSubmit() {
    if (!isValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    await addDonation({
      title: title.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit,
      expiryDate: parseDateToISO(expiryDate),
      location: location.trim(),
      description: description.trim(),
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setTitle("");
      setQuantity("");
      setExpiryDate("");
      setDescription("");
      setSuccess(false);
      router.push("/(tabs)/my-items");
    }, 1500);
  }

  if (success) {
    return (
      <View style={[styles.successScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="check-circle" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          Doação cadastrada!
        </Text>
        <Text style={[styles.successDesc, { color: colors.mutedForeground }]}>
          Sua doação foi publicada e já está disponível para coleta.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Cadastrar Doação</Text>
      <Text style={[styles.pageDesc, { color: colors.mutedForeground }]}>
        Preencha as informações sobre o alimento que você deseja doar
      </Text>

      <View style={styles.section}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Alimento *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Ex: Arroz branco 5kg"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Categoria *</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat.id);
                }}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather name={cat.icon} size={14} color={isActive ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.catChipText, { color: isActive ? "#fff" : colors.foreground }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Quantidade *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Ex: 5"
            placeholderTextColor={colors.mutedForeground}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Unidade</Text>
          <View style={styles.unitGrid}>
            {UNITS.map((u) => (
              <Pressable
                key={u.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setUnit(u.id);
                }}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor: unit === u.id ? colors.primary : colors.card,
                    borderColor: unit === u.id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.unitText, { color: unit === u.id ? "#fff" : colors.foreground }]}>
                  {u.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Validade *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.mutedForeground}
          value={expiryDate}
          onChangeText={(t) => setExpiryDate(formatExpiryInput(t))}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Local de retirada *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Rua, bairro, cidade"
          placeholderTextColor={colors.mutedForeground}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Descrição (opcional)</Text>
        <TextInput
          style={[
            styles.input,
            styles.textarea,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground },
          ]}
          placeholder="Informações adicionais sobre o alimento..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!isValid || loading}
        style={({ pressed }) => [
          styles.submitBtn,
          {
            backgroundColor: isValid ? colors.primary : colors.muted,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="plus-circle" size={20} color={isValid ? "#fff" : colors.mutedForeground} />
        <Text style={[styles.submitText, { color: isValid ? "#fff" : colors.mutedForeground }]}>
          {loading ? "Cadastrando..." : "Publicar Doação"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 4 },
  pageTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  pageDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  section: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  unitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  unitText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  restricted: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  restrictedTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  restrictedDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  successDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
