import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
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

const CATEGORY_LABELS: Record<string, string> = {
  cereais: "Cereais e Grãos",
  enlatados: "Enlatados",
  bebidas: "Bebidas",
  massas: "Massas",
  laticinios: "Laticínios",
  outros: "Outros",
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function DonationDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { donations, user, claimDonation, cancelClaim } = useApp();

  const donation = donations.find((d) => d.id === id);

  if (!donation) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>
          Doação não encontrada
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const isOwner = donation.donorId === user?.id;
  const isClaimedByMe = donation.claimedBy === user?.id;
  const canClaim =
    !isOwner &&
    donation.status === "disponivel" &&
    user?.role === "instituicao";

  function handleClaim() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Reservar doação",
      `Deseja reservar "${donation!.title}"? Você receberá os dados de contato do doador.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reservar",
          onPress: async () => {
            await claimDonation(donation!.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function handleCancelClaim() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Cancelar reserva", "Tem certeza?", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar reserva",
        style: "destructive",
        onPress: async () => {
          await cancelClaim(donation!.id);
        },
      },
    ]);
  }

  function openPhone(phone: string) {
    const cleaned = phone.replace(/\D/g, "");
    Linking.openURL(`tel:${cleaned}`);
  }

  function openWhatsApp(phone: string, name: string) {
    const cleaned = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá ${name}, vi sua doação "${donation!.title}" no app Doa Food e gostaria de buscar.`
    );
    Linking.openURL(`https://wa.me/55${cleaned}?text=${msg}`);
  }

  const statusConfig = {
    disponivel: { label: "Disponível", color: "#2D7A4F", bg: "#E8F5EE" },
    reservado: { label: "Reservado", color: "#F4A942", bg: "#FFF3E0" },
    coletado: { label: "Coletado", color: "#7A9080", bg: "#F0F4EE" },
  }[donation.status];

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 20);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroTop}>
          <View style={[styles.heroIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="gift" size={36} color={colors.primary} />
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{donation.title}</Text>
        <Text style={[styles.category, { color: colors.mutedForeground }]}>
          {CATEGORY_LABELS[donation.category] ?? "Outros"}
        </Text>
      </View>

      <View style={styles.detailGrid}>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="layers" size={18} color={colors.primary} />
          <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Quantidade</Text>
          <Text style={[styles.detailValue, { color: colors.foreground }]}>
            {donation.quantity} {donation.unit}
          </Text>
        </View>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Validade</Text>
          <Text style={[styles.detailValue, { color: colors.foreground }]}>
            {formatDate(donation.expiryDate)}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionRow}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Local de retirada</Text>
        </View>
        <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>{donation.location}</Text>
      </View>

      {!!donation.description && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionRow}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Descrição</Text>
          </View>
          <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>
            {donation.description}
          </Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionRow}>
          <Feather name="user" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Doador</Text>
        </View>
        <Text style={[styles.sectionBody, { color: colors.foreground }]}>{donation.donorName}</Text>
        {(isClaimedByMe || isOwner) && (
          <View style={styles.contactRow}>
            <Pressable
              onPress={() => openPhone(donation.donorPhone)}
              style={[styles.contactBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="phone" size={15} color={colors.primary} />
              <Text style={[styles.contactBtnText, { color: colors.primary }]}>Ligar</Text>
            </Pressable>
            <Pressable
              onPress={() => openWhatsApp(donation.donorPhone, donation.donorName)}
              style={[styles.contactBtn, { backgroundColor: "#E8F5E9" }]}
            >
              <Feather name="message-circle" size={15} color="#2E7D32" />
              <Text style={[styles.contactBtnText, { color: "#2E7D32" }]}>WhatsApp</Text>
            </Pressable>
          </View>
        )}
        {!isClaimedByMe && !isOwner && donation.status === "disponivel" && (
          <Text style={[styles.contactHint, { color: colors.mutedForeground }]}>
            Reserve para ver o contato do doador
          </Text>
        )}
      </View>

      {donation.status === "reservado" && donation.claimedByName && isOwner && (
        <View style={[styles.section, { backgroundColor: "#FFF3E0", borderColor: "#F4A942" }]}>
          <View style={styles.sectionRow}>
            <Feather name="home" size={16} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reservado por</Text>
          </View>
          <Text style={[styles.sectionBody, { color: colors.foreground }]}>
            {donation.claimedByName}
          </Text>
          {donation.claimedByPhone && (
            <View style={styles.contactRow}>
              <Pressable
                onPress={() => openPhone(donation.claimedByPhone!)}
                style={[styles.contactBtn, { backgroundColor: colors.secondary }]}
              >
                <Feather name="phone" size={15} color={colors.primary} />
                <Text style={[styles.contactBtnText, { color: colors.primary }]}>Ligar</Text>
              </Pressable>
              <Pressable
                onPress={() => openWhatsApp(donation.claimedByPhone!, donation.claimedByName!)}
                style={[styles.contactBtn, { backgroundColor: "#E8F5E9" }]}
              >
                <Feather name="message-circle" size={15} color="#2E7D32" />
                <Text style={[styles.contactBtnText, { color: "#2E7D32" }]}>WhatsApp</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {canClaim && (
        <Pressable
          onPress={handleClaim}
          style={({ pressed }) => [
            styles.claimBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="check-circle" size={20} color="#fff" />
          <Text style={styles.claimBtnText}>Reservar esta doação</Text>
        </Pressable>
      )}

      {isClaimedByMe && donation.status === "reservado" && (
        <Pressable
          onPress={handleCancelClaim}
          style={({ pressed }) => [
            styles.cancelBtn,
            { borderColor: colors.destructive, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.cancelBtnText, { color: colors.destructive }]}>
            Cancelar reserva
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 12 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  backLink: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  category: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  detailGrid: {
    flexDirection: "row",
    gap: 10,
  },
  detailCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 5,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  contactBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  contactHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  claimBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  claimBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  cancelBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: -4,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
