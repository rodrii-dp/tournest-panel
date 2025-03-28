import * as Progress from '@radix-ui/react-progress';
import React from 'react';

export function LoadingIndicator({ progress }: { progress: number }) {
  return (
    <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-4">
      <Progress.Indicator
        className="bg-blue-500 h-full transition-transform"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Progress.Root>
  );
}
