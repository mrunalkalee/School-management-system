const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const targets = [path.join(root, 'backend', 'api-gateway'), ...fs.readdirSync(path.join(root, 'backend', 'services')).map(n => path.join(root, 'backend', 'services', n))];
const required = ['package.json', 'tsconfig.json', 'README.md', '.env.example', 'src'];
const missing = targets.flatMap(dir => required.filter(item => !fs.existsSync(path.join(dir, item))).map(item => `${path.relative(root, dir)}/${item}`)).concat(targets.filter(dir => !fs.existsSync(path.join(dir, 'src', 'main.ts'))).map(dir => `${path.relative(root, dir)}/src/main.ts`));
if (missing.length) { console.error(`Missing required paths:\n${missing.join('\n')}`); process.exit(1); }
console.log(`BrightBoard structure valid (${targets.length} backend applications).`);
