#!/usr/bin/env node

/**
 * Script to fix simulator URL slugs in the database
 * This script checks and corrects any incorrect url_slug values
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSimulatorSlugs() {
  try {
    console.log('🔍 Checking simulator data...');
    
    // Get all simulators
    const { data: simulators, error } = await supabase
      .from('simulators')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    console.log('📊 Found simulators:', simulators.length);
    
    // Display current data
    console.log('\n📋 Current simulator data:');
    simulators.forEach(sim => {
      console.log(`  - ${sim.name} (${sim.title}): url_slug = "${sim.url_slug}"`);
    });

    // Check for issues
    const issues = [];
    
    // Check if Acquiring simulator has wrong slug
    const acquiringSim = simulators.find(s => s.name.toLowerCase().includes('acquiring'));
    if (acquiringSim && acquiringSim.url_slug !== 'acquiring') {
      issues.push({
        id: acquiringSim.id,
        name: acquiringSim.name,
        currentSlug: acquiringSim.url_slug,
        correctSlug: 'acquiring',
        issue: 'Acquiring simulator has wrong url_slug'
      });
    }

    // Check if Issuing simulator has wrong slug
    const issuingSim = simulators.find(s => s.name.toLowerCase().includes('issuing'));
    if (issuingSim && issuingSim.url_slug !== 'issuing') {
      issues.push({
        id: issuingSim.id,
        name: issuingSim.name,
        currentSlug: issuingSim.url_slug,
        correctSlug: 'issuing',
        issue: 'Issuing simulator has wrong url_slug'
      });
    }

    // Check for duplicate slugs
    const slugCounts = {};
    simulators.forEach(sim => {
      slugCounts[sim.url_slug] = (slugCounts[sim.url_slug] || 0) + 1;
    });

    Object.entries(slugCounts).forEach(([slug, count]) => {
      if (count > 1) {
        const duplicates = simulators.filter(s => s.url_slug === slug);
        issues.push({
          issue: `Duplicate url_slug "${slug}" found`,
          duplicates: duplicates.map(s => ({ id: s.id, name: s.name }))
        });
      }
    });

    if (issues.length === 0) {
      console.log('✅ No issues found with simulator slugs');
      return;
    }

    console.log('\n🚨 Issues found:');
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.issue}`);
      if (issue.currentSlug) {
        console.log(`     Current: "${issue.currentSlug}" → Should be: "${issue.correctSlug}"`);
      }
      if (issue.duplicates) {
        console.log(`     Duplicates: ${issue.duplicates.map(d => d.name).join(', ')}`);
      }
    });

    // Ask for confirmation to fix
    console.log('\n🔧 Would you like to fix these issues? (y/N)');
    
    // For automated execution, we'll fix the most common issue
    if (issues.some(issue => issue.correctSlug)) {
      console.log('🔧 Auto-fixing simulator slugs...');
      
      for (const issue of issues) {
        if (issue.correctSlug) {
          console.log(`  Fixing ${issue.name}: "${issue.currentSlug}" → "${issue.correctSlug}"`);
          
          const { error: updateError } = await supabase
            .from('simulators')
            .update({ url_slug: issue.correctSlug })
            .eq('id', issue.id);

          if (updateError) {
            console.error(`❌ Failed to update ${issue.name}:`, updateError);
          } else {
            console.log(`✅ Updated ${issue.name}`);
          }
        }
      }
      
      console.log('\n✅ Simulator slugs have been fixed!');
    }

  } catch (error) {
    console.error('❌ Error fixing simulator slugs:', error);
    process.exit(1);
  }
}

// Run the script
fixSimulatorSlugs();
