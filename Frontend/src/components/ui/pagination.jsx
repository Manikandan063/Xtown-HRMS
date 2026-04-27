import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false,
  className 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/50 backdrop-blur-sm border-t border-muted/20", className)}>
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
        Page <span className="text-primary">{currentPage}</span> of <span className="text-primary">{totalPages}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              className={cn(
                "h-8 min-w-[32px] rounded-lg font-black text-xs transition-all",
                currentPage === page 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                  : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
              )}
              onClick={() => onPageChange(page)}
              disabled={loading}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
