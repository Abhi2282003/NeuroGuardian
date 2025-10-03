import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Trash2, FolderOpen } from 'lucide-react';
import { getAllRecordings, deleteRecording, deleteAllRecordings, convertToCSV } from '@/lib/indexedDB';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

export default function RecordingManager() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const { toast } = useToast();

  const loadRecordings = async () => {
    const recs = await getAllRecordings();
    setRecordings(recs);
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const handleDownload = async (recording: any) => {
    const csv = convertToCSV(recording.data, recording.channels);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `${recording.name} downloaded successfully`,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteRecording(id);
    await loadRecordings();
    toast({
      title: 'Deleted',
      description: 'Recording deleted successfully',
    });
  };

  const handleDownloadAll = async () => {
    if (recordings.length === 0) {
      toast({
        title: 'No Recordings',
        description: 'No recordings to download',
        variant: 'destructive',
      });
      return;
    }

    const zip = new JSZip();
    
    for (const recording of recordings) {
      const csv = convertToCSV(recording.data, recording.channels);
      zip.file(`${recording.name}.csv`, csv);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eeg-recordings-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `${recordings.length} recordings downloaded as ZIP`,
    });
  };

  const handleDeleteAll = async () => {
    await deleteAllRecordings();
    await loadRecordings();
    toast({
      title: 'Deleted',
      description: 'All recordings deleted',
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          Files ({recordings.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recorded Files</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                disabled={recordings.length === 0}
              >
                <Download className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAll}
                disabled={recordings.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                All
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recordings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recordings yet
              </p>
            ) : (
              recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{recording.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {recording.duration.toFixed(1)}s • {recording.channels} ch •{' '}
                      {recording.data.length.toLocaleString()} samples
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(recording)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(recording.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
