import { testAuthFunctions } from './auth.test.js';
import { testPostFunctions } from './posts.test.js';
import { testFollowFunctions } from './follow.test.js';

const runAllTests = async () => {
  console.log('🧪 Starting BlogApp Test Suite...\n');
  
  let passedTests = 0;
  let totalTests = 0;

  try {
    // Authentication Tests
    console.log('📋 Authentication Tests');
    console.log('------------------------');
    const authTests = testAuthFunctions();
    const authResults = await Promise.all([
      authTests.testPassword(),
      authTests.testJWTFormat()
    ]);
    passedTests += authResults.filter(result => result).length;
    totalTests += authResults.length;
    console.log('');

    // Post Tests
    console.log('📋 Post Management Tests');
    console.log('-------------------------');
    const postTests = testPostFunctions();
    const postResults = [
      postTests.testPostValidation(),
      postTests.testTagsParsing()
    ];
    passedTests += postResults.filter(result => result).length;
    totalTests += postResults.length;
    console.log('');

    // Follow Tests
    console.log('📋 Follow System Tests');
    console.log('----------------------');
    const followTests = testFollowFunctions();
    const followResults = [
      followTests.testFollowValidation(),
      followTests.testFollowCounts()
    ];
    passedTests += followResults.filter(result => result).length;
    totalTests += followResults.length;
    console.log('');

    // Final Results
    console.log('📊 Test Results');
    console.log('================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Some tests failed. Please review the output above.');
    }

  } catch (error) {
    console.error('Error running tests:', error);
  }
};

runAllTests();