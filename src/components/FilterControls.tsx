import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Heart, Brain, Eye, Activity, Zap } from 'lucide-react';
import { FilterType } from '@/lib/signalFilters';

interface FilterControlsProps {
  channelFilters: FilterType[];
  onFilterChange: (channelIndex: number, filter: FilterType) => void;
  onApplyToAll: (filter: FilterType) => void;
  numChannels: number;
}

export default function FilterControls({
  channelFilters,
  onFilterChange,
  onApplyToAll,
  numChannels,
}: FilterControlsProps) {
  const filters: { type: FilterType; icon: any; label: string; color: string }[] = [
    { type: 'emg', icon: Activity, label: 'EMG', color: 'text-red-500' },
    { type: 'ecg', icon: Heart, label: 'ECG', color: 'text-pink-500' },
    { type: 'eog', icon: Eye, label: 'EOG', color: 'text-blue-500' },
    { type: 'eeg', icon: Brain, label: 'EEG', color: 'text-purple-500' },
    { type: 'notch50', icon: Zap, label: '50Hz', color: 'text-yellow-500' },
    { type: 'notch60', icon: Zap, label: '60Hz', color: 'text-orange-500' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Apply to All Channels</h4>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.type}
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyToAll(filter.type)}
                  className="flex items-center gap-1"
                >
                  <filter.icon className={`h-3 w-3 ${filter.color}`} />
                  {filter.label}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyToAll('none')}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Individual Channels</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Array.from({ length: numChannels }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm w-12">Ch {idx + 1}:</span>
                  <div className="flex flex-wrap gap-1">
                    {filters.map((filter) => (
                      <Button
                        key={filter.type}
                        variant={channelFilters[idx] === filter.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFilterChange(idx, filter.type)}
                        className="px-2 py-1 h-auto text-xs"
                      >
                        <filter.icon className="h-3 w-3" />
                      </Button>
                    ))}
                    <Button
                      variant={channelFilters[idx] === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onFilterChange(idx, 'none')}
                      className="px-2 py-1 h-auto text-xs"
                    >
                      None
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
