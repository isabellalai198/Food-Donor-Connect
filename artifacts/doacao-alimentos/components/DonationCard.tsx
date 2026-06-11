import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Donation } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_LABELS: Record<string, string> = {
  cereais: "Cereais",
  enlatados: "Enlatados",
  bebidas: "Bebidas",
  massas: "Massas",
  laticinios: "Laticínios",
  outros: "Outros",
};

const CATEGORY_ICONS: Record<string, string> = {
  cereais: "box",
  enlatados: "layers",
  bebidas: "droplet",
  massas: "package",
  laticinios: "coffee",
  outros: "gift",
};

const STATUS_CONFIG = {
  disponivel: { label: "Disponível", color: "#2D7A4F" },
  reservado: { label: "Reservado", color: "#F4A942" },
  coletado: { label: "Coletado", color: "#7A9080" },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "agora há pouco";
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

interface DonationCardProps {
  donation: Donation;
  compact?: boolean;
}

export function DonationCard({ donation, compact = false }: DonationCardProps) {
  const colors = useColors();

  const status = STATUS_CONFIG[donation.status];
  const categoryIcon = (CATEGORY_ICONS[donation.category] ?? "gift") as keyof typeof Feather.glyphMap;

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/donation/${donation.id}`);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
          <Feather name={categoryIcon} size={20} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {donation.title}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {donation.quantity} {donation.unit} · {CATEGORY_LABELS[donation.category] ?? "Outros"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.color + "20" },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: status.color }]}
          />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {!compact && (
        <>
          <Text
            style={[styles.description, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {donation.description}
          </Text>
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text
                style={[styles.footerText, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {donation.location}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text
                style={[styles.footerText, { color: colors.mutedForeground }]}
              >
                Val: {formatDate(donation.expiryDate)}
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Feather name="user" size={12} color={colors.mutedForeground} />
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                {donation.donorName}
              </Text>
            </View>
            <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>
              {timeAgo(donation.createdAt)}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  timeAgo: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
