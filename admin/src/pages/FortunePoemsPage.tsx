import { DashboardLayout } from '@/components/layout';
import { AutoTextarea } from '@/components/ui/auto-textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/constants';
import supabase from '@/lib/supabase/client';
import type { FortunePoemContentType, LanguageKey } from '@/types';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';
import { AlertCircle, Loader2, Plus, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

registerAllModules();

interface Manifest {
  version: number;
  lastUpdated: string;
  languages: {
    [key in LanguageKey]?: number;
  };
}

const DEFAULT_MANIFEST: Manifest = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  languages: {},
};

export function FortunePoemsPage() {
  const hotTableRef = useRef(null);
  const hotInstanceRef = useRef<any>(null);
  const isUpdatingFromTable = useRef(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [poems, setPoems] = useState<FortunePoemContentType[]>([]);
  const [manifest, setManifest] = useState<Manifest>(DEFAULT_MANIFEST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPoem, setEditingPoem] = useState<FortunePoemContentType | null>(
    null,
  );

  // Load manifest on component mount
  useEffect(() => {
    loadManifest();
  }, []);

  // Load poems when language changes
  useEffect(() => {
    loadPoems(selectedLanguage);
  }, [selectedLanguage]);

  const loadManifest = async () => {
    try {
      setLoading(true);
      const { data, error: downloadError } = await supabase.storage
        .from('fortune_data')
        .download('fortune_poems/manifest.json');

      if (downloadError && downloadError.message !== 'Not found') {
        throw downloadError;
      }

      if (data) {
        const text = await data.text();
        setManifest(JSON.parse(text));
      } else {
        setManifest(DEFAULT_MANIFEST);
      }
    } catch (err: any) {
      console.log('Manifest not found, using default');
      setManifest(DEFAULT_MANIFEST);
    } finally {
      setLoading(false);
    }
  };

  const loadPoems = async (language: LanguageKey) => {
    try {
      setLoading(true);
      setError(null);
      const version = manifest.languages[language] || 1;
      const fileName = `fortune_poems/${language}-${version}.json`;

      const { data, error: downloadError } = await supabase.storage
        .from('fortune_data')
        .download(fileName);

      if (downloadError && downloadError.message !== 'Not found') {
        throw downloadError;
      }

      if (data) {
        const text = await data.text();
        const poemsData = JSON.parse(text);
        setPoems(Array.isArray(poemsData) ? poemsData : []);
      } else {
        // File not found, start with empty array
        setPoems([]);
      }
    } catch (err: any) {
      // Only show real errors, not "file not found"
      if (err.message && !err.message.includes('Not found')) {
        setError(`Failed to load poems: ${err.message}`);
      }
      setPoems([]);
    } finally {
      setLoading(false);
    }
  };

  const savePoems = async () => {
    try {
      setLoading(true);

      // Update manifest
      const updatedManifest = {
        ...manifest,
        version: manifest.version,
        lastUpdated: new Date().toISOString(),
        languages: {
          ...manifest.languages,
          [selectedLanguage]: (manifest.languages[selectedLanguage] || 0) + 1,
        },
      };

      const version = updatedManifest.languages[selectedLanguage] || 1;
      const fileName = `fortune_poems/${selectedLanguage}-${version}.json`;

      const { error: uploadError } = await supabase.storage
        .from('fortune_data')
        .upload(fileName, JSON.stringify(poems, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;

      setManifest(updatedManifest);

      const { error: manifestError } = await supabase.storage
        .from('fortune_data')
        .upload(
          'fortune_poems/manifest.json',
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

  const addRow = () => {
    const newPoem: FortunePoemContentType = {
      drawNo:
        poems.length > 0 ? Math.max(...poems.map((p) => p.drawNo)) + 1 : 1,
      language: selectedLanguage,
      fortuneTellingPoem: '',
      poetry: '',
      insights: '',
      divineWill: '',
      allusion: '',
    };
    setPoems([...poems, newPoem]);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteRow = (_index: number) => {
    // Row deletion handled by Handsontable context menu
  };

  const updatePoem = (
    index: number,
    field: keyof FortunePoemContentType,
    value: any,
  ) => {
    const updated = [...poems];
    updated[index] = { ...updated[index], [field]: value };
    setPoems(updated);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openEditModal = (_index: number) => {
    // Edit modal functionality
  };

  const closeEditModal = () => {
    setEditingIndex(null);
    setEditingPoem(null);
  };

  const updateEditingPoem = (
    field: keyof FortunePoemContentType,
    value: any,
  ) => {
    if (editingPoem) {
      setEditingPoem({ ...editingPoem, [field]: value });
    }
  };

  const saveEditedPoem = () => {
    if (editingIndex !== null && editingPoem) {
      updatePoem(editingIndex, 'drawNo', editingPoem.drawNo);
      Object.keys(editingPoem).forEach((key) => {
        if (key !== 'drawNo') {
          updatePoem(
            editingIndex,
            key as keyof FortunePoemContentType,
            (editingPoem as any)[key],
          );
        }
      });
      closeEditModal();
    }
  };

  const handleTableChange = (_changes: any, _source: any) => {
    if (!hotInstanceRef.current) return;
    const data = hotInstanceRef.current.getData?.();
    if (!data) return;

    isUpdatingFromTable.current = true;
    const updatedPoems = data.map((row: any[]) => ({
      drawNo: row[0] ?? 0,
      fortuneTellingPoem: row[1] ?? '',
      poetry: row[2] ?? '',
      insights: row[3] ?? '',
      divineWill: row[4] ?? '',
      allusion: row[5] ?? '',
      language: selectedLanguage,
    }));
    setPoems(updatedPoems);
    setTimeout(() => {
      isUpdatingFromTable.current = false;
    }, 0);
  };

  // Initialize Handsontable on mount or when poems change
  useEffect(() => {
    if (!hotTableRef.current) return;

    const container = hotTableRef.current as HTMLElement;

    const tableData = poems.map((poem) => [
      poem.drawNo,
      poem.fortuneTellingPoem,
      poem.poetry,
      poem.insights,
      poem.divineWill,
      poem.allusion,
    ]);

    // If instance exists, just update the data (unless update is coming from table itself)
    if (hotInstanceRef.current && !isUpdatingFromTable.current) {
      hotInstanceRef.current.loadData(tableData);
      return;
    }

    // Reset the flag after checking
    if (isUpdatingFromTable.current) {
      return;
    }

    // Initialize Handsontable only once
    const initTable = () => {
      try {
        // Check if instance exists, if so destroy it first
        if (hotInstanceRef.current) {
          hotInstanceRef.current.destroy();
        }

        const instance = new Handsontable(container, {
          data: tableData,
          colHeaders: [
            'Draw No',
            'Fortune Telling Poem',
            'Poetry',
            'Insights',
            'Divine Will',
            'Allusion',
          ],
          rowHeaders: true,
          height: 580,
          columns: [
            { type: 'numeric', width: 80 },
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
      // Don't destroy on every render, only when component unmounts
    };
  }, [poems, selectedLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hotInstanceRef.current) {
        hotInstanceRef.current.destroy();
        hotInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <DashboardLayout title="Fortune Poems">
      <div className="space-y-6">
        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Language</CardTitle>
            <CardDescription>
              Choose a language to view and edit fortune poems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={selectedLanguage}
                onValueChange={(value) =>
                  setSelectedLanguage(value as LanguageKey)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => loadPoems(selectedLanguage)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Reload'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Grid Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedLanguage.toUpperCase()} - {poems.length} poems
                </CardTitle>
                <CardDescription>
                  Version: {manifest.languages[selectedLanguage] || 1}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && poems.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            <div className="space-y-4">
              <div
                ref={hotTableRef}
                style={{
                  width: '100%',
                  height: '600px',
                  overflow: 'hidden',
                  display: loading || poems.length === 0 ? 'none' : 'block',
                }}
              />
            </div>

            {!loading && poems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No poems yet for {selectedLanguage.toUpperCase()}
                </p>
                <Button onClick={addRow} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Poem
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {editingIndex !== null && editingPoem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="sticky top-0 bg-background border-b flex items-center justify-between">
                <div>
                  <CardTitle>Edit Poem #{editingPoem.drawNo}</CardTitle>
                  <CardDescription>
                    Edit all fields for this poem
                  </CardDescription>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-1 hover:bg-muted rounded"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Draw Number
                  </label>
                  <input
                    type="number"
                    value={editingPoem.drawNo}
                    onChange={(e) =>
                      updateEditingPoem('drawNo', parseInt(e.target.value) || 0)
                    }
                    className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Fortune Telling Poem
                  </label>
                  <AutoTextarea
                    value={editingPoem.fortuneTellingPoem}
                    onChange={(e) =>
                      updateEditingPoem('fortuneTellingPoem', e.target.value)
                    }
                    minRows={1}
                    maxRows={20}
                    placeholder="Enter the fortune telling poem..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Poetry
                  </label>
                  <AutoTextarea
                    value={editingPoem.poetry}
                    onChange={(e) =>
                      updateEditingPoem('poetry', e.target.value)
                    }
                    minRows={1}
                    maxRows={20}
                    placeholder="Enter the poetry..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Insights
                  </label>
                  <AutoTextarea
                    value={editingPoem.insights}
                    onChange={(e) =>
                      updateEditingPoem('insights', e.target.value)
                    }
                    minRows={1}
                    maxRows={20}
                    placeholder="Enter the insights..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Divine Will
                  </label>
                  <AutoTextarea
                    value={editingPoem.divineWill}
                    onChange={(e) =>
                      updateEditingPoem('divineWill', e.target.value)
                    }
                    minRows={1}
                    maxRows={20}
                    placeholder="Enter the divine will..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Allusion
                  </label>
                  <AutoTextarea
                    value={editingPoem.allusion}
                    onChange={(e) =>
                      updateEditingPoem('allusion', e.target.value)
                    }
                    minRows={1}
                    maxRows={20}
                    placeholder="Enter the allusion..."
                  />
                </div>
              </CardContent>
              <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-end gap-2">
                <Button onClick={closeEditModal} variant="outline">
                  Cancel
                </Button>
                <Button onClick={saveEditedPoem}>Save Changes</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
