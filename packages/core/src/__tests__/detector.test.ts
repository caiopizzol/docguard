// Basic tests for DocGuard detector
import { Detector } from '../detector';

// Simple test function to verify detector works
function testDetector() {
    const detector = new Detector();
    const changes = [{
        path: 'test.md',
        before: 'Use your API key for auth',
        after: 'Use your token for auth'
    }];

    const results = detector.detect(changes);
    console.log('Test results:', results.length > 0 ? 'PASS' : 'FAIL');
    console.log('Expected removal detected:', results[0]?.removals[0]?.value === 'API key' ? 'PASS' : 'FAIL');
}

// Run test if this file is executed directly
if (require.main === module) {
    testDetector();
}
