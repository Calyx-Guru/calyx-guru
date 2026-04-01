import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KAUCIM_CONCERNS } from '@/types';

const ALL_CONCERNS: KAUCIM_CONCERNS[] = Object.values(KAUCIM_CONCERNS);

interface KaucimConcernSelectorProps {
  value: KAUCIM_CONCERNS;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function KaucimConcernSelector({
  value,
  onValueChange,
  disabled,
}: KaucimConcernSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select conern" />
      </SelectTrigger>
      <SelectContent className="z-180">
        {ALL_CONCERNS.map((concern) => (
          <SelectItem key={concern} value={concern}>
            {concern}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
