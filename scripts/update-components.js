#!/usr/bin/env node

/**
 * Component Update Script
 * 
 * Updates React components to use new Clean Architecture
 * Provides safe migration with backup and rollback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Components to update
const COMPONENTS_TO_UPDATE = [
  'src/components/PricingSimulator.tsx',
  'src/components/ScenarioBuilder.tsx',
  'src/features/pricing/components/PricingItemCard.tsx',
  'src/features/pricing/components/FeeSummary.tsx',
  'src/features/pricing/components/ItemLibrary.tsx',
];

// Backup directory
const BACKUP_DIR = 'backups/components';

// Create backup directory
function createBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✅ Created backup directory:', BACKUP_DIR);
  }
}

// Backup original file
function backupFile(filePath) {
  const fileName = path.basename(filePath);
  const backupPath = path.join(BACKUP_DIR, `${fileName}.backup`);
  
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Backed up: ${filePath} -> ${backupPath}`);
    return backupPath;
  }
  
  return null;
}

// Update component to use new architecture
function updateComponent(filePath) {
  const fileName = path.basename(filePath);
  const newFilePath = filePath.replace('.tsx', '.new.tsx');
  
  console.log(`🔄 Updating component: ${fileName}`);
  
  // Check if new version exists
  if (fs.existsSync(newFilePath)) {
    // Replace original with new version
    fs.copyFileSync(newFilePath, filePath);
    console.log(`✅ Updated: ${fileName}`);
    
    // Remove new file
    fs.unlinkSync(newFilePath);
    console.log(`✅ Cleaned up: ${newFilePath}`);
    
    return true;
  } else {
    console.log(`⚠️  No new version found for: ${fileName}`);
    return false;
  }
}

// Rollback component
function rollbackComponent(filePath) {
  const fileName = path.basename(filePath);
  const backupPath = path.join(BACKUP_DIR, `${fileName}.backup`);
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    console.log(`✅ Rolled back: ${fileName}`);
    return true;
  } else {
    console.log(`⚠️  No backup found for: ${fileName}`);
    return false;
  }
}

// Main update function
function updateComponents() {
  console.log('🚀 Starting component update process...');
  
  // Create backup directory
  createBackupDir();
  
  const results = {
    updated: [],
    failed: [],
    skipped: []
  };
  
  // Process each component
  COMPONENTS_TO_UPDATE.forEach(filePath => {
    try {
      // Backup original
      const backupPath = backupFile(filePath);
      
      if (backupPath) {
        // Update component
        const success = updateComponent(filePath);
        
        if (success) {
          results.updated.push(filePath);
        } else {
          results.skipped.push(filePath);
        }
      } else {
        results.skipped.push(filePath);
      }
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
      results.failed.push(filePath);
    }
  });
  
  // Print results
  console.log('\n📊 Update Results:');
  console.log(`✅ Updated: ${results.updated.length}`);
  console.log(`⚠️  Skipped: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.updated.length > 0) {
    console.log('\n✅ Successfully updated components:');
    results.updated.forEach(file => console.log(`  - ${file}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed to update components:');
    results.failed.forEach(file => console.log(`  - ${file}`));
  }
  
  if (results.skipped.length > 0) {
    console.log('\n⚠️  Skipped components:');
    results.skipped.forEach(file => console.log(`  - ${file}`));
  }
  
  return results;
}

// Rollback function
function rollbackComponents() {
  console.log('🔄 Starting component rollback process...');
  
  const results = {
    rolledBack: [],
    failed: []
  };
  
  // Process each component
  COMPONENTS_TO_UPDATE.forEach(filePath => {
    try {
      const success = rollbackComponent(filePath);
      
      if (success) {
        results.rolledBack.push(filePath);
      } else {
        results.failed.push(filePath);
      }
    } catch (error) {
      console.error(`❌ Error rolling back ${filePath}:`, error.message);
      results.failed.push(filePath);
    }
  });
  
  // Print results
  console.log('\n📊 Rollback Results:');
  console.log(`✅ Rolled back: ${results.rolledBack.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  return results;
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'update':
    updateComponents();
    break;
  case 'rollback':
    rollbackComponents();
    break;
  case 'status':
    console.log('📋 Component Update Status:');
    COMPONENTS_TO_UPDATE.forEach(filePath => {
      const exists = fs.existsSync(filePath);
      const backupExists = fs.existsSync(path.join(BACKUP_DIR, `${path.basename(filePath)}.backup`));
      console.log(`  ${exists ? '✅' : '❌'} ${filePath} ${backupExists ? '(backed up)' : '(no backup)'}`);
    });
    break;
  default:
    console.log('Usage: node scripts/update-components.js [update|rollback|status]');
    console.log('');
    console.log('Commands:');
    console.log('  update   - Update components to use new architecture');
    console.log('  rollback - Rollback components to original versions');
    console.log('  status   - Show current status of components');
    break;
}
