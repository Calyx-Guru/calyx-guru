import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KAUCIM_CONCERNS } from '@/types';

export const ALL_KAUCIM_CONCERNS: KAUCIM_CONCERNS[] = Object.values(KAUCIM_CONCERNS);

export function formatKaucimConcernLabel(concern: KAUCIM_CONCERNS): string {
  return concern.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isKaucimConcern(value: string | undefined): value is KAUCIM_CONCERNS {
  return ALL_KAUCIM_CONCERNS.includes(value as KAUCIM_CONCERNS);
}

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
        {ALL_KAUCIM_CONCERNS.map((concern) => (
          <SelectItem key={concern} value={concern}>
            {concern}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
