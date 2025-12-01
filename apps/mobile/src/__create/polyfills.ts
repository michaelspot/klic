console.log('🔌 [APP] Loading polyfills...');

import updatedFetch from './fetch';
// @ts-ignore
global.fetch = updatedFetch;

console.log('✅ [APP] Polyfills applied successfully');
