import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { 
  Briefcase, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  Users, 
  ExternalLink,
  Loader2,
  Trash2,
  Settings2,
  FileDown,
  BarChart2,
  Timer,
  FileText,
  Upload,
  Download,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import ProjectModal from './ProjectModal';
import ProjectTeamModal from './ProjectTeamModal';
import ProjectProgressModal from './ProjectProgressModal';
import { Pagination } from '@/components/ui/pagination';
import PageLoader from '@/components/ui/PageLoader';

const ProjectFilesModal = ({ project, isOpen, onClose }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!project) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/project/${project.id}/files`);
      setFiles(response.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load project files');
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    if (isOpen) fetchFiles();
  }, [isOpen, fetchFiles]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await apiFetch(`/project/${project.id}/files`, {
        method: 'POST',
        body: formData,
        isFormData: true
      });
      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await apiFetch(`/project/files/${fileId}`, { method: 'DELETE' });
      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl ring-1 ring-border">
        <DialogHeader className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase">PROJECT DOCUMENTS</DialogTitle>
              <DialogDescription className="text-white/60 font-medium italic">
                Manage shared files for <span className="text-white font-bold">{project?.projectName}</span>
              </DialogDescription>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
               <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {/* Upload Section */}
          <div className="group relative">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label 
              htmlFor="file-upload" 
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all duration-300 ${uploading ? 'bg-muted opacity-50' : 'hover:border-indigo-500 hover:bg-indigo-50/50 border-border group-hover:shadow-lg'}`}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Click to Upload Document</span>
                  <span className="text-[10px] text-muted-foreground opacity-60">PDF, IMAGES, EXCEL, WORD, ZIP (MAX 20MB)</span>
                </>
              )}
            </label>
          </div>

          {/* Files List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : files.length > 0 ? (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 rounded-[1.2rem] bg-muted/30 border border-border/50 hover:border-indigo-500/30 hover:bg-white transition-all group/file">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight line-clamp-1 max-w-[250px]">{file.originalName}</span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold opacity-60 uppercase">
                        <span>{formatSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>By {file.uploader?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600" asChild>
                      <a href={`${API_URL}${file.fileUrl}`} target="_blank" rel="noopener noreferrer" download={file.originalName}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'super_admin' || file.uploadedBy === user?.userId) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-40">
                <FileText className="h-12 w-12 mx-auto mb-3" />
                <p className="font-bold uppercase tracking-widest text-xs">No documents uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="w-full rounded-xl font-bold uppercase tracking-widest text-[11px] h-11">Close Manager</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProjectList = () => {
  const { canEdit, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [selectedProjectForFiles, setSelectedProjectForFiles] = useState(null);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/project?page=${page}&limit=${limit}&search=${searchQuery}`);
      const projectData = data.data || [];
      setProjects(projectData);
      setTotalCount(data?.total || 0);
      setTotalPages(Math.ceil((data?.total || 0) / limit) || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Reset to first page when searching
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will hide the project from the list.')) return;

    try {
      await apiFetch(`/project/${id}`, { method: 'DELETE' });
      toast.success('Project archived successfully');
      fetchProjects();
    } catch (error) {
      toast.error(error.message || 'Failed to archive project');
    }
  };

  const handleGenerateReport = () => {
    toast.info("Generating enterprise portfolio report...", {
      description: `Analyzing ${projects.length} projects across the company.`
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-600';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-600';
      case 'ON_HOLD': return 'bg-orange-500/10 text-orange-600';
      case 'NOT_STARTED': return 'bg-slate-400/10 text-slate-500';
      default: return 'bg-slate-500/10 text-slate-600';
    }
  };

  const filteredProjects = projects; // Search handled by backend

  const metrics = [
    { label: 'Total Projects', value: totalCount, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'In Progress', value: projects.filter(p => p.projectStatus === 'IN_PROGRESS').length, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    { label: 'Completed', value: projects.filter(p => p.projectStatus === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'On Hold', value: projects.filter(p => p.projectStatus === 'ON_HOLD').length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-500/10' },
  ];

  if (loading) {
    return <PageLoader message="Loading Project List..." />;

  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">All Projects</h1>
          <p className="text-muted-foreground font-medium italic opacity-80">Track your team's work and progress.</p>

        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleGenerateReport} variant="outline" className="h-12 px-6 rounded-2xl flex gap-3 font-black uppercase text-[10px] tracking-widest border-border hover:bg-muted shadow-sm">
             <FileDown className="h-4 w-4" /> Report
          </Button>
          {canEdit && (
            <ProjectModal onSuccess={fetchProjects} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="border-none shadow-xl p-6 rounded-3xl bg-card/70 backdrop-blur-md hover:shadow-2xl transition-all group ring-1 ring-border">
             <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl ${m.bg} flex items-center justify-center ${m.color} group-hover:rotate-6 transition-transform`}>
                   <m.icon className="h-8 w-8" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight">{m.label}</p>
                   <h4 className="text-3xl font-black tracking-tighter">{m.value}</h4>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-xl ring-1 ring-border">
        <CardHeader className="bg-muted/50 border-b border-border px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-xl font-bold tracking-tight italic">All Projects</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              <Input 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 border-none rounded-xl bg-muted" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-bold py-6 pl-8 uppercase text-[10px] tracking-widest text-muted-foreground">Project Name</TableHead>
                <TableHead className="font-bold py-6 uppercase text-[10px] tracking-widest text-muted-foreground">Dates</TableHead>
                <TableHead className="font-bold py-6 uppercase text-[10px] tracking-widest text-muted-foreground">Progress</TableHead>
                <TableHead className="font-bold py-6 text-center uppercase text-[10px] tracking-widest text-muted-foreground">Status</TableHead>
                <TableHead className="font-bold py-6 text-right pr-8 uppercase text-[10px] tracking-widest text-muted-foreground">More</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium opacity-50 uppercase tracking-tighter">
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((prj) => (
                  <TableRow key={prj.id} className="hover:bg-primary/5 border-b border-border transition-all group">
                    <TableCell className="py-6 pl-8">
                       <div className="space-y-1">
                          <h4 className="font-black text-foreground text-lg tracking-tight">{prj.projectName}</h4>
                          <p className="text-[11px] text-muted-foreground font-medium italic opacity-70 line-clamp-1 max-w-[250px]">{prj.description || 'No description added.'}</p>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-[10px] text-muted-foreground uppercase tracking-widest overflow-hidden">
                       <motion.div 
                         className="flex flex-col gap-3"
                         initial={false}
                       >
                          <motion.div 
                            className="flex items-center gap-3 origin-left group/timer"
                            whileHover={{ scale: 1.05 }}
                          >
                             <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover/timer:bg-emerald-500/20 transition-colors">
                                <Timer className="h-4 w-4 text-emerald-600 group-hover/timer:rotate-12 transition-transform" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] text-emerald-600/50 font-black">START PHASE</span>
                                <span className="text-foreground font-black tracking-tighter text-xs">
                                   {new Date(prj.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                             </div>
                          </motion.div>
                          
                          <motion.div 
                            className="flex items-center gap-3 origin-left opacity-60 group-hover:opacity-100 group/timer"
                            whileHover={{ scale: 1.05 }}
                          >
                             <div className="p-1.5 bg-rose-500/10 rounded-lg group-hover/timer:bg-rose-500/20 transition-colors">
                                <Timer className="h-4 w-4 text-rose-600 group-hover/timer:-rotate-12 transition-transform" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[8px] text-rose-600/50 font-black">TARGET DEADLINE</span>
                                <span className="text-foreground font-black tracking-tighter text-xs">
                                   {prj.endDate ? new Date(prj.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'STABLE CONTINUOUS'}
                                </span>
                             </div>
                          </motion.div>
                       </motion.div>
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="space-y-2 w-48">
                          <div className="flex justify-between text-[11px] font-black uppercase italic text-primary">
                             <span>Progress</span>
                             <span>{prj.progressPercentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner border border-border p-[2px]">
                             <div 
                               className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-sm shadow-blue-500/40" 
                               style={{ width: `${prj.progressPercentage}%` }}
                             />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                             <BarChart2 className="h-3 w-3 text-emerald-500" />
                             <span className="text-[9px] font-bold text-emerald-600 uppercase">Work Status: Normal</span>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center py-6">
                      <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase shadow-none border-none ${getStatusColor(prj.projectStatus)}`}>
                         {prj.projectStatus?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-6 pr-8">
                       <div className="flex items-center justify-end gap-2">
                          <Button 
                             variant="outline" 
                             size="sm" 
                             className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-9 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 group/btn"
                             onClick={() => {
                               setSelectedProjectForFiles(prj);
                               setIsFilesModalOpen(true);
                             }}
                          >
                             <FileText className="h-3.5 w-3.5 mr-2 text-indigo-600 group-hover/btn:scale-110 transition-transform" />
                             Files
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="group-hover:bg-card rounded-full h-10 w-10 shadow-sm border border-transparent hover:border-border transition-all">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-[1.2rem] p-2 bg-card backdrop-blur-xl border border-border shadow-2xl">
                               <DropdownMenuItem className="gap-3 py-3 rounded-xl focus:bg-primary/5 cursor-pointer font-bold text-xs uppercase transition-all">
                                  <ExternalLink className="h-4 w-4 text-primary" /> View Details
                               </DropdownMenuItem>
                               <ProjectTeamModal 
                                   project={prj} 
                                   trigger={
                                     <DropdownMenuItem onSelect={e => e.preventDefault()} className="gap-3 py-3 rounded-xl focus:bg-muted cursor-pointer font-bold text-xs uppercase transition-all">
                                       <Users className="h-4 w-4 text-muted-foreground" /> Manage Team
                                     </DropdownMenuItem>
                                   }
                                />
                               {/* Allow assigned employees to update their report */}
                               <ProjectProgressModal 
                                  project={prj} 
                                  onSuccess={fetchProjects}
                                  trigger={
                                    <DropdownMenuItem onSelect={e => e.preventDefault()} className="gap-3 py-3 rounded-xl focus:bg-indigo-500/10 text-indigo-500 cursor-pointer font-bold text-xs uppercase transition-all">
                                      <TrendingUp className="h-4 w-4" /> Update Progress
                                    </DropdownMenuItem>
                                  }
                               />
                               {canEdit && (
                                  <>
                                    <div className="h-px bg-border my-2" />
                                    <ProjectModal 
                                       project={prj} 
                                       onSuccess={fetchProjects}
                                       trigger={
                                         <DropdownMenuItem onSelect={e => e.preventDefault()} className="gap-3 py-3 rounded-xl focus:bg-indigo-500/10 text-indigo-500 cursor-pointer font-bold text-xs uppercase transition-all">
                                           <Settings2 className="h-4 w-4" /> Edit Project
                                         </DropdownMenuItem>
                                       }
                                    />
                                    <DropdownMenuItem 
                                       onClick={() => handleDelete(prj.id)}
                                       className="gap-3 py-3 rounded-xl focus:bg-red-500/10 text-red-600 cursor-pointer font-bold text-xs uppercase transition-all"
                                     >
                                      <Trash2 className="h-4 w-4" /> Archive Project
                                    </DropdownMenuItem>
                                  </>
                               )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          className="bg-transparent border-t border-border/50"
        />
      </Card>
      
      <ProjectFilesModal 
        project={selectedProjectForFiles}
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
      />
    </div>
  );
};

export default ProjectList;
