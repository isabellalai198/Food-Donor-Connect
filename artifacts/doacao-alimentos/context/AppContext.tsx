import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "doador" | "instituicao";
export type DonationStatus = "disponivel" | "reservado" | "coletado";
export type FoodCategory =
  | "cereais"
  | "enlatados"
  | "bebidas"
  | "massas"
  | "laticinios"
  | "outros";
export type FoodUnit = "kg" | "unidades" | "litros" | "caixas" | "pacotes";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  city: string;
  address: string;
}

export interface Donation {
  id: string;
  title: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  expiryDate: string;
  description: string;
  location: string;
  status: DonationStatus;
  donorId: string;
  donorName: string;
  donorPhone: string;
  claimedBy?: string;
  claimedByName?: string;
  claimedByPhone?: string;
  createdAt: string;
}

interface AppContextValue {
  user: UserProfile | null;
  donations: Donation[];
  isLoaded: boolean;
  saveUser: (profile: UserProfile) => Promise<void>;
  clearUser: () => Promise<void>;
  addDonation: (donation: Omit<Donation, "id" | "createdAt" | "donorId" | "donorName" | "donorPhone" | "status">) => Promise<void>;
  claimDonation: (donationId: string) => Promise<void>;
  markCollected: (donationId: string) => Promise<void>;
  cancelClaim: (donationId: string) => Promise<void>;
  deleteDonation: (donationId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  user: "@doacao:user",
  donations: "@doacao:donations",
};

const SEED_DONATIONS: Donation[] = [
  {
    id: "seed-1",
    title: "Arroz branco 5kg",
    category: "cereais",
    quantity: 3,
    unit: "pacotes",
    expiryDate: "2025-08-01",
    description: "Arroz tipo 1, embalagem original fechada",
    location: "Centro, São Paulo - SP",
    status: "disponivel",
    donorId: "seed-donor",
    donorName: "Maria Silva",
    donorPhone: "(11) 98765-4321",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "seed-2",
    title: "Feijão carioca",
    category: "cereais",
    quantity: 2,
    unit: "kg",
    expiryDate: "2025-09-15",
    description: "Feijão carioca embalado, excelente qualidade",
    location: "Vila Mariana, São Paulo - SP",
    status: "disponivel",
    donorId: "seed-donor",
    donorName: "João Pereira",
    donorPhone: "(11) 91234-5678",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "seed-3",
    title: "Leite integral caixinha",
    category: "laticinios",
    quantity: 12,
    unit: "unidades",
    expiryDate: "2025-07-20",
    description: "Caixas de 1L fechadas",
    location: "Pinheiros, São Paulo - SP",
    status: "disponivel",
    donorId: "seed-donor",
    donorName: "Ana Costa",
    donorPhone: "(11) 94444-3333",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "seed-4",
    title: "Macarrão espaguete",
    category: "massas",
    quantity: 5,
    unit: "pacotes",
    expiryDate: "2025-12-01",
    description: "Pacotes de 500g, lacrados",
    location: "Tatuapé, São Paulo - SP",
    status: "disponivel",
    donorId: "seed-donor",
    donorName: "Carlos Souza",
    donorPhone: "(11) 97777-8888",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "seed-5",
    title: "Óleo de soja 900ml",
    category: "outros",
    quantity: 4,
    unit: "unidades",
    expiryDate: "2025-10-30",
    description: "Garrafas lacradas 900ml",
    location: "Mooca, São Paulo - SP",
    status: "disponivel",
    donorId: "seed-donor",
    donorName: "Luciana Oliveira",
    donorPhone: "(11) 96666-5555",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [userStr, donationsStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.donations),
        ]);
        if (userStr) setUser(JSON.parse(userStr));
        if (donationsStr) {
          setDonations(JSON.parse(donationsStr));
        } else {
          setDonations(SEED_DONATIONS);
          await AsyncStorage.setItem(STORAGE_KEYS.donations, JSON.stringify(SEED_DONATIONS));
        }
      } catch {}
      setIsLoaded(true);
    }
    load();
  }, []);

  const saveUser = useCallback(async (profile: UserProfile) => {
    setUser(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
  }, []);

  const clearUser = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.user);
  }, []);

  const saveDonations = useCallback(async (updated: Donation[]) => {
    setDonations(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.donations, JSON.stringify(updated));
  }, []);

  const addDonation = useCallback(
    async (
      data: Omit<Donation, "id" | "createdAt" | "donorId" | "donorName" | "donorPhone" | "status">
    ) => {
      if (!user) return;
      const newDonation: Donation = {
        ...data,
        id: generateId(),
        status: "disponivel",
        donorId: user.id,
        donorName: user.name,
        donorPhone: user.phone,
        createdAt: new Date().toISOString(),
      };
      const updated = [newDonation, ...donations];
      await saveDonations(updated);
    },
    [user, donations, saveDonations]
  );

  const claimDonation = useCallback(
    async (donationId: string) => {
      if (!user) return;
      const updated = donations.map((d) =>
        d.id === donationId
          ? {
              ...d,
              status: "reservado" as DonationStatus,
              claimedBy: user.id,
              claimedByName: user.name,
              claimedByPhone: user.phone,
            }
          : d
      );
      await saveDonations(updated);
    },
    [user, donations, saveDonations]
  );

  const markCollected = useCallback(
    async (donationId: string) => {
      const updated = donations.map((d) =>
        d.id === donationId ? { ...d, status: "coletado" as DonationStatus } : d
      );
      await saveDonations(updated);
    },
    [donations, saveDonations]
  );

  const cancelClaim = useCallback(
    async (donationId: string) => {
      const updated = donations.map((d) =>
        d.id === donationId
          ? {
              ...d,
              status: "disponivel" as DonationStatus,
              claimedBy: undefined,
              claimedByName: undefined,
              claimedByPhone: undefined,
            }
          : d
      );
      await saveDonations(updated);
    },
    [donations, saveDonations]
  );

  const deleteDonation = useCallback(
    async (donationId: string) => {
      const updated = donations.filter((d) => d.id !== donationId);
      await saveDonations(updated);
    },
    [donations, saveDonations]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        donations,
        isLoaded,
        saveUser,
        clearUser,
        addDonation,
        claimDonation,
        markCollected,
        cancelClaim,
        deleteDonation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
