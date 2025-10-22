#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests with detailed reporting and performance monitoring
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      integration: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      critical: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      performance: { passed: 0, failed: 0, skipped: 0, duration: 0 },
      e2e: { passed: 0, failed: 0, skipped: 0, duration: 0 },
    };
    this.startTime = Date.now();
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Test Suite');
    console.log('='.repeat(50));

    try {
      // Run unit tests
      await this.runUnitTests();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Run critical path tests
      await this.runCriticalTests();
      
      // Run performance tests
      await this.runPerformanceTests();
      
      // Run E2E tests
      await this.runE2ETests();
      
      // Generate comprehensive report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run unit tests
   */
  async runUnitTests() {
    console.log('\n📋 Running Unit Tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test -- --run', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      this.results.unit.duration = Date.now() - startTime;
      this.parseTestOutput(output, 'unit');
      console.log('✅ Unit tests completed');
      
    } catch (error) {
      this.results.unit.failed = 1;
      console.log('❌ Unit tests failed');
    }
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:integration', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      this.results.integration.duration = Date.now() - startTime;
      this.parseTestOutput(output, 'integration');
      console.log('✅ Integration tests completed');
      
    } catch (error) {
      this.results.integration.failed = 1;
      console.log('❌ Integration tests failed');
    }
  }

  /**
   * Run critical path tests
   */
  async runCriticalTests() {
    console.log('\n🚨 Running Critical Path Tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test -- tests/critical --run', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      this.results.critical.duration = Date.now() - startTime;
      this.parseTestOutput(output, 'critical');
      console.log('✅ Critical path tests completed');
      
    } catch (error) {
      this.results.critical.failed = 1;
      console.log('❌ Critical path tests failed');
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test -- tests/performance --run', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      this.results.performance.duration = Date.now() - startTime;
      this.parseTestOutput(output, 'performance');
      console.log('✅ Performance tests completed');
      
    } catch (error) {
      this.results.performance.failed = 1;
      console.log('❌ Performance tests failed');
    }
  }

  /**
   * Run E2E tests
   */
  async runE2ETests() {
    console.log('\n🌐 Running E2E Tests...');
    const startTime = Date.now();
    
    try {
      const output = execSync('npm run test:e2e', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      this.results.e2e.duration = Date.now() - startTime;
      this.parseTestOutput(output, 'e2e');
      console.log('✅ E2E tests completed');
      
    } catch (error) {
      this.results.e2e.failed = 1;
      console.log('❌ E2E tests failed');
    }
  }

  /**
   * Parse test output to extract results
   */
  parseTestOutput(output, testType) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('✓') || line.includes('PASS')) {
        this.results[testType].passed++;
      } else if (line.includes('✗') || line.includes('FAIL')) {
        this.results[testType].failed++;
      } else if (line.includes('○') || line.includes('SKIP')) {
        this.results[testType].skipped++;
      }
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n📊 Test Suite Report');
    console.log('='.repeat(50));
    
    // Summary
    const totalPassed = Object.values(this.results).reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, result) => sum + result.failed, 0);
    const totalSkipped = Object.values(this.results).reduce((sum, result) => sum + result.skipped, 0);
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`  Tests Passed: ${totalPassed}`);
    console.log(`  Tests Failed: ${totalFailed}`);
    console.log(`  Tests Skipped: ${totalSkipped}`);
    console.log(`  Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
    
    // Detailed results
    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(50));
    
    Object.entries(this.results).forEach(([suite, result]) => {
      const status = result.failed > 0 ? '❌' : '✅';
      const duration = Math.round(result.duration / 1000);
      
      console.log(`  ${status} ${suite.toUpperCase()}:`);
      console.log(`    Passed: ${result.passed}`);
      console.log(`    Failed: ${result.failed}`);
      console.log(`    Skipped: ${result.skipped}`);
      console.log(`    Duration: ${duration}s`);
    });
    
    // Performance metrics
    this.generatePerformanceMetrics();
    
    // Recommendations
    this.generateRecommendations();
    
    // Save report to file
    this.saveReportToFile();
    
    // Exit with appropriate code
    if (totalFailed > 0) {
      console.log('\n❌ Some tests failed. Please review the results.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }

  /**
   * Generate performance metrics
   */
  generatePerformanceMetrics() {
    console.log('\n⚡ Performance Metrics:');
    console.log('-'.repeat(50));
    
    const totalDuration = Object.values(this.results).reduce((sum, result) => sum + result.duration, 0);
    const averageTestTime = totalDuration / Object.values(this.results).reduce((sum, result) => sum + result.passed + result.failed, 0);
    
    console.log(`  Total Test Duration: ${Math.round(totalDuration / 1000)}s`);
    console.log(`  Average Test Time: ${Math.round(averageTestTime)}ms`);
    
    // Performance recommendations
    if (totalDuration > 300000) { // 5 minutes
      console.log('  ⚠️  Test suite is slow. Consider optimizing tests.');
    }
    
    if (averageTestTime > 1000) { // 1 second per test
      console.log('  ⚠️  Individual tests are slow. Consider optimization.');
    }
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(50));
    
    const { unit, integration, critical, performance, e2e } = this.results;
    
    if (unit.failed > 0) {
      console.log('  🔧 Fix failing unit tests to ensure code quality');
    }
    
    if (integration.failed > 0) {
      console.log('  🔗 Review integration test failures for API issues');
    }
    
    if (critical.failed > 0) {
      console.log('  🚨 CRITICAL: Fix critical path test failures immediately');
    }
    
    if (performance.failed > 0) {
      console.log('  ⚡ Address performance test failures for optimal user experience');
    }
    
    if (e2e.failed > 0) {
      console.log('  🌐 Fix E2E test failures to ensure end-to-end functionality');
    }
    
    // Coverage recommendations
    const totalTests = unit.passed + integration.passed + critical.passed + performance.passed + e2e.passed;
    if (totalTests < 50) {
      console.log('  📊 Consider adding more tests for better coverage');
    }
    
    // Performance recommendations
    const totalDuration = Object.values(this.results).reduce((sum, result) => sum + result.duration, 0);
    if (totalDuration > 600000) { // 10 minutes
      console.log('  ⚡ Consider parallelizing tests for faster execution');
    }
  }

  /**
   * Save test report to file
   */
  saveReportToFile() {
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        totalPassed: Object.values(this.results).reduce((sum, result) => sum + result.passed, 0),
        totalFailed: Object.values(this.results).reduce((sum, result) => sum + result.failed, 0),
        totalSkipped: Object.values(this.results).reduce((sum, result) => sum + result.skipped, 0),
      }
    };
    
    const reportPath = path.join(process.cwd(), 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 Test report saved to: ${reportPath}`);
  }
}

// Run test suite
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.runAllTests();
}

export default TestRunner;
