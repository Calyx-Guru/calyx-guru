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
import {
    AlertCircle,
    Edit,
    Loader2,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Manifest {
  version: string;
  lastUpdated: string;
  languages: {
    [key in LanguageKey]?: string;
  };
}

const DEFAULT_MANIFEST: Manifest = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  languages: {},
};

export function FortunePoemsPage() {
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
      const version = manifest.languages[language] || '1.0.0';
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
      const version = manifest.languages[selectedLanguage] || '1.0.0';
      const fileName = `fortune_poems/${selectedLanguage}-${version}.json`;

      const { error: uploadError } = await supabase.storage
        .from('fortune_data')
        .upload(fileName, JSON.stringify(poems, null, 2), {
          upsert: true,
          contentType: 'application/json',
        });

      if (uploadError) throw uploadError;

      // Update manifest
      const updatedManifest = {
        ...manifest,
        lastUpdated: new Date().toISOString(),
        languages: {
          ...manifest.languages,
          [selectedLanguage]: version,
        },
      };
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

  const deleteRow = (index: number) => {
    setPoems(poems.filter((_, i) => i !== index));
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

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setEditingPoem({ ...poems[index] });
  };

  const closeEditModal = () => {
    setEditingIndex(null);
    setEditingPoem(null);
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

  const updateEditingPoem = (
    field: keyof FortunePoemContentType,
    value: any,
  ) => {
    if (editingPoem) {
      setEditingPoem({ ...editingPoem, [field]: value });
    }
  };

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
                  Version: {manifest.languages[selectedLanguage] || '1.0.0'}
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
            {loading && poems.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left font-semibold w-16">
                          Draw No
                        </th>
                        <th className="border p-2 text-left font-semibold">
                          Fortune Telling Poem
                        </th>
                        <th className="border p-2 text-left font-semibold">
                          Poetry
                        </th>
                        <th className="border p-2 text-left font-semibold">
                          Insights
                        </th>
                        <th className="border p-2 text-left font-semibold">
                          Divine Will
                        </th>
                        <th className="border p-2 text-left font-semibold">
                          Allusion
                        </th>
                        <th className="border p-2 text-center font-semibold w-12">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {poems.map((poem, index) => (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="border p-2 text-center font-semibold">
                            {poem.drawNo}
                          </td>
                          <td className="border p-2 max-w-xs truncate text-sm">
                            {poem.fortuneTellingPoem}
                          </td>
                          <td className="border p-2 max-w-xs truncate text-xs text-muted-foreground">
                            {poem.poetry}
                          </td>
                          <td className="border p-2 max-w-xs truncate text-xs text-muted-foreground">
                            {poem.insights}
                          </td>
                          <td className="border p-2 max-w-xs truncate text-xs text-muted-foreground">
                            {poem.divineWill}
                          </td>
                          <td className="border p-2 max-w-xs truncate text-xs text-muted-foreground">
                            {poem.allusion}
                          </td>
                          <td className="border p-2 text-center flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(index)}
                              className="p-1 hover:bg-primary/10 rounded"
                              title="Edit row"
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </button>
                            <button
                              onClick={() => deleteRow(index)}
                              className="p-1 hover:bg-destructive/10 rounded"
                              title="Delete row"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {poems.length === 0 && (
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
