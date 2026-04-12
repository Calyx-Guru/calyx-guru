import { KaucimConcernSelector } from '@/components/KaucimConcernSelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TableLayout } from '@/components/layout/TableLayout';
import { Button } from '@/components/ui/button';
import { DEFAULT_HANDSON_TABLE_OPTIONS, KAUCIM_STORIES_STORAGE_FOLDER, STORAGE_BUCKET } from '@/constants';
import { MasterDataContext } from '@/contexts/MasterDataContext';
import { usePageState } from '@/hooks/usePageState';
import {
  mergeColumnWidths,
  textColumnsFromWidths,
} from '@/lib/handsontableColumnWidths';
import supabase from '@/lib/supabase/client';
import { languageKeyToLabel } from '@/lib/utils';
import { KAUCIM_CONCERNS, type LanguageKey } from '@/types';
import type { KaucimStoryLineType } from '@/types/KaucimStories';
import type { MasterDataManifest } from '@/types/MasterDataManifest';
import Handsontable from 'handsontable';
import { Plus } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const PAGE_STATE_PREFIX = 'kaucimStories';

function makeFilePath(concern: KAUCIM_CONCERNS, language: LanguageKey, version: number) {
  return `${KAUCIM_STORIES_STORAGE_FOLDER}/${concern}-${language}-${version}.json`;
}

const KAUCIM_STORIES_DEFAULT_COLUMN_WIDTHS = [
  80, 80, 240, 480, 480, 480, 480,
] as const;

interface KaucimStoriesPageState {
  selectedLanguage: LanguageKey;
  selectedConcern: KAUCIM_CONCERNS;
  /** Persisted Handsontable column widths (px), same order as columns */
  columnWidths?: number[];
}

export function KaucimStoriesPage() {
  const hotTableRef = useRef(null);
  const hotInstanceRef = useRef<any>(null);
  const [pageState, setPageState] = usePageState<KaucimStoriesPageState>(
    PAGE_STATE_PREFIX,
    {
      selectedLanguage: 'en',
      selectedConcern: KAUCIM_CONCERNS.LOVE,
    },
  );
  const {
    manifest,
    refetch: refetchManifest,
    updateManifest,
  } = useContext(MasterDataContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableUpdateTimestamp, setTableUpdateTimestamp] = useState(0);
  const [storyLines, setStoryLines] = useState<KaucimStoryLineType[]>([]);

  // -- Page state management --
  const updatePageState = useCallback(
    (updates: Partial<KaucimStoriesPageState>) => {
      setTableUpdateTimestamp(Date.now());
      setPageState((prev) => ({ ...prev, ...updates }));
    },
    [setPageState],
  );

  // -- Inline components --
  const headerContent = useMemo(
    () => (
      <div className="flex flex-row gap-2">
        <LanguageSelector
          value={pageState.selectedLanguage}
          onValueChange={(value) => {
            setTableUpdateTimestamp(Date.now());
            updatePageState({ selectedLanguage: value as LanguageKey });
          }}
          disabled={loading}
        />
        <KaucimConcernSelector
          value={pageState.selectedConcern}
          onValueChange={(value) => {
            setTableUpdateTimestamp(Date.now());
            updatePageState({ selectedConcern: value as KAUCIM_CONCERNS });
          }}
          disabled={loading}
        />
      </div>
    ),
    [loading],
  );

  // -- Effects --

  // Load stories when language or concern changes
  useEffect(() => {
    if (manifest) {
      loadStories(pageState.selectedConcern, pageState.selectedLanguage);
    } else {
      setLoading(true);
    }
  }, [pageState.selectedLanguage, pageState.selectedConcern, manifest]);

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

        const colWidths = mergeColumnWidths(
          KAUCIM_STORIES_DEFAULT_COLUMN_WIDTHS,
          pageState.columnWidths,
        );

        const instance = new Handsontable(container, {
          ...DEFAULT_HANDSON_TABLE_OPTIONS,
          stretchH: 'none',
          data: [],
          colHeaders: [
            'No.',
            'Level',
            'Title',
            'Verdict',
            'Omen',
            'Action',
            'Conclusion',
          ],
          columns: textColumnsFromWidths(colWidths),
          afterColumnResize: (newSize, column) => {
            setPageState((prev) => {
              const merged = mergeColumnWidths(
                KAUCIM_STORIES_DEFAULT_COLUMN_WIDTHS,
                prev.columnWidths,
              );
              merged[column] = newSize;
              return { ...prev, columnWidths: merged };
            });
          },
          afterChange: handleTableChange,
          afterRemoveRow: handleTableRemoveRow,
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- mount-only init; column widths from persisted pageState on first paint

  // Update table data when poems or language changes
  useEffect(() => {
    if (!hotInstanceRef.current) return;

    const tableData = storyLines.map((item) => [
      item.stickNumber,
      item.fortuneLevel,
      item.title,
      item.verdict,
      item.omen,
      item.action,
      item.conclusion,
    ]);

    hotInstanceRef.current.loadData(tableData);
  }, [tableUpdateTimestamp]);

  // -- Data loader --
  const loadStories = async (concern: KAUCIM_CONCERNS, language: LanguageKey) => {
    try {
      if (!manifest) {
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      const version = manifest.kaucimStories?.[concern]?.[language] || 1;
      const fileName = makeFilePath(concern, language, version);

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
        const storyLines = JSON.parse(text);
        setTableUpdateTimestamp(Date.now());
        setStoryLines(Array.isArray(storyLines) ? storyLines as KaucimStoryLineType[] : []);
      } else {
        // File not found, start with empty array
        setTableUpdateTimestamp(Date.now());
        setStoryLines([]);
      }
    } catch (err: any) {
      // Only show real errors, not "file not found"
      if (err.message && !err.message.includes('Not found')) {
        setError(`Failed to load stories: ${err.message}`);
      }
      setTableUpdateTimestamp(Date.now());
      setStoryLines([]);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    const newStoryLine: KaucimStoryLineType = {
      stickNumber: storyLines.length + 1,
      fortuneLevel: 3,
      title: '',
      verdict: '',
      omen: '',
      action: '',
      conclusion: '',
    };
    setTableUpdateTimestamp(Date.now());
    setStoryLines([...storyLines, newStoryLine]);
  };

  const handleTableChange = (_changes: any, _source: any) => {
    if (!hotInstanceRef.current) return;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return;

    const updatedData = data.map((row: any[]) => ({
      stickNumber: row[0] ?? 0,
      fortuneLevel: row[1] ?? 0,
      title: row[2] ?? '',
      verdict: row[3] ?? '',
      omen: row[4] ?? '',
      action: row[5] ?? '',
      conclusion: row[6] ?? '',
    }));
    setStoryLines(updatedData);
  };

  const handleTableRemoveRow = (index: number, amount: number) => {
    if (!hotInstanceRef.current) return;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return;

    const updatedData = data.map((row: any[]) => ({
      stickNumber: row[0] ?? 0,
      fortuneLevel: row[1] ?? 0,
      title: row[2] ?? '',
      verdict: row[3] ?? '',
      omen: row[4] ?? '',
      action: row[5] ?? '',
      conclusion: row[6] ?? '',
    }));
    setStoryLines(updatedData);
  };

  const versionUpData = async () => {
    try {
      if (!manifest) return;

      setLoading(true);

      // Update manifest
      const updatedManifest: MasterDataManifest = {
        ...manifest,
        kaucimStories: {
          ...manifest.kaucimStories,
          [pageState.selectedConcern]: {
            [pageState.selectedLanguage]:
              (manifest.kaucimStories?.[pageState.selectedConcern]?.[pageState.selectedLanguage] ||
                0) + 1,
          },
        },
      };

      const version =
        updatedManifest.kaucimStories?.[pageState.selectedConcern]?.[pageState.selectedLanguage] || 1;
      const fileName = makeFilePath(pageState.selectedConcern, pageState.selectedLanguage, version);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(storyLines, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;

    } catch (err: any) {
      setError(`Failed to save stories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      if (!manifest) return;

      setLoading(true);

      const version =
        manifest.kaucimStories?.[pageState.selectedConcern]?.[pageState.selectedLanguage] || 1;
      const fileName = makeFilePath(pageState.selectedConcern, pageState.selectedLanguage, version);

      // Sort storyLines by stickNumber
      const sortedStoryLines = Array.from(storyLines).sort((a, b) => a.stickNumber - b.stickNumber);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(sortedStoryLines, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;

      setStoryLines(sortedStoryLines);
      setTableUpdateTimestamp(Date.now());
    } catch (err: any) {
      setError(`Failed to save stories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (<>
    <TableLayout
      loading={loading}
      error={error}
      title="Kaucim Stories"
      headerContent={headerContent}
      cardTitle={languageKeyToLabel(pageState.selectedLanguage)}
      cardDescription={
        <>
          Version:{' '}
          {manifest?.kaucimStories?.[pageState.selectedConcern]?.[pageState.selectedLanguage] || 1 || '-'}
          {!loading && <span> ({storyLines.length} stories)</span>}
        </>
      }
      noDataContent={<div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No data yet for {pageState.selectedLanguage.toUpperCase()}</p>
        <Button onClick={addRow} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Create First Story
        </Button>
      </div>}
      rows={storyLines}
      hotTableRef={hotTableRef}
      refresh={() => loadStories(pageState.selectedConcern, pageState.selectedLanguage)}
      versionUp={versionUpData}
      addRow={addRow}
      saveData={saveData}
    />
  </>
  );
}
