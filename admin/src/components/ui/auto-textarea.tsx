import { cn } from '@/lib/utils';
import { forwardRef, TextareaHTMLAttributes } from 'react';

interface AutoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

const getAutoRows = (
  text: string,
  minRows: number,
  maxRows: number,
): number => {
  // Count newlines and add 1 for the first line
  const lineCount = (text.match(/\n/g) || []).length + 1;
  // Estimate rows based on text length (approximately 50 chars per row)
  const estimatedRows = Math.ceil(text.length / 50);
  // Return the maximum of these two, constrained between minRows and maxRows
  return Math.min(
    Math.max(Math.max(lineCount, estimatedRows), minRows),
    maxRows,
  );
};

export const AutoTextarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ className, minRows = 1, maxRows = 20, value = '', ...props }, ref) => {
    const rows = getAutoRows(String(value), minRows, maxRows);

    return (
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none',
          className,
        )}
        {...props}
      />
    );
  },
);

AutoTextarea.displayName = 'AutoTextarea';
