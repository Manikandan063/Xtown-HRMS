import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  Plus,
  File,
  Loader2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DocumentVault = () => {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    employeeId: user?.employeeId || '',
    documentType: 'Aadhaar Card',
    documentName: '',
    remarks: ''
  });

  const isManagement = isSuperAdmin || isAdmin;

  const docTypes = [
    "Aadhaar Card",
    "PAN Card",
    "Resume / CV",
    "Educational Certificates",
    "Offer Letter",
    "Experience Letter",
    "Salary Slips",
    "Address Proof",
    "Bank Passbook / Cancelled Cheque",
    "Other"
  ];

  useEffect(() => {
    if (user) {
      fetchDocuments();
      if (isManagement) fetchEmployees();
    }
  }, [user, isManagement, search, filterType, filterStatus]);

  const fetchDocuments = async () => {
    if (!user) return;
    if (!isManagement && !user.employeeId) {
       setLoading(false);
       return;
    }
    
    try {
      setLoading(true);
      let url = isManagement ? '/document/all' : `/document/employee/${user.employeeId}`;
      
      const params = new URLSearchParams();
      if (isManagement) {
        if (search) params.append('search', search);
        if (filterType !== 'All') params.append('type', filterType);
        if (filterStatus !== 'All') params.append('status', filterStatus);
      }
      
      const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
      const res = await apiFetch(finalUrl);
      if (res.status === 'success') {
        setDocuments(res.data);
      }
    } catch (e) {
      toast.error("Failed to load document vault");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch('/employees');
      if (res.status === 'success' || res.success) {
        setEmployees(res.data);
      }
    } catch (e) {
      console.error("Failed to load employees", e);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('doc-upload-input');
    const file = fileInput.files[0];
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', uploadForm.employeeId);
    formData.append('documentType', uploadForm.documentType);
    formData.append('documentName', uploadForm.documentName);
    formData.append('remarks', uploadForm.remarks);

    try {
      const data = await apiFetch('/document/upload', {
        method: 'POST',
        body: formData
      });

      if (data.status === 'success') {
        toast.success("Document uploaded successfully");
        setIsUploadOpen(false);
        fetchDocuments();
        setUploadForm({
          employeeId: user?.employeeId || '',
          documentType: 'Aadhaar Card',
          documentName: '',
          remarks: ''
        });
      }
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerify = async (id, status, remarks = '') => {
    try {
      const res = await apiFetch(`/document/${id}/verify`, {
        method: 'PATCH',
        body: { status, remarks }
      });
      if (res.status === 'success') {
        toast.success(`Document marked as ${status}`);
        fetchDocuments();
      }
    } catch (e) {
      toast.error("Verification failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await apiFetch(`/document/${id}`, { method: 'DELETE' });
      if (res.status === 'success') {
        toast.success("Document deleted");
        fetchDocuments();
      }
    } catch (e) {
      toast.error("Deletion failed");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified': return <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-2"><CheckCircle2 className="h-2 w-2 mr-1" /> Verified</Badge>;
      case 'Rejected': return <Badge className="bg-rose-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-2"><XCircle className="h-2 w-2 mr-1" /> Rejected</Badge>;
      default: return <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-2"><Clock className="h-2 w-2 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <ShieldCheck className="h-48 w-48 text-white" />
         </div>
         <div className="space-y-2 relative z-10">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Document Vault</h1>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Secure Digital Identity Storage</p>
            </div>
         </div>
         <Button 
            onClick={() => setIsUploadOpen(true)}
            className="rounded-2xl px-8 py-7 bg-white text-slate-900 hover:bg-slate-100 font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-2 group relative z-10"
         >
            <Upload className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
            Upload New Document
         </Button>
      </div>

      {/* FILTER BAR */}
      {isManagement && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/50 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
           <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                 placeholder="Search by Employee Name or Code..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="pl-12 py-6 rounded-2xl bg-white border-none shadow-inner font-bold text-xs"
              />
           </div>
           <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-white px-4 py-3 rounded-2xl border-none shadow-inner text-[10px] font-black uppercase tracking-widest outline-none"
           >
              <option value="All">All Categories</option>
              {docTypes.map(type => <option key={type} value={type}>{type}</option>)}
           </select>
           <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white px-4 py-3 rounded-2xl border-none shadow-inner text-[10px] font-black uppercase tracking-widest outline-none"
           >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
           </select>
        </div>
      )}

      {/* DOCUMENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-[2.5rem]" />
          ))
        ) : documents.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
             <FileText className="h-16 w-16" />
             <p className="text-sm font-black uppercase tracking-widest">No documents found in the vault</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id}
              className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
            >
               <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                     <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <FileText className="h-6 w-6" />
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(doc.verificationStatus)}
                        <span className="text-[8px] font-black uppercase opacity-30 italic">{new Date(doc.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>

                  <div>
                     <p className="text-[8px] font-black uppercase text-primary/60 tracking-[0.2em] mb-1">{doc.documentType}</p>
                     <h3 className="text-sm font-black tracking-tight leading-tight line-clamp-1">{doc.documentName}</h3>
                     {isManagement && (
                       <p className="text-[10px] font-bold text-slate-400 mt-1">
                         {doc.employee?.firstName} {doc.employee?.lastName}
                       </p>
                     )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                     <a 
                       href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${doc.filePath}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all"
                     >
                        <Eye className="h-3 w-3 mr-2" /> Preview
                     </a>
                     <a 
                       href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${doc.filePath}`}
                       download
                       className="p-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all"
                     >
                        <Download className="h-4 w-4" />
                     </a>
                     {isManagement && (
                       <button 
                         onClick={() => handleDelete(doc.id)}
                         className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                     )}
                  </div>
                  
                  {isManagement && doc.verificationStatus === 'Pending' && (
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                       <Button 
                          onClick={() => handleVerify(doc.id, 'Verified')}
                          className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase"
                       >
                          Approve
                       </Button>
                       <Button 
                          onClick={() => handleVerify(doc.id, 'Rejected')}
                          variant="ghost"
                          className="h-8 text-rose-500 hover:bg-rose-50 rounded-xl text-[8px] font-black uppercase border border-rose-100"
                       >
                          Reject
                       </Button>
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                 <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Secure Document Upload</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Authorized PDF, JPG, PNG only</p>
                 </div>
                 <button onClick={() => setIsUploadOpen(false)} className="h-10 w-10 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-colors">
                    <XCircle className="h-5 w-5" />
                 </button>
              </div>

              <form onSubmit={handleFileUpload} className="p-8 space-y-6">
                 {isManagement && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Employee</label>
                      <select 
                        value={uploadForm.employeeId}
                        onChange={e => setUploadForm({...uploadForm, employeeId: e.target.value})}
                        className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-xs outline-none"
                        required
                      >
                         <option value="">Select Personnel...</option>
                         {employees.map(emp => (
                           <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                         ))}
                      </select>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Category</label>
                       <select 
                         value={uploadForm.documentType}
                         onChange={e => setUploadForm({...uploadForm, documentType: e.target.value})}
                         className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-xs outline-none"
                         required
                       >
                          {docTypes.map(type => <option key={type} value={type}>{type}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Name</label>
                       <Input 
                          placeholder="e.g. My Aadhaar Front" 
                          value={uploadForm.documentName}
                          onChange={e => setUploadForm({...uploadForm, documentName: e.target.value})}
                          className="bg-slate-50 border-none rounded-2xl py-6 font-bold text-xs"
                          required
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload Soft Copy</label>
                    <div className="relative h-32 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center group hover:border-primary transition-all cursor-pointer">
                       <input 
                         type="file" 
                         id="doc-upload-input"
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         accept=".pdf,.jpg,.jpeg,.png"
                       />
                       <File className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors mb-2" />
                       <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-primary transition-colors">Drag or click to choose file</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Internal Remarks (Optional)</label>
                    <textarea 
                       placeholder="Enter any notes about this document..."
                       value={uploadForm.remarks}
                       onChange={e => setUploadForm({...uploadForm, remarks: e.target.value})}
                       className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-xs outline-none min-h-[80px] resize-none"
                    />
                 </div>

                 <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full h-14 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-800 shadow-xl"
                 >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Commit to Vault"}
                 </Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
