import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { Command } from 'commander';
import sharp from 'sharp';

const MAX_STICKS = 100;
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const SOURCE_EXTENSIONS = new Set(IMAGE_EXTENSIONS);
const CONCERNS = ['love', 'career', 'wealth', 'family', 'health'] as const;

type StoryKind = 'omen' | 'action' | 'conclude';
type SourceStoryKind = StoryKind | 'conlude';
type ConcernStats = {
  sourceFolderFound: boolean;
  sourceFilesTotal: number;
  sourceStoryFilesRecognized: number;
  sourceFilesIgnored: number;
  sourceDuplicateStoryFiles: number;
  targetImagesGenerated: number;
  targetImagesSkippedExisting: number;
  targetImagesAvailable: number;
  targetImagesMissing: number;
};

function normalizeKind(kind: SourceStoryKind): StoryKind {
  return kind === 'conlude' ? 'conclude' : kind;
}

function parseStoryFileName(fileName: string): { kind: StoryKind; index: number } | null {
  const match = fileName.match(/^(omen|action|conclude|conlude)-(\d+)(\.\w+)$/i);
  if (!match) return null;

  const ext = match[3].toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return null;

  const index = parseInt(match[2], 10);
  if (!Number.isFinite(index) || index < 1 || index > MAX_STICKS) return null;

  return { kind: normalizeKind(match[1].toLowerCase() as SourceStoryKind), index };
}

function getStoryIndex(fileName: string, kind: StoryKind): number | null {
  const extPattern = IMAGE_EXTENSIONS.map((ext) => ext.replace('.', '\\.')).join('|');
  const pattern = new RegExp(`^${kind}-(\\d+)(${extPattern})$`, 'i');
  const match = fileName.match(pattern);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function getKindIndexSet(kind: StoryKind, filenames: string[]): Set<number> {
  const set = new Set<number>();
  for (const fileName of filenames) {
    const index = getStoryIndex(fileName, kind);
    if (index === null || index < 1 || index > MAX_STICKS) continue;
    set.add(index);
  }
  return set;
}

function buildInstructions(kind: StoryKind, filenames: string[]): string {
  const byIndex = new Map<number, string>();

  for (const fileName of filenames) {
    const index = getStoryIndex(fileName, kind);
    if (index === null || index < 1 || index > MAX_STICKS || byIndex.has(index)) continue;
    byIndex.set(index, fileName);
  }

  const entries: string[] = ['[]'];
  for (let i = 1; i <= MAX_STICKS; i++) {
    const fileName = byIndex.get(i);
    entries.push(fileName ? `[() => require('./${fileName}')]` : '[]');
  }

  return entries.join(', ');
}

async function clearGeneratedStoryJpegs(concernDir: string): Promise<void> {
  const files = await fs.readdir(concernDir, { withFileTypes: true });
  const removablePattern = /^(omen|action|conclude)-\d+\.jpg$/i;

  for (const file of files) {
    if (!file.isFile()) continue;
    if (!removablePattern.test(file.name)) continue;
    await fs.unlink(path.join(concernDir, file.name));
  }
}

async function optimizeAndCopyStories(
  rawConcernDir: string,
  outputConcernDir: string,
  reset: boolean,
): Promise<{
  sourceFilesTotal: number;
  sourceStoryFilesRecognized: number;
  sourceFilesIgnored: number;
  sourceDuplicateStoryFiles: number;
  targetImagesGenerated: number;
  targetImagesSkippedExisting: number;
}> {
  const files = await fs.readdir(rawConcernDir, { withFileTypes: true });
  const byOutput = new Map<string, string>();
  const stats = {
    sourceFilesTotal: 0,
    sourceStoryFilesRecognized: 0,
    sourceFilesIgnored: 0,
    sourceDuplicateStoryFiles: 0,
    targetImagesGenerated: 0,
    targetImagesSkippedExisting: 0,
  };

  for (const file of files) {
    if (!file.isFile()) continue;
    stats.sourceFilesTotal += 1;
    const parsed = parseStoryFileName(file.name);
    if (!parsed) {
      stats.sourceFilesIgnored += 1;
      continue;
    }
    stats.sourceStoryFilesRecognized += 1;
    const outputName = `${parsed.kind}-${parsed.index}.jpg`;
    if (!byOutput.has(outputName)) {
      byOutput.set(outputName, path.join(rawConcernDir, file.name));
    } else {
      stats.sourceDuplicateStoryFiles += 1;
    }
  }

  for (const [outputName, sourcePath] of byOutput.entries()) {
    const outputPath = path.join(outputConcernDir, outputName);
    if (!reset) {
      try {
        await fs.access(outputPath);
        stats.targetImagesSkippedExisting += 1;
        continue;
      } catch {
        // File does not exist yet; generate it.
      }
    }
    const meta = await sharp(sourcePath).metadata();
    let pipeline = sharp(sourcePath).rotate();
    if (meta.hasAlpha) {
      pipeline = pipeline.flatten({ background: '#ffffff' });
    }
    await pipeline
      .resize({
        height: 1280,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 80,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: '4:2:0',
      })
      .toFile(outputPath);
    stats.targetImagesGenerated += 1;
  }

  return stats;
}

function logConcernStats(concern: string, stats: ConcernStats): void {
  console.log(`[${concern}] generation report`);
  console.log(`  source folder found: ${stats.sourceFolderFound ? 'yes' : 'no'}`);
  console.log(`  source files scanned: ${stats.sourceFilesTotal}`);
  console.log(`  source story files recognized: ${stats.sourceStoryFilesRecognized}`);
  console.log(`  source files ignored: ${stats.sourceFilesIgnored}`);
  console.log(`  source duplicate story files: ${stats.sourceDuplicateStoryFiles}`);
  console.log(`  target images generated: ${stats.targetImagesGenerated}`);
  console.log(`  target images skipped (already existed): ${stats.targetImagesSkippedExisting}`);
  console.log(`  target images available: ${stats.targetImagesAvailable}`);
  console.log(`  target images missing: ${stats.targetImagesMissing}`);
}

async function run(opts: { source: string; target: string; reset: boolean }) {
  const rawStoriesRoot = path.resolve(process.cwd(), opts.source);
  const imagesRoot = path.resolve(process.cwd(), opts.target);

  try {
    await fs.access(rawStoriesRoot);
  } catch {
    console.error(`Source folder missing: ${rawStoriesRoot}`);
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(imagesRoot, { recursive: true });

  for (const concern of CONCERNS) {
    const rawConcernDir = path.join(rawStoriesRoot, concern);
    const concernDir = path.join(imagesRoot, concern);
    await fs.mkdir(concernDir, { recursive: true });
    if (opts.reset) {
      await clearGeneratedStoryJpegs(concernDir);
    }

    let hasSource = true;
    try {
      await fs.access(rawConcernDir);
    } catch {
      hasSource = false;
      console.warn(`No source for ${concern} at ${rawConcernDir}; generating empty slots.`);
    }

    let processStats = {
      sourceFilesTotal: 0,
      sourceStoryFilesRecognized: 0,
      sourceFilesIgnored: 0,
      sourceDuplicateStoryFiles: 0,
      targetImagesGenerated: 0,
      targetImagesSkippedExisting: 0,
    };
    if (hasSource) {
      processStats = await optimizeAndCopyStories(rawConcernDir, concernDir, opts.reset);
    }

    const files = await fs.readdir(concernDir, { withFileTypes: true });
    const filenames = files.filter((f) => f.isFile()).map((f) => f.name);
    const availableOmens = getKindIndexSet('omen', filenames).size;
    const availableActions = getKindIndexSet('action', filenames).size;
    const availableConcludes = getKindIndexSet('conclude', filenames).size;
    const targetImagesAvailable = availableOmens + availableActions + availableConcludes;
    const targetImagesMissing = MAX_STICKS * 3 - targetImagesAvailable;

    let content = '';
    content += `export const OMENS = [${buildInstructions('omen', filenames)}]` + os.EOL;
    content += `export const ACTIONS = [${buildInstructions('action', filenames)}]` + os.EOL;
    content += `export const CONCLUDES = [${buildInstructions('conclude', filenames)}]` + os.EOL;
    await fs.writeFile(path.join(concernDir, 'index.ts'), content, 'utf-8');
    console.log(`Wrote to ${path.join(concernDir, 'index.ts')}`);
    logConcernStats(concern, {
      sourceFolderFound: hasSource,
      sourceFilesTotal: processStats.sourceFilesTotal,
      sourceStoryFilesRecognized: processStats.sourceStoryFilesRecognized,
      sourceFilesIgnored: processStats.sourceFilesIgnored,
      sourceDuplicateStoryFiles: processStats.sourceDuplicateStoryFiles,
      targetImagesGenerated: processStats.targetImagesGenerated,
      targetImagesSkippedExisting: processStats.targetImagesSkippedExisting,
      targetImagesAvailable,
      targetImagesMissing,
    });
  }
}

const program = new Command();

program
  .name('generate-stories-imports')
  .description('Optimize story images and generate fixed 1..100 import arrays')
  .option('--source <dir>', 'Raw stories source root', 'raw/stories')
  .option('--target <dir>', 'Generated stories target root', 'src/assets/images/stories')
  .option('--reset', 'Delete generated target JPEGs and regenerate them', false)
  .action(run);

program.parseAsync(process.argv);
