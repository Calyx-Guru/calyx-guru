import { LanguageSelector } from '@/components/LanguageSelector';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FORTUNE_POEMS_STORAGE_FOLDER,
  MASTER_DATA_MANIFEST_FILE_NAME,
  STORAGE_BUCKET,
} from '@/constants';
import { MasterDataContext } from '@/contexts/MasterDataContext';
import { usePageState } from '@/hooks/usePageState';
import supabase from '@/lib/supabase/client';
import { languageKeyToLabel } from '@/lib/utils';
import type { FortunePoemContentType, LanguageKey } from '@/types';
import Handsontable from 'handsontable';
import {
  AlertCircle,
  ArrowUpWideNarrow,
  Loader2,
  Plus,
  RefreshCcwDotIcon,
  Save,
} from 'lucide-react';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const PAGE_STATE_PREFIX = 'fortunePoems';

interface FortunePoemsPageState {
  selectedLanguage: LanguageKey;
}

function makeFilePath(language: LanguageKey, version: number) {
  return `${FORTUNE_POEMS_STORAGE_FOLDER}/${language}-${version}.json`;
}

export function FortunePoemsPage() {
  const hotTableRef = useRef(null);
  const hotInstanceRef = useRef<any>(null);
  const {
    manifest,
    refetch: refetchManifest,
    setManifest,
  } = useContext(MasterDataContext);

  const [poems, setPoems] = useState<FortunePoemContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableUpdateTimestamp, setTableUpdateTimestamp] = useState(0);

  const [pageState, setPageState] = usePageState<FortunePoemsPageState>(
    PAGE_STATE_PREFIX,
    { selectedLanguage: 'en' },
  );

  const updatePageState = useCallback(
    (updates: Partial<FortunePoemsPageState>) => {
      setTableUpdateTimestamp(Date.now());
      setPageState((prev) => ({ ...prev, ...updates }));
    },
    [setPageState],
  );

  // Load poems when language changes
  useEffect(() => {
    if (manifest) {
      loadPoems(pageState.selectedLanguage);
    } else {
      setLoading(true);
    }
  }, [pageState.selectedLanguage, manifest]);

  const loadPoems = async (language: LanguageKey) => {
    try {
      if (!manifest) {
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      const version = manifest.fortunePoems.languages[language] || 1;
      const fileName = makeFilePath(language, version);

      const { data, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(fileName);

      if (
        downloadError &&
        downloadError.message !== 'Not found' &&
        downloadError.message !== '{}'
      ) {
        throw downloadError;
      }

      if (data) {
        const text = await data.text();
        const poemsData = JSON.parse(text);
        setTableUpdateTimestamp(Date.now());
        setPoems(Array.isArray(poemsData) ? poemsData : []);
      } else {
        // File not found, start with empty array
        setTableUpdateTimestamp(Date.now());
        setPoems([]);
      }
    } catch (err: any) {
      // Only show real errors, not "file not found"
      if (err.message && !err.message.includes('Not found')) {
        setError(`Failed to load poems: ${err.message}`);
      }
      setTableUpdateTimestamp(Date.now());
      setPoems([]);
    } finally {
      setLoading(false);
    }
  };

  const versionUpPoems = async () => {
    try {
      if (!manifest) return;

      setLoading(true);

      // Update manifest
      const updatedManifest = {
        ...manifest,
        fortunePoems: {
          lastUpdated: new Date().toISOString(),
          languages: {
            ...manifest.fortunePoems.languages,
            [pageState.selectedLanguage]:
              (manifest.fortunePoems.languages[pageState.selectedLanguage] ||
                0) + 1,
          },
        },
      };

      const version =
        updatedManifest.fortunePoems.languages[pageState.selectedLanguage] || 1;
      const fileName = makeFilePath(pageState.selectedLanguage, version);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(poems, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;

      setManifest(updatedManifest);

      const { error: manifestError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(
          MASTER_DATA_MANIFEST_FILE_NAME,
          JSON.stringify(updatedManifest, null, 2),
          {
            upsert: true,
            contentType: 'application/json',
          },
        );

      if (manifestError) throw manifestError;
    } catch (err: any) {
      setError(`Failed to save poems: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const savePoems = async () => {
    try {
      if (!manifest) return;

      setLoading(true);

      const version =
        manifest.fortunePoems.languages[pageState.selectedLanguage] || 1;
      const fileName = makeFilePath(pageState.selectedLanguage, version);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(poems, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;
    } catch (err: any) {
      setError(`Failed to save poems: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    const newPoem: FortunePoemContentType = {
      drawNo: String(poems.length + 1),
      language: pageState.selectedLanguage,
      fortuneTellingPoem: '',
      poetry: '',
      insights: '',
      divineWill: '',
      allusion: '',
    };
    setTableUpdateTimestamp(Date.now());
    setPoems([...poems, newPoem]);
  };

  const handleTableChange = (_changes: any, _source: any) => {
    if (!hotInstanceRef.current) return;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return;

    const updatedPoems = data.map((row: any[]) => ({
      drawNo: row[0] ?? '',
      fortuneTellingPoem: row[1] ?? '',
      poetry: row[2] ?? '',
      insights: row[3] ?? '',
      divineWill: row[4] ?? '',
      allusion: row[5] ?? '',
      language: pageState.selectedLanguage,
    }));
    setPoems(updatedPoems);
  };

  const handleTableRemoveRow = (index: number, amount: number) => {
    if (!hotInstanceRef.current) return;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return;

    const updatedPoems = data.map((row: any[]) => ({
      drawNo: row[0] ?? 0,
      fortuneTellingPoem: row[1] ?? '',
      poetry: row[2] ?? '',
      insights: row[3] ?? '',
      divineWill: row[4] ?? '',
      allusion: row[5] ?? '',
      language: pageState.selectedLanguage,
    }));
    setPoems(updatedPoems);
  };

  // Initialize Handsontable on mount
  useEffect(() => {
    refetchManifest();

    if (!hotTableRef.current) return;

    const container = hotTableRef.current as HTMLElement;

    // Initialize Handsontable only once
    const initTable = () => {
      try {
        // Check if instance exists, if so destroy it first
        if (hotInstanceRef.current) {
          hotInstanceRef.current.destroy();
        }

        const instance = new Handsontable(container, {
          data: [],
          colHeaders: [
            'Draw No',
            'Fortune Telling Poem',
            'Poetry',
            'Insights',
            'Divine Will',
            'Allusion',
          ],
          rowHeaders: true,
          height: '100%',
          columns: [
            { type: 'text', width: 80 },
            { type: 'text', width: 240 },
            { type: 'text', width: 160 },
            { type: 'text', width: 160 },
            { type: 'text', width: 160 },
            { type: 'text', width: 480 },
          ],
          contextMenu: {
            items: {
              row_above: { name: 'Insert row above' },
              row_below: { name: 'Insert row below' },
              hsep1: '---------',
              remove_row: { name: 'Delete row' },
              hsep2: '---------',
              copy: { name: 'Copy' },
              paste: { name: 'Paste' },
            },
          },
          afterChange: handleTableChange,
          afterRemoveRow: handleTableRemoveRow,
          licenseKey: 'non-commercial-and-evaluation',
          stretchH: 'all',
          manualColumnResize: true,
          themeName: 'ht-theme-main',
        });

        hotInstanceRef.current = instance;
      } catch (err) {
        console.error('Failed to initialize Handsontable:', err);
      }
    };

    initTable();

    return () => {
      if (hotInstanceRef.current) {
        hotInstanceRef.current.destroy();
        hotInstanceRef.current = null;
      }
    };
  }, []);

  // Update table data when poems or language changes
  useEffect(() => {
    if (!hotInstanceRef.current) return;

    const tableData = poems.map((poem) => [
      poem.drawNo,
      poem.fortuneTellingPoem,
      poem.poetry,
      poem.insights,
      poem.divineWill,
      poem.allusion,
    ]);

    hotInstanceRef.current.loadData(tableData);
  }, [tableUpdateTimestamp]);

  const headerContent = useMemo(
    () => (
      <LanguageSelector
        value={pageState.selectedLanguage}
        onValueChange={(value) => {
          setTableUpdateTimestamp(Date.now());
          updatePageState({ selectedLanguage: value as LanguageKey });
        }}
        disabled={loading}
      />
    ),
    [loading],
  );

  return (
    <DashboardLayout title="Fortune Poems" headerContent={headerContent}>
      <div className="flex flex-col gap-6 h-full">
        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-3 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Grid Editor */}
        <Card className="flex flex-col flex-1 min-h-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {languageKeyToLabel(pageState.selectedLanguage)}
                </CardTitle>
                <CardDescription>
                  Version:{' '}
                  {manifest?.fortunePoems.languages[
                    pageState.selectedLanguage
                  ] || 1}
                  {!loading && <span> ({poems.length} poems)</span>}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => loadPoems(pageState.selectedLanguage)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <RefreshCcwDotIcon className="mr-2 h-4 w-4" />
                    </>
                  )}
                  Reload
                </Button>
                <Button onClick={versionUpPoems} disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
                    </>
                  )}
                  Version Up
                </Button>
                <Button
                  onClick={addRow}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </Button>
                <Button onClick={savePoems} disabled={loading} size="sm">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                    </>
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {loading && poems.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && poems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No poems yet for {pageState.selectedLanguage.toUpperCase()}
                </p>
                <Button onClick={addRow} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Poem
                </Button>
              </div>
            )}

            <div className="flex-1 min-h-0">
              <div
                ref={hotTableRef}
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                  display: loading || poems.length === 0 ? 'none' : 'block',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
