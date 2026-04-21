import fs from 'fs/promises';
import os from 'os';
import path from 'path';

async function* walkJpgs(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkJpgs(full);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.jpg')) {
      yield full;
    }
  }
}

function isUnderStories(filePath: string, imagesRoot: string, concern: string): boolean {
  const rel = path.relative(imagesRoot, filePath);
  const first = rel.split(path.sep)[0];
  return first === concern;
}

const getNum = (str: string) => {
  const match = str.match(/(\d+)(?=\.\w+$)/);
  return match ? parseInt(match[1], 10) : -Infinity;
};

function compareStoryNames(a: string, b: string) {  
  return getNum(a) - getNum(b);
}

async function main() {
  const imagesRoot = path.resolve(process.cwd(), 'src/assets/images/stories');

  try {
    await fs.access(imagesRoot);
  } catch {
    console.error(`Images root not found: ${imagesRoot}`);
    process.exitCode = 1;
    return;
  }

  const CONCERNS = ['love', 'career', 'wealth', 'family', 'health'];
  for (const concern of CONCERNS) {
    let content = '';
    const omens = [];
    const actions = [];
    const concludes = [];
    for await (const jpgPath of walkJpgs(imagesRoot)) {
      if (isUnderStories(jpgPath, imagesRoot, concern)) {
        const filename = path.basename(jpgPath);
        if (filename.startsWith('omen')) {
          omens.push(filename);
        } else if (filename.startsWith('action')) {
          actions.push(filename);
        } else if (filename.startsWith('conclude')) {
          concludes.push(filename);
        }
      }
    }

    omens.sort(compareStoryNames);
    content += `export const OMENS = [[], ${omens.map((fn) => `[() => require('./${fn}')]`)}]` + os.EOL;
    content += `export const ACTIONS = [[], ${actions.map((fn) => `[() => require('./${fn}')]`)}]` + os.EOL;
    content += `export const CONCLUDES = [[], ${concludes.map((fn) => `[() => require('./${fn}')]`)}]` + os.EOL;
    await fs.writeFile(path.join(imagesRoot, concern, 'index.ts'), content, 'utf-8');
    console.log(`Wrote to ${path.join(imagesRoot, concern, 'index.ts')}`);
  }
}

main();
