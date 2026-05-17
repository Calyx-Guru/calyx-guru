import { formatKaucimConcernLabel, isKaucimConcern } from '@/components/KaucimConcernSelector';
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
import { Navigate, useParams } from 'react-router-dom';

const PAGE_STATE_PREFIX = 'kaucimStories';

/** Title column (0-based index 2): paste text always starts here and wraps along the row. */
const PASTE_TEXT_START_COL = 2;

function makeFilePath(concern: KAUCIM_CONCERNS, language: LanguageKey, version: number) {
  return `${KAUCIM_STORIES_STORAGE_FOLDER}/${concern}-${language}-${version}.json`;
}

/** Clipboard text → non-empty lines (newline split, empty lines removed). */
function clipboardNonEmptyLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return normalized.split('\n').filter((line) => line.trim().length > 0);
}

const KAUCIM_STORIES_DEFAULT_COLUMN_WIDTHS = [
  80, 80, 240, 480, 480, 480, 480,
] as const;

interface KaucimStoriesPageState {
  selectedLanguage: LanguageKey;
  /** Persisted Handsontable column widths (px), same order as columns */
  columnWidths?: number[];
}

export function KaucimStoriesPage() {
  const { concern: concernParam } = useParams<{ concern: string }>();

  if (!isKaucimConcern(concernParam)) {
    return <Navigate to={`/kaucim-stories/${KAUCIM_CONCERNS.LOVE}`} replace />;
  }

  return <KaucimStoriesPageContent selectedConcern={concernParam} />;
}

function KaucimStoriesPageContent({
  selectedConcern,
}: {
  selectedConcern: KAUCIM_CONCERNS;
}) {
  const hotTableRef = useRef(null);
  const hotInstanceRef = useRef<any>(null);
  const [pageState, setPageState] = usePageState<KaucimStoriesPageState>(
    PAGE_STATE_PREFIX,
    {
      selectedLanguage: 'en',
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
      </div>
    ),
    [loading, pageState.selectedLanguage, updatePageState],
  );

  // -- Effects --

  // Load stories when language or concern changes
  useEffect(() => {
    if (manifest) {
      loadStories(selectedConcern, pageState.selectedLanguage);
    } else {
      setLoading(true);
    }
  }, [pageState.selectedLanguage, selectedConcern, manifest]);

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
          contextMenu: {
            items: {
              paste_content: {
                name: 'Paste content',
                disabled: () => !hotInstanceRef.current?.getSelectedLast?.(),
                callback: () => {
                  const hot = hotInstanceRef.current;
                  if (!hot) return;
                  const selected = hot.getSelectedLast();
                  if (selected == null) return;

                  const [r1, , r2] = selected;
                  const startRow = Math.min(r1, r2);

                  void navigator.clipboard
                    .readText()
                    .then((text) => {
                      const parts = clipboardNonEmptyLines(text);
                      const numCols = hot.countCols?.() ?? 0;
                      const cellsPerRow = numCols - PASTE_TEXT_START_COL;

                      if (parts.length === 0 || cellsPerRow <= 0) {
                        handleTableChange(null, 'paste_content');
                        return;
                      }

                      const lastRowIndex =
                        startRow + Math.floor((parts.length - 1) / cellsPerRow);
                      const rowsNeeded = lastRowIndex + 1;
                      const currentRows = hot.countRows();
                      const insertCount = Math.max(0, rowsNeeded - currentRows);

                      if (insertCount > 0) {
                        if (currentRows > 0) {
                          hot.alter(
                            'insert_row_below',
                            currentRows - 1,
                            insertCount,
                            'paste_content',
                          );
                        } else {
                          hot.alter('insert_row_above', 0, insertCount, 'paste_content');
                        }
                      }

                      const changes: [number, number, string][] = [];
                      for (let i = 0; i < parts.length; i++) {
                        const row = startRow + Math.floor(i / cellsPerRow);
                        const col = PASTE_TEXT_START_COL + (i % cellsPerRow);
                        changes.push([row, col, parts[i]]);
                      }
                      hot.setDataAtCell(changes, 'paste_content');
                      handleTableChange(null, 'paste_content');
                    })
                    .catch((err) => {
                      console.error('Clipboard read failed:', err);
                    });
                },
              },
              hsep1: '---------',
              ...(typeof DEFAULT_HANDSON_TABLE_OPTIONS.contextMenu === 'object' &&
              DEFAULT_HANDSON_TABLE_OPTIONS.contextMenu !== null &&
              'items' in DEFAULT_HANDSON_TABLE_OPTIONS.contextMenu
                ? DEFAULT_HANDSON_TABLE_OPTIONS.contextMenu.items
                : {}),
            },
          },
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
          [selectedConcern]: {
            [pageState.selectedLanguage]:
              (manifest.kaucimStories?.[selectedConcern]?.[pageState.selectedLanguage] ||
                0) + 1,
          },
        },
      };

      const version =
        updatedManifest.kaucimStories?.[selectedConcern]?.[pageState.selectedLanguage] || 1;
      const fileName = makeFilePath(selectedConcern, pageState.selectedLanguage, version);

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
        manifest.kaucimStories?.[selectedConcern]?.[pageState.selectedLanguage] || 1;
      const fileName = makeFilePath(selectedConcern, pageState.selectedLanguage, version);

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
      title={`Kaucim Stories — ${formatKaucimConcernLabel(selectedConcern)}`}
      headerContent={headerContent}
      cardTitle={languageKeyToLabel(pageState.selectedLanguage)}
      cardDescription={
        <>
          Version:{' '}
          {manifest?.kaucimStories?.[selectedConcern]?.[pageState.selectedLanguage] || 1 || '-'}
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
      refresh={() => loadStories(selectedConcern, pageState.selectedLanguage)}
      versionUp={versionUpData}
      addRow={addRow}
      saveData={saveData}
    />
  </>
  );
}
