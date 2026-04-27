import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  ShieldCheck, 
  Briefcase, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import DesignationModal from './DesignationModal';
import { Pagination } from '@/components/ui/pagination';

const DesignationList = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/designations?page=${page}&limit=${limit}&search=${searchQuery}`);
      setDesignations(res?.data || []);
      setTotalPages(Math.ceil((res?.total || 0) / limit) || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, page]); // Fetch on page change

  const filtered = designations; // Search handled by backend

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Designations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Designations</h1>
          <p className="text-muted-foreground font-medium italic opacity-70 text-sm">Manage roles and titles in your company.</p>
        </div>
        
        <DesignationModal onSuccess={fetchData} />
      </div>

      <div className="flex items-center gap-4 bg-card/50 backdrop-blur-md p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by role title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-none bg-muted rounded-2xl font-bold"
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card/70 backdrop-blur-xl ring-1 ring-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-none font-black uppercase text-[10px] tracking-widest text-muted-foreground">
                <TableHead className="pl-8 py-6">ID</TableHead>
                <TableHead className="py-6">Role / Title</TableHead>
                <TableHead className="py-6">Level</TableHead>
                <TableHead className="py-6 text-center">Employee Count</TableHead>
                <TableHead className="pr-8 py-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium uppercase tracking-tighter">
                    No designations found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((desig, idx) => (
                  <TableRow key={desig.id} className="group hover:bg-muted/10 transition-all border-border">
                    <TableCell className="pl-8 py-6 font-mono text-[10px] font-bold text-muted-foreground">DES-{(idx + 1).toString().padStart(3, '0')}</TableCell>
                    <TableCell className="py-6">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-card group-hover:text-amber-600 transition-colors border border-border">
                             <ShieldCheck className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-foreground tracking-tight">{desig.name}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6">
                       <Badge variant="secondary" className="rounded-md font-black uppercase text-[9px] tracking-widest px-2 opacity-60">
                          {desig.level || 'Standard'}
                       </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <span className="font-black text-lg text-muted-foreground/30 group-hover:text-foreground transition-colors">{desig.employeeCount || 0}</span>
                    </TableCell>
                    <TableCell className="pr-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                         <DesignationModal 
                            designation={desig} 
                            onSuccess={fetchData} 
                            trigger={
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-card border-transparent hover:border-border">
                                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Button>
                            } 
                         />
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-card border-transparent hover:border-border">
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-600" />
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
        />
      </Card>
    </div>
  );
};

export default DesignationList;
