import React from 'react';
import { CheckCircle2, Circle, Clock, Loader2, Eye, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

const LeaveTracker = ({ status, createdAt, viewedAt, approvedAt }) => {
  const steps = [
    { 
      label: 'Requested', 
      desc: createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Pending',
      status: 'complete',
      icon: Clock
    },
    { 
      label: 'Admin Viewed', 
      desc: viewedAt ? new Date(viewedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Waiting...',
      status: viewedAt ? 'complete' : 'current',
      icon: Eye
    },
    { 
      label: status === 'Rejected' ? 'Rejected' : 'Approved', 
      desc: approvedAt ? new Date(approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Processing',
      status: status === 'Pending' ? 'upcoming' : 'complete',
      icon: status === 'Rejected' ? Ban : CheckCircle2,
      isFinal: true,
      result: status
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="flex items-center w-full">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;
          
          let colorClass = "text-muted-foreground/30";
          let bgClass = "bg-muted/50";
          let borderClass = "border-border";

          if (step.status === 'complete') {
            colorClass = step.isFinal && step.result === 'Rejected' ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400";
            bgClass = step.isFinal && step.result === 'Rejected' ? "bg-rose-500/10" : "bg-emerald-500/10";
            borderClass = step.isFinal && step.result === 'Rejected' ? "border-rose-500/20" : "border-emerald-500/20";
          } else if (step.status === 'current') {
            colorClass = "text-amber-600 dark:text-amber-400";
            bgClass = "bg-amber-500/10";
            borderClass = "border-amber-500/20";
          }

          return (
            <React.Fragment key={idx}>
              {/* Step Node */}
              <div className="flex flex-col items-center relative z-10 w-14">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm grow-0 shrink-0",
                  bgClass, borderClass, colorClass
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                {/* Labels */}
                <div className="absolute -bottom-14 flex flex-col items-center min-w-[120px] text-center">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest whitespace-nowrap", colorClass)}>
                    {step.label}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground mt-1 italic uppercase tracking-tighter">
                    {step.desc}
                  </span>
                </div>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-[3px] bg-muted relative rounded-full mx-[-2px]">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      step.status === 'complete' 
                        ? (step.isFinal && step.result === 'Rejected' ? 'bg-rose-500' : 'bg-emerald-500') 
                        : 'bg-muted'
                    )}
                    style={{ width: step.status === 'complete' ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveTracker;
