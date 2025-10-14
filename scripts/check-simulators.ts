/**
 * Script to check and fix simulator URL slugs
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSimulators() {
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

    // Check for the specific issue
    const acquiringSim = simulators.find(s => 
      s.name.toLowerCase().includes('acquiring') || 
      s.title.toLowerCase().includes('acquiring')
    );
    
    const issuingSim = simulators.find(s => 
      s.name.toLowerCase().includes('issuing') || 
      s.title.toLowerCase().includes('issuing')
    );

    console.log('\n🔍 Analysis:');
    if (acquiringSim) {
      console.log(`  Acquiring simulator found: "${acquiringSim.name}" with url_slug = "${acquiringSim.url_slug}"`);
      if (acquiringSim.url_slug === 'issuing') {
        console.log('  🚨 ISSUE: Acquiring simulator has url_slug = "issuing" (should be "acquiring")');
      }
    } else {
      console.log('  ⚠️  No Acquiring simulator found');
    }

    if (issuingSim) {
      console.log(`  Issuing simulator found: "${issuingSim.name}" with url_slug = "${issuingSim.url_slug}"`);
      if (issuingSim.url_slug === 'acquiring') {
        console.log('  🚨 ISSUE: Issuing simulator has url_slug = "acquiring" (should be "issuing")');
      }
    } else {
      console.log('  ⚠️  No Issuing simulator found');
    }

    // Check for duplicate slugs
    const slugCounts: Record<string, number> = {};
    simulators.forEach(sim => {
      slugCounts[sim.url_slug] = (slugCounts[sim.url_slug] || 0) + 1;
    });

    const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('\n🚨 Duplicate url_slug values found:');
      duplicates.forEach(([slug, count]) => {
        const sims = simulators.filter(s => s.url_slug === slug);
        console.log(`  "${slug}" used by ${count} simulators: ${sims.map(s => s.name).join(', ')}`);
      });
    }

    // Suggest fixes
    console.log('\n🔧 Suggested fixes:');
    if (acquiringSim && acquiringSim.url_slug !== 'acquiring') {
      console.log(`  UPDATE simulators SET url_slug = 'acquiring' WHERE id = '${acquiringSim.id}';`);
    }
    if (issuingSim && issuingSim.url_slug !== 'issuing') {
      console.log(`  UPDATE simulators SET url_slug = 'issuing' WHERE id = '${issuingSim.id}';`);
    }

  } catch (error) {
    console.error('❌ Error checking simulators:', error);
    process.exit(1);
  }
}

// Run the check
checkSimulators();
