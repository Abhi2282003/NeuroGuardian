import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2 } from 'lucide-react';

interface ChannelSelectorProps {
  totalChannels: number;
  selectedChannels: boolean[];
  onChannelToggle: (index: number) => void;
  onSelectAll: () => void;
  onReset: () => void;
}

export default function ChannelSelector({
  totalChannels,
  selectedChannels,
  onChannelToggle,
  onSelectAll,
  onReset,
}: ChannelSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Channels ({selectedChannels.filter(Boolean).length}/{totalChannels})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Select Channels</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={onReset}>
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
            {Array.from({ length: totalChannels }).map((_, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  id={`channel-${idx}`}
                  checked={selectedChannels[idx]}
                  onCheckedChange={() => onChannelToggle(idx)}
                />
                <label
                  htmlFor={`channel-${idx}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ch {idx + 1}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
