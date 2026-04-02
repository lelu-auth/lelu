console.error('\n⚠️  DEPRECATION WARNING ⚠️\n');
console.error('The package "@lelu-auth/lelu" has been renamed to "lelu-agent-auth"');
console.error('\nPlease update your package.json:');
console.error('  npm uninstall @lelu-auth/lelu');
console.error('  npm install lelu-agent-auth');
console.error('\nThen update your imports:');
console.error('  - import { createClient } from "@lelu-auth/lelu"');
console.error('  + import { createClient } from "lelu-agent-auth"');
console.error('\nFor more information, visit: https://github.com/lelu-auth/lelu\n');

throw new Error('Package @lelu-auth/lelu is deprecated. Use lelu-agent-auth instead.');
