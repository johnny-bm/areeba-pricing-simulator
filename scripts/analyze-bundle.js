#!/usr/bin/env node

/**
 * Bundle analysis and optimization script
 * Analyzes the production bundle and provides optimization recommendations
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

class BundleAnalyzer {
  constructor() {
    this.analysis = {
      totalSize: 0,
      chunks: [],
      modules: [],
      recommendations: [],
      warnings: [],
      errors: [],
    };
  }

  /**
   * Analyze the production bundle
   */
  async analyze() {
    console.log('🔍 Analyzing production bundle...');
    
    try {
      // Build the project
      console.log('📦 Building project...');
      execSync('npm run build:prod', { stdio: 'inherit' });
      
      // Analyze bundle size
      await this.analyzeBundleSize();
      
      // Analyze dependencies
      await this.analyzeDependencies();
      
      // Analyze code splitting
      await this.analyzeCodeSplitting();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Generate report
      this.generateReport();
      
      console.log('✅ Bundle analysis complete!');
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Analyze bundle size
   */
  async analyzeBundleSize() {
    const distPath = join(process.cwd(), 'dist');
    const files = this.getFilesRecursively(distPath);
    
    let totalSize = 0;
    const chunkSizes = {};
    
    files.forEach(file => {
      const size = this.getFileSize(file);
      totalSize += size;
      
      const relativePath = file.replace(distPath, '');
      chunkSizes[relativePath] = size;
    });
    
    this.analysis.totalSize = totalSize;
    this.analysis.chunks = Object.entries(chunkSizes)
      .map(([name, size]) => ({ name, size, percentage: (size / totalSize) * 100 }))
      .sort((a, b) => b.size - a.size);
  }

  /**
   * Analyze dependencies
   */
  async analyzeDependencies() {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const moduleSizes = {};
    
    Object.entries(dependencies).forEach(([name, version]) => {
      // Estimate module size (this is a simplified approach)
      const estimatedSize = this.estimateModuleSize(name);
      moduleSizes[name] = { version, estimatedSize };
    });
    
    this.analysis.modules = Object.entries(moduleSizes)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.estimatedSize - a.estimatedSize);
  }

  /**
   * Analyze code splitting
   */
  async analyzeCodeSplitting() {
    const distPath = join(process.cwd(), 'dist');
    const jsFiles = this.getFilesRecursively(distPath).filter(file => file.endsWith('.js'));
    
    const chunkAnalysis = {
      totalChunks: jsFiles.length,
      averageChunkSize: 0,
      largestChunk: null,
      smallestChunk: null,
    };
    
    if (jsFiles.length > 0) {
      const sizes = jsFiles.map(file => this.getFileSize(file));
      chunkAnalysis.averageChunkSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
      chunkAnalysis.largestChunk = Math.max(...sizes);
      chunkAnalysis.smallestChunk = Math.min(...sizes);
    }
    
    this.analysis.chunkAnalysis = chunkAnalysis;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Bundle size recommendations
    if (this.analysis.totalSize > 1024 * 1024) { // 1MB
      recommendations.push({
        type: 'warning',
        category: 'bundle-size',
        message: 'Bundle size is large (>1MB). Consider code splitting or removing unused dependencies.',
        impact: 'high',
      });
    }
    
    // Large chunks recommendations
    if (this.analysis.chunkAnalysis?.largestChunk > 512 * 1024) { // 512KB
      recommendations.push({
        type: 'warning',
        category: 'chunk-size',
        message: 'Some chunks are large (>512KB). Consider splitting them further.',
        impact: 'medium',
      });
    }
    
    // Dependency recommendations
    const largeModules = this.analysis.modules.filter(m => m.estimatedSize > 100 * 1024); // 100KB
    if (largeModules.length > 0) {
      recommendations.push({
        type: 'info',
        category: 'dependencies',
        message: `Large dependencies detected: ${largeModules.map(m => m.name).join(', ')}`,
        impact: 'low',
      });
    }
    
    // Code splitting recommendations
    if (this.analysis.chunkAnalysis?.totalChunks < 3) {
      recommendations.push({
        type: 'info',
        category: 'code-splitting',
        message: 'Consider implementing code splitting for better performance.',
        impact: 'medium',
      });
    }
    
    this.analysis.recommendations = recommendations;
  }

  /**
   * Generate analysis report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: this.analysis,
      summary: {
        totalSize: this.formatBytes(this.analysis.totalSize),
        totalChunks: this.analysis.chunkAnalysis?.totalChunks || 0,
        averageChunkSize: this.formatBytes(this.analysis.chunkAnalysis?.averageChunkSize || 0),
        recommendations: this.analysis.recommendations.length,
        warnings: this.analysis.warnings.length,
        errors: this.analysis.errors.length,
      },
    };
    
    // Write report to file
    writeFileSync('bundle-analysis.json', JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n📊 Bundle Analysis Summary:');
    console.log(`Total Size: ${report.summary.totalSize}`);
    console.log(`Total Chunks: ${report.summary.totalChunks}`);
    console.log(`Average Chunk Size: ${report.summary.averageChunkSize}`);
    console.log(`Recommendations: ${report.summary.recommendations}`);
    
    // Print top chunks
    console.log('\n📦 Top 10 Largest Chunks:');
    this.analysis.chunks.slice(0, 10).forEach((chunk, index) => {
      console.log(`${index + 1}. ${chunk.name}: ${this.formatBytes(chunk.size)} (${chunk.percentage.toFixed(1)}%)`);
    });
    
    // Print recommendations
    if (this.analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.analysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.type.toUpperCase()}] ${rec.message}`);
      });
    }
  }

  /**
   * Get files recursively
   */
  getFilesRecursively(dir) {
    const files = [];
    const items = this.readDir(dir);
    
    items.forEach(item => {
      const fullPath = join(dir, item);
      if (this.isDirectory(fullPath)) {
        files.push(...this.getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  /**
   * Get file size
   */
  getFileSize(filePath) {
    try {
      const stats = this.getFileStats(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Estimate module size
   */
  estimateModuleSize(moduleName) {
    // This is a simplified estimation
    // In a real implementation, you'd analyze the actual module
    const sizeMap = {
      'react': 50 * 1024,
      'react-dom': 150 * 1024,
      'typescript': 200 * 1024,
      'vite': 100 * 1024,
      'tailwindcss': 80 * 1024,
      'lucide-react': 30 * 1024,
      'zod': 20 * 1024,
      'class-variance-authority': 10 * 1024,
      'clsx': 5 * 1024,
      'tailwind-merge': 5 * 1024,
    };
    
    return sizeMap[moduleName] || 50 * 1024; // Default 50KB
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Read directory (simplified)
   */
  readDir(dir) {
    try {
      return execSync(`ls "${dir}"`, { encoding: 'utf8' }).trim().split('\n');
    } catch {
      return [];
    }
  }

  /**
   * Check if path is directory
   */
  isDirectory(path) {
    try {
      return execSync(`test -d "${path}"`, { encoding: 'utf8' }) === '';
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   */
  getFileStats(path) {
    try {
      const output = execSync(`stat -c %s "${path}"`, { encoding: 'utf8' });
      return { size: parseInt(output.trim()) };
    } catch {
      return { size: 0 };
    }
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze().catch(console.error);
