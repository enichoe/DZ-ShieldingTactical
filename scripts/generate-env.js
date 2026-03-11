const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const content = `// Generated at build time - do not commit\n` +
`window.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};\n` +
`window.SUPABASE_ANON_KEY = ${JSON.stringify(supabaseKey)};\n`;

try {
  fs.writeFileSync(path.join(__dirname, '..', 'env.js'), content, { encoding: 'utf8' });
  console.log('✅ env.js generated');
} catch (err) {
  console.error('❌ Failed to write env.js', err);
  process.exit(1);
}
