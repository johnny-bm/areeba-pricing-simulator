export interface Simulator {
  id: string;
  name: string;
  title: string;
  description: string;
  ctaText: string;
  iconName: string;
  urlSlug: string;
  isActive: boolean;
  isAvailable: boolean;
  comingSoon: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  isActive?: boolean;
  isAvailable?: boolean;
  comingSoon?: boolean;
  sortOrder?: number;
}

export interface UpdateSimulatorData {
  name?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  iconName?: string;
  urlSlug?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  comingSoon?: boolean;
  sortOrder?: number;
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
