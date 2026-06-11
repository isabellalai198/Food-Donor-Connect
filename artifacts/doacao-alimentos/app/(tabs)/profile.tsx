import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, donations, clearUser } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const isDoador = user?.role === "doador";

  const stats = {
    total: isDoador
      ? donations.filter((d) => d.donorId === user?.id).length
      : donations.filter((d) => d.claimedBy === user?.id).length,
    coletado: isDoador
      ? donations.filter((d) => d.donorId === user?.id && d.status === "coletado").length
      : donations.filter((d) => d.claimedBy === user?.id && d.status === "coletado").length,
  };

  function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await clearUser();
          router.replace("/onboarding");
        },
      },
    ]);
  }

  const menuItems = [
    {
      icon: "info" as keyof typeof Feather.glyphMap,
      label: "Sobre o DoaAlimento",
      desc: "Nossa missão e como funciona",
      onPress: () => {
        Alert.alert(
          "Sobre o DoaAlimento",
          "O DoaAlimento conecta doadores e instituições para facilitar a doação de alimentos lacrados e combater o desperdício alimentar na comunidade local.",
          [{ text: "OK" }]
        );
      },
    },
    {
      icon: "heart" as keyof typeof Feather.glyphMap,
      label: "Como funciona",
      desc: "Guia de uso do aplicativo",
      onPress: () => {
        Alert.alert(
          "Como funciona",
          isDoador
            ? "1. Cadastre alimentos disponíveis na aba Doar\n2. Aguarde uma instituição reservar\n3. Combine a coleta e confirme no app"
            : "1. Explore as doações disponíveis na aba Início\n2. Toque em uma doação e clique em Reservar\n3. Entre em contato com o doador e confirme a coleta",
          [{ text: "Entendi" }]
        );
      },
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: isDoador ? colors.secondary : "#FFF3E0" }]}>
          <Feather
            name={isDoador ? "user" : "home"}
            size={32}
            color={isDoador ? colors.primary : colors.accent}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isDoador ? colors.secondary : "#FFF3E0" }]}>
            <Text style={[styles.roleText, { color: isDoador ? colors.primary : colors.accent }]}>
              {isDoador ? "Doador" : "Instituição"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        {user?.phone && (
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Feather name="phone" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{user.phone}</Text>
          </View>
        )}
        {user?.city && (
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{user.city}</Text>
          </View>
        )}
        {user?.address && (
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Feather name="home" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{user.address}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            {isDoador ? "Doações" : "Reservas"}
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.muted }]}>
          <Text style={[styles.statNum, { color: colors.mutedForeground }]}>{stats.coletado}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Coletados</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: "#FFF3E0" }]}>
          <Text style={[styles.statNum, { color: colors.accent }]}>
            {isDoador
              ? donations.filter((d) => d.donorId === user?.id && d.status === "reservado").length
              : donations.filter((d) => d.claimedBy === user?.id && d.status === "reservado").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Reservados</Text>
        </View>
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {menuItems.map((item, idx) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.menuItem,
              {
                borderBottomWidth: idx < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.secondary }]}>
              <Feather name={item.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <View style={[styles.impactCard, { backgroundColor: colors.primary }]}>
        <Feather name="trending-up" size={24} color="#fff" />
        <View style={{ flex: 1 }}>
          <Text style={styles.impactTitle}>Impacto na comunidade</Text>
          <Text style={styles.impactDesc}>
            Cada doação conta. Obrigado por ajudar a reduzir o desperdício alimentar!
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          { borderColor: colors.destructive, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 14 },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  infoSection: {
    borderRadius: 14,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  statNum: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  menuSection: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  menuDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  impactCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  impactTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    marginBottom: 3,
  },
  impactDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 17,
  },
  logoutBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
