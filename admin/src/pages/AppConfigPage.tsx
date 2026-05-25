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
  APP_CONFIG_FILE_NAME,
  DEFAULT_HANDSON_TABLE_OPTIONS,
  STORAGE_BUCKET,
} from '@/constants';
import { MasterDataContext } from '@/contexts/MasterDataContext';
import { usePageState } from '@/hooks/usePageState';
import {
  mergeColumnWidths,
  textColumnsFromWidths,
} from '@/lib/handsontableColumnWidths';
import supabase from '@/lib/supabase/client';
import type { AppConfigEntryType } from '@/types/AppConfig';
import Handsontable from 'handsontable';
import {
  AlertCircle,
  ArrowUpWideNarrow,
  Loader2,
  Plus,
  Save,
} from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';

function makeFilePath(version: number) {
  return `${APP_CONFIG_FILE_NAME}-${version}.json`;
}

const APP_CONFIG_DEFAULT_COLUMN_WIDTHS = [240, 480] as const;

interface AppConfigTableUiState {
  columnWidths?: number[];
}

function tableRowsToEntries(rows: unknown[][]): AppConfigEntryType[] {
  return rows.map((row) => ({
    key: String(row[0] ?? ''),
    value: String(row[1] ?? ''),
  }));
}

export function AppConfigPage() {
  const hotTableRef = useRef(null);
  const hotInstanceRef = useRef<Handsontable | null>(null);
  const {
    manifest,
    refetch: refetchManifest,
    updateManifest,
  } = useContext(MasterDataContext);

  const [entries, setEntries] = useState<AppConfigEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableUpdateTimestamp, setTableUpdateTimestamp] = useState(0);

  const [tableUi, setTableUi] = usePageState<AppConfigTableUiState>(
    'appConfigTable',
    {},
  );

  useEffect(() => {
    if (manifest) {
      loadAppConfig();
    } else {
      setLoading(true);
    }
  }, [manifest]);

  const loadAppConfig = async () => {
    try {
      if (!manifest) {
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      const version = manifest.appConfig?.version || 1;
      const fileName = makeFilePath(version);

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
        const parsed = JSON.parse(text) as AppConfigEntryType[];
        setTableUpdateTimestamp(Date.now());
        setEntries(Array.isArray(parsed) ? parsed : []);
      } else {
        setTableUpdateTimestamp(Date.now());
        setEntries([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message && !message.includes('Not found')) {
        setError(`Failed to load app config: ${message}`);
      }
      setTableUpdateTimestamp(Date.now());
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getEntriesFromTable = (): AppConfigEntryType[] => {
    if (!hotInstanceRef.current) return entries;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return entries;
    return tableRowsToEntries(data);
  };

  const versionUpAppConfig = async () => {
    try {
      if (!manifest) return;

      setLoading(true);

      const currentEntries = getEntriesFromTable();

      const updatedManifest = {
        ...manifest,
        appConfig: {
          lastUpdated: new Date().toISOString(),
          version: (manifest.appConfig?.version || 1) + 1,
        },
      };

      const version = updatedManifest.appConfig.version || 1;
      const fileName = makeFilePath(version);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(currentEntries, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;

      updateManifest(updatedManifest);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to save app config: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveAppConfig = async () => {
    try {
      if (!manifest) return;

      setLoading(true);

      const currentEntries = getEntriesFromTable();
      const version = manifest.appConfig?.version || 1;
      const fileName = makeFilePath(version);

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(currentEntries, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to save app config: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    setTableUpdateTimestamp(Date.now());
    setEntries([...entries, { key: '', value: '' }]);
  };

  const syncEntriesFromTable = () => {
    if (!hotInstanceRef.current) return;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return;
    setEntries(tableRowsToEntries(data));
  };

  useEffect(() => {
    refetchManifest();

    if (!hotTableRef.current) return;

    const container = hotTableRef.current as HTMLElement;

    const initTable = () => {
      try {
        const colWidths = mergeColumnWidths(
          APP_CONFIG_DEFAULT_COLUMN_WIDTHS,
          tableUi.columnWidths,
        );

        const instance = new Handsontable(container, {
          ...DEFAULT_HANDSON_TABLE_OPTIONS,
          stretchH: 'none',
          data: [],
          colHeaders: ['Key', 'Value'],
          columns: textColumnsFromWidths(colWidths),
          afterColumnResize: (newSize, column) => {
            setTableUi((prev) => {
              const merged = mergeColumnWidths(
                APP_CONFIG_DEFAULT_COLUMN_WIDTHS,
                prev.columnWidths,
              );
              merged[column] = newSize;
              return { ...prev, columnWidths: merged };
            });
          },
          afterChange: syncEntriesFromTable,
          afterRemoveRow: syncEntriesFromTable,
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hotInstanceRef.current) return;

    const tableData = entries.map((entry) => [entry.key, entry.value]);
    hotInstanceRef.current.loadData(tableData);
  }, [tableUpdateTimestamp]);

  return (
    <DashboardLayout title="App Config">
      <div className="flex flex-col gap-6 h-full">
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-3 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        <Card className="flex flex-col flex-1 min-h-0">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle></CardTitle>
                <CardDescription>
                  Version: {manifest?.appConfig?.version || 1}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={versionUpAppConfig} disabled={loading} size="sm">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
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
                <Button onClick={saveAppConfig} disabled={loading} size="sm">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && entries.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No config entries yet</p>
                <Button onClick={addRow} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Entry
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
                  display: loading || entries.length === 0 ? 'none' : 'block',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
