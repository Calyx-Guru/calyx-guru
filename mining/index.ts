/**
 * Mining CLI - Crawl fortune lot data from ydm.com.tw
 *
 * Usage:
 *   npx tsx mining/index.ts crawl             # Crawl all 60 lots (English)
 *   npx tsx mining/index.ts crawl --from 1 --to 5   # Crawl lots 1-5 only
 *   npx tsx mining/index.ts crawl --delay 2000       # 2s delay between requests
 *   npx tsx mining/index.ts crawl --no-images        # Skip image downloads
 */

import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { Command } from 'commander';
import type { AnyNode, Element, Text } from 'domhandler';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

// ─── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = 'http://www.ydm.com.tw';
const DETAIL_URL = (anum: number) => `${BASE_URL}/loteng_go.asp?anum=${anum}`;
const OUTPUT_DIR = path.resolve(__dirname, 'output');
const IMAGES_DIR = path.resolve(OUTPUT_DIR, 'images');
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'lots-en.json');
const TOTAL_LOTS = 60;

// ─── Types ───────────────────────────────────────────────────────────────────

interface LotHighlights {
   seizeAllOpportunities: string;
   detailsAndActions: string;
   workWithPeople: string;
   ownYourFate: string;
}

interface LotApplications {
   [key: string]: string;
}

interface LotData {
   drawNo: number;
   images: {
      illustration: string | null; // lotpic/pN.jpg
      hexagramImage: string | null; // lotpic/N.png
   };
   originalExplanation: string;
   updatedExplanation: string;
   hexagram: string;
   pictureExplanation: string;
   implications: string;
   matsusWords: string;
   highlights: LotHighlights;
   applications: LotApplications;
   lastReminders: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean extracted text: trim, normalize whitespace, remove leading/trailing <br> artifacts
 */
function cleanText(text: string): string {
   return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\u3000/g, ' ') // ideographic space → regular space
      .replace(/^\s+|\s+$/g, '') // trim
      .replace(/^[\s\n]+|[\s\n]+$/g, '');
}

/**
 * Extract text from a cheerio element, converting <br> to newline
 */
function extractText($el: cheerio.Cheerio<AnyNode>, $: cheerio.CheerioAPI): string {
   // Replace <br> with newlines before getting text
   const html = $el.html();
   if (!html) return '';
   const text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '') // strip remaining HTML tags
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');
   return cleanText(text);
}

// ─── Page Fetching ───────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string> {
   const response = await fetch(url, {
      headers: {
         'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
         Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
         'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8',
      },
   });

   if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
   }

   // Handle potential encoding issues (Big5 / UTF-8)
   const buffer = Buffer.from(await response.arrayBuffer());

   // Try UTF-8 first, then Big5 if there are issues
   let html = buffer.toString('utf-8');

   // If it looks like Big5 encoding, try to decode
   if (html.includes('charset=big5') || html.includes('charset=Big5')) {
      try {
         const decoder = new TextDecoder('big5');
         html = decoder.decode(buffer);
      } catch {
         // fallback to utf-8
      }
   }

   return html;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
   try {
      const response = await fetch(url, {
         headers: {
            'User-Agent':
               'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
         },
      });

      if (!response.ok) {
         console.warn(`  ⚠ Failed to download image: ${url} (HTTP ${response.status})`);
         return false;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      return true;
   } catch (error) {
      console.warn(`  ⚠ Error downloading image: ${url}`, error);
      return false;
   }
}

// ─── HTML Parsing ────────────────────────────────────────────────────────────

function parseLotDetailPage(html: string, drawNo: number): Omit<LotData, 'images'> {
   const $ = cheerio.load(html);

   // Find the content container - try multiple selectors
   const contentBox = $('.eng-content-box').length > 0 ? $('.eng-content-box') : $('body');

   // Extract sections by their title
   const sections = new Map<string, string>();
   contentBox.find('.section-title').each((_, el) => {
      const title = $(el).text().trim();
      const textEl = $(el).next('.section-text');
      if (textEl.length > 0) {
         sections.set(title, extractText(textEl, $));
      }
   });

   // Parse highlights sub-sections
   const highlights: LotHighlights = {
      seizeAllOpportunities: '',
      detailsAndActions: '',
      workWithPeople: '',
      ownYourFate: '',
   };

   const highlightsSection = contentBox
      .find('.section-title')
      .filter((_, el) => $(el).text().trim() === 'Highlights')
      .next('.section-text');

   if (highlightsSection.length > 0) {
      // Split by highlight-sub divs
      const subSectionMap: Record<string, keyof LotHighlights> = {
         'Seize All Opportunities': 'seizeAllOpportunities',
         'Details and Actions': 'detailsAndActions',
         'Work with People': 'workWithPeople',
         'Own Your Fate': 'ownYourFate',
      };

      highlightsSection.find('.highlight-sub').each((_, el) => {
         const subTitle = $(el).text().trim();
         const key = subSectionMap[subTitle];
         if (key) {
            // Get all text nodes after this sub-title until the next sub-title
            let content = '';
            let sibling = $(el).get(0)?.nextSibling;
            while (sibling) {
               if (sibling.type === 'tag' && (sibling as Element).attribs?.class === 'highlight-sub') {
                  break; // Stop at the next sub-section
               }
               if (sibling.type === 'text') {
                  content += (sibling as Text).data || '';
               } else if (sibling.type === 'tag') {
                  const tagName = (sibling as Element).tagName?.toLowerCase();
                  if (tagName === 'br') {
                     content += '\n';
                  } else {
                     content += $(sibling).text();
                  }
               }
               sibling = sibling.nextSibling;
            }
            highlights[key] = cleanText(content);
         }
      });
   }

   // Parse applications into key-value pairs
   const applications: LotApplications = {};
   const applicationsText = sections.get('Applications') || '';
   if (applicationsText) {
      // Split by double-newline or by pattern "Topic: description"
      const lines = applicationsText.split(/\n{2,}/);
      for (const line of lines) {
         const trimmed = line.trim();
         if (!trimmed) continue;

         // Match pattern like "Future: someone will come to help."
         const match = trimmed.match(/^([^:]+):\s*(.+)$/s);
         if (match) {
            applications[match[1].trim()] = cleanText(match[2]);
         }
      }
   }

   return {
      drawNo,
      originalExplanation: sections.get('Original Explanation') || '',
      updatedExplanation: sections.get('Updated Explanation') || '',
      hexagram: sections.get('Hexagram') || '',
      pictureExplanation: sections.get('Picture Explanation') || '',
      implications: sections.get('Implications') || '',
      matsusWords: sections.get('Matsu\u2019s Words') || sections.get("Matsu's Words") || '',
      highlights,
      applications,
      lastReminders: sections.get('Last Reminders') || '',
   };
}

function extractImageUrls(html: string): { illustration: string | null; hexagramImage: string | null } {
   const $ = cheerio.load(html);
   const images: string[] = [];

   // Find all images in the content area
   const contentBox = $('.eng-content-box').length > 0 ? $('.eng-content-box') : $('body');
   contentBox.find('img.img-responsive, img[src*="lotpic"]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) images.push(src);
   });

   return {
      illustration: images.find((src) => src.match(/lotpic\/p\d+\./i)) || null,
      hexagramImage: images.find((src) => src.match(/lotpic\/\d+\./i) && !src.match(/lotpic\/p\d+\./i)) || null,
   };
}

// ─── Main Crawl Logic ────────────────────────────────────────────────────────

async function crawlLot(drawNo: number, downloadImages: boolean): Promise<LotData> {
   const url = DETAIL_URL(drawNo);
   console.log(`  📖 Fetching lot #${drawNo}: ${url}`);

   const html = await fetchPage(url);
   const data = parseLotDetailPage(html, drawNo);
   const imageUrls = extractImageUrls(html);

   const images: LotData['images'] = {
      illustration: null,
      hexagramImage: null,
   };

   if (downloadImages) {
      // Download illustration image (e.g., lotpic/p1.jpg)
      if (imageUrls.illustration) {
         const fullUrl = `${BASE_URL}/${imageUrls.illustration}`;
         const ext = path.extname(imageUrls.illustration);
         const destPath = path.join(IMAGES_DIR, `lot-${drawNo}-illustration${ext}`);
         const success = await downloadImage(fullUrl, destPath);
         if (success) {
            images.illustration = `images/lot-${drawNo}-illustration${ext}`;
            console.log(`    ✅ Downloaded illustration`);
         }
      }

      // Download hexagram image (e.g., lotpic/1.png)
      if (imageUrls.hexagramImage) {
         const fullUrl = `${BASE_URL}/${imageUrls.hexagramImage}`;
         const ext = path.extname(imageUrls.hexagramImage);
         const destPath = path.join(IMAGES_DIR, `lot-${drawNo}-hexagram${ext}`);
         const success = await downloadImage(fullUrl, destPath);
         if (success) {
            images.hexagramImage = `images/lot-${drawNo}-hexagram${ext}`;
            console.log(`    ✅ Downloaded hexagram image`);
         }
      }
   }

   return { ...data, images };
}

async function crawlAll(options: { from: number; to: number; delay: number; downloadImages: boolean }): Promise<void> {
   const { from, to, delay, downloadImages } = options;

   console.log(`\n🚀 Starting crawl: lots #${from} to #${to}`);
   console.log(`   Delay: ${delay}ms | Images: ${downloadImages ? 'yes' : 'no'}`);
   console.log(`   Output: ${OUTPUT_FILE}\n`);

   // Ensure output directories exist
   fs.mkdirSync(OUTPUT_DIR, { recursive: true });
   if (downloadImages) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
   }

   // Load existing data if resuming
   let existingData: LotData[] = [];
   if (fs.existsSync(OUTPUT_FILE)) {
      try {
         existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
         console.log(`📂 Loaded ${existingData.length} existing lots from output file\n`);
      } catch {
         console.log(`📂 Starting fresh (could not parse existing file)\n`);
      }
   }

   const results: LotData[] = [...existingData];
   let successCount = 0;
   let failCount = 0;

   for (let i = from; i <= to; i++) {
      // Skip if already crawled
      if (results.find((r) => r.drawNo === i)) {
         console.log(`  ⏭ Lot #${i} already exists, skipping`);
         continue;
      }

      try {
         const lotData = await crawlLot(i, downloadImages);
         results.push(lotData);
         successCount++;

         // Save incrementally (in case of interruption)
         results.sort((a, b) => a.drawNo - b.drawNo);
         fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
         console.log(`  ✅ Lot #${i} saved (${successCount}/${to - from + 1})\n`);
      } catch (error) {
         failCount++;
         console.error(`  ❌ Failed to crawl lot #${i}:`, error instanceof Error ? error.message : error);
         console.log('');
      }

      // Polite delay between requests
      if (i < to) {
         await sleep(delay);
      }
   }

   console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
   console.log(`✅ Crawl complete!`);
   console.log(`   Success: ${successCount} | Failed: ${failCount}`);
   console.log(`   Total lots in file: ${results.length}`);
   console.log(`   Output: ${OUTPUT_FILE}`);
   if (downloadImages) {
      console.log(`   Images: ${IMAGES_DIR}`);
   }
   console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const program = new Command();

program.name('mining').description('Crawl fortune lot data from ydm.com.tw').version('1.0.0');

program
   .command('crawl')
   .description('Crawl English lot detail pages and save as JSON')
   .option('--from <number>', 'Start lot number', '1')
   .option('--to <number>', 'End lot number', String(TOTAL_LOTS))
   .option('--delay <ms>', 'Delay between requests in ms', '1500')
   .option('--no-images', 'Skip downloading images')
   .action(async (opts) => {
      const from = parseInt(opts.from, 10);
      const to = parseInt(opts.to, 10);
      const delay = parseInt(opts.delay, 10);
      const downloadImages = opts.images !== false;

      if (from < 1 || to > TOTAL_LOTS || from > to) {
         console.error(`❌ Invalid range: --from ${from} --to ${to} (must be 1-${TOTAL_LOTS})`);
         process.exit(1);
      }

      await crawlAll({ from, to, delay, downloadImages });
   });

// ─── Application Key → Category Mapping ─────────────────────────────────────

const STORAGE_BUCKET = 'fortune_data';
const STORAGE_FOLDER = 'fortune_telling';

type FortuneTellingCategory = 'family_friends' | 'money' | 'love' | 'career' | 'health';

const APPLICATION_CATEGORY_MAP: Record<string, FortuneTellingCategory> = {
   // family_friends
   Family: 'family_friends',
   Network: 'family_friends',
   'Asking About Others': 'family_friends',
   'Lost Individual': 'family_friends',
   'Asking About Things': 'family_friends',
   // money
   Wealth: 'money',
   Business: 'money',
   Farming: 'money',
   Employing: 'money',
   'Lost Items': 'money',
   House: 'money',
   Lawsuits: 'money',
   // love
   Marriage: 'love',
   Relationship: 'love',
   Pregnancy: 'love',
   'Not pregnant yet': 'love',
   // career
   Future: 'career',
   Career: 'career',
   'Job Search': 'career',
   Exam: 'career',
   Education: 'career',
   Direction: 'career',
   Time: 'career',
   'Changing Name': 'career',
   Immigration: 'career',
   // health
   Health: 'health',
   Illness: 'health',
   Traveling: 'health',
   Grave: 'health',
};

function categorizeApplications(applications: LotApplications): Record<FortuneTellingCategory, string[]> {
   const categorized: Record<FortuneTellingCategory, string[]> = {
      family_friends: [],
      money: [],
      love: [],
      career: [],
      health: [],
   };

   for (const [key, value] of Object.entries(applications)) {
      const category = APPLICATION_CATEGORY_MAP[key];
      if (category) {
         categorized[category].push(`${key}: ${value}`);
      }
   }

   return categorized;
}

// ─── Upload to Supabase ──────────────────────────────────────────────────────

async function uploadToSupabase(): Promise<void> {
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
   const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

   if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
      process.exit(1);
   }

   // Load crawled data
   if (!fs.existsSync(OUTPUT_FILE)) {
      console.error('❌ No crawled data found. Run "crawl" first.');
      process.exit(1);
   }

   const lots: LotData[] = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
   console.log(`\n📤 Uploading ${lots.length} lots to Supabase...\n`);

   const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
   console.log('🔐 Using service role key (bypasses RLS)\n');

   let successCount = 0;
   let failCount = 0;

   for (const lot of lots) {
      console.log(`  📦 Processing lot #${lot.drawNo}...`);

      let illustrationUrl: string | null = null;
      let hexagramImageUrl: string | null = null;

      // Upload illustration image
      if (lot.images.illustration) {
         const localPath = path.join(OUTPUT_DIR, lot.images.illustration);
         if (fs.existsSync(localPath)) {
            const fileBuffer = fs.readFileSync(localPath);
            const ext = path.extname(localPath);
            const storagePath = `${STORAGE_FOLDER}/lot-${lot.drawNo}-illustration${ext}`;
            const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

            const { error } = await supabase.storage
               .from(STORAGE_BUCKET)
               .upload(storagePath, fileBuffer, { contentType, upsert: true });

            if (error) {
               console.warn(`    ⚠ Failed to upload illustration: ${error.message}`);
            } else {
               const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
               illustrationUrl = urlData.publicUrl;
               console.log(`    ✅ Uploaded illustration`);
            }
         }
      }

      // Upload hexagram image
      if (lot.images.hexagramImage) {
         const localPath = path.join(OUTPUT_DIR, lot.images.hexagramImage);
         if (fs.existsSync(localPath)) {
            const fileBuffer = fs.readFileSync(localPath);
            const ext = path.extname(localPath);
            const storagePath = `${STORAGE_FOLDER}/lot-${lot.drawNo}-hexagram${ext}`;
            const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

            const { error } = await supabase.storage
               .from(STORAGE_BUCKET)
               .upload(storagePath, fileBuffer, { contentType, upsert: true });

            if (error) {
               console.warn(`    ⚠ Failed to upload hexagram image: ${error.message}`);
            } else {
               const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
               hexagramImageUrl = urlData.publicUrl;
               console.log(`    ✅ Uploaded hexagram image`);
            }
         }
      }

      // Categorize applications
      const categorizedApps = categorizeApplications(lot.applications);

      // Random value -100 - +100
      const value = Math.floor(Math.random() * 201) - 100;

      // Upsert row
      const { error: dbError } = await supabase.from('fortune_telling').upsert(
         {
            draw_no: lot.drawNo,
            locale: 'en',
            value,
            original_explanation: lot.originalExplanation,
            updated_explanation: lot.updatedExplanation,
            hexagram: lot.hexagram,
            picture_explanation: lot.pictureExplanation,
            implications: lot.implications,
            matsus_words: lot.matsusWords,
            highlights: lot.highlights,
            applications: categorizedApps,
            last_reminders: lot.lastReminders,
            illustration_url: illustrationUrl,
            hexagram_image_url: hexagramImageUrl,
         },
         { onConflict: 'draw_no,locale' },
      );

      if (dbError) {
         failCount++;
         console.error(`    ❌ DB insert failed for lot #${lot.drawNo}: ${dbError.message}`);
      } else {
         successCount++;
         console.log(`    ✅ Lot #${lot.drawNo} inserted (value: ${value})\n`);
      }
   }

   console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
   console.log(`✅ Upload complete!`);
   console.log(`   Success: ${successCount} | Failed: ${failCount}`);
   console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

program
   .command('upload')
   .description('Upload crawled lot data and images to Supabase')
   .action(async () => {
      await uploadToSupabase();
   });

program.parse();
