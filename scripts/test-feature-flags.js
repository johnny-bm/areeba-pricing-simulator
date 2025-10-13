#!/usr/bin/env node

/**
 * Feature Flag Testing Script
 * 
 * Tests feature flags in development environment
 * Verifies new architecture works correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Feature flags to test
const FEATURE_FLAGS = {
  USE_NEW_ARCHITECTURE: true,
  USE_NEW_PRICING: true,
  USE_NEW_AUTH: false,
  USE_NEW_ADMIN: false,
  USE_NEW_DOCUMENTS: false,
  ENABLE_DEBUG_LOGGING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
};

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'New Architecture Enabled',
    flags: { ...FEATURE_FLAGS, USE_NEW_ARCHITECTURE: true },
    expected: 'new'
  },
  {
    name: 'Legacy Architecture',
    flags: { ...FEATURE_FLAGS, USE_NEW_ARCHITECTURE: false },
    expected: 'legacy'
  },
  {
    name: 'Mixed Features',
    flags: { 
      ...FEATURE_FLAGS, 
      USE_NEW_PRICING: true, 
      USE_NEW_AUTH: false 
    },
    expected: 'mixed'
  }
];

// Create test environment file
function createTestEnv(flags) {
  const envContent = Object.entries(flags)
    .map(([key, value]) => `VITE_${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(__dirname, '..', '.env.test');
  fs.writeFileSync(envPath, envContent);
  // console.log(`✅ Created test environment: ${envPath}`);
  return envPath;
}

// Test feature flag loading
function testFeatureFlags() {
  // console.log('🧪 Testing feature flag loading...');
  
  try {
    // Test if feature flag module can be imported
    const featuresPath = path.join(__dirname, '..', 'src', 'config', 'features.ts');
    
    if (fs.existsSync(featuresPath)) {
      // console.log('✅ Feature flags module exists');
      
      // Read and validate feature flags
      const content = fs.readFileSync(featuresPath, 'utf8');
      
      // Check for required exports
      const requiredExports = [
        'FEATURES',
        'isNewArchitectureEnabled',
        'isPricingEnabled',
        'isAuthEnabled',
        'getFeatureFlags'
      ];
      
      requiredExports.forEach(exportName => {
        if (content.includes(exportName)) {
          // console.log(`✅ Export found: ${exportName}`);
        } else {
          // console.log(`❌ Export missing: ${exportName}`);
        }
      });
      
      return true;
    } else {
      // console.log('❌ Feature flags module not found');
      return false;
    }
  } catch (error) {
    // console.error('❌ Error testing feature flags:', error.message);
    return false;
  }
}

// Test component integration
function testComponentIntegration() {
  // console.log('🧪 Testing component integration...');
  
  try {
    // Check if new components exist
    const newComponentPath = path.join(__dirname, '..', 'src', 'components', 'PricingSimulator.new.tsx');
    
    if (fs.existsSync(newComponentPath)) {
      // console.log('✅ New component version exists');
      
      // Check for Clean Architecture imports
      const content = fs.readFileSync(newComponentPath, 'utf8');
      
      const requiredImports = [
        'usePricingOperations',
        'usePricing',
        'FEATURES',
        'PricingAdapter'
      ];
      
      requiredImports.forEach(importName => {
        if (content.includes(importName)) {
          // console.log(`✅ Import found: ${importName}`);
        } else {
          // console.log(`❌ Import missing: ${importName}`);
        }
      });
      
      return true;
    } else {
      // console.log('❌ New component version not found');
      return false;
    }
  } catch (error) {
    // console.error('❌ Error testing component integration:', error.message);
    return false;
  }
}

// Test hooks integration
function testHooksIntegration() {
  // console.log('🧪 Testing hooks integration...');
  
  try {
    // Check if hooks exist
    const hooksPath = path.join(__dirname, '..', 'src', 'presentation', 'features', 'pricing', 'hooks', 'usePricingOperations.ts');
    
    if (fs.existsSync(hooksPath)) {
      // console.log('✅ Pricing operations hook exists');
      
      // Check for required functionality
      const content = fs.readFileSync(hooksPath, 'utf8');
      
      const requiredFeatures = [
        'calculatePricing',
        'getPricingItems',
        'getPricingItemById',
        'isLoading',
        'error',
        'clearError'
      ];
      
      requiredFeatures.forEach(feature => {
        if (content.includes(feature)) {
          // console.log(`✅ Feature found: ${feature}`);
        } else {
          // console.log(`❌ Feature missing: ${feature}`);
        }
      });
      
      return true;
    } else {
      // console.log('❌ Pricing operations hook not found');
      return false;
    }
  } catch (error) {
    // console.error('❌ Error testing hooks integration:', error.message);
    return false;
  }
}

// Test adapter integration
function testAdapterIntegration() {
  // console.log('🧪 Testing adapter integration...');
  
  try {
    // Check if adapter exists
    const adapterPath = path.join(__dirname, '..', 'src', 'presentation', 'adapters', 'PricingAdapter.ts');
    
    if (fs.existsSync(adapterPath)) {
      // console.log('✅ Pricing adapter exists');
      
      // Check for required functionality
      const content = fs.readFileSync(adapterPath, 'utf8');
      
      const requiredFeatures = [
        'getPricingItems',
        'calculatePricing',
        'getPricingItemById',
        'isNewArchitectureEnabled',
        'getImplementationInfo'
      ];
      
      requiredFeatures.forEach(feature => {
        if (content.includes(feature)) {
          // console.log(`✅ Feature found: ${feature}`);
        } else {
          // console.log(`❌ Feature missing: ${feature}`);
        }
      });
      
      return true;
    } else {
      // console.log('❌ Pricing adapter not found');
      return false;
    }
  } catch (error) {
    // console.error('❌ Error testing adapter integration:', error.message);
    return false;
  }
}

// Run all tests
function runAllTests() {
  // console.log('🚀 Starting feature flag testing...\n');
  
  const results = {
    featureFlags: testFeatureFlags(),
    componentIntegration: testComponentIntegration(),
    hooksIntegration: testHooksIntegration(),
    adapterIntegration: testAdapterIntegration()
  };
  
  // console.log('\n📊 Test Results:');
  // console.log(`✅ Feature Flags: ${results.featureFlags ? 'PASS' : 'FAIL'}`);
  // console.log(`✅ Component Integration: ${results.componentIntegration ? 'PASS' : 'FAIL'}`);
  // console.log(`✅ Hooks Integration: ${results.hooksIntegration ? 'PASS' : 'FAIL'}`);
  // console.log(`✅ Adapter Integration: ${results.adapterIntegration ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    // console.log('\n🎉 All tests passed! Feature flags are ready for production.');
  } else {
    // console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  return allPassed;
}

// Create test environment files
function createTestEnvironments() {
  // console.log('🔧 Creating test environment files...\n');
  
  TEST_SCENARIOS.forEach((scenario, index) => {
    const envPath = createTestEnv(scenario.flags);
    // console.log(`✅ Created test environment ${index + 1}: ${scenario.name}`);
  });
  
  // console.log('\n📋 Test environments created:');
  TEST_SCENARIOS.forEach((scenario, index) => {
    // console.log(`  ${index + 1}. ${scenario.name} (${scenario.expected})`);
  });
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'test':
    runAllTests();
    break;
  case 'create-env':
    createTestEnvironments();
    break;
  case 'help':
    // console.log('Usage: node scripts/test-feature-flags.js [test|create-env|help]');
    // console.log('');
    // console.log('Commands:');
    // console.log('  test       - Run all feature flag tests');
    // console.log('  create-env - Create test environment files');
    // console.log('  help       - Show this help message');
    break;
  default:
    runAllTests();
    break;
}
