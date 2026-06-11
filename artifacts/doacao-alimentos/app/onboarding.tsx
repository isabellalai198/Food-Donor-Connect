import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserProfile, UserRole, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveUser } = useApp();

  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  function selectRole(r: UserRole) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRole(r);
    setStep("form");
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !city.trim() || !role) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    const profile: UserProfile = {
      id: generateId(),
      name: name.trim(),
      role,
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
    };
    await saveUser(profile);
    router.replace("/(tabs)");
  }

  const isFormValid = name.trim() && phone.trim() && city.trim();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Feather name="heart" size={32} color="#fff" />
          </View>
        </View>

        <Text style={[styles.appName, { color: colors.foreground }]}>
          Doa Food
        </Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Conectando doadores e instituições{"\n"}para combater o desperdício alimentar
        </Text>

        {step === "role" && (
          <View style={styles.roleSection}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
              Como você vai usar o app?
            </Text>

            <Pressable
              onPress={() => selectRole("doador")}
              style={({ pressed }) => [
                styles.roleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View style={[styles.roleIconBox, { backgroundColor: colors.secondary }]}>
                <Feather name="gift" size={28} color={colors.primary} />
              </View>
              <View style={styles.roleTextBox}>
                <Text style={[styles.roleTitle, { color: colors.foreground }]}>
                  Sou Doador
                </Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                  Quero cadastrar alimentos disponíveis para doação
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>

            <Pressable
              onPress={() => selectRole("instituicao")}
              style={({ pressed }) => [
                styles.roleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.accent,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View style={[styles.roleIconBox, { backgroundColor: "#FFF3E0" }]}>
                <Feather name="home" size={28} color={colors.accent} />
              </View>
              <View style={styles.roleTextBox}>
                <Text style={[styles.roleTitle, { color: colors.foreground }]}>
                  Sou Instituição
                </Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>
                  Represento uma instituição que coleta e distribui alimentos
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {step === "form" && role && (
          <View style={styles.formSection}>
            <Pressable
              onPress={() => setStep("role")}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={18} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
            </Pressable>

            <View style={[styles.roleChip, { backgroundColor: role === "doador" ? colors.secondary : "#FFF3E0" }]}>
              <Feather
                name={role === "doador" ? "gift" : "home"}
                size={14}
                color={role === "doador" ? colors.primary : colors.accent}
              />
              <Text style={[styles.roleChipText, { color: role === "doador" ? colors.primary : colors.accent }]}>
                {role === "doador" ? "Doador" : "Instituição"}
              </Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
              Seus dados
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                {role === "doador" ? "Seu nome completo" : "Nome da instituição"} *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={role === "doador" ? "Ex: João Silva" : "Ex: Instituto Vida Nova"}
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                Telefone / WhatsApp *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                Cidade *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="Ex: São Paulo - SP"
                placeholderTextColor={colors.mutedForeground}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                Endereço (opcional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="Rua, bairro..."
                placeholderTextColor={colors.mutedForeground}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: isFormValid ? colors.primary : colors.muted,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.submitText, { color: isFormValid ? "#fff" : colors.mutedForeground }]}>
                {loading ? "Entrando..." : "Começar"}
              </Text>
              {!loading && (
                <Feather name="arrow-right" size={18} color={isFormValid ? "#fff" : colors.mutedForeground} />
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    gap: 8,
  },
  logoRow: {
    alignItems: "center",
    marginBottom: 8,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 12,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  roleSection: { gap: 12 },
  sectionLabel: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  roleCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  roleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTextBox: { flex: 1, gap: 3 },
  roleTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  roleDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  formSection: { gap: 14 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  backText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  roleChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
