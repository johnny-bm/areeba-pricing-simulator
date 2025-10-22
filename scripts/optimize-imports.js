#!/usr/bin/env node

/**
 * Import optimization script
 * Analyzes and optimizes imports for better tree shaking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImportOptimizer {
  constructor() {
    this.issues = [];
    this.optimizations = [];
    this.stats = {
      filesScanned: 0,
      issuesFound: 0,
      optimizationsFound: 0
    };
  }

  /**
   * Scan files for import optimization opportunities
   */
  scanFiles() {
    console.log('🔍 Scanning for import optimization opportunities...');
    
    const srcPath = path.join(process.cwd(), 'src');
    this.scanDirectory(srcPath);
    
    this.generateReport();
  }

  /**
   * Recursively scan directory
   */
  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      // Skip node_modules, dist, etc.
      if (this.shouldSkipDirectory(fullPath)) {
        return;
      }
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (this.isSourceFile(fullPath)) {
        this.analyzeFile(fullPath);
      }
    });
  }

  /**
   * Check if directory should be skipped
   */
  shouldSkipDirectory(dirPath) {
    const skipPatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.d\.ts$/,
      /test/,
      /tests/,
      /__tests__/
    ];
    
    return skipPatterns.some(pattern => pattern.test(dirPath));
  }

  /**
   * Check if file is a source file
   */
  isSourceFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  }

  /**
   * Analyze file for import optimization opportunities
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.stats.filesScanned++;
      
      // Check for barrel imports
      this.checkBarrelImports(content, relativePath);
      
      // Check for unused imports
      this.checkUnusedImports(content, relativePath);
      
      // Check for large imports
      this.checkLargeImports(content, relativePath);
      
      // Check for specific optimization patterns
      this.checkOptimizationPatterns(content, relativePath);
      
    } catch (error) {
      console.warn(`Warning: Could not analyze file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check for barrel imports that could be optimized
   */
  checkBarrelImports(content, filePath) {
    const barrelPatterns = [
      /import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"]/g,
      /import\s+\{[^}]*\}\s+from\s+['"]\.\.\/[^'"]*index['"]/g,
      /import\s+\{[^}]*\}\s+from\s+['"]@\/[^'"]*['"]/g
    ];
    
    barrelPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'barrel-import',
            severity: 'medium',
            file: filePath,
            issue: 'Barrel import detected',
            suggestion: 'Use specific imports instead of barrel imports',
            match: match.substring(0, 100)
          });
          this.stats.issuesFound++;
        });
      }
    });
  }

  /**
   * Check for potentially unused imports
   */
  checkUnusedImports(content, filePath) {
    const importLines = content.split('\n').filter(line => 
      line.trim().startsWith('import ') && !line.includes('//')
    );
    
    importLines.forEach((line, index) => {
      // Extract imported names
      const importMatch = line.match(/import\s+\{([^}]+)\}/);
      if (importMatch) {
        const importedNames = importMatch[1]
          .split(',')
          .map(name => name.trim().split(' as ')[0].trim());
        
        // Check if imported names are used in the file
        importedNames.forEach(name => {
          const usagePattern = new RegExp(`\\b${name}\\b`, 'g');
          const usageCount = (content.match(usagePattern) || []).length;
          
          if (usageCount <= 1) {
            this.issues.push({
              type: 'unused-import',
              severity: 'low',
              file: filePath,
              line: index + 1,
              issue: `Potentially unused import: ${name}`,
              suggestion: 'Remove unused imports to reduce bundle size',
              match: line.trim()
            });
            this.stats.issuesFound++;
          }
        });
      }
    });
  }

  /**
   * Check for large imports that could be optimized
   */
  checkLargeImports(content, filePath) {
    const largeImportPatterns = [
      /import\s+\{[^}]{100,}\}\s+from/g, // Large destructured imports
      /import\s+\*\s+as\s+\w+\s+from\s+['"]react['"]/g, // React namespace imports
      /import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/g, // Lodash namespace imports
    ];
    
    largeImportPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'large-import',
            severity: 'high',
            file: filePath,
            issue: 'Large import detected',
            suggestion: 'Split large imports into smaller, specific imports',
            match: match.substring(0, 100)
          });
          this.stats.issuesFound++;
        });
      }
    });
  }

  /**
   * Check for specific optimization patterns
   */
  checkOptimizationPatterns(content, filePath) {
    // Check for React imports that could be optimized
    if (content.includes('import React from \'react\'')) {
      this.optimizations.push({
        type: 'react-import',
        file: filePath,
        suggestion: 'Use named React imports for better tree shaking',
        implementation: 'import { useState, useEffect } from \'react\''
      });
      this.stats.optimizationsFound++;
    }
    
    // Check for lodash imports
    if (content.includes('import _ from \'lodash\'')) {
      this.optimizations.push({
        type: 'lodash-import',
        file: filePath,
        suggestion: 'Use specific lodash imports',
        implementation: 'import { debounce, throttle } from \'lodash-es\''
      });
      this.stats.optimizationsFound++;
    }
    
    // Check for moment.js imports
    if (content.includes('import moment from \'moment\'')) {
      this.optimizations.push({
        type: 'moment-import',
        file: filePath,
        suggestion: 'Consider using date-fns or dayjs for smaller bundle',
        implementation: 'import { format, parseISO } from \'date-fns\''
      });
      this.stats.optimizationsFound++;
    }
  }

  /**
   * Generate optimization report
   */
  generateReport() {
    console.log('\n📊 Import Optimization Report');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Statistics:`);
    console.log(`  Files scanned: ${this.stats.filesScanned}`);
    console.log(`  Issues found: ${this.stats.issuesFound}`);
    console.log(`  Optimizations found: ${this.stats.optimizationsFound}`);
    
    if (this.issues.length > 0) {
      console.log('\n⚠️  Import Issues:');
      console.log('-'.repeat(50));
      
      // Group by type
      const groupedIssues = this.issues.reduce((acc, issue) => {
        if (!acc[issue.type]) acc[issue.type] = [];
        acc[issue.type].push(issue);
        return acc;
      }, {});
      
      Object.entries(groupedIssues).forEach(([type, issues]) => {
        console.log(`\n${type.toUpperCase()} (${issues.length} issues):`);
        issues.slice(0, 5).forEach(issue => {
          const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
          console.log(`  ${severityIcon} ${issue.file}:${issue.line || 'N/A'}`);
          console.log(`     ${issue.issue}`);
          console.log(`     💡 ${issue.suggestion}`);
        });
        
        if (issues.length > 5) {
          console.log(`     ... and ${issues.length - 5} more`);
        }
      });
    }
    
    if (this.optimizations.length > 0) {
      console.log('\n🚀 Optimization Opportunities:');
      console.log('-'.repeat(50));
      
      const groupedOptimizations = this.optimizations.reduce((acc, opt) => {
        if (!acc[opt.type]) acc[opt.type] = [];
        acc[opt.type].push(opt);
        return acc;
      }, {});
      
      Object.entries(groupedOptimizations).forEach(([type, optimizations]) => {
        console.log(`\n${type.toUpperCase()} (${optimizations.length} opportunities):`);
        console.log(`  💡 ${optimizations[0].suggestion}`);
        console.log(`  📝 Example: ${optimizations[0].implementation}`);
      });
    }
    
    this.generateOptimizationGuide();
  }

  /**
   * Generate optimization implementation guide
   */
  generateOptimizationGuide() {
    console.log('\n🛠️  Import Optimization Guide:');
    console.log('='.repeat(50));
    
    console.log('\n1. Use Specific Imports:');
    console.log('   ❌ import * as React from \'react\'');
    console.log('   ✅ import { useState, useEffect } from \'react\'');
    
    console.log('\n2. Avoid Barrel Imports:');
    console.log('   ❌ import { Button, Input } from \'../components\'');
    console.log('   ✅ import { Button } from \'../components/Button\'');
    console.log('   ✅ import { Input } from \'../components/Input\'');
    
    console.log('\n3. Use Tree-Shakable Libraries:');
    console.log('   ❌ import _ from \'lodash\'');
    console.log('   ✅ import { debounce } from \'lodash-es\'');
    
    console.log('\n4. Remove Unused Imports:');
    console.log('   - Use ESLint rules to detect unused imports');
    console.log('   - Regularly audit import usage');
    console.log('   - Use IDE features to remove unused imports');
    
    console.log('\n5. Optimize Library Imports:');
    console.log('   - Use specific imports from large libraries');
    console.log('   - Consider lighter alternatives (date-fns vs moment)');
    console.log('   - Use dynamic imports for heavy libraries');
    
    console.log('\n6. Bundle Analysis:');
    console.log('   - Run "npm run analyze-bundle" to see impact');
    console.log('   - Monitor bundle size after optimizations');
    console.log('   - Use webpack-bundle-analyzer for detailed analysis');
  }
}

// Run import optimization
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new ImportOptimizer();
  optimizer.scanFiles();
  console.log('\n✅ Import optimization analysis complete!');
}

export default ImportOptimizer;
