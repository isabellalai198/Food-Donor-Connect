import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DonationCard } from "@/components/DonationCard";
import { Donation, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type TabId = "ativos" | "historico";

export default function MyItemsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, donations, deleteDonation, cancelClaim, markCollected } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>("ativos");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const myDonations = useMemo(
    () => donations.filter((d) => d.donorId === user?.id),
    [donations, user]
  );

  const myClaims = useMemo(
    () => donations.filter((d) => d.claimedBy === user?.id),
    [donations, user]
  );

  const isDoador = user?.role === "doador";

  const activeDonations = useMemo(
    () =>
      isDoador
        ? myDonations.filter((d) => d.status !== "coletado")
        : myClaims.filter((d) => d.status !== "coletado"),
    [myDonations, myClaims, isDoador]
  );

  const history = useMemo(
    () =>
      isDoador
        ? myDonations.filter((d) => d.status === "coletado")
        : myClaims.filter((d) => d.status === "coletado"),
    [myDonations, myClaims, isDoador]
  );

  const displayList = activeTab === "ativos" ? activeDonations : history;

  function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Excluir doação",
      "Tem certeza que deseja excluir esta doação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteDonation(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function handleMarkCollected(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Marcar como coletado",
      "Confirmar que este item foi coletado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            await markCollected(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function handleCancelClaim(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Cancelar reserva", "Tem certeza?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar reserva",
        style: "destructive",
        onPress: async () => {
          await cancelClaim(id);
        },
      },
    ]);
  }

  function renderActions(item: Donation) {
    if (isDoador) {
      return (
        <View style={styles.actionRow}>
          {item.status === "reservado" && (
            <Pressable
              onPress={() => handleMarkCollected(item.id)}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="check" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Confirmar coleta</Text>
            </Pressable>
          )}
          {item.status === "reservado" && item.claimedByPhone && (
            <Pressable
              onPress={() => {}}
              style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="phone" size={14} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                {item.claimedByName}
              </Text>
            </Pressable>
          )}
          {item.status === "disponivel" && (
            <Pressable
              onPress={() => handleDelete(item.id)}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: "#FEE2E2", opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name="trash-2" size={14} color={colors.destructive} />
              <Text style={[styles.actionBtnText, { color: colors.destructive }]}>
                Remover
              </Text>
            </Pressable>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.actionRow}>
          {item.status === "reservado" && (
            <>
              <Pressable
                onPress={() => handleMarkCollected(item.id)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Feather name="check" size={14} color="#fff" />
                <Text style={styles.actionBtnText}>Coletado</Text>
              </Pressable>
              <Pressable
                onPress={() => handleCancelClaim(item.id)}
                style={[styles.actionBtn, { backgroundColor: "#FEE2E2" }]}
              >
                <Feather name="x" size={14} color={colors.destructive} />
                <Text style={[styles.actionBtnText, { color: colors.destructive }]}>
                  Cancelar
                </Text>
              </Pressable>
            </>
          )}
        </View>
      );
    }
  }

  function renderHeader() {
    return (
      <View>
        <View style={[styles.pageHeader, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            {isDoador ? "Minhas Doações" : "Minhas Reservas"}
          </Text>
          {isDoador && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/donate");
              }}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus" size={20} color="#fff" />
            </Pressable>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statNum, { color: colors.primary }]}>
              {isDoador ? myDonations.filter((d) => d.status === "disponivel").length : myClaims.filter((d) => d.status === "reservado").length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {isDoador ? "Disponíveis" : "Reservados"}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.statNum, { color: colors.accent }]}>
              {isDoador ? myDonations.filter((d) => d.status === "reservado").length : 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {isDoador ? "Reservados" : ""}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.muted }]}>
            <Text style={[styles.statNum, { color: colors.mutedForeground }]}>
              {isDoador ? myDonations.filter((d) => d.status === "coletado").length : myClaims.filter((d) => d.status === "coletado").length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Coletados</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {(["ativos", "historico"] as TabId[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
              style={[
                styles.tab,
                {
                  borderBottomWidth: activeTab === tab ? 2 : 0,
                  borderBottomColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? colors.primary : colors.mutedForeground,
                    fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {tab === "ativos" ? "Ativos" : "Histórico"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <Feather
          name={activeTab === "ativos" ? "inbox" : "clock"}
          size={36}
          color={colors.mutedForeground}
        />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          {activeTab === "ativos" ? "Nenhum item ativo" : "Sem histórico"}
        </Text>
        {isDoador && activeTab === "ativos" && (
          <Pressable
            onPress={() => router.push("/(tabs)/donate")}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.emptyBtnText}>Cadastrar doação</Text>
          </Pressable>
        )}
        {!isDoador && activeTab === "ativos" && (
          <Pressable
            onPress={() => router.push("/(tabs)")}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.emptyBtnText}>Ver doações disponíveis</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <FlatList<Donation>
      style={{ backgroundColor: colors.background }}
      data={displayList}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={{
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 90),
        flexGrow: 1,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <DonationCard donation={item} />
          {renderActions(item)}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDE8DC",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabText: { fontSize: 14 },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },
});
