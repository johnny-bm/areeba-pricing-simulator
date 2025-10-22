#!/usr/bin/env node

/**
 * Bundle optimization script
 * Analyzes bundle size and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BundleOptimizer {
  constructor() {
    this.analysis = {
      totalSize: 0,
      chunks: [],
      recommendations: [],
      optimizations: []
    };
  }

  /**
   * Analyze bundle size from dist directory
   */
  analyzeBundle() {
    const distPath = path.join(process.cwd(), 'dist');
    
    if (!fs.existsSync(distPath)) {
      console.log('❌ Dist directory not found. Run "npm run build" first.');
      return false;
    }

    console.log('🔍 Analyzing bundle size...');
    
    this.scanDirectory(distPath);
    this.generateRecommendations();
    this.generateReport();
    
    return true;
  }

  /**
   * Scan directory for JavaScript files
   */
  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (item.endsWith('.js') && !item.includes('.map')) {
        this.analyzeChunk(fullPath, item);
      }
    });
  }

  /**
   * Analyze individual chunk
   */
  analyzeChunk(filePath, fileName) {
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    
    this.analysis.totalSize += sizeKB;
    this.analysis.chunks.push({
      name: fileName,
      size: sizeKB,
      path: filePath
    });
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const { chunks, totalSize } = this.analysis;
    
    // Sort chunks by size
    chunks.sort((a, b) => b.size - a.size);
    
    // Large chunk recommendations
    chunks.forEach(chunk => {
      if (chunk.size > 500) {
        this.analysis.recommendations.push({
          type: 'large-chunk',
          severity: 'high',
          chunk: chunk.name,
          size: chunk.size,
          message: `Large chunk detected: ${chunk.name} (${chunk.size}KB). Consider splitting into smaller chunks.`
        });
      } else if (chunk.size > 200) {
        this.analysis.recommendations.push({
          type: 'medium-chunk',
          severity: 'medium',
          chunk: chunk.name,
          size: chunk.size,
          message: `Medium chunk: ${chunk.name} (${chunk.size}KB). Consider optimization.`
        });
      }
    });

    // Total bundle size recommendations
    if (totalSize > 2000) {
      this.analysis.recommendations.push({
        type: 'total-size',
        severity: 'high',
        message: `Total bundle size is ${totalSize}KB. Consider aggressive code splitting.`
      });
    } else if (totalSize > 1000) {
      this.analysis.recommendations.push({
        type: 'total-size',
        severity: 'medium',
        message: `Total bundle size is ${totalSize}KB. Consider optimization.`
      });
    }

    // Specific optimization suggestions
    this.generateOptimizationSuggestions();
  }

  /**
   * Generate specific optimization suggestions
   */
  generateOptimizationSuggestions() {
    const { chunks } = this.analysis;
    
    // Check for common optimization opportunities
    const vendorChunk = chunks.find(c => c.name.includes('vendor'));
    const reactChunk = chunks.find(c => c.name.includes('react'));
    const adminChunk = chunks.find(c => c.name.includes('admin'));
    const pdfChunk = chunks.find(c => c.name.includes('pdf'));
    
    if (vendorChunk && vendorChunk.size > 300) {
      this.analysis.optimizations.push({
        type: 'vendor-splitting',
        description: 'Split vendor chunk into smaller pieces',
        impact: 'high',
        implementation: 'Update manualChunks configuration in vite.config.ts'
      });
    }

    if (adminChunk && adminChunk.size > 200) {
      this.analysis.optimizations.push({
        type: 'admin-lazy-loading',
        description: 'Implement lazy loading for admin features',
        impact: 'high',
        implementation: 'Use React.lazy() for admin components'
      });
    }

    if (pdfChunk && pdfChunk.size > 300) {
      this.analysis.optimizations.push({
        type: 'pdf-lazy-loading',
        description: 'Implement lazy loading for PDF builder',
        impact: 'high',
        implementation: 'Use React.lazy() for PDF builder components'
      });
    }

    // General optimizations
    this.analysis.optimizations.push({
      type: 'tree-shaking',
      description: 'Optimize imports for better tree shaking',
      impact: 'medium',
      implementation: 'Use specific imports instead of barrel exports'
    });

    this.analysis.optimizations.push({
      type: 'dynamic-imports',
      description: 'Add dynamic imports for non-critical features',
      impact: 'high',
      implementation: 'Use dynamic imports for heavy components'
    });

    this.analysis.optimizations.push({
      type: 'image-optimization',
      description: 'Optimize images and assets',
      impact: 'medium',
      implementation: 'Use WebP format and compress images'
    });
  }

  /**
   * Generate optimization report
   */
  generateReport() {
    console.log('\n📊 Bundle Analysis Report');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Bundle Statistics:`);
    console.log(`  Total size: ${this.analysis.totalSize}KB`);
    console.log(`  Number of chunks: ${this.analysis.chunks.length}`);
    console.log(`  Average chunk size: ${Math.round(this.analysis.totalSize / this.analysis.chunks.length)}KB`);
    
    console.log('\n📦 Chunk Breakdown:');
    console.log('-'.repeat(50));
    this.analysis.chunks.forEach(chunk => {
      const sizeIndicator = chunk.size > 500 ? '🔴' : chunk.size > 200 ? '🟡' : '🟢';
      console.log(`  ${sizeIndicator} ${chunk.name}: ${chunk.size}KB`);
    });
    
    if (this.analysis.recommendations.length > 0) {
      console.log('\n⚠️  Recommendations:');
      console.log('-'.repeat(50));
      this.analysis.recommendations.forEach(rec => {
        const severityIcon = rec.severity === 'high' ? '🔴' : '🟡';
        console.log(`  ${severityIcon} ${rec.message}`);
      });
    }
    
    if (this.analysis.optimizations.length > 0) {
      console.log('\n🚀 Optimization Opportunities:');
      console.log('-'.repeat(50));
      this.analysis.optimizations.forEach(opt => {
        const impactIcon = opt.impact === 'high' ? '🔴' : '🟡';
        console.log(`  ${impactIcon} ${opt.description}`);
        console.log(`     Impact: ${opt.impact}`);
        console.log(`     Implementation: ${opt.implementation}`);
        console.log('');
      });
    }
    
    // Performance score
    const score = this.calculatePerformanceScore();
    console.log(`\n🎯 Performance Score: ${score}/100`);
    
    if (score < 70) {
      console.log('⚠️  Bundle size needs optimization');
    } else if (score < 85) {
      console.log('✅ Bundle size is acceptable but could be improved');
    } else {
      console.log('🎉 Bundle size is well optimized!');
    }
  }

  /**
   * Calculate performance score based on bundle size
   */
  calculatePerformanceScore() {
    const { totalSize } = this.analysis;
    
    // Score based on total bundle size
    if (totalSize < 500) return 100;
    if (totalSize < 1000) return 90;
    if (totalSize < 1500) return 80;
    if (totalSize < 2000) return 70;
    if (totalSize < 3000) return 60;
    if (totalSize < 5000) return 50;
    return 30;
  }

  /**
   * Generate optimization implementation guide
   */
  generateImplementationGuide() {
    console.log('\n🛠️  Implementation Guide:');
    console.log('='.repeat(50));
    
    console.log('\n1. Code Splitting:');
    console.log('   - Use React.lazy() for route-based splitting');
    console.log('   - Implement component-level lazy loading');
    console.log('   - Split vendor libraries into separate chunks');
    
    console.log('\n2. Tree Shaking:');
    console.log('   - Use specific imports: import { Button } from "library"');
    console.log('   - Avoid barrel exports: import * from "library"');
    console.log('   - Remove unused dependencies');
    
    console.log('\n3. Dynamic Imports:');
    console.log('   - Use dynamic imports for heavy libraries');
    console.log('   - Implement route-based code splitting');
    console.log('   - Lazy load non-critical features');
    
    console.log('\n4. Asset Optimization:');
    console.log('   - Compress images and use WebP format');
    console.log('   - Optimize SVG icons');
    console.log('   - Use CDN for large assets');
    
    console.log('\n5. Bundle Analysis:');
    console.log('   - Run "npm run analyze-bundle" regularly');
    console.log('   - Monitor bundle size in CI/CD');
    console.log('   - Set bundle size budgets');
  }
}

// Run bundle optimization
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new BundleOptimizer();
  const success = optimizer.analyzeBundle();
  
  if (success) {
    optimizer.generateImplementationGuide();
    console.log('\n✅ Bundle analysis complete!');
  } else {
    console.log('\n❌ Bundle analysis failed!');
    process.exit(1);
  }
}

export default BundleOptimizer;
