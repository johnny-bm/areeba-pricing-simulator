// Test script to verify service data persistence
// Run this in the browser console after implementing the fixes

// console.log('🧪 Testing Service Data Persistence...');

// Test data
const testService = {
  id: `test-service-${Date.now()}`,
  name: 'Debug Test Service',
  description: 'Test service for debugging data loss',
  categoryId: 'setup', // Make sure this category exists
  unit: 'each',
  defaultPrice: 99,
  pricingType: 'fixed',
  tags: ['urgent', 'premium'],
  is_active: true
};

// console.log('📝 Test service data:', testService);

// Function to test service save
async function testServiceSave() {
  // console.log('🔍 === TESTING SERVICE SAVE ===');
  
  try {
    // Import the API (assuming it's available globally or via import)
    const { api } = await import('./src/utils/api.ts');
    
    // console.log('💾 Saving test service...');
    await api.savePricingItems([testService]);
    // console.log('✅ Service saved successfully');
    
    return true;
  } catch (error) {
    // console.error('❌ Failed to save service:', error);
    return false;
  }
}

// Function to test service load
async function testServiceLoad() {
  // console.log('🔍 === TESTING SERVICE LOAD ===');
  
  try {
    const { api } = await import('./src/utils/api.ts');
    
    // console.log('📥 Loading services...');
    const services = await api.loadPricingItems();
    
    // console.log('📊 Loaded services:', services.length);
    
    // Find our test service
    const testServiceLoaded = services.find(s => s.id === testService.id);
    
    if (testServiceLoaded) {
      // console.log('✅ Test service found in loaded data');
      // console.log('🔍 Service details:', {
        name: testServiceLoaded.name,
        categoryId: testServiceLoaded.categoryId,
        defaultPrice: testServiceLoaded.defaultPrice,
        pricingType: testServiceLoaded.pricingType,
        tags: testServiceLoaded.tags
      });
      
      // Verify data integrity
      const dataIntegrity = {
        name: testServiceLoaded.name === testService.name,
        categoryId: testServiceLoaded.categoryId === testService.categoryId,
        defaultPrice: testServiceLoaded.defaultPrice === testService.defaultPrice,
        pricingType: testServiceLoaded.pricingType === testService.pricingType,
        tags: JSON.stringify(testServiceLoaded.tags?.sort()) === JSON.stringify(testService.tags.sort())
      };
      
      // console.log('🔍 Data integrity check:', dataIntegrity);
      
      const allDataIntact = Object.values(dataIntegrity).every(Boolean);
      
      if (allDataIntact) {
        // console.log('✅ ALL DATA INTACT - No data loss detected!');
        return true;
      } else {
        // console.log('❌ DATA LOSS DETECTED - Some fields are missing or incorrect');
        return false;
      }
    } else {
      // console.log('❌ Test service not found in loaded data');
      return false;
    }
  } catch (error) {
    // console.error('❌ Failed to load services:', error);
    return false;
  }
}

// Function to test database state directly
async function testDatabaseState() {
  // console.log('🔍 === TESTING DATABASE STATE ===');
  
  try {
    const { supabase } = await import('./src/utils/supabase/client.ts');
    
    // Check services table
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('id', testService.id);
    
    if (servicesError) {
      // console.error('❌ Failed to query services:', servicesError);
      return false;
    }
    
    // console.log('📊 Services in database:', services);
    
    if (services && services.length > 0) {
      const service = services[0];
      // console.log('🔍 Service in database:', {
        name: service.name,
        category: service.category,
        default_price: service.default_price,
        pricing_type: service.pricing_type
      });
    }
    
    // Check service_tags table
    const { data: serviceTags, error: tagsError } = await supabase
      .from('service_tags')
      .select('*, tag:tags(name)')
      .eq('service_id', testService.id);
    
    if (tagsError) {
      // console.error('❌ Failed to query service_tags:', tagsError);
      return false;
    }
    
    // console.log('📊 Service tags in database:', serviceTags);
    
    return true;
  } catch (error) {
    // console.error('❌ Failed to test database state:', error);
    return false;
  }
}

// Main test function
async function runFullTest() {
  // console.log('🚀 Starting comprehensive service data test...');
  
  const saveResult = await testServiceSave();
  if (!saveResult) {
    // console.log('❌ Test failed at save step');
    return;
  }
  
  const loadResult = await testServiceLoad();
  if (!loadResult) {
    // console.log('❌ Test failed at load step');
    return;
  }
  
  const dbResult = await testDatabaseState();
  if (!dbResult) {
    // console.log('❌ Test failed at database check step');
    return;
  }
  
  // console.log('🎉 ALL TESTS PASSED - Service data persistence is working correctly!');
}

// Export functions for manual testing
window.testServiceData = {
  runFullTest,
  testServiceSave,
  testServiceLoad,
  testDatabaseState,
  testService
};

// console.log('🧪 Test functions available as window.testServiceData');
// console.log('💡 Run: testServiceData.runFullTest() to start the test');
