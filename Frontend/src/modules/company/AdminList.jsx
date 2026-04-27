import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Building2, 
  Mail, 
  MoreVertical, 
  Trash2, 
  Loader2,
  Lock,
  UserCheck,
  Eye,
  Edit3
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

import PageLoader from '@/components/ui/PageLoader';
import ProvisionAdminModal from './ProvisionAdminModal';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/users');
      // Filter for Admins (role name containing 'admin' but NOT 'super')
      const allUsers = data?.data || data || [];
      const adminUsers = allUsers.filter(u => {
        const roleName = u.role?.name?.toLowerCase() || '';
        return roleName.includes('admin') && !roleName.includes('super');
      });
      setAdmins(adminUsers);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch admin list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to revoke administrative access for this user?')) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      toast.success('Access revoked');
      fetchAdmins();
    } catch (error) {
      toast.error(error.message || 'Action failed');
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.company?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <PageLoader message="Synchronizing Admin Accounts..." />;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Company Admins</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-80 pl-1 border-l-2 border-slate-200">List of all registered company owners</p>
        </div>
        
        <Button 
          onClick={() => {
            setSelectedAdmin(null);
            setOpenModal(true);
          }}
          className="h-11 px-8 rounded-2xl shadow-xl shadow-indigo-500/30 bg-indigo-600 hover:bg-indigo-700 font-black uppercase text-xs tracking-widest flex gap-2"
        >
           <UserPlus className="h-4 w-4" /> Add New Admin
        </Button>
      </div>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl mx-4">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b px-10 py-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-black tracking-tighter uppercase text-slate-800 dark:text-slate-100 flex items-center gap-2">
               <div className="w-1 h-5 bg-indigo-600 rounded-full" />
               All Admins
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                placeholder="Filter by name, email or company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 shadow-inner font-bold" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30 dark:bg-slate-800/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-black py-8 pl-10 uppercase text-[10px] tracking-[0.2em] text-slate-400">Admin Name</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-[0.2em] text-slate-400">Company</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-[0.2em] text-slate-400 text-center">Status</TableHead>
                <TableHead className="font-black py-8 uppercase text-[10px] tracking-[0.2em] text-slate-400 text-right pr-10">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-24 text-slate-300 italic font-black uppercase tracking-widest text-xs opacity-50">
                    No admins found in the system.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/20 border-b border-slate-50 dark:border-slate-800 group transition-all">
                    <TableCell className="py-8 pl-10">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-600/20 scale-100 group-hover:scale-110 transition-transform">
                             {admin.name?.charAt(0)}
                          </div>
                          <div className="space-y-0.5">
                             <h4 className="font-black text-slate-900 dark:text-white tracking-tighter">{admin.name}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 outline-none bg-transparent">
                                <Mail className="h-3 w-3" /> {admin.email}
                             </p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-8">
                       <div className="flex flex-col gap-1">
                          <span className="font-black text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                             <Building2 className="h-4 w-4 text-blue-500" /> {admin.company?.companyName || 'No Company'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                             <div className="h-1 w-1 rounded-full bg-indigo-400" /> {admin.designation || 'Authorized Admin'}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center py-8">
                       <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-black text-[9px] px-3 py-1 uppercase tracking-widest shadow-none">
                          Verified Account
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right py-8 pr-10">
                        <div className="flex justify-end gap-2">
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Update Email/Password"
                              className="h-10 w-10 p-0 rounded-2xl text-indigo-600 hover:bg-indigo-100/50"
                              onClick={() => {
                                 setSelectedAdmin(admin);
                                 setOpenModal(true);
                              }}
                           >
                              <Edit3 className="h-4 w-4" />
                           </Button>
                           <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 rounded-2xl text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDelete(admin.id)}
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
      </Card>
      <ProvisionAdminModal 
        open={openModal}
        setOpen={setOpenModal}
        admin={selectedAdmin}
        onSuccess={fetchAdmins}
      />
    </div>
  );
};

export default AdminList;
