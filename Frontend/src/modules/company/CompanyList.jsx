import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Search, 
  Globe, 
  ShieldCheck, 
  Trash2, 
  Loader2,
  Users,
  Eye,
  Zap,
  Plus,
  Bell,
  Calendar,
  Ban,
  Unlock
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
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import CompanyModal from './CompanyModal';
import { Pagination } from '@/components/ui/pagination';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/companies?page=${page}&limit=${limit}`);
      setCompanies(data?.data || []);
      setTotalPages(Math.ceil((data?.total || 0) / limit) || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to establish connection with local registry');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to terminate this organization node? This will disconnect all associated users.')) return;
    try {
      await apiFetch(`/companies/${id}`, { method: 'DELETE' });
      toast.success('Organization node terminated');
      fetchCompanies();
    } catch (error) {
      toast.error(error.message || 'Termination sequence failed');
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemind = async (id) => {
    try {
      toast.loading('Dispatching renewal protocol...', { id: 'remind' });
      await apiFetch(`/companies/${id}/remind-expiry`, { method: 'POST' });
      toast.success('Renewal reminder sent to client admin.', { id: 'remind' });
    } catch (error) {
       toast.error(error.message || 'Notification broadcast failed', { id: 'remind' });
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm('Are you sure you want to block this company? All users will be locked out immediately.')) return;
    try {
      await apiFetch(`/companies/${id}/block`, { method: 'PATCH' });
      toast.success('Company account blocked');
      fetchCompanies();
    } catch (error) {
      toast.error(error.message || 'Failed to block company');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await apiFetch(`/companies/${id}/unblock`, { method: 'PATCH' });
      toast.success('Company account unblocked');
      fetchCompanies();
    } catch (error) {
      toast.error(error.message || 'Failed to unblock company');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Set';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin opacity-20" />
          <Building2 className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-[10px] italic">Accessing Local Tenant Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-10 w-1 bg-blue-600 rounded-full" />
             <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Company List</h1>
          </div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-70 border-l-[3px] border-slate-100 pl-3 ml-4">Manage your subscribed companies</p>
        </div>
        
        <Button 
          onClick={() => {
            setSelectedCompany(null);
            setOpenModal(true);
          }}
          className="h-11 px-6 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 flex gap-2 font-black uppercase text-xs tracking-widest rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Establish New Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { label: 'Total Companies', value: companies.length, icon: Globe, color: 'text-blue-600' },
          { label: 'Active Domains', value: companies.filter(c => c.domain).length, icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'System Integrity', value: '100%', icon: Building2, color: 'text-indigo-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-2xl rounded-[1.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden group hover:-translate-y-1 transition-all">
             <div className="p-8 flex items-center gap-6">
                <div className={`h-16 w-16 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-inner`}>
                   <stat.icon className="h-8 w-8" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h4 className="text-3xl font-black tracking-tighter">{stat.value}</h4>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl mx-4">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b px-10 py-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <CardTitle className="text-xl font-black tracking-tight uppercase italic text-slate-800 dark:text-slate-200">All Registered Companies</CardTitle>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <Input 
                placeholder="Search local domains or entity names..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 border-slate-100 dark:border-slate-800 shadow-inner rounded-2xl bg-white/50 dark:bg-slate-800/50 font-bold" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="py-6 pl-10 font-black uppercase text-[10px] tracking-widest text-slate-400">Company Name</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Details</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Expires On</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-2"><Eye className="h-3 w-3" /> Plan Type</TableHead>
                  <TableHead className="py-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Status</TableHead>
                  <TableHead className="py-6 pr-10 text-right font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                           <Building2 className="h-16 w-16" />
                           <p className="font-black uppercase tracking-[0.3em] text-xs font-mono">No nodes deployed to cluster</p>
                        </div>
                     </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((comp) => (
                    <TableRow key={comp.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-all border-slate-50 dark:border-slate-800">
                      <TableCell className="py-8 pl-10">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-blue-600/5 border border-blue-600/10 flex items-center justify-center font-black text-blue-600 text-xl italic shadow-sm group-hover:scale-110 transition-transform">
                             {comp.companyName?.charAt(0)}
                          </div>
                          <div className="space-y-1">
                             <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tighter">{comp.companyName}</h4>
                             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                <Globe className="h-3 w-3" /> {comp.email}
                             </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-8">
                        <div className="flex flex-col">
                           <span className="font-black text-sm text-slate-700 dark:text-slate-300 tracking-tight">{comp.registrationNumber || 'N/A'}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comp.domain || 'local.host'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-8">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                              <Calendar className="h-3.5 w-3.5 text-rose-400" /> {formatDate(comp.planExpiryDate)}
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Lifecycle Termination</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-8">
                         <Badge className="bg-slate-900 text-white font-black text-[9px] px-3 py-1 italic tracking-widest border-none">
                            <Zap className="h-3 w-3 mr-1 text-blue-400 fill-blue-400" /> {comp.subscriptionPlan || 'BASIC'}
                         </Badge>
                      </TableCell>
                    <TableCell className="text-center py-8">
                       {comp.status === 'BLOCKED' ? (
                          <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[10px] px-4 py-1.5 uppercase tracking-widest shadow-none animate-pulse">
                             Blocked Account
                          </Badge>
                       ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] px-4 py-1.5 uppercase tracking-widest shadow-none">
                             Verified Tenant
                          </Badge>
                       )}
                    </TableCell>
                     <TableCell className="text-right py-8 pr-10">
                        <div className="flex justify-end gap-2">
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 rounded-2xl text-amber-500 hover:bg-amber-50"
                              title="Send Renewal Reminder"
                              onClick={() => handleRemind(comp.id)}
                           >
                              <Bell className="h-4 w-4" />
                           </Button>
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 rounded-2xl text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                 setSelectedCompany(comp);
                                 setOpenModal(true);
                              }}
                           >
                              <Eye className="h-4 w-4" />
                           </Button>

                           {comp.status === 'BLOCKED' ? (
                              <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="h-10 w-10 p-0 rounded-2xl text-emerald-600 hover:bg-emerald-50"
                                 title="Unblock Company"
                                 onClick={() => handleUnblock(comp.id)}
                              >
                                 <Unlock className="h-4 w-4" />
                              </Button>
                           ) : (
                              <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="h-10 w-10 p-0 rounded-2xl text-rose-400 hover:bg-rose-50"
                                 title="Block Company"
                                 onClick={() => handleBlock(comp.id)}
                              >
                                 <Ban className="h-4 w-4" />
                              </Button>
                           )}

                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 rounded-2xl text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDelete(comp.id)}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
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
          className="bg-transparent border-t border-slate-100"
        />
      </Card>
      <CompanyModal 
        open={openModal}
        setOpen={setOpenModal}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />
    </div>
  );
};

export default CompanyList;
