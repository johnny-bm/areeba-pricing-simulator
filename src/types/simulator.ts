export interface Simulator {
  id: string;
  name: string;
  title: string;
  description: string;
  ctaText: string;
  iconName: string;
  urlSlug: string;
  is_active: boolean;
  isAvailable: boolean;
  comingSoon: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateSimulatorData {
  name: string;
  title: string;
  description: string;
  ctaText?: string;
  iconName?: string;
  urlSlug?: string; // Optional, will be generated if not provided
  is_active?: boolean;
  isAvailable?: boolean;
  comingSoon?: boolean;
  sort_order?: number;
}

export interface UpdateSimulatorData {
  name?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  iconName?: string;
  urlSlug?: string;
  is_active?: boolean;
  isAvailable?: boolean;
  comingSoon?: boolean;
  sort_order?: number;
}

// Available Lucide icons for simulators
export const SIMULATOR_ICONS = [
  'CreditCard',
  'Calculator',
  'Zap',
  'Building',
  'Shield',
  'Globe',
  'Smartphone',
  'Laptop',
  'Database',
  'Lock',
  'Key',
  'Wallet',
  'TrendingUp',
  'BarChart3',
  'PieChart',
  'LineChart',
  'Activity',
  'Target',
  'Rocket',
  'Star',
  'Heart',
  'DollarSign',
  'Euro',
  'Bitcoin',
  'Banknote',
  'Coins',
  'Receipt',
  'FileText',
  'Settings',
  'Cog',
  'Wrench',
  'Package',
  'Truck',
  'Plane',
  'Ship',
  'Car',
  'Bike',
  'Bus',
  'Train'
] as const;

export type SimulatorIcon = typeof SIMULATOR_ICONS[number];
