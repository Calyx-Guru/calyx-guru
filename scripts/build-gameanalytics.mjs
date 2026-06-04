/**
 * Merges GA-SDK-JAVASCRIPT TypeScript sources into src/lib/gameanalytics.ts
 * with React Native / Expo adaptations.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'lib', 'gameanalytics.ts');
const SDK = process.env.GA_SDK_ROOT || 'd:/Downloads/GA-SDK-JAVASCRIPT-master';

const FILES = [
  'src/Enums.ts',
  'src/logging/GALogger.ts',
  'src/utilities/GAUtilities.ts',
  'src/validators/GAValidator.ts',
  'src/device/GADevice.ts',
  'src/store/GAStore.ts',
  'src/state/GAState.ts',
  'src/tasks/SdkErrorTask.ts',
  'src/http/GAHTTPApi.ts',
  'src/events/GAEvents.ts',
];

const FILES_AFTER_THREADING = ['src/GameAnalytics.ts'];

function stripExportModule(inner, exportModuleName) {
  const marker = `export module ${exportModuleName}`;
  const start = inner.indexOf(marker);
  if (start === -1) {
    return inner.trim();
  }
  let depth = 0;
  let i = inner.indexOf('{', start);
  const contentStart = i + 1;
  for (; i < inner.length; i++) {
    if (inner[i] === '{') depth++;
    if (inner[i] === '}') {
      depth--;
      if (depth === 0) return inner.slice(contentStart, i).trim();
    }
  }
  throw new Error(`Unbalanced braces in export module ${exportModuleName}`);
}

/** Single threading module — avoids Metro splitting duplicate `export module threading` IIFEs. */
const THREADING_BODY = [
  stripExportModule(stripModuleWrapper(read('src/threading/TimedBlock.ts')), 'threading'),
  stripExportModule(stripModuleWrapper(read('src/threading/PriorityQueue.ts')), 'threading'),
  stripExportModule(stripModuleWrapper(read('src/threading/GAThreading.ts')), 'threading'),
].join('\n\n');

function read(p) {
  return fs.readFileSync(path.join(SDK, p), 'utf8');
}

function stripModuleWrapper(src, moduleName = 'gameanalytics') {
  let s = src.trim();
  s = s.replace(/^\/\/GALOGGER_START\r?\n/, '');
  s = s.replace(/\r?\n\/\/GALOGGER_END\r?\n?$/, '');
  const marker = `module ${moduleName}`;
  const start = s.indexOf(marker);
  if (start === -1) {
    throw new Error(`Expected ${marker} wrapper in chunk`);
  }
  let depth = 0;
  let i = s.indexOf('{', start);
  const contentStart = i + 1;
  for (; i < s.length; i++) {
    if (s[i] === '{') depth++;
    if (s[i] === '}') {
      depth--;
      if (depth === 0) return s.slice(contentStart, i).trim();
    }
  }
  throw new Error(`Unbalanced braces in ${moduleName}`);
}

const hmac = read('vendor/hmac-sha256-min.js');
const base64 = read('vendor/enc-base64-min.js');

let body = '';
for (const f of FILES) {
  body += '\n' + stripModuleWrapper(read(f)) + '\n';
}
body += `\nexport module threading\n    {\n${THREADING_BODY}\n    }\n`;
for (const f of FILES_AFTER_THREADING) {
  body += '\n' + stripModuleWrapper(read(f)) + '\n';
}

body = body
  .replace(
    /return \("10000000-1000-4000-8000-100000000000"\)\.replace\(\/\[018\]\/g, c => \(\+c \^ crypto\.getRandomValues\(new Uint8Array\(1\)\)\[0\] & 15 >> \+c \/ 4\)\.toString\(16\)\);/,
    `return ("10000000-1000-4000-8000-100000000000").replace(/[018]/g, (c) =>
                    (+c ^ (gaRandomByte() & 15) >> (+c / 4)).toString(16),
                );`,
  )
  .replace(
    /navigator\.platform,\s*\n\s*navigator\.userAgent,\s*\n\s*navigator\.appVersion,\s*\n\s*navigator\.vendor/g,
    `gaNavigator.platform,\n                gaNavigator.userAgent,\n                gaNavigator.appVersion,\n                gaNavigator.vendor`,
  )
  .replace(/navigator\.onLine/g, 'gaNavigator.onLine')
  .replace(/navigator\.userAgent/g, 'gaNavigator.userAgent')
  .replace(/\[navigator\.appName, navigator\.appVersion/g, '[gaNavigator.appName, gaNavigator.appVersion')
  .replace(
    /private constructor\(\)\s*\{\s*try\s*\{[\s\S]*?GALogger\.d\("Storage is available\?: " \+ GAStore\.storageAvailable\);\s*\}/,
    `private constructor()
            {
                try
                {
                    GAStore.storageAvailable = gaStorage.isAvailable();
                }
                catch (e)
                {
                    GAStore.storageAvailable = false;
                }

                GALogger.d("Storage is available?: " + GAStore.storageAvailable);
            }`,
  )
  .replace(/localStorage\.setItem\(/g, 'gaStorage.setItem(')
  .replace(/localStorage\.getItem\(/g, 'gaStorage.getItem(')
  .replace(/localStorage\.removeItem\(/g, 'gaStorage.removeItem(')
  .replace(
    `GAStore.instance.progressionStore = [];`,
    `GAStore.instance.storeItems = {};`,
  )
  .replace(
    /window\.addEventListener\("beforeunload",[\s\S]*?\}\);/,
    '// beforeunload: call onGameAnalyticsBeforeUnload() from the app',
  )
  .replace(
    /timedBlock\.block = \(\) =>\s*\{\s*if \(GameAnalytics\.isSdkReady\(true, false\)\)/,
    `timedBlock.block = () => {
                void gaStorage.hydrate(gameKey).then(() => {
                if (GameAnalytics.isSdkReady(true, false))`,
  )
  .replace(
    /GameAnalytics\.internalInitialize\(\);\s*\};\s*\n\s*GAThreading\.performTimedBlockOnGAThread\(timedBlock\);\s*\}/,
    `GameAnalytics.internalInitialize();
                });
            };

            GAThreading.performTimedBlockOnGAThread(timedBlock);
        }`,
  )
  .replace(/gameanalytics\.GameAnalytics\.init\(\);\s*\nvar GameAnalytics = gameanalytics\.GameAnalytics\.gaCommand;?\s*$/, '')
  .replace(
    /formatted = formatted\.replace\(regexp, arguments\[i\]\)/,
    'formatted = formatted.replace(regexp, args[i])',
  )
  .replace(
    /if\(!key \|\| !value\)/,
    'if(!key || value === null || value === undefined)',
  );

const header = `// @ts-nocheck
/**
 * GameAnalytics JavaScript SDK — React Native / Expo port (based on SDK 4.4.6).
 * Call \`onGameAnalyticsBeforeUnload()\` when the app backgrounds or closes.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { storage } from './storage';

/* CryptoJS subset (HMAC-SHA256 + Base64) — from GA-SDK vendor */
${hmac}
${base64}

function gaRandomByte(): number {
  return Math.floor(Math.random() * 256);
}

const gaNavigator = (() => {
  const os = Platform.OS;
  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '1.0.0';
  const appName =
    Application.applicationName ?? Constants.expoConfig?.name ?? 'app';
  let platform = 'unknown';
  let userAgent = \`Expo ReactNative/\${os} \${version}\`;

  if (os === 'ios') {
    platform = 'iPhone';
    userAgent = \`Mozilla/5.0 (iPhone; CPU iPhone OS \${Platform.Version}_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/\${version} \${appName}\`;
  } else if (os === 'android') {
    platform = 'Linux';
    userAgent = \`Mozilla/5.0 (Linux; Android \${Platform.Version}) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/0.0.0.0 Mobile Safari/537.36 \${appName}/\${version}\`;
  } else if (os === 'web') {
    platform = typeof navigator !== 'undefined' ? navigator.platform : 'web';
    userAgent =
      typeof navigator !== 'undefined'
        ? navigator.userAgent
        : userAgent;
  }

  return {
    platform,
    userAgent,
    appVersion: version,
    appName,
    vendor: 'ReactNative',
    onLine: true,
  };
})();

const gaStorage = (() => {
  const memory = new Map<string, string>();
  let hydratedGameKey: string | null = null;
  const hydratePromises = new Map<string, Promise<void>>();

  const formatKey = (gameKey: string, key: string) => \`GA::\${gameKey}::\${key}\`;

  /** SecureStore only allows [a-zA-Z0-9._-]; GA keys use \`::\` separators. */
  const toPersistedKey = (logicalKey: string) =>
    logicalKey.replace(/::/g, '__').replace(/[^a-zA-Z0-9._-]/g, '_');

  const storeKeys = ['ga_event', 'ga_session', 'ga_progression', 'ga_items'] as const;

  return {
    isAvailable(): boolean {
      return true;
    },
    getItem(key: string): string | null {
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      memory.set(key, value);
      void storage.setItem(toPersistedKey(key), value);
    },
    removeItem(key: string): void {
      memory.delete(key);
      void storage.removeItem(toPersistedKey(key));
    },
    async hydrate(gameKey: string): Promise<void> {
      if (hydratedGameKey === gameKey) return;
      const existing = hydratePromises.get(gameKey);
      if (existing) return existing;

      const p = (async () => {
        for (const suffix of storeKeys) {
          const key = formatKey(gameKey, suffix);
          const v = await storage.getItem(toPersistedKey(key));
          if (v != null) memory.set(key, v);
        }
        hydratedGameKey = gameKey;
      })();

      hydratePromises.set(gameKey, p);
      await p;
    },
  };
})();

export function onGameAnalyticsBeforeUnload(): void {
  gameanalytics.state.GAState.instance.isUnloading = true;
  gameanalytics.state.GAState.notifyBeforeUnloadListeners();
  gameanalytics.threading.GAThreading.endSessionAndStopQueue();
  gameanalytics.state.GAState.instance.isUnloading = false;
}

export function setGameAnalyticsUserId(userId: string): void {
  gameanalytics.state.GAState.setUserId(userId);
}

export function isGameAnalyticsReady(): boolean {
  const state = gameanalytics.state.GAState;
  return (
    state.isInitialized() && state.isEnabled() && state.sessionIsStarted()
  );
}

namespace gameanalytics {
${body}
}

export const GameAnalytics = gameanalytics.GameAnalytics;
export default GameAnalytics;

export const EGAErrorSeverity = gameanalytics.EGAErrorSeverity;
export const EGAProgressionStatus = gameanalytics.EGAProgressionStatus;
export const EGAResourceFlowType = gameanalytics.EGAResourceFlowType;
export const EGAAdAction = gameanalytics.EGAAdAction;
export const EGAAdError = gameanalytics.EGAAdError;
export const EGAAdType = gameanalytics.EGAAdType;

gameanalytics.GameAnalytics.init();
`;

fs.writeFileSync(OUT, header, 'utf8');
console.log('Wrote', OUT);
