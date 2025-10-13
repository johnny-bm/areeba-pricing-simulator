#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate version based on git commit count
let version = '1.0.0';
try {
  const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
  const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  version = `1.${commitCount}.${shortHash}`;
} catch (error) {
  // Fallback: use timestamp-based version
  const timestamp = Math.floor(Date.now() / 1000);
  version = `1.${timestamp}.0`;
}

// Create .env.local file with version
const envContent = `VITE_BUILD_HASH=${version}\n`;
const envPath = join(__dirname, '..', '.env.local');

writeFileSync(envPath, envContent);
console.log(`✅ Set VITE_BUILD_HASH to ${version}`);
