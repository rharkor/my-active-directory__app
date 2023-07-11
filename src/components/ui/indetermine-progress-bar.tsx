import { cn } from '@/lib/utils';

export default function IndeterminateProgressBar({
  className,
  barClassName,
}: {
  className?: string;
  barClassName?: string;
}) {
  return (
    <div
      className={cn('roudned-full h-[2px] relative overflow-hidden', className)}
    >
      <div
        className={cn(
          'bg-primary rounded-full absolute bottom-0 top-0 w-1/2 animate-progress-bar',
          barClassName,
        )}
      ></div>
    </div>
  );
}
