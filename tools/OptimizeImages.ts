import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function* walkPngs(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkPngs(full);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.png')) {
      yield full;
    }
  }
}

function isUnderStories(filePath: string, imagesRoot: string): boolean {
  const rel = path.relative(imagesRoot, filePath);
  const first = rel.split(path.sep)[0];
  return first === 'stories';
}

async function convertStoriesPngToJpeg(
  pngPath: string,
  dryRun: boolean,
): Promise<void> {
  const jpgPath = pngPath.slice(0, -'.png'.length) + '.jpg';
  if (dryRun) {
    console.log(`[dry-run] ${pngPath} -> ${jpgPath} (jpeg q80, max height 1280)`);
    return;
  }

  const meta = await sharp(pngPath).metadata();
  let pipeline = sharp(pngPath).rotate();
  if (meta.hasAlpha) {
    pipeline = pipeline.flatten({ background: '#ffffff' });
  }
  await pipeline
    .resize({
      height: 1280,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(jpgPath);
  await fs.unlink(pngPath);
  console.log(`Converted: ${pngPath} -> ${jpgPath}`);
}

async function optimizeOtherPng(pngPath: string, dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log(`[dry-run] optimize PNG: ${pngPath}`);
    return;
  }

  const buf = await sharp(pngPath)
    .rotate()
    .png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true })
    .toBuffer();
  const before = (await fs.stat(pngPath)).size;
  if (buf.length < before) {
    await fs.writeFile(pngPath, buf);
    console.log(`Optimized PNG (${before} -> ${buf.length} B): ${pngPath}`);
  } else {
    console.log(`Skip (not smaller): ${pngPath}`);
  }
}

const program = new Command();

program
  .name('optimize-images')
  .description(
    'Optimize PNGs under src/assets/images; story PNGs become JPEG (q80, max height 1280)',
  )
  .option(
    '--root <dir>',
    'Images root directory (relative to cwd)',
    'src/assets/images',
  )
  .option('--dry-run', 'Print actions without writing files', false)
  .action(async (opts: { root: string; dryRun: boolean }) => {
    const imagesRoot = path.resolve(process.cwd(), opts.root);
    try {
      await fs.access(imagesRoot);
    } catch {
      console.error(`Images root not found: ${imagesRoot}`);
      process.exitCode = 1;
      return;
    }

    let failed = 0;
    for await (const pngPath of walkPngs(imagesRoot)) {
      try {
        if (isUnderStories(pngPath, imagesRoot)) {
          continue;
        } else {
          await optimizeOtherPng(pngPath, opts.dryRun);
        }
      } catch (err) {
        failed += 1;
        console.error(`Error processing ${pngPath}:`, err);
      }
    }

    if (failed > 0) {
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
