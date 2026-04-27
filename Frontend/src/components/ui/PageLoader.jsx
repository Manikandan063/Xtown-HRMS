import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PageLoader = ({ message = "Loading Portal Data...", className }) => {
  return (
    <div className={cn(
      "min-h-[70vh] w-full flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500",
      className
    )}>
       <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full border-t-2 border-b-2 border-primary/20 animate-spin duration-[3000ms]" />
          <div className="absolute h-16 w-16 rounded-full border-r-2 border-l-2 border-primary/40 animate-spin-reverse duration-1000" />
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
       </div>
       <div className="text-center space-y-1">
          <p className="text-slate-900 dark:text-white font-black tracking-[0.3em] uppercase text-[10px] italic animate-pulse">
            {message}
          </p>
          <div className="h-0.5 w-12 bg-primary/20 mx-auto rounded-full overflow-hidden">
             <div className="h-full bg-primary w-1/2 animate-shimmer" />
          </div>
       </div>
    </div>
  );
};

export default PageLoader;
