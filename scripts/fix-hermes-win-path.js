const fs = require('fs');
const path = require('path');

if (process.platform !== 'win32') {
  process.exit(0);
}

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(
  projectRoot,
  'node_modules',
  'hermes-compiler',
  'hermesc',
  'win64-bin',
);
const targetDir = path.join(
  projectRoot,
  'node_modules',
  'react-native',
  'sdks',
  'hermesc',
  'win64-bin',
);

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

if (!exists(sourceDir)) {
  console.warn(
    '[fix-hermes-win-path] Source Hermes binaries not found, skipping.',
  );
  process.exit(0);
}

if (!exists(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);
for (const file of files) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log(
  `[fix-hermes-win-path] Copied ${files.length} Hermes binaries to React Native SDK path.`,
);
