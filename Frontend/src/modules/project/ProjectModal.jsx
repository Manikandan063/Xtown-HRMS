import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const ProjectModal = ({ onSuccess, project = null, trigger = null }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!project;

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    projectStatus: 'IN_PROGRESS',
    progressPercentage: 0,
    teamLeadId: ''
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (open && project) {
      setFormData({
        projectName: project.projectName || '',
        description: project.description || '',
        startDate: project.startDate?.split('T')[0] || '',
        endDate: project.endDate?.split('T')[0] || '',
        projectStatus: project.projectStatus || 'IN_PROGRESS',
        progressPercentage: project.progressPercentage || 0
      });
    } else if (open && !project) {
      setFormData({
        projectName: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        projectStatus: 'IN_PROGRESS',
        progressPercentage: 0
      });
    }
  }, [open, project]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await apiFetch('/employees');
        setEmployees(result?.data || result || []);
      } catch (error) {
        console.error('Failed to fetch employees');
      }
    };
    if (open) fetchEmployees();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = isEdit ? `/project/${project.id}` : '/project';
      const method = isEdit ? 'PUT' : 'POST';
      
      await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          progressPercentage: Number(formData.progressPercentage)
        })
      });
      
      toast.success(isEdit ? 'Project updated successfully' : 'Project created successfully');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to sync project data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 font-bold bg-primary hover:bg-blue-600 transition-all flex gap-3">
            <Plus className="h-5 w-5" />
            Add Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm font-medium italic">
            Assign resources and define delivery timelines for your venture.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Project Name</label>
            <Input 
              name="projectName" 
              placeholder="Ex: NextGen UI Revamp" 
              required 
              value={formData.projectName}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
            <Input 
              name="description" 
              placeholder="Outline the core objective..." 
              value={formData.description}
              onChange={handleChange}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
              <Input 
                name="startDate" 
                type="date"
                required 
                value={formData.startDate}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Target End</label>
              <Input 
                name="endDate" 
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Team Lead / Project Manager</label>
            <select 
              name="teamLeadId"
              required
              value={formData.teamLeadId}
              onChange={handleChange}
              className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm font-medium outline-none"
            >
              <option value="">Select a Lead</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Initial Status</label>
              <select 
                name="projectStatus"
                value={formData.projectStatus}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm font-medium outline-none"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Progress (%)</label>
              <Input 
                name="progressPercentage" 
                type="number"
                min="0"
                max="100"
                value={formData.progressPercentage}
                onChange={handleChange}
                className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="px-8 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-blue-600 min-w-[140px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Project')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
