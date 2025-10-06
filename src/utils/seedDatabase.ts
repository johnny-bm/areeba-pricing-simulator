/**
 * Database Seeding Utility
 * Seeds the database with initial categories and services for development
 */

import { api } from './api';

// Sample categories
const sampleCategories = [
  {
    id: 'card-issuing',
    name: 'Card Issuing',
    description: 'Services related to card issuance and management',
    color: '#3B82F6',
    order_index: 1,
    is_active: true
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    description: 'Payment processing and transaction services',
    color: '#10B981',
    order_index: 2,
    is_active: true
  },
  {
    id: 'compliance',
    name: 'Compliance & Security',
    description: 'Compliance, security, and regulatory services',
    color: '#F59E0B',
    order_index: 3,
    is_active: true
  },
  {
    id: 'support',
    name: 'Support & Maintenance',
    description: 'Customer support and system maintenance',
    color: '#8B5CF6',
    order_index: 4,
    is_active: true
  }
];

// Sample services
const sampleServices = [
  {
    id: 'debit-card-issuance',
    name: 'Debit Card Issuance',
    description: 'Issue and manage debit cards for your customers',
    category: 'card-issuing',
    unit: 'per card',
    default_price: 2.50,
    pricing_type: 'simple',
    tiered_pricing: {
      type: 'simple',
      tiers: []
    },
    is_active: true,
    tags: ['cards', 'issuance', 'debit']
  },
  {
    id: 'credit-card-issuance',
    name: 'Credit Card Issuance',
    description: 'Issue and manage credit cards for your customers',
    category: 'card-issuing',
    unit: 'per card',
    default_price: 3.00,
    pricing_type: 'simple',
    tiered_pricing: {
      type: 'simple',
      tiers: []
    },
    is_active: true,
    tags: ['cards', 'issuance', 'credit']
  },
  {
    id: 'transaction-processing',
    name: 'Transaction Processing',
    description: 'Process payment transactions',
    category: 'payment-processing',
    unit: 'per transaction',
    default_price: 0.15,
    pricing_type: 'tiered',
    tiered_pricing: {
      type: 'tiered',
      tiers: [
        { min: 0, max: 1000, price: 0.20 },
        { min: 1001, max: 10000, price: 0.15 },
        { min: 10001, max: null, price: 0.10 }
      ]
    },
    is_active: true,
    tags: ['processing', 'transactions', 'payments']
  },
  {
    id: 'monthly-maintenance',
    name: 'Monthly System Maintenance',
    description: 'Monthly maintenance and support for your systems',
    category: 'support',
    unit: 'per month',
    default_price: 500.00,
    pricing_type: 'simple',
    tiered_pricing: {
      type: 'simple',
      tiers: []
    },
    is_active: true,
    tags: ['maintenance', 'support', 'monthly']
  },
  {
    id: 'compliance-audit',
    name: 'Compliance Audit',
    description: 'Annual compliance audit and reporting',
    category: 'compliance',
    unit: 'per audit',
    default_price: 2500.00,
    pricing_type: 'simple',
    tiered_pricing: {
      type: 'simple',
      tiers: []
    },
    is_active: true,
    tags: ['compliance', 'audit', 'reporting']
  }
];

export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // First, save categories
    console.log('📁 Seeding categories...');
    await api.saveCategories(sampleCategories);
    console.log(`✅ Seeded ${sampleCategories.length} categories`);
    
    // Then, save services
    console.log('📦 Seeding services...');
    await api.savePricingItems(sampleServices);
    console.log(`✅ Seeded ${sampleServices.length} services`);
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Auto-seed function that can be called from the browser console
export function autoSeedDatabase(): void {
  console.log('🌱 Auto-seeding database...');
  seedDatabase()
    .then(() => {
      console.log('✅ Database auto-seeding completed!');
      // Reload the page to see the new data
      window.location.reload();
    })
    .catch((error) => {
      console.error('❌ Auto-seeding failed:', error);
    });
}

// Make it available globally for easy access
if (typeof window !== 'undefined') {
  (window as any).seedDatabase = autoSeedDatabase;
}
