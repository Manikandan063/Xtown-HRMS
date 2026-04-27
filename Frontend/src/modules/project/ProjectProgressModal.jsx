import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const ProjectProgressModal = ({ project, onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(project.progressPercentage || 0);
  const [status, setStatus] = useState(project.projectStatus || 'IN_PROGRESS');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Update Progress
      await apiFetch(`/project/progress/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({ progressPercentage: Number(progress) })
      });

      // Update Status if changed
      if (status !== project.projectStatus) {
        await apiFetch(`/project/status/${project.id}`, {
          method: 'PUT',
          body: JSON.stringify({ projectStatus: status })
        });
      }

      toast.success('Project progress updated');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
        <DialogHeader className="p-8 bg-slate-50/50 border-b">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                 <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Update Work Status</DialogTitle>
                <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">Project: {project.projectName}</DialogDescription>
              </div>
           </div>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
           <div className="space-y-4">
              {/* Progress Slider Display */}
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Completion Level</label>
                    <span className="text-xl font-black italic text-indigo-600">{progress}%</span>
                 </div>

                 <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                 />
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Current Status</label>
                 <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                 >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                 </select>
              </div>

           </div>

           <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 rounded-2xl bg-slate-900 font-black uppercase text-[11px] tracking-[0.2em] text-white shadow-xl shadow-slate-200 flex gap-3"
           >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save Progress Update
           </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectProgressModal;
