#!/usr/bin/env node

/**
 * Security validation script
 * Checks for common security issues in the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security patterns to check for
const SECURITY_PATTERNS = {
  hardcodedCredentials: [
    /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, // JWT tokens
    /sk_[A-Za-z0-9]+/, // Stripe keys
    /pk_[A-Za-z0-9]+/, // Stripe keys
    /https:\/\/[a-zA-Z0-9-]+\.supabase\.co/, // Hardcoded Supabase URLs
    /password\s*=\s*['"][^'"]+['"]/, // Hardcoded passwords
    /api[_-]?key\s*=\s*['"][^'"]+['"]/, // API keys
  ],
  dangerousPatterns: [
    /eval\s*\(/, // eval() usage
    /innerHTML\s*=/, // innerHTML assignment
    /document\.write/, // document.write usage
    /setTimeout\s*\(\s*['"][^'"]*['"]/, // string-based setTimeout
    /setInterval\s*\(\s*['"][^'"]*['"]/, // string-based setInterval
  ],
  consoleLogs: [
    /console\.log\s*\(/, // console.log statements
    /console\.debug\s*\(/, // console.debug statements
  ],
  securityIssues: [
    /localStorage\.setItem\s*\(\s*['"]password/, // Storing passwords in localStorage
    /sessionStorage\.setItem\s*\(\s*['"]password/, // Storing passwords in sessionStorage
    /\.innerHTML\s*=/, // Direct innerHTML assignment
    /dangerouslySetInnerHTML/, // React dangerouslySetInnerHTML
  ]
};

// Files to exclude from security checks
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.d\.ts$/,
  /\.md$/,
  /security-check\.js$/,
  /test/,
  /tests/,
  /\.test\./,
  /\.spec\./
];

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.stats = {
      filesScanned: 0,
      issuesFound: 0,
      criticalIssues: 0,
      warnings: 0
    };
  }

  /**
   * Scan a file for security issues
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.stats.filesScanned++;

      // Check for hardcoded credentials
      this.checkPatterns(content, relativePath, SECURITY_PATTERNS.hardcodedCredentials, 'CRITICAL', 'Hardcoded credentials detected');
      
      // Check for dangerous patterns
      this.checkPatterns(content, relativePath, SECURITY_PATTERNS.dangerousPatterns, 'HIGH', 'Dangerous code patterns detected');
      
      // Check for console logs (warnings in production)
      this.checkPatterns(content, relativePath, SECURITY_PATTERNS.consoleLogs, 'WARNING', 'Console logging detected');
      
      // Check for security issues
      this.checkPatterns(content, relativePath, SECURITY_PATTERNS.securityIssues, 'HIGH', 'Security issues detected');

    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check content against patterns
   */
  checkPatterns(content, filePath, patterns, severity, description) {
    patterns.forEach((pattern, index) => {
      const matches = content.match(new RegExp(pattern.source, 'g'));
      if (matches) {
        matches.forEach(match => {
          const lineNumber = this.getLineNumber(content, match);
          this.issues.push({
            file: filePath,
            line: lineNumber,
            severity,
            description,
            match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
            pattern: pattern.source
          });
          
          this.stats.issuesFound++;
          if (severity === 'CRITICAL') this.stats.criticalIssues++;
          if (severity === 'WARNING') this.stats.warnings++;
        });
      }
    });
  }

  /**
   * Get line number for a match
   */
  getLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * Recursively scan directory
   */
  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      // Skip excluded patterns
      if (EXCLUDE_PATTERNS.some(pattern => pattern.test(fullPath))) {
        return;
      }
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (stat.isFile() && this.isSourceFile(fullPath)) {
        this.scanFile(fullPath);
      }
    });
  }

  /**
   * Check if file is a source file
   */
  isSourceFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'].includes(ext);
  }

  /**
   * Generate security report
   */
  generateReport() {
    console.log('\n🔒 Security Check Report');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Statistics:`);
    console.log(`  Files scanned: ${this.stats.filesScanned}`);
    console.log(`  Issues found: ${this.stats.issuesFound}`);
    console.log(`  Critical issues: ${this.stats.criticalIssues}`);
    console.log(`  Warnings: ${this.stats.warnings}`);
    
    if (this.issues.length === 0) {
      console.log('\n✅ No security issues found!');
      return true;
    }
    
    console.log('\n🚨 Security Issues:');
    console.log('-'.repeat(50));
    
    // Group by severity
    const grouped = this.issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});
    
    // Display by severity
    ['CRITICAL', 'HIGH', 'WARNING'].forEach(severity => {
      if (grouped[severity]) {
        console.log(`\n${severity} Issues:`);
        grouped[severity].forEach(issue => {
          console.log(`  📁 ${issue.file}:${issue.line}`);
          console.log(`     ${issue.description}`);
          console.log(`     Match: ${issue.match}`);
          console.log('');
        });
      }
    });
    
    return this.stats.criticalIssues === 0;
  }

  /**
   * Run security check
   */
  run() {
    console.log('🔍 Starting security scan...');
    
    const srcPath = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcPath)) {
      this.scanDirectory(srcPath);
    }
    
    return this.generateReport();
  }
}

// Run security check
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new SecurityChecker();
  const success = checker.run();
  
  if (!success) {
    console.log('\n❌ Security check failed! Please fix critical issues before deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ Security check passed!');
    process.exit(0);
  }
}

export default SecurityChecker;
