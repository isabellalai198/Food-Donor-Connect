import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DonationCard } from "@/components/DonationCard";
import { Donation, FoodCategory, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES: { id: FoodCategory | "todos"; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: "todos", label: "Todos", icon: "grid" },
  { id: "cereais", label: "Cereais", icon: "box" },
  { id: "enlatados", label: "Enlatados", icon: "layers" },
  { id: "bebidas", label: "Bebidas", icon: "droplet" },
  { id: "massas", label: "Massas", icon: "package" },
  { id: "laticinios", label: "Laticínios", icon: "coffee" },
  { id: "outros", label: "Outros", icon: "gift" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { donations, user } = useApp();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "todos">("todos");
  const [activeStatus, setActiveStatus] = useState<"disponivel" | "todos">("disponivel");

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.location.toLowerCase().includes(search.toLowerCase()) ||
        d.donorName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "todos" || d.category === activeCategory;
      const matchesStatus =
        activeStatus === "todos" || d.status === activeStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [donations, search, activeCategory, activeStatus]);

  const availableCount = donations.filter((d) => d.status === "disponivel").length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleCategoryPress(id: FoodCategory | "todos") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(id);
  }

  function renderHeader() {
    return (
      <View>
        <View style={[styles.pageHeader, { paddingTop: topPad + 16 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              Olá, {user?.name?.split(" ")[0] ?? "bem-vindo"}
            </Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Doações disponíveis
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>
              {availableCount}
            </Text>
            <Text style={[styles.countLabel, { color: colors.primary }]}>itens</Text>
          </View>
        </View>

        <View style={[styles.searchRow, { marginHorizontal: 16, marginBottom: 12 }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar por alimento, local..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 14 }}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.id;
            return (
              <Pressable
                onPress={() => handleCategoryPress(item.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={13}
                  color={isActive ? "#fff" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isActive ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.statusRow}>
          {(["disponivel", "todos"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveStatus(s);
              }}
              style={[
                styles.statusTab,
                {
                  borderBottomWidth: activeStatus === s ? 2 : 0,
                  borderBottomColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusTabText,
                  {
                    color: activeStatus === s ? colors.primary : colors.mutedForeground,
                    fontFamily: activeStatus === s ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {s === "disponivel" ? "Disponíveis" : "Todos"}
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
        <Feather name="inbox" size={40} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          Nenhuma doação encontrada
        </Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
          Tente ajustar os filtros ou a busca
        </Text>
      </View>
    );
  }

  return (
    <FlatList<Donation>
      style={{ backgroundColor: colors.background }}
      data={filtered}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 90) },
      ]}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <DonationCard donation={item} />
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  countBadge: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  countText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  countLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DDE8DC",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statusRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDE8DC",
  },
  statusTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statusTabText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
